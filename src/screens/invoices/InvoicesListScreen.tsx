import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {Screen} from '../../components/Screen';
import {ScreenHeader} from '../../components/ScreenHeader';
import {AnimatedPressable} from '../../components/AnimatedPressable';
import {EmptyState} from '../../components/EmptyState';
import {ChevronRightIcon} from '../../components/icons';
import {colors, fontSize, fontWeight, radii, spacing} from '../../theme/tokens';
import {useStoreState} from '../../data/store';
import {formatINR} from '../../lib/currency';
import {formatRelative} from '../../lib/date';
import type {RootStackParamList} from '../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const InvoicesListScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const invoices = useStoreState(s => s.invoices);
  const customers = useStoreState(s => s.customers);
  const jobs = useStoreState(s => s.jobs);

  return (
    <Screen>
      <ScreenHeader
        title="Invoices"
        subtitle={`${invoices.length} total`}
        onBack={() => nav.goBack()}
      />
      {invoices.length === 0 ? (
        <View style={styles.flex}>
          <EmptyState
            kind="invoices"
            title="No invoices yet"
            message="Generate one from a completed job."
          />
        </View>
      ) : (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}>
          {invoices.map((inv, i) => {
            const cust = customers.find(c => c.id === inv.customerId);
            const job = jobs.find(j => j.id === inv.jobId);
            return (
              <Animated.View
                key={inv.id}
                entering={FadeInDown.duration(260)
                  .delay(i * 30)
                  .springify()
                  .damping(18)}>
                <AnimatedPressable
                  onPress={() =>
                    nav.navigate('InvoiceDetail', {invoiceId: inv.id})
                  }
                  style={styles.row}
                  scaleTo={0.99}>
                  <View style={styles.flex}>
                    <Text style={styles.title}>{inv.invoiceNo}</Text>
                    <Text style={styles.sub}>
                      {cust?.name ?? 'Unknown'} · {job?.ticketNo}
                    </Text>
                    <Text style={styles.meta}>
                      {formatRelative(inv.createdAt)}
                    </Text>
                  </View>
                  <View style={styles.right}>
                    <Text style={styles.amount}>{formatINR(inv.total)}</Text>
                    <ChevronRightIcon size={18} color={colors.textSubtle} />
                  </View>
                </AnimatedPressable>
              </Animated.View>
            );
          })}
        </ScrollView>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1},
  list: {paddingHorizontal: spacing.lg, paddingBottom: spacing.huge, gap: spacing.sm},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.lg,
  },
  title: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.bold,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  sub: {fontSize: fontSize.small, color: colors.textMuted, marginTop: 2},
  meta: {fontSize: fontSize.caption, color: colors.textSubtle, marginTop: 2},
  right: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
  amount: {
    fontSize: fontSize.bodyLg,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
});
