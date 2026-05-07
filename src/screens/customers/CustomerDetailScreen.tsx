import React, {useMemo} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Animated, {FadeIn} from 'react-native-reanimated';
import {Screen} from '../../components/Screen';
import {ScreenHeader} from '../../components/ScreenHeader';
import {AnimatedPressable} from '../../components/AnimatedPressable';
import {StatusPill} from '../../components/StatusPill';
import {PhotoPicker} from '../../components/PhotoPicker';
import {Button} from '../../components/Button';
import {colors, fontSize, fontWeight, spacing} from '../../theme/tokens';
import {upsertCustomer, useStoreState} from '../../data/store';
import {formatINR} from '../../lib/currency';
import {formatRelative} from '../../lib/date';
import {callPhone, openWhatsApp} from '../../lib/whatsapp';
import type {RootStackParamList} from '../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'CustomerDetail'>;

export const CustomerDetailScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const {customerId} = useRoute<Route>().params;
  const customer = useStoreState(s =>
    s.customers.find(c => c.id === customerId),
  );
  const jobs = useStoreState(s =>
    s.jobs.filter(j => j.customerId === customerId),
  );
  const totalSpend = useMemo(() => {
    return jobs
      .filter(j => j.status === 'delivered')
      .reduce((sum, j) => sum + (j.finalAmount ?? j.estimateAmount ?? 0), 0);
  }, [jobs]);

  if (!customer) {
    return (
      <Screen>
        <ScreenHeader title="Not found" onBack={() => nav.goBack()} />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader title="" onBack={() => nav.goBack()} />
      <Animated.View entering={FadeIn.duration(220)} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}>
          <View style={styles.heroBlock}>
            <PhotoPicker
              uri={customer.avatarUri}
              fallback={customer.name
                .split(' ')
                .map(p => p[0] ?? '')
                .join('')}
              size={72}
              onChange={u =>
                upsertCustomer({
                  id: customer.id,
                  name: customer.name,
                  phone: customer.phone,
                  email: customer.email,
                  address: customer.address,
                  avatarUri: u ?? undefined,
                })
              }
            />
            <Text style={styles.name}>{customer.name}</Text>
            <Text style={styles.phone}>+91 {customer.phone}</Text>
            <View style={styles.actionRow}>
              <Button
                label="Call"
                variant="secondary"
                size="sm"
                onPress={() => callPhone(customer.phone)}
              />
              <Button
                label="WhatsApp"
                variant="secondary"
                size="sm"
                onPress={() => openWhatsApp(customer.phone, `Hi ${customer.name}!`)}
              />
            </View>
          </View>

          <View style={styles.statsRow}>
            <Stat label="Lifetime spend" value={formatINR(totalSpend)} />
            <View style={styles.divider} />
            <Stat
              label="Jobs"
              value={String(jobs.length)}
            />
          </View>

          {customer.email || customer.address ? (
            <View style={styles.infoBlock}>
              {customer.email ? (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{customer.email}</Text>
                </View>
              ) : null}
              {customer.address ? (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Address</Text>
                  <Text style={styles.infoValue}>{customer.address}</Text>
                </View>
              ) : null}
            </View>
          ) : null}

          <Text style={styles.sectionTitle}>Job history</Text>
          {jobs.length === 0 ? (
            <Text style={styles.empty}>No jobs yet.</Text>
          ) : (
            <View style={styles.list}>
              {jobs.map(j => (
                <AnimatedPressable
                  key={j.id}
                  onPress={() => nav.navigate('JobDetail', {jobId: j.id})}
                  style={styles.jobRow}
                  scaleTo={0.99}>
                  <View style={styles.flex}>
                    <Text style={styles.jobDevice}>
                      {j.device.brand} {j.device.model}
                    </Text>
                    <Text style={styles.jobMeta}>
                      {j.ticketNo} · {formatRelative(j.receivedAt)} ·{' '}
                      {formatINR(j.finalAmount ?? j.estimateAmount)}
                    </Text>
                  </View>
                  <StatusPill status={j.status} size="sm" />
                </AnimatedPressable>
              ))}
            </View>
          )}

          <View style={{height: spacing.huge}} />
        </ScrollView>
      </Animated.View>
    </Screen>
  );
};

const Stat: React.FC<{label: string; value: string}> = ({label, value}) => (
  <View style={styles.statCell}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  flex: {flex: 1},
  scroll: {paddingBottom: spacing.huge},

  heroBlock: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  name: {
    marginTop: spacing.md,
    fontSize: fontSize.display,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    letterSpacing: -0.4,
  },
  phone: {
    marginTop: 4,
    fontSize: fontSize.body,
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },

  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  divider: {
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
    fontSize: fontSize.subhead,
    color: colors.text,
    fontWeight: fontWeight.medium,
    fontVariant: ['tabular-nums'],
  },

  infoBlock: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  infoRow: {gap: 4},
  infoLabel: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: fontSize.body,
    color: colors.text,
  },

  sectionTitle: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
    fontSize: fontSize.subhead,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  empty: {
    paddingHorizontal: spacing.xl,
    fontSize: fontSize.body,
    color: colors.textMuted,
  },
  list: {paddingHorizontal: spacing.xl},
  jobRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  jobDevice: {
    fontSize: fontSize.body,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  jobMeta: {
    marginTop: 2,
    fontSize: fontSize.small,
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
});
