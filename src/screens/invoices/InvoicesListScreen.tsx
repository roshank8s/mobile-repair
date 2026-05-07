import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Animated, {FadeIn} from 'react-native-reanimated';
import {Screen} from '../../components/Screen';
import {ScreenHeader} from '../../components/ScreenHeader';
import {AnimatedPressable} from '../../components/AnimatedPressable';
import {EmptyState} from '../../components/EmptyState';
import {colors, fontSize, fontWeight, spacing} from '../../theme/tokens';
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
      <ScreenHeader title="Invoices" onBack={() => nav.goBack()} />
      <Animated.View entering={FadeIn.duration(220)} style={styles.flex}>
        <View style={styles.subHeader}>
          <Text style={styles.title}>Invoices</Text>
          <Text style={styles.subtitle}>{invoices.length} total</Text>
        </View>

        {invoices.length === 0 ? (
          <View style={styles.flex}>
            <EmptyState
              title="No invoices yet"
              message="Generate one from a completed job."
            />
          </View>
        ) : (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}>
            {invoices.map(inv => {
              const cust = customers.find(c => c.id === inv.customerId);
              const job = jobs.find(j => j.id === inv.jobId);
              return (
                <AnimatedPressable
                  key={inv.id}
                  onPress={() =>
                    nav.navigate('InvoiceDetail', {invoiceId: inv.id})
                  }
                  style={styles.row}
                  scaleTo={0.99}>
                  <View style={styles.flex}>
                    <Text style={styles.invoiceNo}>{inv.invoiceNo}</Text>
                    <Text style={styles.meta}>
                      {cust?.name ?? 'Unknown'} · {job?.ticketNo}
                    </Text>
                    <Text style={styles.time}>
                      {formatRelative(inv.createdAt)}
                    </Text>
                  </View>
                  <Text style={styles.amount}>{formatINR(inv.total)}</Text>
                </AnimatedPressable>
              );
            })}
          </ScrollView>
        )}
      </Animated.View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1},
  subHeader: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.display,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 4,
    fontSize: fontSize.body,
    color: colors.textMuted,
  },
  list: {paddingHorizontal: spacing.xl, paddingBottom: spacing.huge},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  invoiceNo: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.medium,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  meta: {fontSize: fontSize.small, color: colors.textMuted, marginTop: 2},
  time: {fontSize: fontSize.caption, color: colors.textSubtle, marginTop: 2},
  amount: {
    fontSize: fontSize.subhead,
    color: colors.text,
    fontWeight: fontWeight.medium,
    fontVariant: ['tabular-nums'],
  },
});
