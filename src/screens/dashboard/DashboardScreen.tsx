import React, {useMemo} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {CommonActions, useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Animated, {FadeInDown, FadeInUp} from 'react-native-reanimated';
import {Screen} from '../../components/Screen';
import {Hero} from '../../components/Hero';
import {Avatar} from '../../components/Avatar';
import {AnimatedPressable} from '../../components/AnimatedPressable';
import {StatusPill} from '../../components/StatusPill';
import {SectionHeader} from '../../components/SectionHeader';
import {Fab} from '../../components/Fab';
import {MoneyText} from '../../components/MoneyText';
import {
  AlertIcon,
  ChevronRightIcon,
  ClipboardIcon,
  PackageIcon,
  PlusIcon,
  UsersIcon,
} from '../../components/icons';
import {
  colors,
  fontSize,
  fontWeight,
  radii,
  shadows,
  spacing,
} from '../../theme/tokens';
import {useStoreState} from '../../data/store';
import {isToday} from '../../lib/date';
import type {RootStackParamList} from '../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map(p => p[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('') || 'RS';

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
      .slice(0, 4);
  }, [jobs]);

  const goToJobs = () =>
    nav.dispatch(
      CommonActions.navigate({name: 'AppTabs', params: {screen: 'Jobs'}}),
    );

  const goToInventory = () =>
    nav.dispatch(
      CommonActions.navigate({name: 'AppTabs', params: {screen: 'Inventory'}}),
    );

  const goToCustomers = () =>
    nav.dispatch(
      CommonActions.navigate({name: 'AppTabs', params: {screen: 'Customers'}}),
    );

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        {/* Hero greeting */}
        <Animated.View
          entering={FadeInUp.duration(420).springify().damping(18)}
          style={styles.heroWrap}>
          <Hero style={styles.hero}>
            <View style={styles.heroTop}>
              <Avatar
                uri={shop.logoUri ?? shop.ownerAvatarUri}
                fallback={initials(shop.name)}
                size={48}
                background={colors.accent}
                textColor={colors.textOnAccent}
              />
              <View style={styles.flex}>
                <Text style={styles.heroGreeting}>
                  {greeting()},{' '}
                  <Text style={styles.heroName}>
                    {shop.ownerName?.split(' ')[0] || 'there'}
                  </Text>
                </Text>
                <Text style={styles.heroShop} numberOfLines={1}>
                  {shop.name || 'Repair Shop'}
                </Text>
              </View>
            </View>

            <View style={styles.heroDivider} />

            <View style={styles.heroBottom}>
              <View style={styles.flex}>
                <Text style={styles.heroLabel}>Today's revenue</Text>
                <MoneyText
                  value={stats.todayRevenue}
                  size="xl"
                  style={styles.heroMoney}
                />
              </View>
              <AnimatedPressable
                onPress={goToJobs}
                style={styles.heroPill}
                scaleTo={0.95}>
                <Text style={styles.heroPillLabel}>
                  {stats.todayJobs} job{stats.todayJobs === 1 ? '' : 's'} today
                </Text>
                <ChevronRightIcon
                  size={14}
                  color={colors.textOnPrimary}
                  strokeWidth={2.4}
                />
              </AnimatedPressable>
            </View>
          </Hero>
        </Animated.View>

        {/* Quick actions */}
        <View style={styles.quickRow}>
          <QuickAction
            icon={ClipboardIcon}
            label="New job"
            color={colors.primary}
            bg={colors.primaryMuted}
            delay={80}
            onPress={() => nav.navigate('JobCreate')}
          />
          <QuickAction
            icon={UsersIcon}
            label="Customers"
            color={colors.info}
            bg={colors.infoSoft}
            delay={140}
            onPress={goToCustomers}
          />
          <QuickAction
            icon={PackageIcon}
            label="Inventory"
            color={colors.accent}
            bg={colors.accentSoft}
            delay={200}
            onPress={goToInventory}
          />
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <StatTile
            label="In progress"
            value={stats.inProgress}
            accent={colors.warning}
            accentBg={colors.warningSoft}
            delay={220}
          />
          <StatTile
            label="Ready for pickup"
            value={stats.ready}
            accent={colors.success}
            accentBg={colors.successSoft}
            delay={280}
          />
        </View>
        <View style={styles.statsGrid}>
          <StatTile
            label="Customers"
            value={customers.length}
            accent={colors.info}
            accentBg={colors.infoSoft}
            delay={320}
          />
          <StatTile
            label="Parts in stock"
            value={parts.reduce((s, p) => s + p.stock, 0)}
            accent={colors.primary}
            accentBg={colors.primaryMuted}
            delay={360}
          />
        </View>

        {stats.lowStock.length > 0 ? (
          <Animated.View
            entering={FadeInDown.duration(360).delay(360).springify().damping(16)}
            style={{paddingHorizontal: spacing.lg, marginTop: spacing.md}}>
            <AnimatedPressable
              onPress={goToInventory}
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

        <SectionHeader
          title="Active jobs"
          caption={
            recentActive.length > 0
              ? `${recentActive.length} need attention`
              : 'No active jobs right now'
          }
          actionLabel={recentActive.length > 0 ? 'See all' : undefined}
          onAction={goToJobs}
        />

        {recentActive.length === 0 ? (
          <View style={[styles.emptyCard, {marginHorizontal: spacing.lg}]}>
            <Text style={styles.emptyTitle}>You're all caught up</Text>
            <Text style={styles.emptySub}>
              Tap the orange + button to log a new device.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {recentActive.map((j, i) => (
              <Animated.View
                key={j.id}
                entering={FadeInDown.duration(280)
                  .delay(60 * i)
                  .springify()
                  .damping(18)}>
                <ActiveJobCard
                  job={j}
                  customerName={
                    customers.find(c => c.id === j.customerId)?.name ??
                    'Walk-in'
                  }
                  customerAvatar={
                    customers.find(c => c.id === j.customerId)?.avatarUri
                  }
                  onPress={() => nav.navigate('JobDetail', {jobId: j.id})}
                />
              </Animated.View>
            ))}
          </View>
        )}

        <View style={{height: 110}} />
      </ScrollView>

      <Fab onPress={() => nav.navigate('JobCreate')} />
    </Screen>
  );
};

// ---- helpers ----

const QuickAction: React.FC<{
  icon: React.ComponentType<{size?: number; color?: string; strokeWidth?: number}>;
  label: string;
  color: string;
  bg: string;
  delay: number;
  onPress: () => void;
}> = ({icon: Icon, label, color, bg, delay, onPress}) => (
  <Animated.View
    entering={FadeInDown.duration(360).delay(delay).springify().damping(18)}
    style={styles.quickActionWrap}>
    <AnimatedPressable
      onPress={onPress}
      style={styles.quickAction}
      scaleTo={0.95}>
      <View style={[styles.quickIconWrap, {backgroundColor: bg}]}>
        <Icon size={22} color={color} strokeWidth={2.2} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </AnimatedPressable>
  </Animated.View>
);

const StatTile: React.FC<{
  label: string;
  value: number;
  accent: string;
  accentBg: string;
  delay: number;
}> = ({label, value, accent, accentBg, delay}) => (
  <Animated.View
    entering={FadeInDown.duration(360).delay(delay).springify().damping(18)}
    style={styles.statTile}>
    <View style={[styles.statBar, {backgroundColor: accent}]} />
    <View style={styles.flex}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
    <View style={[styles.statDot, {backgroundColor: accentBg}]}>
      <View style={[styles.statDotInner, {backgroundColor: accent}]} />
    </View>
  </Animated.View>
);

const STATUS_ACCENT: Record<string, string> = {
  received: colors.info,
  diagnosed: colors.info,
  quoted: colors.warning,
  approved: colors.warning,
  in_progress: colors.warning,
  ready: colors.success,
  delivered: colors.primary,
  cancelled: colors.danger,
};

const ActiveJobCard: React.FC<{
  job: any;
  customerName: string;
  customerAvatar?: string;
  onPress: () => void;
}> = ({job, customerName, customerAvatar, onPress}) => {
  const accent = STATUS_ACCENT[job.status] ?? colors.primary;
  return (
    <AnimatedPressable onPress={onPress} style={styles.jobRow} scaleTo={0.99}>
      <View style={[styles.jobAccent, {backgroundColor: accent}]} />
      <View style={styles.jobBody}>
        <View style={styles.jobTopRow}>
          <Avatar
            uri={customerAvatar}
            fallback={customerName
              .split(' ')
              .map(p => p[0] ?? '')
              .join('')}
            size={36}
          />
          <View style={styles.flex}>
            <Text style={styles.jobName} numberOfLines={1}>
              {customerName}
            </Text>
            <Text style={styles.jobTicket}>
              {job.ticketNo} · {job.device.brand} {job.device.model}
            </Text>
          </View>
          <StatusPill status={job.status} size="sm" />
        </View>
        <Text style={styles.jobIssue} numberOfLines={1}>
          {job.issue}
        </Text>
      </View>
    </AnimatedPressable>
  );
};

void PlusIcon;

const styles = StyleSheet.create({
  flex: {flex: 1, minWidth: 0},
  scroll: {paddingTop: spacing.sm, paddingBottom: spacing.huge},

  // Hero
  heroWrap: {paddingHorizontal: spacing.lg, marginBottom: spacing.lg},
  hero: {minHeight: 188, padding: spacing.xl, gap: spacing.md},
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  heroGreeting: {
    fontSize: fontSize.body,
    color: '#C7D2FE',
    fontWeight: fontWeight.semibold,
  },
  heroName: {color: '#FFFFFF', fontWeight: fontWeight.bold},
  heroShop: {
    color: '#FFFFFF',
    fontSize: fontSize.bodyLg,
    fontWeight: fontWeight.bold,
    marginTop: 1,
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginVertical: spacing.xs,
  },
  heroBottom: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  heroLabel: {
    fontSize: fontSize.caption,
    color: '#C7D2FE',
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  heroMoney: {color: '#FFFFFF'},
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  heroPillLabel: {
    color: '#FFFFFF',
    fontSize: fontSize.caption,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.3,
  },

  // Quick actions
  quickRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  quickActionWrap: {flex: 1},
  quickAction: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: spacing.sm,
    ...shadows.card,
  },
  quickIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontSize: fontSize.small,
    fontWeight: fontWeight.bold,
    color: colors.text,
    letterSpacing: 0.2,
  },

  // Stats
  statsGrid: {
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
  statBar: {
    width: 4,
    alignSelf: 'stretch',
    marginRight: spacing.md,
  },
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
  statDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Alert
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.warningSoft,
    borderColor: colors.warning,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  alertIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
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

  // Active jobs list
  list: {paddingHorizontal: spacing.lg, gap: spacing.sm},
  jobRow: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.lg,
    overflow: 'hidden',
    minHeight: 76,
    ...shadows.card,
  },
  jobAccent: {width: 4, alignSelf: 'stretch'},
  jobBody: {flex: 1, padding: spacing.md, gap: spacing.xs},
  jobTopRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.md},
  jobName: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  jobTicket: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  jobIssue: {fontSize: fontSize.small, color: colors.textMuted, marginLeft: 48},

  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: fontSize.bodyLg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  emptySub: {
    fontSize: fontSize.small,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
});
