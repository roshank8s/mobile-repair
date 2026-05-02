import React, {useMemo} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {ScreenHeader} from '../../components/ScreenHeader';
import {Card} from '../../components/Card';
import {AnimatedPressable} from '../../components/AnimatedPressable';
import {StatusPill} from '../../components/StatusPill';
import {MoneyText} from '../../components/MoneyText';
import {PhoneIcon, WhatsAppIcon} from '../../components/icons';
import {colors, fontSize, fontWeight, radii, spacing} from '../../theme/tokens';
import {useStoreState} from '../../data/store';
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
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Not found" onBack={() => nav.goBack()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title={customer.name} onBack={() => nav.goBack()} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(260)}>
          <Card>
            <Text style={styles.label}>Phone</Text>
            <Text style={styles.value}>+91 {customer.phone}</Text>
            {customer.email ? (
              <>
                <Text style={[styles.label, {marginTop: spacing.md}]}>
                  Email
                </Text>
                <Text style={styles.value}>{customer.email}</Text>
              </>
            ) : null}
            {customer.address ? (
              <>
                <Text style={[styles.label, {marginTop: spacing.md}]}>
                  Address
                </Text>
                <Text style={styles.value}>{customer.address}</Text>
              </>
            ) : null}
            <View style={styles.actionRow}>
              <AnimatedPressable
                onPress={() => callPhone(customer.phone)}
                style={[styles.action, {backgroundColor: colors.primaryMuted}]}
                scaleTo={0.95}>
                <PhoneIcon size={18} color={colors.primary} />
                <Text style={[styles.actionLabel, {color: colors.primary}]}>
                  Call
                </Text>
              </AnimatedPressable>
              <AnimatedPressable
                onPress={() =>
                  openWhatsApp(
                    customer.phone,
                    `Hi ${customer.name}!`,
                  )
                }
                style={[styles.action, {backgroundColor: colors.successSoft}]}
                scaleTo={0.95}>
                <WhatsAppIcon size={18} color={colors.success} />
                <Text style={[styles.actionLabel, {color: colors.success}]}>
                  WhatsApp
                </Text>
              </AnimatedPressable>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(260).delay(80)}>
          <Card style={{marginTop: spacing.md}}>
            <Text style={styles.label}>Lifetime spend</Text>
            <MoneyText value={totalSpend} size="lg" />
            <Text style={styles.muted}>
              Across {jobs.length} job{jobs.length === 1 ? '' : 's'}
            </Text>
          </Card>
        </Animated.View>

        <Text style={styles.section}>Job history</Text>
        {jobs.length === 0 ? (
          <Card>
            <Text style={styles.muted}>No jobs yet for this customer.</Text>
          </Card>
        ) : (
          <View style={styles.list}>
            {jobs.map((j, i) => (
              <Animated.View
                key={j.id}
                entering={FadeInDown.duration(240).delay(i * 40)}>
                <AnimatedPressable
                  onPress={() => nav.navigate('JobDetail', {jobId: j.id})}
                  style={styles.jobRow}
                  scaleTo={0.99}>
                  <View style={styles.flex}>
                    <Text style={styles.jobTicket}>{j.ticketNo}</Text>
                    <Text style={styles.jobDevice}>
                      {j.device.brand} {j.device.model}
                    </Text>
                    <Text style={styles.jobTime}>
                      {formatRelative(j.receivedAt)} ·{' '}
                      {formatINR(j.finalAmount ?? j.estimateAmount)}
                    </Text>
                  </View>
                  <StatusPill status={j.status} size="sm" />
                </AnimatedPressable>
              </Animated.View>
            ))}
          </View>
        )}
        <View style={{height: spacing.huge}} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  flex: {flex: 1},
  scroll: {paddingHorizontal: spacing.lg, paddingBottom: spacing.huge},
  label: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.bold,
    color: colors.textSubtle,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  value: {
    fontSize: fontSize.body,
    color: colors.text,
    marginTop: 2,
    fontWeight: fontWeight.semibold,
  },
  actionRow: {flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg},
  action: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radii.md,
  },
  actionLabel: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.bold,
  },
  muted: {
    fontSize: fontSize.small,
    color: colors.textMuted,
    marginTop: 4,
  },
  section: {
    fontSize: fontSize.small,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  list: {gap: spacing.sm},
  jobRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  jobTicket: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.bold,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  jobDevice: {fontSize: fontSize.small, color: colors.textMuted, marginTop: 2},
  jobTime: {fontSize: fontSize.caption, color: colors.textSubtle, marginTop: 4},
});
