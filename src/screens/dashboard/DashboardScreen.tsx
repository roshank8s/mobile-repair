import React, {useMemo} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {Screen} from '../../components/Screen';
import {ScreenHeader} from '../../components/ScreenHeader';
import {StatCard} from '../../components/StatCard';
import {Card} from '../../components/Card';
import {AnimatedPressable} from '../../components/AnimatedPressable';
import {StatusPill} from '../../components/StatusPill';
import {Fab} from '../../components/Fab';
import {ChevronRightIcon, AlertIcon} from '../../components/icons';
import {colors, fontSize, fontWeight, radii, spacing} from '../../theme/tokens';
import {useStoreState} from '../../data/store';
import {isToday} from '../../lib/date';
import {formatINR} from '../../lib/currency';
import type {RootStackParamList} from '../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const DashboardScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const shop = useStoreState(s => s.shop);
  const jobs = useStoreState(s => s.jobs);
  const parts = useStoreState(s => s.parts);
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
    return {todayJobs, ready, inProgress, todayRevenue, lowStock};
  }, [jobs, payments, parts]);

  const recentActive = useMemo(() => {
    return jobs
      .filter(j => j.status !== 'delivered' && j.status !== 'cancelled')
      .slice(0, 4);
  }, [jobs]);

  return (
    <Screen>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title={shop.name || 'Repair Shop'}
          subtitle={shop.ownerName ? `Hi, ${shop.ownerName}` : undefined}
        />

        <View style={styles.statsRow}>
          <StatCard
            label="Today's jobs"
            value={stats.todayJobs.length}
            accent={colors.primary}
            delay={0}
          />
          <StatCard
            label="Today's revenue"
            value={stats.todayRevenue}
            asMoney
            accent={colors.accent}
            delay={60}
          />
        </View>
        <View style={styles.statsRow}>
          <StatCard
            label="In progress"
            value={stats.inProgress}
            accent={colors.warning}
            delay={120}
          />
          <StatCard
            label="Ready for pickup"
            value={stats.ready}
            accent={colors.success}
            delay={180}
          />
        </View>

        {stats.lowStock.length > 0 ? (
          <Animated.View
            entering={FadeInDown.duration(360).delay(240).springify().damping(16)}>
            <AnimatedPressable
              onPress={() => nav.navigate('AppTabs', {screen: 'Inventory'} as any)}
              style={styles.alertBox}
              scaleTo={0.99}>
              <View style={styles.alertIcon}>
                <AlertIcon size={18} color={colors.warning} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.alertTitle}>
                  {stats.lowStock.length} part
                  {stats.lowStock.length === 1 ? '' : 's'} running low
                </Text>
                <Text style={styles.alertSub} numberOfLines={1}>
                  {stats.lowStock
                    .slice(0, 3)
                    .map(p => p.name)
                    .join(' · ')}
                </Text>
              </View>
              <ChevronRightIcon size={20} color={colors.textSubtle} />
            </AnimatedPressable>
          </Animated.View>
        ) : null}

        <Text style={styles.sectionTitle}>Active jobs</Text>
        {recentActive.length === 0 ? (
          <Card>
            <Text style={styles.emptyMsg}>No active jobs right now.</Text>
            <Text style={styles.emptySub}>
              Tap the + button to log your first job.
            </Text>
          </Card>
        ) : (
          <View style={styles.list}>
            {recentActive.map((j, i) => (
              <Animated.View
                key={j.id}
                entering={FadeInDown.duration(280)
                  .delay(60 * i)
                  .springify()
                  .damping(18)}>
                <AnimatedPressable
                  onPress={() => nav.navigate('JobDetail', {jobId: j.id})}
                  style={styles.row}
                  scaleTo={0.99}>
                  <View style={styles.flex}>
                    <Text style={styles.rowTitle}>{j.ticketNo}</Text>
                    <Text style={styles.rowSub} numberOfLines={1}>
                      {j.device.brand} {j.device.model} · {j.issue}
                    </Text>
                    <Text style={styles.rowEstimate}>
                      Estimate {formatINR(j.estimateAmount)}
                    </Text>
                  </View>
                  <View style={styles.rowEnd}>
                    <StatusPill status={j.status} size="sm" />
                  </View>
                </AnimatedPressable>
              </Animated.View>
            ))}
          </View>
        )}

        <View style={{height: 96}} />
      </ScrollView>

      <Fab onPress={() => nav.navigate('JobCreate')} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1},
  scroll: {paddingBottom: spacing.huge},
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  alertBox: {
    marginHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.warningSoft,
    borderColor: colors.warning,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  alertIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  alertTitle: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.bold,
    color: '#92400E',
  },
  alertSub: {
    fontSize: fontSize.caption,
    color: '#92400E',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: fontSize.subhead,
    fontWeight: fontWeight.bold,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  list: {paddingHorizontal: spacing.lg, gap: spacing.sm},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  rowTitle: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.bold,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  rowSub: {
    fontSize: fontSize.small,
    color: colors.textMuted,
    marginTop: 2,
  },
  rowEstimate: {
    fontSize: fontSize.small,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
    marginTop: 4,
  },
  rowEnd: {alignItems: 'flex-end'},
  emptyMsg: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  emptySub: {
    fontSize: fontSize.small,
    color: colors.textMuted,
    marginTop: 4,
  },
});
