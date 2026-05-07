import React, {useMemo} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {CommonActions, useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Animated, {FadeIn} from 'react-native-reanimated';
import {Screen} from '../../components/Screen';
import {AnimatedPressable} from '../../components/AnimatedPressable';
import {StatusPill} from '../../components/StatusPill';
import {Fab} from '../../components/Fab';
import {MoneyText} from '../../components/MoneyText';
import {ChevronRightIcon} from '../../components/icons';
import {colors, fontSize, fontWeight, radii, spacing} from '../../theme/tokens';
import {useStoreState} from '../../data/store';
import {isToday} from '../../lib/date';
import type {RootStackParamList} from '../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export const DashboardScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const shop = useStoreState(s => s.shop);
  const jobs = useStoreState(s => s.jobs);
  const parts = useStoreState(s => s.parts);
  const customers = useStoreState(s => s.customers);
  const payments = useStoreState(s => s.payments);

  const stats = useMemo(() => {
    const todayJobs = jobs.filter(j => isToday(j.receivedAt));
    const ready = jobs.filter(j => j.status === 'ready').length;
    const inProgress = jobs.filter(
      j => j.status === 'in_progress' || j.status === 'approved',
    ).length;
    const todayRevenue = payments
      .filter(p => isToday(p.at))
      .reduce((sum, p) => sum + p.amount, 0);
    const lowStock = parts.filter(p => p.stock <= p.lowStockAt);
    return {
      todayJobs: todayJobs.length,
      ready,
      inProgress,
      todayRevenue,
      lowStock,
    };
  }, [jobs, payments, parts]);

  const recentActive = useMemo(() => {
    return jobs
      .filter(j => j.status !== 'delivered' && j.status !== 'cancelled')
      .slice(0, 5);
  }, [jobs]);

  const goToJobs = () =>
    nav.dispatch(
      CommonActions.navigate({name: 'AppTabs', params: {screen: 'Jobs'}}),
    );

  const goToInventory = () =>
    nav.dispatch(
      CommonActions.navigate({name: 'AppTabs', params: {screen: 'Inventory'}}),
    );

  return (
    <Screen>
      <Animated.View entering={FadeIn.duration(220)} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.greeting}>
              {greeting()}, {shop.ownerName?.split(' ')[0] || 'there'}
            </Text>
            <Text style={styles.shopName} numberOfLines={1}>
              {shop.name || 'Repair Shop'}
            </Text>
          </View>

          <View style={styles.revenueBlock}>
            <Text style={styles.revenueLabel}>Today</Text>
            <MoneyText
              value={stats.todayRevenue}
              size="xl"
              animate={false}
              style={styles.revenueValue}
            />
            <Text style={styles.revenueHint}>
              {stats.todayJobs === 0
                ? 'No new jobs yet'
                : `${stats.todayJobs} new job${stats.todayJobs === 1 ? '' : 's'}`}
            </Text>
          </View>

          <View style={styles.statsGrid}>
            <StatCell
              label="In progress"
              value={String(stats.inProgress)}
              onPress={goToJobs}
            />
            <View style={styles.divider} />
            <StatCell
              label="Ready"
              value={String(stats.ready)}
              onPress={goToJobs}
            />
          </View>
          <View style={styles.gridDivider} />
          <View style={styles.statsGrid}>
            <StatCell label="Customers" value={String(customers.length)} />
            <View style={styles.divider} />
            <StatCell
              label="Parts"
              value={String(parts.reduce((s, p) => s + p.stock, 0))}
              onPress={goToInventory}
            />
          </View>

          {stats.lowStock.length > 0 ? (
            <AnimatedPressable
              onPress={goToInventory}
              style={styles.alertRow}
              scaleTo={0.99}>
              <View style={styles.alertDot} />
              <View style={styles.flex}>
                <Text style={styles.alertTitle}>
                  {stats.lowStock.length} part
                  {stats.lowStock.length === 1 ? '' : 's'} running low
                </Text>
                <Text style={styles.alertSub} numberOfLines={1}>
                  {stats.lowStock
                    .slice(0, 3)
                    .map(p => p.name)
                    .join(', ')}
                </Text>
              </View>
              <ChevronRightIcon size={18} color={colors.textSubtle} strokeWidth={1.8} />
            </AnimatedPressable>
          ) : null}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active jobs</Text>
            {recentActive.length > 0 ? (
              <AnimatedPressable onPress={goToJobs} scaleTo={0.96}>
                <Text style={styles.sectionAction}>See all</Text>
              </AnimatedPressable>
            ) : null}
          </View>

          {recentActive.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Nothing pending</Text>
              <Text style={styles.emptySub}>
                Tap + to log a new device.
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {recentActive.map(j => (
                <ActiveJobRow
                  key={j.id}
                  job={j}
                  customerName={
                    customers.find(c => c.id === j.customerId)?.name ?? 'Walk-in'
                  }
                  onPress={() => nav.navigate('JobDetail', {jobId: j.id})}
                />
              ))}
            </View>
          )}

          <View style={{height: 110}} />
        </ScrollView>
      </Animated.View>

      <Fab onPress={() => nav.navigate('JobCreate')} />
    </Screen>
  );
};

const StatCell: React.FC<{
  label: string;
  value: string;
  onPress?: () => void;
}> = ({label, value, onPress}) => {
  const inner = (
    <View style={styles.statCell}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
  if (onPress) {
    return (
      <AnimatedPressable onPress={onPress} style={styles.flex} scaleTo={0.97}>
        {inner}
      </AnimatedPressable>
    );
  }
  return <View style={styles.flex}>{inner}</View>;
};

const ActiveJobRow: React.FC<{
  job: any;
  customerName: string;
  onPress: () => void;
}> = ({job, customerName, onPress}) => (
  <AnimatedPressable onPress={onPress} style={styles.jobRow} scaleTo={0.99}>
    <View style={styles.jobBody}>
      <Text style={styles.jobName} numberOfLines={1}>
        {customerName}
      </Text>
      <Text style={styles.jobMeta} numberOfLines={1}>
        {job.ticketNo} · {job.device.brand} {job.device.model}
      </Text>
    </View>
    <StatusPill status={job.status} size="sm" />
  </AnimatedPressable>
);

const styles = StyleSheet.create({
  flex: {flex: 1},
  scroll: {paddingTop: spacing.sm, paddingBottom: spacing.huge},

  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  greeting: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    fontWeight: fontWeight.regular,
    marginBottom: 4,
  },
  shopName: {
    fontSize: fontSize.display,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    letterSpacing: -0.4,
  },

  revenueBlock: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  revenueLabel: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  revenueValue: {
    color: colors.text,
    fontSize: fontSize.hero,
    fontWeight: fontWeight.semibold,
  },
  revenueHint: {
    marginTop: 6,
    fontSize: fontSize.body,
    color: colors.textMuted,
  },

  statsGrid: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: spacing.xl,
    minHeight: 84,
  },
  statCell: {
    paddingVertical: spacing.lg,
    gap: 4,
  },
  divider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
  },
  gridDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xl,
  },
  statLabel: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: fontSize.display,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },

  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    marginTop: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.warning,
  },
  alertTitle: {
    fontSize: fontSize.body,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  alertSub: {
    marginTop: 2,
    fontSize: fontSize.small,
    color: colors.textMuted,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.subhead,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  sectionAction: {
    fontSize: fontSize.small,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
  },

  empty: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.huge,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: fontSize.subhead,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  emptySub: {
    marginTop: 6,
    fontSize: fontSize.body,
    color: colors.textMuted,
  },

  list: {paddingHorizontal: spacing.xl, gap: 0},
  jobRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  jobBody: {flex: 1, gap: 2},
  jobName: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  jobMeta: {
    fontSize: fontSize.small,
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
});

void radii;
