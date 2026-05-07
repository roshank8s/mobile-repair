import React, {useMemo} from 'react';
import {Alert, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Animated, {FadeIn} from 'react-native-reanimated';
import {Screen} from '../../components/Screen';
import {ScreenHeader} from '../../components/ScreenHeader';
import {AnimatedPressable} from '../../components/AnimatedPressable';
import {EmptyState} from '../../components/EmptyState';
import {Fab} from '../../components/Fab';
import {MoneyText} from '../../components/MoneyText';
import {TrashIcon} from '../../components/icons';
import {colors, fontSize, fontWeight, spacing} from '../../theme/tokens';
import {deleteExpense, useStoreState} from '../../data/store';
import {EXPENSE_CATEGORY_LABEL} from '../../data/types';
import {formatINR} from '../../lib/currency';
import {formatDate, formatRelative} from '../../lib/date';
import type {RootStackParamList} from '../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const startOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
};

export const ExpensesListScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const expenses = useStoreState(s => s.expenses);

  const totals = useMemo(() => {
    const monthCutoff = startOfMonth();
    const month = expenses
      .filter(e => new Date(e.at).getTime() >= monthCutoff)
      .reduce((s, e) => s + e.amount, 0);
    const all = expenses.reduce((s, e) => s + e.amount, 0);
    return {month, all};
  }, [expenses]);

  return (
    <Screen>
      <ScreenHeader title="Expenses" onBack={() => nav.goBack()} />
      <Animated.View entering={FadeIn.duration(220)} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}>
          <View style={styles.totalsBlock}>
            <Text style={styles.totalLabel}>This month</Text>
            <MoneyText
              value={totals.month}
              size="xl"
              animate={false}
              style={styles.totalMoney}
            />
            <Text style={styles.totalAll}>All-time {formatINR(totals.all)}</Text>
          </View>

          {expenses.length === 0 ? (
            <View style={styles.flex}>
              <EmptyState
                title="No expenses yet"
                message="Tap + to log shop rent, parts purchases, utilities, etc."
                actionLabel="Add expense"
                onAction={() => nav.navigate('ExpenseEdit')}
              />
            </View>
          ) : (
            <View style={styles.list}>
              {expenses.map(e => (
                <View key={e.id} style={styles.row}>
                  <View style={styles.flex}>
                    <Text style={styles.label} numberOfLines={1}>
                      {e.label}
                    </Text>
                    <Text style={styles.meta} numberOfLines={1}>
                      {EXPENSE_CATEGORY_LABEL[e.category]} · {e.mode.toUpperCase()} ·{' '}
                      {formatDate(e.at)}
                    </Text>
                    {e.note ? (
                      <Text style={styles.note} numberOfLines={1}>
                        {e.note}
                      </Text>
                    ) : null}
                  </View>
                  <View style={styles.right}>
                    <Text style={styles.amount}>- {formatINR(e.amount)}</Text>
                    <Text style={styles.time}>{formatRelative(e.at)}</Text>
                    <AnimatedPressable
                      onPress={() => {
                        Alert.alert('Delete expense?', e.label, [
                          {text: 'Cancel', style: 'cancel'},
                          {
                            text: 'Delete',
                            style: 'destructive',
                            onPress: () => deleteExpense(e.id),
                          },
                        ]);
                      }}
                      style={styles.deleteBtn}
                      scaleTo={0.92}>
                      <TrashIcon size={14} color={colors.danger} />
                    </AnimatedPressable>
                  </View>
                </View>
              ))}
              <View style={{height: 110}} />
            </View>
          )}
        </ScrollView>
      </Animated.View>
      <Fab label="Add expense" onPress={() => nav.navigate('ExpenseEdit')} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1, minWidth: 0},
  scroll: {paddingBottom: spacing.huge},
  totalsBlock: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  totalLabel: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  totalMoney: {
    color: colors.text,
    fontSize: fontSize.hero,
    fontWeight: fontWeight.semibold,
  },
  totalAll: {
    marginTop: 6,
    fontSize: fontSize.body,
    color: colors.textMuted,
  },

  list: {paddingHorizontal: spacing.xl},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: fontSize.bodyLg,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  meta: {
    fontSize: fontSize.small,
    color: colors.textMuted,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  note: {
    fontSize: fontSize.small,
    color: colors.textSubtle,
    marginTop: 2,
    fontStyle: 'italic',
  },
  right: {alignItems: 'flex-end', gap: 4},
  amount: {
    fontSize: fontSize.body,
    color: colors.danger,
    fontWeight: fontWeight.medium,
    fontVariant: ['tabular-nums'],
  },
  time: {fontSize: fontSize.caption, color: colors.textSubtle},
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
});
