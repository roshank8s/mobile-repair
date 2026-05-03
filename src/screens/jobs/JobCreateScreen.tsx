import React, {useMemo, useState} from 'react';
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
import {Card} from '../../components/Card';
import {AnimatedPressable} from '../../components/AnimatedPressable';
import {colors, fontSize, fontWeight, radii, spacing} from '../../theme/tokens';
import {createJob, upsertCustomer, useStoreState} from '../../data/store';
import {useToast} from '../../components/Toast';
import {success as hapticSuccess} from '../../lib/haptics';
import type {RootStackParamList} from '../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const JobCreateScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const customers = useStoreState(s => s.customers);
  const technicians = useStoreState(s => s.technicians);
  const toast = useToast();

  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [imei, setImei] = useState('');
  const [color, setColor] = useState('');
  const [pwdNote, setPwdNote] = useState('');
  const [accessories, setAccessories] = useState('');
  const [issue, setIssue] = useState('');
  const [estimate, setEstimate] = useState('');
  const [techId, setTechId] = useState<string | undefined>();

  const matchingCustomer = useMemo(
    () => customers.find(c => c.phone === phone.trim()),
    [customers, phone],
  );

  React.useEffect(() => {
    if (matchingCustomer && !name) setName(matchingCustomer.name);
  }, [matchingCustomer, name]);

  const canSubmit =
    phone.trim().length >= 10 &&
    !!name.trim() &&
    !!brand.trim() &&
    !!model.trim() &&
    !!issue.trim();

  const submit = () => {
    if (!canSubmit) return;
    const customer = upsertCustomer({
      name: name.trim(),
      phone: phone.trim(),
    });
    const job = createJob({
      customerId: customer.id,
      device: {
        brand: brand.trim(),
        model: model.trim(),
        imei: imei.trim() || undefined,
        color: color.trim() || undefined,
        passwordNote: pwdNote.trim() || undefined,
        accessories: accessories.trim() || undefined,
      },
      issue: issue.trim(),
      estimateAmount: Number(estimate) || 0,
      technicianId: techId,
    });
    hapticSuccess();
    toast.show(`Ticket ${job.ticketNo} created`);
    nav.replace('JobDetail', {jobId: job.id});
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScreenHeader title="New Job" onBack={() => nav.goBack()} />
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeIn.duration(180)}>
            <SectionTitle>Customer</SectionTitle>
            <Card>
              <View style={styles.gap}>
                <Input
                  label="Phone"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  maxLength={10}
                  leftAdornment={<Text style={styles.prefix}>+91</Text>}
                  hint={
                    matchingCustomer
                      ? `Existing customer · ${matchingCustomer.name}`
                      : undefined
                  }
                />
                <Input
                  label="Customer name"
                  value={name}
                  onChangeText={setName}
                  placeholder="As they prefer to be addressed"
                />
              </View>
            </Card>

            <SectionTitle>Device</SectionTitle>
            <Card>
              <View style={styles.gap}>
                <View style={styles.row2}>
                  <Input
                    label="Brand"
                    value={brand}
                    onChangeText={setBrand}
                    placeholder="Apple, Samsung..."
                    containerStyle={styles.flex}
                  />
                  <Input
                    label="Model"
                    value={model}
                    onChangeText={setModel}
                    placeholder="iPhone 13, A52..."
                    containerStyle={styles.flex}
                  />
                </View>
                <View style={styles.row2}>
                  <Input
                    label="IMEI (optional)"
                    value={imei}
                    onChangeText={setImei}
                    keyboardType="number-pad"
                    maxLength={15}
                    containerStyle={styles.flex}
                  />
                  <Input
                    label="Colour"
                    value={color}
                    onChangeText={setColor}
                    placeholder="Midnight, Blue..."
                    containerStyle={styles.flex}
                  />
                </View>
                <Input
                  label="Password / pattern (optional)"
                  value={pwdNote}
                  onChangeText={setPwdNote}
                  placeholder="PIN, pattern, or 'no lock'"
                />
                <Input
                  label="Accessories received"
                  value={accessories}
                  onChangeText={setAccessories}
                  placeholder="Charger, case, SIM tray..."
                />
              </View>
            </Card>

            <SectionTitle>Issue</SectionTitle>
            <Card>
              <View style={styles.gap}>
                <Input
                  label="What's wrong?"
                  value={issue}
                  onChangeText={setIssue}
                  multiline
                  numberOfLines={3}
                  placeholder="e.g. Screen cracked, touch unresponsive..."
                />
                <Input
                  label="Estimate (₹)"
                  value={estimate}
                  onChangeText={setEstimate}
                  keyboardType="numeric"
                  leftAdornment={<Text style={styles.prefix}>₹</Text>}
                  hint="Leave 0 if quoting after diagnosis."
                />
              </View>
            </Card>

            {technicians.length > 0 ? (
              <>
                <SectionTitle>Assign technician</SectionTitle>
                <View style={styles.techRow}>
                  <AnimatedPressable
                    onPress={() => setTechId(undefined)}
                    style={[
                      styles.techChip,
                      !techId && styles.techChipActive,
                    ]}
                    scaleTo={0.95}>
                    <Text
                      style={[
                        styles.techLabel,
                        !techId && styles.techLabelActive,
                      ]}>
                      Unassigned
                    </Text>
                  </AnimatedPressable>
                  {technicians
                    .filter(t => t.active)
                    .map(t => (
                      <AnimatedPressable
                        key={t.id}
                        onPress={() => setTechId(t.id)}
                        style={[
                          styles.techChip,
                          techId === t.id && styles.techChipActive,
                        ]}
                        scaleTo={0.95}>
                        <Text
                          style={[
                            styles.techLabel,
                            techId === t.id && styles.techLabelActive,
                          ]}>
                          {t.name}
                        </Text>
                      </AnimatedPressable>
                    ))}
                </View>
              </>
            ) : null}
          </Animated.View>
        </ScrollView>
        <View style={styles.footer}>
          <Button
            label="Create job ticket"
            onPress={submit}
            disabled={!canSubmit}
            variant="primary"
            size="lg"
            fullWidth
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const SectionTitle: React.FC<{children: React.ReactNode}> = ({children}) => (
  <Text style={styles.sectionTitle}>{children}</Text>
);

const styles = StyleSheet.create({
  flex: {flex: 1},
  scroll: {paddingHorizontal: spacing.lg, paddingBottom: spacing.huge},
  gap: {gap: spacing.md},
  row2: {flexDirection: 'row', gap: spacing.md},
  sectionTitle: {
    fontSize: fontSize.small,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  prefix: {color: colors.textMuted, fontWeight: fontWeight.semibold},
  techRow: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm},
  techChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  techChipActive: {backgroundColor: colors.primary, borderColor: colors.primary},
  techLabel: {
    fontSize: fontSize.small,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
  },
  techLabelActive: {color: colors.textOnPrimary},
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
});
