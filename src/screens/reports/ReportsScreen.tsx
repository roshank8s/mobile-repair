import React, {useMemo, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Animated, {FadeInDown, FadeInUp} from 'react-native-reanimated';
import {Screen} from '../../components/Screen';
import {ScreenHeader} from '../../components/ScreenHeader';
import {Hero} from '../../components/Hero';
import {MoneyText} from '../../components/MoneyText';
import {AnimatedPressable} from '../../components/AnimatedPressable';
import {Avatar} from '../../components/Avatar';
import {SectionHeader} from '../../components/SectionHeader';
import {colors, fontSize, fontWeight, radii, shadows, spacing} from '../../theme/tokens';
import {useStoreState} from '../../data/store';
import {formatINR} from '../../lib/currency';
import type {RootStackParamList} from '../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Range = 'today' | 'week' | 'month';

const startOfDay = (d: Date) => {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
};

const cutoffMs = (range: Range): number => {
  const now = new Date();
  if (range === 'today') return startOfDay(now).getTime();
  if (range === 'week') {
    const start = startOfDay(now);
    start.setDate(start.getDate() - 6);
    return start.getTime();
  }
  // month
  return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
};

const RANGE_LABEL: Record<Range, string> = {
  today: 'Today',
  week: 'Last 7 days',
  month: 'This month',
};

const ISSUE_KEYWORDS: {tag: string; tests: RegExp[]}[] = [
  {tag: 'Screen', tests: [/screen/i, /display/i, /lcd/i, /glass/i, /touch/i]},
  {tag: 'Battery', tests: [/battery/i, /charge fast/i, /drain/i, /swollen/i]},
  {tag: 'Charging', tests: [/charging/i, /port/i, /jack/i]},
  {tag: 'Camera', tests: [/camera/i, /lens/i]},
  {tag: 'Speaker', tests: [/speaker/i, /audio/i, /earpiece/i, /receiver/i]},
  {tag: 'Water damage', tests: [/water/i, /liquid/i, /wet/i]},
  {tag: 'Software', tests: [/software/i, /reboot/i, /hang/i, /freeze/i]},
];

const tagIssue = (issue: string): string => {
  for (const k of ISSUE_KEYWORDS) {
    if (k.tests.some(t => t.test(issue))) return k.tag;
  }
  return 'Other';
};

export const ReportsScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const jobs = useStoreState(s => s.jobs);
  const customers = useStoreState(s => s.customers);
  const payments = useStoreState(s => s.payments);
  const expenses = useStoreState(s => s.expenses);
  const [range, setRange] = useState<Range>('month');

  const data = useMemo(() => {
    const cut = cutoffMs(range);
    const rangePayments = payments.filter(
      p => new Date(p.at).getTime() >= cut,
    );
    const rangeExpenses = expenses.filter(
      e => new Date(e.at).getTime() >= cut,
    );
    const rangeJobs = jobs.filter(j => new Date(j.receivedAt).getTime() >= cut);

    const revenue = rangePayments.reduce((s, p) => s + p.amount, 0);
    const exp = rangeExpenses.reduce((s, e) => s + e.amount, 0);
    const profit = revenue - exp;
    const jobCount = rangeJobs.length;
    const completedCount = rangeJobs.filter(j => j.status === 'delivered').length;

    // Top repair tags
    const tagCounts: Record<string, number> = {};
    rangeJobs.forEach(j => {
      const tag = tagIssue(j.issue);
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    });
    const topRepairs = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Top customers by spend
    const spendByCust: Record<string, number> = {};
    rangePayments.forEach(p => {
      const job = jobs.find(j => j.id === p.jobId);
      if (!job) return;
      spendByCust[job.customerId] =
        (spendByCust[job.customerId] ?? 0) + p.amount;
    });
    const topCustomers = Object.entries(spendByCust)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cid, amt]) => ({
        customer: customers.find(c => c.id === cid),
        amount: amt,
      }))
      .filter(x => !!x.customer) as {
      customer: NonNullable<ReturnType<typeof customers.find>>;
      amount: number;
    }[];

    // Payment mode split
    const modeSplit: Record<string, number> = {};
    rangePayments.forEach(p => {
      modeSplit[p.mode] = (modeSplit[p.mode] ?? 0) + p.amount;
    });

    return {
      revenue,
      exp,
      profit,
      jobCount,
      completedCount,
      topRepairs,
      topCustomers,
      modeSplit,
      hasData: rangePayments.length + rangeExpenses.length + rangeJobs.length > 0,
    };
  }, [range, jobs, customers, payments, expenses]);

  return (
    <Screen>
      <ScreenHeader
        title="Reports"
        subtitle="Earnings, expenses & insights"
        onBack={() => nav.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        {/* Range chips */}
        <View style={styles.rangeRow}>
          {(['today', 'week', 'month'] as Range[]).map(r => (
            <AnimatedPressable
              key={r}
              onPress={() => setRange(r)}
              style={[styles.rangeChip, range === r && styles.rangeChipActive]}
              scaleTo={0.95}>
              <Text
                style={[
                  styles.rangeChipLabel,
                  range === r && styles.rangeChipLabelActive,
                ]}>
                {RANGE_LABEL[r]}
              </Text>
            </AnimatedPressable>
          ))}
        </View>

        {/* Hero net profit */}
        <Animated.View
          entering={FadeInUp.duration(360).springify().damping(18)}
          style={styles.heroWrap}>
          <Hero style={styles.hero}>
            <Text style={styles.heroLabel}>Net profit · {RANGE_LABEL[range]}</Text>
            <MoneyText
              value={data.profit}
              size="xl"
              style={[
                styles.heroMoney,
                data.profit < 0 && {color: '#FCA5A5'},
              ]}
            />
            <View style={styles.heroPills}>
              <View style={styles.heroPill}>
                <Text style={styles.heroPillLabel}>Revenue</Text>
                <MoneyText
                  value={data.revenue}
                  size="sm"
                  style={styles.heroPillValue}
                />
              </View>
              <View style={styles.heroPill}>
                <Text style={styles.heroPillLabel}>Expenses</Text>
                <MoneyText
                  value={data.exp}
                  size="sm"
                  style={styles.heroPillValue}
                />
              </View>
            </View>
          </Hero>
        </Animated.View>

        {/* Stat tiles */}
        <View style={styles.statsRow}>
          <StatTile label="Jobs in range" value={String(data.jobCount)} delay={120} />
          <StatTile
            label="Delivered"
            value={String(data.completedCount)}
            accent={colors.success}
            delay={180}
          />
        </View>

        {/* Top repairs */}
        <SectionHeader
          title="Most common repairs"
          caption={
            data.topRepairs.length > 0
              ? `${data.topRepairs.length} categories`
              : 'No repairs in this range'
          }
        />
        {data.topRepairs.length > 0 ? (
          <View style={styles.list}>
            {data.topRepairs.map(([tag, count], i) => {
              const max = data.topRepairs[0][1];
              const pct = Math.max(10, Math.round((count / max) * 100));
              return (
                <Animated.View
                  key={tag}
                  entering={FadeInDown.duration(260)
                    .delay(i * 40)
                    .springify()
                    .damping(18)}>
                  <View style={styles.barRow}>
                    <Text style={styles.barLabel}>{tag}</Text>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {width: `${pct}%`},
                        ]}
                      />
                    </View>
                    <Text style={styles.barCount}>{count}</Text>
                  </View>
                </Animated.View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyMsg}>
              Repair patterns will show here as you log jobs.
            </Text>
          </View>
        )}

        {/* Top customers */}
        <SectionHeader
          title="Top customers"
          caption={
            data.topCustomers.length > 0
              ? `By spend in ${RANGE_LABEL[range].toLowerCase()}`
              : 'No payments in this range'
          }
        />
        {data.topCustomers.length > 0 ? (
          <View style={styles.list}>
            {data.topCustomers.map(({customer, amount}, i) => (
              <Animated.View
                key={customer.id}
                entering={FadeInDown.duration(260)
                  .delay(i * 40)
                  .springify()
                  .damping(18)}>
                <View style={styles.custRow}>
                  <Avatar
                    uri={customer.avatarUri}
                    fallback={customer.name
                      .split(' ')
                      .map(p => p[0] ?? '')
                      .join('')}
                    size={40}
                  />
                  <View style={styles.flex}>
                    <Text style={styles.custName}>{customer.name}</Text>
                    <Text style={styles.custPhone}>+91 {customer.phone}</Text>
                  </View>
                  <MoneyText value={amount} size="sm" />
                </View>
              </Animated.View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyMsg}>
              Once payments land you'll see your highest-spend customers here.
            </Text>
          </View>
        )}

        {/* Payment mode split */}
        {Object.keys(data.modeSplit).length > 0 ? (
          <>
            <SectionHeader
              title="Payment mode mix"
              caption={`${RANGE_LABEL[range]} revenue by mode`}
            />
            <View style={styles.list}>
              {(['cash', 'upi', 'card'] as const).map(m => (
                <View key={m} style={styles.modeRow}>
                  <Text style={styles.modeLabel}>{m.toUpperCase()}</Text>
                  <Text style={styles.modeAmount}>
                    {formatINR(data.modeSplit[m] ?? 0)}
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : null}

        <View style={{height: spacing.huge}} />
      </ScrollView>
    </Screen>
  );
};

const StatTile: React.FC<{
  label: string;
  value: string;
  accent?: string;
  delay: number;
}> = ({label, value, accent = colors.primary, delay}) => (
  <Animated.View
    entering={FadeInDown.duration(360).delay(delay).springify().damping(18)}
    style={styles.statTile}>
    <View style={[styles.statBar, {backgroundColor: accent}]} />
    <View style={styles.flex}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  </Animated.View>
);

const styles = StyleSheet.create({
  flex: {flex: 1, minWidth: 0},
  scroll: {paddingBottom: spacing.huge},
  rangeRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  rangeChip: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: colors.borderOnBg,
    alignItems: 'center',
  },
  rangeChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  rangeChipLabel: {
    fontSize: fontSize.small,
    fontWeight: fontWeight.bold,
    color: colors.textOnBgMuted,
  },
  rangeChipLabelActive: {color: colors.textOnAccent},

  // Hero
  heroWrap: {paddingHorizontal: spacing.lg, marginBottom: spacing.md},
  hero: {padding: spacing.xl},
  heroLabel: {
    color: '#C7D2FE',
    fontSize: fontSize.caption,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  heroMoney: {color: '#FFFFFF'},
  heroPills: {flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg},
  heroPill: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  heroPillLabel: {
    color: '#C7D2FE',
    fontSize: fontSize.caption,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  heroPillValue: {color: '#FFFFFF'},

  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statTile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.md,
    paddingLeft: 0,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    minHeight: 78,
    ...shadows.card,
  },
  statBar: {width: 4, alignSelf: 'stretch', marginRight: spacing.md},
  statLabel: {
    fontSize: fontSize.small,
    color: colors.textMuted,
    fontWeight: fontWeight.semibold,
  },
  statValue: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    color: colors.text,
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },

  // Generic list
  list: {paddingHorizontal: spacing.lg, gap: spacing.sm},
  emptyCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyMsg: {fontSize: fontSize.small, color: colors.textMuted, textAlign: 'center'},

  // Bar chart row
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  barLabel: {
    width: 96,
    fontSize: fontSize.small,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.cardMuted,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  barCount: {
    width: 24,
    textAlign: 'right',
    fontSize: fontSize.small,
    fontWeight: fontWeight.bold,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },

  // Customer
  custRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.lg,
  },
  custName: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  custPhone: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },

  // Mode mix
  modeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
  },
  modeLabel: {
    fontSize: fontSize.small,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  modeAmount: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.bold,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
});
