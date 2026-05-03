import React, {useMemo} from 'react';
import {Alert, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useNavigation, CommonActions} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {Screen} from '../../components/Screen';
import {ScreenHeader} from '../../components/ScreenHeader';
import {AnimatedPressable} from '../../components/AnimatedPressable';
import {MoneyText} from '../../components/MoneyText';
import {
  BarChartIcon,
  ChevronRightIcon,
  HelpIcon,
  LogOutIcon,
  PercentIcon,
  PlusIcon,
  ReceiptIcon,
  SettingsIcon,
  StoreIcon,
  UsersIcon,
  WhatsAppIcon,
} from '../../components/icons';
import {colors, fontSize, fontWeight, radii, shadows, spacing} from '../../theme/tokens';
import {resetAll, useStoreState} from '../../data/store';
import {isToday} from '../../lib/date';
import {useToast} from '../../components/Toast';
import type {RootStackParamList} from '../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map(p => p[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('') || 'RS';

export const MoreScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const shop = useStoreState(s => s.shop);
  const jobs = useStoreState(s => s.jobs);
  const payments = useStoreState(s => s.payments);
  const toast = useToast();

  const stats = useMemo(() => {
    const totalJobs = jobs.length;
    const todayRevenue = payments
      .filter(p => isToday(p.at))
      .reduce((sum, p) => sum + p.amount, 0);
    return {totalJobs, todayRevenue};
  }, [jobs, payments]);

  const goToTab = (tabName: 'Dashboard' | 'Jobs' | 'Customers' | 'Inventory') =>
    nav.dispatch(
      CommonActions.navigate({
        name: 'AppTabs',
        params: {screen: tabName},
      }),
    );

  const onHelp = () => {
    Alert.alert(
      'Help & Support',
      'For questions or issues, message the app developer on WhatsApp. Your data stays on this device.',
      [{text: 'OK'}],
    );
  };

  const onLogout = () => {
    Alert.alert(
      'Reset shop data?',
      'This wipes all jobs, customers, parts, invoices, and shop settings. Cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetAll();
            toast.show('All data reset');
          },
        },
      ],
    );
  };

  return (
    <Screen>
      <ScreenHeader title="More" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        {/* Profile card */}
        <Animated.View entering={FadeInDown.duration(300).springify().damping(18)}>
          <View style={styles.profileCard}>
            <View style={styles.profileTop}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials(shop.name)}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.shopName} numberOfLines={1}>
                  {shop.name || 'Repair Shop'}
                </Text>
                <Text style={styles.shopRole}>
                  {shop.ownerName || 'Owner'} · Owner
                </Text>
                {shop.gstin ? (
                  <Text style={styles.shopGstin}>GSTIN {shop.gstin}</Text>
                ) : null}
              </View>
            </View>

            <View style={styles.profileStatsRow}>
              <View style={styles.profileStat}>
                <Text style={styles.profileStatLabel}>Total jobs</Text>
                <Text style={styles.profileStatValue}>{stats.totalJobs}</Text>
              </View>
              <View style={styles.profileDivider} />
              <View style={styles.profileStat}>
                <Text style={styles.profileStatLabel}>Today's revenue</Text>
                <MoneyText
                  value={stats.todayRevenue}
                  size="md"
                  style={styles.profileStatMoney}
                />
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Quick actions */}
        <Animated.View
          entering={FadeInDown.duration(300).delay(60).springify().damping(18)}
          style={styles.quickActionsRow}>
          <QuickAction
            icon={ReceiptIcon}
            label="Create Invoice"
            color={colors.primary}
            bg={colors.primaryMuted}
            onPress={() => goToTab('Jobs')}
          />
          <QuickAction
            icon={PlusIcon}
            label="Add Technician"
            color={colors.success}
            bg={colors.successSoft}
            onPress={() => nav.navigate('Settings')}
          />
          <QuickAction
            icon={BarChartIcon}
            label="View Reports"
            color={colors.accent}
            bg={colors.accentSoft}
            onPress={() => goToTab('Dashboard')}
          />
        </Animated.View>

        {/* Sections */}
        <Section title="Business" delay={120}>
          <Row
            icon={ReceiptIcon}
            iconBg={colors.primaryMuted}
            iconColor={colors.primary}
            title="Invoices"
            sub="Past GST invoices"
            onPress={() => nav.navigate('InvoicesList')}
          />
          <Row
            icon={PercentIcon}
            iconBg={colors.warningSoft}
            iconColor={colors.warning}
            title="GST & Tax"
            sub={
              shop.gstin
                ? `${shop.gstRatePct}% default · GSTIN configured`
                : `${shop.gstRatePct}% default · no GSTIN`
            }
            onPress={() => nav.navigate('Settings')}
          />
        </Section>

        <Section title="Management" delay={180}>
          <Row
            icon={UsersIcon}
            iconBg={colors.successSoft}
            iconColor={colors.success}
            title="Technicians"
            sub="Manage your team"
            onPress={() => nav.navigate('Settings')}
          />
          <Row
            icon={StoreIcon}
            iconBg={colors.infoSoft}
            iconColor={colors.info}
            title="Shop Info"
            sub={shop.address ?? 'Address, phone, owner'}
            onPress={() => nav.navigate('Settings')}
          />
        </Section>

        <Section title="App" delay={240}>
          <Row
            icon={SettingsIcon}
            iconBg={colors.cardMuted}
            iconColor={colors.text}
            title="Settings"
            sub="All preferences"
            onPress={() => nav.navigate('Settings')}
          />
          <Row
            icon={HelpIcon}
            iconBg={colors.infoSoft}
            iconColor={colors.info}
            title="Help & Support"
            sub="Get in touch"
            rightIcon={
              <View style={styles.waBadge}>
                <WhatsAppIcon size={14} color={colors.success} />
              </View>
            }
            onPress={onHelp}
          />
          <Row
            icon={LogOutIcon}
            iconBg={colors.dangerSoft}
            iconColor={colors.danger}
            title="Reset all data"
            sub="Wipe shop and start over"
            danger
            onPress={onLogout}
          />
        </Section>

        <Text style={styles.versionText}>Repair Shop · v1.0</Text>
        <View style={{height: spacing.huge}} />
      </ScrollView>
    </Screen>
  );
};

const QuickAction: React.FC<{
  icon: React.ComponentType<{size?: number; color?: string; strokeWidth?: number}>;
  label: string;
  color: string;
  bg: string;
  onPress: () => void;
}> = ({icon: Icon, label, color, bg, onPress}) => (
  <AnimatedPressable
    onPress={onPress}
    style={[styles.quickAction, {backgroundColor: colors.card}]}
    scaleTo={0.97}>
    <View style={[styles.quickActionIcon, {backgroundColor: bg}]}>
      <Icon size={22} color={color} strokeWidth={2.2} />
    </View>
    <Text style={styles.quickActionLabel} numberOfLines={2}>
      {label}
    </Text>
  </AnimatedPressable>
);

const Section: React.FC<{
  title: string;
  delay: number;
  children: React.ReactNode;
}> = ({title, delay, children}) => (
  <Animated.View
    entering={FadeInDown.duration(300).delay(delay).springify().damping(18)}
    style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionGroup}>{children}</View>
  </Animated.View>
);

const Row: React.FC<{
  icon: React.ComponentType<{size?: number; color?: string; strokeWidth?: number}>;
  iconBg: string;
  iconColor: string;
  title: string;
  sub: string;
  onPress: () => void;
  danger?: boolean;
  rightIcon?: React.ReactNode;
}> = ({icon: Icon, iconBg, iconColor, title, sub, onPress, danger, rightIcon}) => (
  <AnimatedPressable onPress={onPress} style={styles.row} scaleTo={0.99}>
    <View style={[styles.rowIcon, {backgroundColor: iconBg}]}>
      <Icon size={20} color={iconColor} strokeWidth={2.2} />
    </View>
    <View style={styles.rowText}>
      <Text style={[styles.rowTitle, danger && {color: colors.danger}]}>
        {title}
      </Text>
      <Text style={styles.rowSub} numberOfLines={1}>
        {sub}
      </Text>
    </View>
    {rightIcon ?? <ChevronRightIcon size={20} color={colors.textSubtle} />}
  </AnimatedPressable>
);

const styles = StyleSheet.create({
  scroll: {paddingHorizontal: spacing.lg, paddingBottom: spacing.huge},

  // Profile
  profileCard: {
    backgroundColor: colors.primary,
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.raised,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: fontSize.subhead,
    fontWeight: fontWeight.black,
    color: colors.textOnAccent,
    letterSpacing: 1,
  },
  profileInfo: {flex: 1, minWidth: 0},
  shopName: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    color: colors.textOnPrimary,
  },
  shopRole: {
    fontSize: fontSize.small,
    color: '#C7D2FE',
    marginTop: 2,
    fontWeight: fontWeight.semibold,
  },
  shopGstin: {
    fontSize: fontSize.caption,
    color: '#A5B4FC',
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  profileStatsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radii.lg,
    marginTop: spacing.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  profileStat: {flex: 1, alignItems: 'flex-start'},
  profileDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginHorizontal: spacing.md,
  },
  profileStatLabel: {
    fontSize: fontSize.caption,
    color: '#C7D2FE',
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  profileStatValue: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    color: colors.textOnPrimary,
    marginTop: 4,
    fontVariant: ['tabular-nums'],
  },
  profileStatMoney: {
    color: colors.textOnPrimary,
    marginTop: 4,
  },

  // Quick actions
  quickActionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  quickAction: {
    flex: 1,
    minHeight: 100,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.card,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 0.2,
  },

  // Sections
  section: {marginTop: spacing.lg},
  sectionTitle: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  sectionGroup: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    minHeight: 64,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {flex: 1, minWidth: 0},
  rowTitle: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  rowSub: {fontSize: fontSize.small, color: colors.textMuted, marginTop: 2},
  waBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  versionText: {
    textAlign: 'center',
    fontSize: fontSize.caption,
    color: colors.textSubtle,
    marginTop: spacing.huge,
  },
});
