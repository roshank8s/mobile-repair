import React, {useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Animated, {FadeIn} from 'react-native-reanimated';
import {Screen} from '../../components/Screen';
import {ScreenHeader} from '../../components/ScreenHeader';
import {Input} from '../../components/Input';
import {Button} from '../../components/Button';
import {PhotoPicker} from '../../components/PhotoPicker';
import {colors, fontSize, fontWeight, spacing} from '../../theme/tokens';
import {deletePart, upsertPart, useStoreState} from '../../data/store';
import {useToast} from '../../components/Toast';
import {success as hapticSuccess} from '../../lib/haptics';
import type {RootStackParamList} from '../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'PartEdit'>;

export const PartEditScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const route = useRoute<Route>();
  const partId = route.params?.partId;
  const existing = useStoreState(s =>
    partId ? s.parts.find(p => p.id === partId) : undefined,
  );
  const toast = useToast();

  const [name, setName] = useState(existing?.name ?? '');
  const [brand, setBrand] = useState(existing?.brand ?? '');
  const [compatModels, setCompatModels] = useState(existing?.compatModels ?? '');
  const [supplier, setSupplier] = useState(existing?.supplier ?? '');
  const [costPrice, setCostPrice] = useState(
    existing ? String(existing.costPrice) : '',
  );
  const [sellPrice, setSellPrice] = useState(
    existing ? String(existing.sellPrice) : '',
  );
  const [stock, setStock] = useState(existing ? String(existing.stock) : '0');
  const [lowStockAt, setLowStockAt] = useState(
    existing ? String(existing.lowStockAt) : '3',
  );
  const [imageUri, setImageUri] = useState<string | undefined>(
    existing?.imageUri,
  );

  const canSave = name.trim() && Number(sellPrice) > 0;

  const save = () => {
    if (!canSave) return;
    upsertPart({
      id: existing?.id,
      name: name.trim(),
      brand: brand.trim() || undefined,
      compatModels: compatModels.trim() || undefined,
      supplier: supplier.trim() || undefined,
      costPrice: Number(costPrice) || 0,
      sellPrice: Number(sellPrice),
      stock: Number(stock) || 0,
      lowStockAt: Number(lowStockAt) || 0,
      imageUri,
    });
    hapticSuccess();
    toast.show(existing ? 'Part updated' : 'Part added');
    nav.goBack();
  };

  const remove = () => {
    if (!existing) return;
    Alert.alert('Delete part?', 'This cannot be undone.', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deletePart(existing.id);
          toast.show('Part deleted');
          nav.goBack();
        },
      },
    ]);
  };

  return (
    <Screen edges={['top', 'bottom']} maxContentWidth={560}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScreenHeader
          title={existing ? 'Edit part' : 'Add part'}
          onBack={() => nav.goBack()}
        />
        <Animated.View entering={FadeIn.duration(220)} style={styles.flex}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.imageRow}>
              <PhotoPicker
                uri={imageUri}
                fallback={name.slice(0, 2) || 'P'}
                size={88}
                shape="rounded"
                label="Part image"
                onChange={u => setImageUri(u ?? undefined)}
              />
            </View>

            <Section title="Identity">
              <Input
                label="Part name"
                value={name}
                onChangeText={setName}
                placeholder="e.g. iPhone 13 Display"
              />
              <View style={styles.row2}>
                <Input
                  label="Brand"
                  value={brand}
                  onChangeText={setBrand}
                  containerStyle={styles.flex}
                  placeholder="Apple, Samsung..."
                />
                <Input
                  label="Models"
                  value={compatModels}
                  onChangeText={setCompatModels}
                  containerStyle={styles.flex}
                  placeholder="iPhone 13, 13 Pro"
                />
              </View>
              <Input
                label="Supplier"
                value={supplier}
                onChangeText={setSupplier}
                placeholder="Vendor name / shop"
              />
            </Section>

            <Section title="Pricing">
              <View style={styles.row2}>
                <Input
                  label="Cost price"
                  value={costPrice}
                  onChangeText={setCostPrice}
                  keyboardType="numeric"
                  containerStyle={styles.flex}
                  leftAdornment={<Text style={styles.prefix}>₹</Text>}
                />
                <Input
                  label="Sell price"
                  value={sellPrice}
                  onChangeText={setSellPrice}
                  keyboardType="numeric"
                  containerStyle={styles.flex}
                  leftAdornment={<Text style={styles.prefix}>₹</Text>}
                />
              </View>
            </Section>

            <Section title="Stock">
              <View style={styles.row2}>
                <Input
                  label="Current stock"
                  value={stock}
                  onChangeText={setStock}
                  keyboardType="number-pad"
                  containerStyle={styles.flex}
                />
                <Input
                  label="Low-stock alert at"
                  value={lowStockAt}
                  onChangeText={setLowStockAt}
                  keyboardType="number-pad"
                  containerStyle={styles.flex}
                />
              </View>
            </Section>

            {existing ? (
              <Button
                label="Delete part"
                variant="ghost"
                onPress={remove}
                style={styles.deleteBtn}
              />
            ) : null}

            <View style={{height: spacing.huge}} />
          </ScrollView>
        </Animated.View>
        <View style={styles.footer}>
          <Button
            label={existing ? 'Save changes' : 'Add part'}
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
  imageRow: {alignItems: 'center', paddingVertical: spacing.lg},
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
  row2: {flexDirection: 'row', gap: spacing.md},
  prefix: {color: colors.textMuted, fontWeight: fontWeight.medium},
  deleteBtn: {
    marginTop: spacing.xl,
    alignSelf: 'center',
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
});
