import React, {useState} from 'react';
import {Alert, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Screen} from '../../components/Screen';
import {ScreenHeader} from '../../components/ScreenHeader';
import {Card} from '../../components/Card';
import {Input} from '../../components/Input';
import {Button} from '../../components/Button';
import {AnimatedPressable} from '../../components/AnimatedPressable';
import {Avatar} from '../../components/Avatar';
import {PhotoPicker} from '../../components/PhotoPicker';
import {TrashIcon, PlusIcon, CameraIcon} from '../../components/icons';
import {choosePhoto} from '../../lib/imagePicker';
import {colors, fontSize, fontWeight, radii, spacing} from '../../theme/tokens';
import {
  addTechnician,
  removeTechnician,
  resetAll,
  updateShop,
  updateTechnician,
  useStoreState,
} from '../../data/store';
import {useToast} from '../../components/Toast';
import type {RootStackParamList} from '../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const SettingsScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const shop = useStoreState(s => s.shop);
  const technicians = useStoreState(s => s.technicians);
  const toast = useToast();

  const [name, setName] = useState(shop.name);
  const [ownerName, setOwnerName] = useState(shop.ownerName);
  const [phone, setPhone] = useState(shop.phone);
  const [gstin, setGstin] = useState(shop.gstin ?? '');
  const [gstRate, setGstRate] = useState(String(shop.gstRatePct));
  const [address, setAddress] = useState(shop.address ?? '');
  const [newTech, setNewTech] = useState('');

  const save = () => {
    updateShop({
      name: name.trim(),
      ownerName: ownerName.trim(),
      phone: phone.trim(),
      gstin: gstin.trim() || undefined,
      gstRatePct: Number(gstRate) || 18,
      address: address.trim() || undefined,
    });
    toast.show('Settings saved');
  };

  const onAddTech = () => {
    const t = newTech.trim();
    if (!t) return;
    addTechnician(t);
    setNewTech('');
  };

  const onReset = () => {
    Alert.alert(
      'Reset all data?',
      'This will erase all jobs, customers, parts, invoices, and shop info. Cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetAll();
            toast.show('Data reset to defaults');
          },
        },
      ],
    );
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <ScreenHeader title="Settings" onBack={() => nav.goBack()} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <SectionTitle>Brand</SectionTitle>
        <Card>
          <View style={styles.brandRow}>
            <PhotoPicker
              uri={shop.logoUri}
              fallback={(name || 'RS').slice(0, 2)}
              size={84}
              shape="rounded"
              label="Shop logo"
              background={colors.primary}
              textColor={colors.textOnPrimary}
              onChange={u => updateShop({logoUri: u ?? undefined})}
            />
            <PhotoPicker
              uri={shop.ownerAvatarUri}
              fallback={(ownerName || 'O').slice(0, 2)}
              size={84}
              label="Owner photo"
              onChange={u => updateShop({ownerAvatarUri: u ?? undefined})}
            />
          </View>
        </Card>

        <SectionTitle>Shop info</SectionTitle>
        <Card>
          <View style={styles.gap}>
            <Input label="Shop name" value={name} onChangeText={setName} />
            <Input
              label="Owner"
              value={ownerName}
              onChangeText={setOwnerName}
            />
            <Input
              label="Phone"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
            />
            <Input
              label="Address"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={2}
            />
          </View>
        </Card>

        <SectionTitle>GST</SectionTitle>
        <Card>
          <View style={styles.gap}>
            <Input
              label="GSTIN"
              value={gstin}
              onChangeText={t => setGstin(t.toUpperCase())}
              autoCapitalize="characters"
              maxLength={15}
            />
            <Input
              label="Default GST rate (%)"
              value={gstRate}
              onChangeText={setGstRate}
              keyboardType="number-pad"
              maxLength={2}
            />
          </View>
        </Card>

        <SectionTitle>Technicians</SectionTitle>
        <Card>
          <View style={styles.gap}>
            {technicians.length === 0 ? (
              <Text style={styles.muted}>No technicians yet.</Text>
            ) : (
              technicians.map(t => (
                <View key={t.id} style={styles.techRow}>
                  <AnimatedPressable
                    onPress={async () => {
                      const picked = await choosePhoto();
                      if (picked) {
                        updateTechnician(t.id, {avatarUri: picked.dataUri});
                      }
                    }}
                    scaleTo={0.94}
                    style={styles.techAvatarWrap}>
                    <Avatar
                      uri={t.avatarUri}
                      fallback={t.name
                        .split(' ')
                        .map(p => p[0] ?? '')
                        .join('')}
                      size={44}
                    />
                    <View style={styles.techAvatarBadge}>
                      <CameraIcon
                        size={11}
                        color={colors.textOnPrimary}
                        strokeWidth={2.4}
                      />
                    </View>
                  </AnimatedPressable>
                  <View style={styles.flex}>
                    <Text style={styles.techName}>{t.name}</Text>
                    {t.phone ? (
                      <Text style={styles.techPhone}>{t.phone}</Text>
                    ) : null}
                  </View>
                  <AnimatedPressable
                    onPress={() => removeTechnician(t.id)}
                    style={styles.techRemove}
                    scaleTo={0.9}>
                    <TrashIcon size={18} color={colors.danger} />
                  </AnimatedPressable>
                </View>
              ))
            )}
            <View style={styles.addTechRow}>
              <Input
                value={newTech}
                onChangeText={setNewTech}
                placeholder="Technician name"
                containerStyle={styles.flex}
                onSubmitEditing={onAddTech}
              />
              <AnimatedPressable
                onPress={onAddTech}
                style={styles.addBtn}
                scaleTo={0.92}>
                <PlusIcon size={18} color={colors.textOnAccent} />
              </AnimatedPressable>
            </View>
          </View>
        </Card>

        <Button
          label="Save settings"
          variant="primary"
          size="lg"
          onPress={save}
          fullWidth
          style={{marginTop: spacing.lg}}
        />
        <Button
          label="Reset all data"
          variant="ghost"
          onPress={onReset}
          style={{marginTop: spacing.md}}
        />
        <View style={{height: spacing.huge}} />
      </ScrollView>
    </Screen>
  );
};

const SectionTitle: React.FC<{children: React.ReactNode}> = ({children}) => (
  <Text style={styles.sectionTitle}>{children}</Text>
);

const styles = StyleSheet.create({
  flex: {flex: 1},
  scroll: {paddingHorizontal: spacing.lg, paddingBottom: spacing.huge},
  sectionTitle: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  gap: {gap: spacing.md},
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  techAvatarWrap: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  techAvatarBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.card,
  },
  muted: {fontSize: fontSize.small, color: colors.textMuted},
  techRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  techName: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  techPhone: {fontSize: fontSize.caption, color: colors.textMuted, marginTop: 2},
  techRemove: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTechRow: {flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm},
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
