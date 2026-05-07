import React, {useMemo, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Animated, {FadeIn} from 'react-native-reanimated';
import {Screen} from '../../components/Screen';
import {Input} from '../../components/Input';
import {AnimatedPressable} from '../../components/AnimatedPressable';
import {EmptyState} from '../../components/EmptyState';
import {Fab} from '../../components/Fab';
import {FilterChips, type FilterChip} from '../../components/FilterChips';
import {SearchIcon} from '../../components/icons';
import {colors, fontSize, fontWeight, spacing} from '../../theme/tokens';
import {useStoreState} from '../../data/store';
import {formatINR} from '../../lib/currency';
import type {Part} from '../../data/types';
import type {RootStackParamList} from '../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type FilterKey = 'all' | 'low' | 'out' | string;

const stockColor = (p: Part): string => {
  if (p.stock === 0) return colors.danger;
  if (p.stock <= p.lowStockAt) return colors.warning;
  return colors.text;
};

export const InventoryListScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const parts = useStoreState(s => s.parts);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');

  const lowCount = parts.filter(p => p.stock <= p.lowStockAt && p.stock > 0).length;
  const outCount = parts.filter(p => p.stock === 0).length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return parts
      .filter(p => {
        if (filter === 'all') return true;
        if (filter === 'low') return p.stock <= p.lowStockAt && p.stock > 0;
        if (filter === 'out') return p.stock === 0;
        return true;
      })
      .filter(p => {
        if (!q) return true;
        return (
          p.name.toLowerCase().includes(q) ||
          (p.brand?.toLowerCase().includes(q) ?? false) ||
          (p.compatModels?.toLowerCase().includes(q) ?? false)
        );
      });
  }, [parts, query, filter]);

  const chips: FilterChip[] = [
    {key: 'all', label: 'All', count: parts.length},
    {key: 'low', label: 'Low', count: lowCount},
    {key: 'out', label: 'Out', count: outCount},
  ];

  return (
    <Screen>
      <Animated.View entering={FadeIn.duration(220)} style={styles.flex}>
        <View style={styles.header}>
          <Text style={styles.title}>Inventory</Text>
          <Text style={styles.subtitle}>
            {parts.length} parts
            {outCount ? ` · ${outCount} out` : ''}
            {lowCount ? ` · ${lowCount} low` : ''}
          </Text>
        </View>

        <View style={styles.searchBox}>
          <Input
            value={query}
            onChangeText={setQuery}
            placeholder="Search by part, brand, model"
            leftAdornment={<SearchIcon size={18} color={colors.textMuted} />}
          />
        </View>

        <FilterChips
          chips={chips}
          activeKey={filter}
          onChange={k => setFilter(k as FilterKey)}
        />

        {filtered.length === 0 ? (
          <View style={styles.flex}>
            <EmptyState
              title={
                query || filter !== 'all'
                  ? 'No parts match'
                  : 'No parts in inventory'
              }
              message={
                query || filter !== 'all'
                  ? 'Try a different keyword or filter.'
                  : 'Tap "Add Part" to add your first item.'
              }
              actionLabel={
                query || filter !== 'all' ? undefined : 'Add part'
              }
              onAction={
                query || filter !== 'all'
                  ? undefined
                  : () => nav.navigate('PartEdit')
              }
            />
          </View>
        ) : (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}>
            {filtered.map(p => (
              <PartRow
                key={p.id}
                part={p}
                onPress={() => nav.navigate('PartEdit', {partId: p.id})}
              />
            ))}
            <View style={{height: 110}} />
          </ScrollView>
        )}
      </Animated.View>

      <Fab label="Add Part" onPress={() => nav.navigate('PartEdit')} />
    </Screen>
  );
};

const PartRow: React.FC<{part: Part; onPress: () => void}> = ({part, onPress}) => {
  return (
    <AnimatedPressable onPress={onPress} style={styles.row} scaleTo={0.99}>
      <View style={styles.flex}>
        <Text style={styles.name} numberOfLines={1}>
          {part.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {part.brand ?? 'Generic'}
          {part.compatModels ? ` · ${part.compatModels}` : ''}
        </Text>
        <Text style={styles.price}>{formatINR(part.sellPrice)}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.stockNum, {color: stockColor(part)}]}>
          {part.stock}
        </Text>
        <Text style={styles.stockLabel}>in stock</Text>
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1},
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.display,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 4,
    fontSize: fontSize.body,
    color: colors.textMuted,
  },
  searchBox: {paddingHorizontal: spacing.xl, marginBottom: spacing.sm},
  list: {paddingHorizontal: spacing.xl},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  name: {
    fontSize: fontSize.bodyLg,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  meta: {fontSize: fontSize.small, color: colors.textMuted, marginTop: 2},
  price: {
    marginTop: 4,
    fontSize: fontSize.body,
    color: colors.text,
    fontWeight: fontWeight.medium,
    fontVariant: ['tabular-nums'],
  },
  right: {alignItems: 'flex-end', minWidth: 64},
  stockNum: {
    fontSize: fontSize.display,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    fontVariant: ['tabular-nums'],
    lineHeight: 36,
  },
  stockLabel: {
    fontSize: fontSize.caption,
    color: colors.textSubtle,
  },
});
