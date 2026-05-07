import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {FadeIn} from 'react-native-reanimated';
import {Screen} from '../../components/Screen';
import {Button} from '../../components/Button';
import {Input} from '../../components/Input';
import {colors, fontSize, fontWeight, spacing} from '../../theme/tokens';
import {completeOnboarding} from '../../data/store';
import {success as hapticSuccess} from '../../lib/haptics';

export const OnboardingScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');

  const canSubmit = name.trim().length > 0 && ownerName.trim().length > 0;

  const finish = () => {
    if (!canSubmit) return;
    completeOnboarding({
      name: name.trim(),
      ownerName: ownerName.trim(),
      phone: phone.trim(),
      gstRatePct: 18,
      onboarded: true,
    });
    hapticSuccess();
  };

  return (
    <Screen edges={['top', 'bottom']} maxContentWidth={520}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Animated.View entering={FadeIn.duration(280)} style={styles.flex}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <Text style={styles.eyebrow}>Welcome</Text>
            <Text style={styles.title}>Set up your shop</Text>
            <Text style={styles.subtitle}>
              These show on invoices and WhatsApp messages. You can change
              everything later in Settings.
            </Text>

            <View style={styles.form}>
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
                label="Phone"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={10}
                leftAdornment={<Text style={styles.prefix}>+91</Text>}
                placeholder="Optional"
              />
            </View>
          </ScrollView>
        </Animated.View>
        <View style={styles.footer}>
          <Button
            label="Get started"
            variant="primary"
            size="lg"
            onPress={finish}
            disabled={!canSubmit}
            fullWidth
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1},
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.huge,
    paddingBottom: spacing.huge,
  },
  eyebrow: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 6,
    fontSize: fontSize.hero,
    color: colors.text,
    fontWeight: fontWeight.semibold,
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: spacing.md,
    fontSize: fontSize.bodyLg,
    color: colors.textMuted,
    lineHeight: 24,
  },
  form: {
    marginTop: spacing.huge,
    gap: spacing.lg,
  },
  prefix: {color: colors.textMuted, fontWeight: fontWeight.medium},
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
});
