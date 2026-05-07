import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Animated, {FadeIn} from 'react-native-reanimated';
import {Screen} from '../../components/Screen';
import {ScreenHeader} from '../../components/ScreenHeader';
import {Input} from '../../components/Input';
import {Button} from '../../components/Button';
import {AnimatedPressable} from '../../components/AnimatedPressable';
import {colors, fontSize, fontWeight, radii, spacing} from '../../theme/tokens';
import {addExpense} from '../../data/store';
import {
  EXPENSE_CATEGORY_LABEL,
  type ExpenseCategory,
  type PaymentMode,
} from '../../data/types';
import {useToast} from '../../components/Toast';
import {success as hapticSuccess} from '../../lib/haptics';
import type {RootStackParamList} from '../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CATEGORIES: ExpenseCategory[] = [
  'rent',
  'parts',
  'staff',
  'utility',
  'travel',
  'other',
];

export const ExpenseEditScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const toast = useToast();
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('parts');
  const [mode, setMode] = useState<PaymentMode>('upi');
  const [note, setNote] = useState('');

  const canSave = label.trim() && Number(amount) > 0;

  const save = () => {
    if (!canSave) return;
    addExpense({
      label: label.trim(),
      amount: Number(amount),
      category,
      mode,
      note: note.trim() || undefined,
    });
    hapticSuccess();
    toast.show('Expense saved');
    nav.goBack();
  };

  return (
    <Screen edges={['top', 'bottom']} maxContentWidth={560}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScreenHeader title="New expense" onBack={() => nav.goBack()} />
        <Animated.View entering={FadeIn.duration(220)} style={styles.flex}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <Section title="Details">
              <Input
                label="What was it for?"
                value={label}
                onChangeText={setLabel}
                placeholder="e.g. Shop rent, display lot"
              />
              <Input
                label="Amount"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                leftAdornment={<Text style={styles.prefix}>₹</Text>}
              />
            </Section>

            <Section title="Category">
              <View style={styles.chipRow}>
                {CATEGORIES.map(c => (
                  <AnimatedPressable
                    key={c}
                    onPress={() => setCategory(c)}
                    style={[styles.chip, category === c && styles.chipActive]}
                    scaleTo={0.96}>
                    <Text
                      style={[
                        styles.chipLabel,
                        category === c && styles.chipLabelActive,
                      ]}>
                      {EXPENSE_CATEGORY_LABEL[c]}
                    </Text>
                  </AnimatedPressable>
                ))}
              </View>
            </Section>

            <Section title="Paid via">
              <View style={styles.modeRow}>
                {(['cash', 'upi', 'card'] as PaymentMode[]).map(m => (
                  <AnimatedPressable
                    key={m}
                    onPress={() => setMode(m)}
                    style={[styles.modeChip, mode === m && styles.modeChipActive]}
                    scaleTo={0.96}>
                    <Text
                      style={[
                        styles.modeLabel,
                        mode === m && styles.modeLabelActive,
                      ]}>
                      {m.toUpperCase()}
                    </Text>
                  </AnimatedPressable>
                ))}
              </View>
            </Section>

            <Section title="Note">
              <Input
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={2}
                placeholder="Any extra detail (optional)"
              />
            </Section>

            <View style={{height: spacing.huge}} />
          </ScrollView>
        </Animated.View>
        <View style={styles.footer}>
          <Button
            label="Save expense"
            onPress={save}
            variant="primary"
            size="lg"
            disabled={!canSave}
            fullWidth
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const Section: React.FC<{title: string; children: React.ReactNode}> = ({
  title,
  children,
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.gap}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  flex: {flex: 1},
  scroll: {paddingHorizontal: spacing.xl, paddingBottom: spacing.huge},
  section: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.md,
  },
  gap: {gap: spacing.md},
  prefix: {color: colors.textMuted, fontWeight: fontWeight.medium},
  chipRow: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm},
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {backgroundColor: colors.primary, borderColor: colors.primary},
  chipLabel: {
    fontSize: fontSize.small,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
  },
  chipLabelActive: {color: colors.textOnPrimary},
  modeRow: {flexDirection: 'row', gap: spacing.sm},
  modeChip: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  modeChipActive: {backgroundColor: colors.primary, borderColor: colors.primary},
  modeLabel: {
    fontSize: fontSize.small,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  modeLabelActive: {color: colors.textOnPrimary},
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
});
