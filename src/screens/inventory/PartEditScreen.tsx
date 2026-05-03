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
import {Screen} from '../../components/Screen';
import {ScreenHeader} from '../../components/ScreenHeader';
import {Card} from '../../components/Card';
import {Input} from '../../components/Input';
import {Button} from '../../components/Button';
import {colors, fontWeight, spacing} from '../../theme/tokens';
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
  const [compatModels, setCompatModels] = useState(
    existing?.compatModels ?? '',
  );
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

  const canSave = name.trim() && Number(sellPrice) > 0;

  const save = () => {
    if (!canSave) return;
    upsertPart({
      id: existing?.id,
      name: name.trim(),
      brand: brand.trim() || undefined,
      compatModels: compatModels.trim() || undefined,
      costPrice: Number(costPrice) || 0,
      sellPrice: Number(sellPrice),
      stock: Number(stock) || 0,
      lowStockAt: Number(lowStockAt) || 0,
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
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScreenHeader
          title={existing ? 'Edit part' : 'Add part'}
          onBack={() => nav.goBack()}
        />
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Card>
            <View style={styles.gap}>
              <Input
                label="Part name"
                value={name}
                onChangeText={setName}
                placeholder="e.g. iPhone 13 Display"
              />
              <View style={styles.row}>
                <Input
                  label="Brand"
                  value={brand}
                  onChangeText={setBrand}
                  containerStyle={styles.flex}
                  placeholder="Apple, Samsung..."
                />
                <Input
                  label="Models supported"
                  value={compatModels}
                  onChangeText={setCompatModels}
                  containerStyle={styles.flex}
                  placeholder="iPhone 13, 13 Pro"
                />
              </View>
              <View style={styles.row}>
                <Input
                  label="Cost price (₹)"
                  value={costPrice}
                  onChangeText={setCostPrice}
                  keyboardType="numeric"
                  containerStyle={styles.flex}
                  leftAdornment={<Text style={styles.prefix}>₹</Text>}
                />
                <Input
                  label="Sell price (₹)"
                  value={sellPrice}
                  onChangeText={setSellPrice}
                  keyboardType="numeric"
                  containerStyle={styles.flex}
                  leftAdornment={<Text style={styles.prefix}>₹</Text>}
                />
              </View>
              <View style={styles.row}>
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
            </View>
          </Card>
          {existing ? (
            <Button
              label="Delete part"
              variant="danger"
              onPress={remove}
              style={{marginTop: spacing.lg}}
            />
          ) : null}
        </ScrollView>
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

const styles = StyleSheet.create({
  flex: {flex: 1},
  scroll: {paddingHorizontal: spacing.lg, paddingBottom: spacing.huge},
  gap: {gap: spacing.md},
  row: {flexDirection: 'row', gap: spacing.md},
  prefix: {color: colors.textMuted, fontWeight: fontWeight.semibold},
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
});
