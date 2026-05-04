import React, {useMemo} from 'react';
import {Alert, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Animated, {FadeInDown, FadeInUp} from 'react-native-reanimated';
import {Screen} from '../../components/Screen';
import {ScreenHeader} from '../../components/ScreenHeader';
import {AnimatedPressable} from '../../components/AnimatedPressable';
import {EmptyState} from '../../components/EmptyState';
import {Fab} from '../../components/Fab';
import {Hero} from '../../components/Hero';
import {MoneyText} from '../../components/MoneyText';
import {TrashIcon} from '../../components/icons';
import {colors, fontSize, fontWeight, radii, spacing} from '../../theme/tokens';
import {deleteExpense, useStoreState} from '../../data/store';
import {EXPENSE_CATEGORY_LABEL} from '../../data/types';
import {formatINR} from '../../lib/currency';
import {formatDate, formatRelative} from '../../lib/date';
import type {RootStackParamList} from '../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CATEGORY_COLOR: Record<string, {bg: string; fg: string}> = {
  rent: {bg: '#FEE2E2', fg: '#9F1239'},
  staff: {bg: '#E7F8EE', fg: '#166534'},
  parts: {bg: '#EEF2FF', fg: '#3730A3'},
  utility: {bg: '#FFF7ED', fg: '#9A3412'},
  travel: {bg: '#ECFEFF', fg: '#155E75'},
  other: {bg: '#F5F5F5', fg: '#525252'},
};

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
      <ScreenHeader
        title="Expenses"
        subtitle={`${expenses.length} entries`}
        onBack={() => nav.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <Animated.View
          entering={FadeInUp.duration(360).springify().damping(18)}
          style={styles.heroWrap}>
          <Hero style={styles.hero}>
            <View style={styles.heroRow}>
              <View style={styles.flex}>
                <Text style={styles.heroLabel}>This month</Text>
                <MoneyText value={totals.month} size="xl" style={styles.heroMoney} />
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.flex}>
                <Text style={styles.heroLabel}>All-time</Text>
                <MoneyText value={totals.all} size="md" style={styles.heroMoney} />
              </View>
            </View>
          </Hero>
        </Animated.View>

        {expenses.length === 0 ? (
          <View style={styles.flex}>
            <EmptyState
              kind="generic"
              title="No expenses yet"
              message="Tap + to log shop rent, parts purchases, utilities, etc."
              actionLabel="Add expense"
              onAction={() => nav.navigate('ExpenseEdit')}
            />
          </View>
        ) : (
          <View style={styles.list}>
            {expenses.map((e, i) => {
              const c = CATEGORY_COLOR[e.category];
              return (
                <Animated.View
                  key={e.id}
                  entering={FadeInDown.duration(260)
                    .delay(i * 30)
                    .springify()
                    .damping(18)}>
                  <View style={styles.row}>
                    <View style={[styles.catBadge, {backgroundColor: c.bg}]}>
                      <Text style={[styles.catBadgeText, {color: c.fg}]}>
                        {EXPENSE_CATEGORY_LABEL[e.category][0]}
                      </Text>
                    </View>
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
                      <Text style={styles.amount}>
                        - {formatINR(e.amount)}
                      </Text>
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
                        scaleTo={0.9}>
                        <TrashIcon size={14} color={colors.danger} />
                      </AnimatedPressable>
                    </View>
                  </View>
                </Animated.View>
              );
            })}
            <View style={{height: 110}} />
          </View>
        )}
      </ScrollView>
      <Fab label="Add expense" onPress={() => nav.navigate('ExpenseEdit')} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1, minWidth: 0},
  scroll: {paddingBottom: spacing.huge},
  heroWrap: {paddingHorizontal: spacing.lg, marginBottom: spacing.lg},
  hero: {padding: spacing.xl},
  heroRow: {flexDirection: 'row', alignItems: 'center'},
  heroDivider: {
    width: 1,
    height: 56,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginHorizontal: spacing.md,
  },
  heroLabel: {
    color: '#C7D2FE',
    fontSize: fontSize.caption,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  heroMoney: {color: '#FFFFFF'},
  list: {paddingHorizontal: spacing.lg, gap: spacing.sm},
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
  catBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catBadgeText: {fontSize: fontSize.bodyLg, fontWeight: fontWeight.black},
  label: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  meta: {fontSize: fontSize.caption, color: colors.textMuted, marginTop: 2},
  note: {fontSize: fontSize.caption, color: colors.textSubtle, marginTop: 2, fontStyle: 'italic'},
  right: {alignItems: 'flex-end', gap: 4},
  amount: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.bold,
    color: colors.danger,
    fontVariant: ['tabular-nums'],
  },
  time: {fontSize: fontSize.caption, color: colors.textSubtle},
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
});
