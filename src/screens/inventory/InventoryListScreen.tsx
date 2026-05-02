import React, {useMemo, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {ScreenHeader} from '../../components/ScreenHeader';
import {Input} from '../../components/Input';
import {AnimatedPressable} from '../../components/AnimatedPressable';
import {EmptyState} from '../../components/EmptyState';
import {Fab} from '../../components/Fab';
import {AlertIcon, ChevronRightIcon, SearchIcon} from '../../components/icons';
import {colors, fontSize, fontWeight, radii, spacing} from '../../theme/tokens';
import {useStoreState} from '../../data/store';
import {formatINR} from '../../lib/currency';
import type {RootStackParamList} from '../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const InventoryListScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const parts = useStoreState(s => s.parts);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return parts;
    return parts.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        (p.brand?.toLowerCase().includes(q) ?? false) ||
        (p.compatModels?.toLowerCase().includes(q) ?? false),
    );
  }, [parts, query]);

  const lowCount = parts.filter(p => p.stock <= p.lowStockAt).length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title="Inventory"
        subtitle={`${parts.length} parts${lowCount ? ` · ${lowCount} low` : ''}`}
      />

      <View style={styles.searchBox}>
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder="Search parts"
          leftAdornment={<SearchIcon size={18} color={colors.textMuted} />}
        />
      </View>

      {filtered.length === 0 ? (
        <View style={styles.flex}>
          <EmptyState
            kind="parts"
            title={query ? 'No parts match' : 'No parts in inventory'}
            message={query ? 'Try a different keyword.' : 'Tap + to add a part.'}
            actionLabel={query ? undefined : 'Add part'}
            onAction={query ? undefined : () => nav.navigate('PartEdit')}
          />
        </View>
      ) : (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}>
          {filtered.map((p, i) => (
            <Animated.View
              key={p.id}
              entering={FadeInDown.duration(260)
                .delay(i * 30)
                .springify()
                .damping(18)}>
              <AnimatedPressable
                onPress={() => nav.navigate('PartEdit', {partId: p.id})}
                style={styles.row}
                scaleTo={0.99}>
                <View style={styles.flex}>
                  <View style={styles.headerRow}>
                    <Text style={styles.name}>{p.name}</Text>
                    {p.stock <= p.lowStockAt ? (
                      <View style={styles.lowBadge}>
                        <AlertIcon size={12} color={colors.warning} />
                        <Text style={styles.lowText}>Low</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.meta}>
                    {p.brand ?? 'Generic'} · {p.compatModels ?? 'Universal'}
                  </Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>{formatINR(p.sellPrice)}</Text>
                    <Text style={styles.cost}>cost {formatINR(p.costPrice)}</Text>
                    <Text
                      style={[
                        styles.stockTag,
                        p.stock <= p.lowStockAt && {color: colors.warning},
                        p.stock === 0 && {color: colors.danger},
                      ]}>
                      {p.stock} in stock
                    </Text>
                  </View>
                </View>
                <ChevronRightIcon size={20} color={colors.textSubtle} />
              </AnimatedPressable>
            </Animated.View>
          ))}
          <View style={{height: 96}} />
        </ScrollView>
      )}

      <Fab onPress={() => nav.navigate('PartEdit')} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  flex: {flex: 1},
  searchBox: {paddingHorizontal: spacing.lg, marginBottom: spacing.sm},
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
  headerRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
  name: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.bold,
    color: colors.text,
    flex: 1,
  },
  meta: {fontSize: fontSize.small, color: colors.textMuted, marginTop: 2},
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  price: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  cost: {
    fontSize: fontSize.caption,
    color: colors.textSubtle,
    fontVariant: ['tabular-nums'],
  },
  stockTag: {
    marginLeft: 'auto',
    fontSize: fontSize.caption,
    color: colors.textMuted,
    fontWeight: fontWeight.semibold,
  },
  lowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: colors.warningSoft,
    borderRadius: radii.pill,
  },
  lowText: {
    fontSize: fontSize.caption,
    color: '#92400E',
    fontWeight: fontWeight.bold,
  },
});
