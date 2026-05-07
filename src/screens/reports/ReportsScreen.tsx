import React, {useMemo, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Animated, {FadeIn} from 'react-native-reanimated';
import {Screen} from '../../components/Screen';
import {ScreenHeader} from '../../components/ScreenHeader';
import {MoneyText} from '../../components/MoneyText';
import {AnimatedPressable} from '../../components/AnimatedPressable';
import {Avatar} from '../../components/Avatar';
import {colors, fontSize, fontWeight, spacing} from '../../theme/tokens';
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
  return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
};

const RANGE_LABEL: Record<Range, string> = {
  today: 'Today',
  week: '7 days',
  month: 'Month',
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

    const tagCounts: Record<string, number> = {};
    rangeJobs.forEach(j => {
      const tag = tagIssue(j.issue);
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    });
    const topRepairs = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

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
    };
  }, [range, jobs, customers, payments, expenses]);

  return (
    <Screen>
      <ScreenHeader title="Reports" onBack={() => nav.goBack()} />
      <Animated.View entering={FadeIn.duration(220)} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}>
          <View style={styles.rangeRow}>
            {(['today', 'week', 'month'] as Range[]).map(r => (
              <AnimatedPressable
                key={r}
                onPress={() => setRange(r)}
                style={[styles.rangeChip, range === r && styles.rangeChipActive]}
                scaleTo={0.96}>
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

          <View style={styles.heroBlock}>
            <Text style={styles.heroLabel}>Net profit</Text>
            <MoneyText
              value={data.profit}
              size="xl"
              animate={false}
              style={[
                styles.heroMoney,
                data.profit < 0 && {color: colors.danger},
              ]}
            />
            <View style={styles.subRow}>
              <View style={styles.subCell}>
                <Text style={styles.subLabel}>Revenue</Text>
                <Text style={styles.subValue}>{formatINR(data.revenue)}</Text>
              </View>
              <View style={styles.subDivider} />
              <View style={styles.subCell}>
                <Text style={styles.subLabel}>Expenses</Text>
                <Text style={styles.subValue}>{formatINR(data.exp)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsRow}>
            <StatCell label="Jobs" value={String(data.jobCount)} />
            <View style={styles.statDivider} />
            <StatCell label="Delivered" value={String(data.completedCount)} />
          </View>

          <Text style={styles.sectionTitle}>Most common repairs</Text>
          {data.topRepairs.length > 0 ? (
            <View style={styles.barList}>
              {data.topRepairs.map(([tag, count]) => {
                const max = data.topRepairs[0][1];
                const pct = Math.max(8, Math.round((count / max) * 100));
                return (
                  <View key={tag} style={styles.barRow}>
                    <Text style={styles.barLabel}>{tag}</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, {width: `${pct}%`}]} />
                    </View>
                    <Text style={styles.barCount}>{count}</Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={styles.empty}>No repairs in range.</Text>
          )}

          <Text style={styles.sectionTitle}>Top customers</Text>
          {data.topCustomers.length > 0 ? (
            <View style={styles.list}>
              {data.topCustomers.map(({customer, amount}) => (
                <View key={customer.id} style={styles.custRow}>
                  <Avatar
                    uri={customer.avatarUri}
                    fallback={customer.name
                      .split(' ')
                      .map(p => p[0] ?? '')
                      .join('')}
                    seed={customer.id}
                    size={36}
                  />
                  <View style={styles.flex}>
                    <Text style={styles.custName} numberOfLines={1}>
                      {customer.name}
                    </Text>
                    <Text style={styles.custPhone}>+91 {customer.phone}</Text>
                  </View>
                  <Text style={styles.custAmount}>{formatINR(amount)}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.empty}>No payments in range.</Text>
          )}

          {Object.keys(data.modeSplit).length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Payment modes</Text>
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
      </Animated.View>
    </Screen>
  );
};

const StatCell: React.FC<{label: string; value: string}> = ({label, value}) => (
  <View style={styles.statCell}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  flex: {flex: 1},
  scroll: {paddingBottom: spacing.huge},

  rangeRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  rangeChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  rangeChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  rangeChipLabel: {
    fontSize: fontSize.small,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
  },
  rangeChipLabelActive: {color: colors.textOnPrimary},

  heroBlock: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  heroLabel: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  heroMoney: {
    color: colors.text,
    fontSize: fontSize.hero,
    fontWeight: fontWeight.semibold,
  },
  subRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.lg,
  },
  subDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  subCell: {flex: 1, gap: 2},
  subLabel: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  subValue: {
    fontSize: fontSize.subhead,
    color: colors.text,
    fontWeight: fontWeight.medium,
    fontVariant: ['tabular-nums'],
  },

  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
  },
  statCell: {flex: 1, gap: 4},
  statLabel: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: fontSize.display,
    color: colors.text,
    fontWeight: fontWeight.semibold,
    fontVariant: ['tabular-nums'],
  },

  sectionTitle: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
    fontSize: fontSize.subhead,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },

  barList: {paddingHorizontal: spacing.xl, gap: spacing.md},
  barRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.md},
  barLabel: {
    width: 96,
    fontSize: fontSize.small,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  barTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primaryMuted,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  barCount: {
    width: 24,
    textAlign: 'right',
    fontSize: fontSize.small,
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },

  list: {paddingHorizontal: spacing.xl},
  empty: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    fontSize: fontSize.body,
    color: colors.textMuted,
  },

  custRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  custName: {
    fontSize: fontSize.body,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  custPhone: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  custAmount: {
    fontSize: fontSize.body,
    color: colors.text,
    fontWeight: fontWeight.medium,
    fontVariant: ['tabular-nums'],
  },

  modeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modeLabel: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
    letterSpacing: 0.6,
  },
  modeAmount: {
    fontSize: fontSize.body,
    color: colors.text,
    fontWeight: fontWeight.medium,
    fontVariant: ['tabular-nums'],
  },
});
