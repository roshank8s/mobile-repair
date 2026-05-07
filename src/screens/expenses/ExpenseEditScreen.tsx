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
import {Screen} from '../../components/Screen';
import {ScreenHeader} from '../../components/ScreenHeader';
import {Card} from '../../components/Card';
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
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScreenHeader title="New expense" onBack={() => nav.goBack()} />
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Card>
            <View style={styles.gap}>
              <Input
                label="What was it for?"
                value={label}
                onChangeText={setLabel}
                placeholder="e.g. Shop rent, Display lot"
              />
              <Input
                label="Amount (₹)"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                leftAdornment={<Text style={styles.prefix}>₹</Text>}
              />
              <View>
                <Text style={styles.fieldLabel}>Category</Text>
                <View style={styles.chipRow}>
                  {CATEGORIES.map(c => (
                    <AnimatedPressable
                      key={c}
                      onPress={() => setCategory(c)}
                      style={[styles.chip, category === c && styles.chipActive]}
                      scaleTo={0.95}>
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
              </View>
              <View>
                <Text style={styles.fieldLabel}>Paid via</Text>
                <View style={styles.chipRow}>
                  {(['cash', 'upi', 'card'] as PaymentMode[]).map(m => (
                    <AnimatedPressable
                      key={m}
                      onPress={() => setMode(m)}
                      style={[styles.modeChip, mode === m && styles.modeChipActive]}
                      scaleTo={0.95}>
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
              </View>
              <Input
                label="Note (optional)"
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={2}
                placeholder="Any extra detail"
              />
            </View>
          </Card>
        </ScrollView>
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

const styles = StyleSheet.create({
  flex: {flex: 1},
  scroll: {paddingHorizontal: spacing.lg, paddingBottom: spacing.huge},
  gap: {gap: spacing.md},
  prefix: {color: colors.textMuted, fontWeight: fontWeight.semibold},
  fieldLabel: {
    fontSize: fontSize.small,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  chipRow: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm},
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {backgroundColor: colors.primary, borderColor: colors.primary},
  chipLabel: {
    fontSize: fontSize.small,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
  },
  chipLabelActive: {color: colors.textOnPrimary},
  modeChip: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  modeChipActive: {backgroundColor: colors.primary, borderColor: colors.primary},
  modeLabel: {
    fontSize: fontSize.small,
    fontWeight: fontWeight.bold,
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
