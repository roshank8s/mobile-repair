import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {FadeIn, FadeInDown} from 'react-native-reanimated';
import {Screen} from '../../components/Screen';
import {Button} from '../../components/Button';
import {Input} from '../../components/Input';
import {WrenchIcon} from '../../components/icons';
import {colors, fontSize, fontWeight, radii, spacing} from '../../theme/tokens';
import {completeOnboarding} from '../../data/store';
import {success as hapticSuccess} from '../../lib/haptics';

const STEPS = [
  {
    title: 'Welcome to your shop',
    subtitle:
      'A focused workspace for mobile repair shops in India — jobs, parts, GST invoices, all in one app.',
  },
  {
    title: 'Tell us about your shop',
    subtitle:
      'We use this on the printed invoice and on the WhatsApp message you send to customers.',
  },
  {
    title: 'GST setup (optional)',
    subtitle:
      'Add your GSTIN if you charge GST. We default to 18% on services (HSN 998719).',
  },
];

export const OnboardingScreen: React.FC = () => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gstin, setGstin] = useState('');
  const [gstRate, setGstRate] = useState('18');

  const finish = () => {
    completeOnboarding({
      name: name.trim() || 'Repair Shop',
      ownerName: ownerName.trim() || 'Owner',
      phone: phone.trim(),
      address: address.trim() || undefined,
      gstin: gstin.trim() || undefined,
      gstRatePct: Number(gstRate) || 18,
      onboarded: true,
    });
    hapticSuccess();
  };

  const next = () => {
    if (step === 0) setStep(1);
    else if (step === 1) {
      if (!name.trim()) return;
      setStep(2);
    } else finish();
  };

  const back = () => setStep(s => Math.max(0, s - 1));

  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled">
          <View style={styles.dots}>
            {STEPS.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === step && styles.dotActive,
                  i < step && styles.dotDone,
                ]}
              />
            ))}
          </View>

          <Animated.View
            key={step}
            entering={FadeIn.duration(220)}
            style={styles.heroBox}>
            <View style={styles.heroIcon}>
              <WrenchIcon size={32} color={colors.accent} />
            </View>
            <Text style={styles.title}>{STEPS[step].title}</Text>
            <Text style={styles.subtitle}>{STEPS[step].subtitle}</Text>
          </Animated.View>

          {step === 0 && (
            <Animated.View
              entering={FadeInDown.duration(280).delay(80)}
              style={styles.featureBox}>
              <Feature title="Jobs" message="Track every device from intake to delivery." />
              <Feature title="Inventory" message="Stock auto-decrements as you fit parts." />
              <Feature title="GST invoices" message="Share over WhatsApp in one tap." />
            </Animated.View>
          )}

          {step === 1 && (
            <Animated.View
              entering={FadeInDown.duration(280).delay(80)}
              style={styles.formBox}>
              <Input
                label="Shop name"
                value={name}
                onChangeText={setName}
                placeholder="e.g. Rohit Mobile Care"
              />
              <Input
                label="Owner name"
                value={ownerName}
                onChangeText={setOwnerName}
                placeholder="Your name"
              />
              <Input
                label="Phone (10 digits)"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={10}
                leftAdornment={
                  <Text style={styles.prefix}>+91</Text>
                }
                placeholder="9876543210"
              />
              <Input
                label="Shop address (optional)"
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={2}
                placeholder="Sector / area / city"
              />
            </Animated.View>
          )}

          {step === 2 && (
            <Animated.View
              entering={FadeInDown.duration(280).delay(80)}
              style={styles.formBox}>
              <Input
                label="GSTIN (optional)"
                value={gstin}
                onChangeText={t => setGstin(t.toUpperCase())}
                autoCapitalize="characters"
                placeholder="22AAAAA0000A1Z5"
                maxLength={15}
              />
              <Input
                label="Default GST rate (%)"
                value={gstRate}
                onChangeText={setGstRate}
                keyboardType="number-pad"
                maxLength={2}
                hint="HSN 998719 — Repair of communication equipment."
              />
            </Animated.View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          {step > 0 ? (
            <Button label="Back" variant="ghost" onPress={back} />
          ) : (
            <View />
          )}
          <Button
            label={step === 2 ? 'Start using app' : 'Continue'}
            onPress={next}
            variant="primary"
            size="lg"
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const Feature: React.FC<{title: string; message: string}> = ({title, message}) => (
  <View style={styles.feature}>
    <View style={styles.featureBullet} />
    <View style={styles.flex}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureMsg}>{message}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  flex: {flex: 1},
  scroll: {padding: spacing.xl, paddingBottom: spacing.xxxl},
  dots: {flexDirection: 'row', gap: 6, alignSelf: 'center', marginBottom: spacing.xxl},
  dot: {width: 18, height: 4, borderRadius: 2, backgroundColor: colors.border},
  dotActive: {backgroundColor: colors.primary, width: 28},
  dotDone: {backgroundColor: colors.accent},
  heroBox: {alignItems: 'center', marginBottom: spacing.xxl},
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.display,
    fontWeight: fontWeight.bold,
    color: colors.textOnBg,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.body,
    color: colors.textOnBgMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    lineHeight: 22,
  },
  featureBox: {gap: spacing.md, marginTop: spacing.lg},
  feature: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginTop: 8,
  },
  featureTitle: {
    fontSize: fontSize.bodyLg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  featureMsg: {fontSize: fontSize.small, color: colors.textMuted, marginTop: 2},
  formBox: {gap: spacing.md},
  prefix: {color: colors.textMuted, fontWeight: fontWeight.semibold},
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
});
