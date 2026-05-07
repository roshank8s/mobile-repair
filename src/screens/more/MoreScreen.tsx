import React from 'react';
import {Alert, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Animated, {FadeIn} from 'react-native-reanimated';
import {Screen} from '../../components/Screen';
import {ScreenHeader} from '../../components/ScreenHeader';
import {AnimatedPressable} from '../../components/AnimatedPressable';
import {Avatar} from '../../components/Avatar';
import {ChevronRightIcon} from '../../components/icons';
import {colors, fontSize, fontWeight, spacing} from '../../theme/tokens';
import {resetAll, useStoreState} from '../../data/store';
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
  const toast = useToast();

  const onHelp = () => {
    Alert.alert(
      'Help & Support',
      'For questions or issues, message the app developer on WhatsApp. Your data stays on this device.',
      [{text: 'OK'}],
    );
  };

  const onReset = () => {
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
      <Animated.View entering={FadeIn.duration(220)} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}>
          <View style={styles.profile}>
            <Avatar
              uri={shop.logoUri ?? shop.ownerAvatarUri}
              fallback={initials(shop.name)}
              size={64}
              background={colors.brand}
              textColor={colors.textOnPrimary}
            />
            <Text style={styles.shopName} numberOfLines={1}>
              {shop.name || 'Repair Shop'}
            </Text>
            <Text style={styles.ownerName}>
              {shop.ownerName || 'Owner'}
            </Text>
            {shop.gstin ? (
              <Text style={styles.gstin}>GSTIN {shop.gstin}</Text>
            ) : null}
          </View>

          <Group title="Business">
            <Row
              title="Reports"
              sub="Earnings, profit, top repairs"
              onPress={() => nav.navigate('Reports')}
            />
            <Row
              title="Expenses"
              sub="Rent, parts, utilities"
              onPress={() => nav.navigate('ExpensesList')}
            />
            <Row
              title="Invoices"
              sub="Past GST invoices"
              onPress={() => nav.navigate('InvoicesList')}
            />
            <Row
              title="GST & Tax"
              sub={
                shop.gstin
                  ? `${shop.gstRatePct}% default · GSTIN configured`
                  : `${shop.gstRatePct}% default · no GSTIN`
              }
              onPress={() => nav.navigate('Settings')}
            />
          </Group>

          <Group title="Shop">
            <Row
              title="Shop info"
              sub={shop.address ?? 'Address, phone, owner'}
              onPress={() => nav.navigate('Settings')}
            />
            <Row
              title="Technicians"
              sub="Manage your team"
              onPress={() => nav.navigate('Settings')}
            />
          </Group>

          <Group title="App">
            <Row
              title="Settings"
              sub="All preferences"
              onPress={() => nav.navigate('Settings')}
            />
            <Row title="Help & support" sub="Get in touch" onPress={onHelp} />
            <Row
              title="Reset all data"
              sub="Wipe shop and start over"
              danger
              onPress={onReset}
            />
          </Group>

          <Text style={styles.version}>Repair Shop · v1.0</Text>
          <View style={{height: spacing.huge}} />
        </ScrollView>
      </Animated.View>
    </Screen>
  );
};

const Group: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({title, children}) => (
  <View style={styles.group}>
    <Text style={styles.groupTitle}>{title}</Text>
    <View style={styles.groupBody}>{children}</View>
  </View>
);

const Row: React.FC<{
  title: string;
  sub?: string;
  onPress: () => void;
  danger?: boolean;
}> = ({title, sub, onPress, danger}) => (
  <AnimatedPressable onPress={onPress} style={styles.row} scaleTo={0.99}>
    <View style={styles.rowText}>
      <Text style={[styles.rowTitle, danger && {color: colors.danger}]}>
        {title}
      </Text>
      {sub ? (
        <Text style={styles.rowSub} numberOfLines={1}>
          {sub}
        </Text>
      ) : null}
    </View>
    <ChevronRightIcon size={18} color={colors.textSubtle} strokeWidth={1.8} />
  </AnimatedPressable>
);

const styles = StyleSheet.create({
  flex: {flex: 1},
  scroll: {paddingBottom: spacing.huge},

  profile: {
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  shopName: {
    marginTop: spacing.md,
    fontSize: fontSize.subhead,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  ownerName: {
    marginTop: 2,
    fontSize: fontSize.body,
    color: colors.textMuted,
  },
  gstin: {
    marginTop: 4,
    fontSize: fontSize.caption,
    color: colors.textSubtle,
    fontVariant: ['tabular-nums'],
  },

  group: {
    marginTop: spacing.xxl,
  },
  groupTitle: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
    fontSize: fontSize.caption,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  groupBody: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowText: {flex: 1, minWidth: 0},
  rowTitle: {
    fontSize: fontSize.body,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  rowSub: {
    fontSize: fontSize.small,
    color: colors.textMuted,
    marginTop: 2,
  },
  version: {
    marginTop: spacing.huge,
    textAlign: 'center',
    fontSize: fontSize.caption,
    color: colors.textSubtle,
  },
});
