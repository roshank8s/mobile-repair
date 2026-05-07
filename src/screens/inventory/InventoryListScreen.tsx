import React, {useMemo, useState} from 'react';
import {Image, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {Screen} from '../../components/Screen';
import {ScreenHeader} from '../../components/ScreenHeader';
import {Input} from '../../components/Input';
import {AnimatedPressable} from '../../components/AnimatedPressable';
import {EmptyState} from '../../components/EmptyState';
import {Fab} from '../../components/Fab';
import {FilterChips, type FilterChip} from '../../components/FilterChips';
import {PartIllustration} from '../../components/PartIllustration';
import {SearchIcon} from '../../components/icons';
import {colors, fontSize, fontWeight, radii, spacing} from '../../theme/tokens';
import {useStoreState} from '../../data/store';
import {formatINR} from '../../lib/currency';
import type {Part} from '../../data/types';
import type {RootStackParamList} from '../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type StockState = 'in' | 'low' | 'out';
type FilterKey = 'all' | 'low' | 'high' | string; // string = brand

const stockStateOf = (p: Part): StockState => {
  if (p.stock === 0) return 'out';
  if (p.stock <= p.lowStockAt) return 'low';
  return 'in';
};

const STOCK_META: Record<
  StockState,
  {label: string; bg: string; fg: string; dot: string}
> = {
  in: {label: 'In stock', bg: colors.successSoft, fg: '#166534', dot: colors.success},
  low: {label: 'Low stock', bg: colors.warningSoft, fg: '#92400E', dot: colors.warning},
  out: {label: 'Out of stock', bg: colors.dangerSoft, fg: colors.danger, dot: colors.danger},
};

export const InventoryListScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const parts = useStoreState(s => s.parts);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');

  const topBrands = useMemo(() => {
    const counts: Record<string, number> = {};
    parts.forEach(p => {
      const b = (p.brand ?? 'Generic').trim();
      counts[b] = (counts[b] ?? 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([brand]) => brand);
  }, [parts]);

  const lowCount = parts.filter(p => p.stock <= p.lowStockAt).length;
  const outCount = parts.filter(p => p.stock === 0).length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return parts
      .filter(p => {
        if (filter === 'all') return true;
        if (filter === 'low') return p.stock <= p.lowStockAt;
        if (filter === 'high') return p.stock > p.lowStockAt * 2;
        return (p.brand ?? 'Generic') === filter;
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
    {key: 'low', label: 'Low stock', count: lowCount},
    {key: 'high', label: 'High stock'},
    ...topBrands.map(b => ({key: b, label: b})),
  ];

  return (
    <Screen>
      <ScreenHeader
        title="Inventory"
        subtitle={
          outCount
            ? `${parts.length} parts · ${outCount} out, ${lowCount} low`
            : `${parts.length} parts${lowCount ? ` · ${lowCount} low` : ''}`
        }
      />

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
            kind="parts"
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
              query || filter !== 'all' ? undefined : () => nav.navigate('PartEdit')
            }
          />
        </View>
      ) : (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}>
          {filtered.map((p, i) => (
            <PartRow
              key={p.id}
              part={p}
              onPress={() => nav.navigate('PartEdit', {partId: p.id})}
              delay={i * 30}
            />
          ))}
          <View style={{height: 110}} />
        </ScrollView>
      )}

      <Fab label="Add Part" onPress={() => nav.navigate('PartEdit')} />
    </Screen>
  );
};

const PartRow: React.FC<{part: Part; onPress: () => void; delay: number}> = ({
  part,
  onPress,
  delay,
}) => {
  const state = stockStateOf(part);
  const meta = STOCK_META[state];
  const profit = part.sellPrice - part.costPrice;
  const profitPct =
    part.sellPrice > 0 ? Math.round((profit / part.sellPrice) * 100) : 0;

  return (
    <Animated.View
      entering={FadeInDown.duration(260).delay(delay).springify().damping(18)}>
      <AnimatedPressable onPress={onPress} style={styles.row} scaleTo={0.99}>
        {part.imageUri ? (
          <View style={styles.thumb}>
            <Image source={{uri: part.imageUri}} style={styles.thumbImg} />
          </View>
        ) : (
          <PartIllustration
            name={part.name}
            compatModels={part.compatModels}
            size={64}
          />
        )}
        <View style={styles.flex}>
          <Text style={styles.name} numberOfLines={1}>
            {part.name}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {part.brand ?? 'Generic'}
            {part.compatModels ? ` · ${part.compatModels}` : ''}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatINR(part.sellPrice)}</Text>
            {profit > 0 ? (
              <Text style={styles.profit}>
                +{formatINR(profit)} ({profitPct}%)
              </Text>
            ) : null}
          </View>
          <Text style={styles.cost}>cost {formatINR(part.costPrice)}</Text>
        </View>

        <View style={styles.right}>
          <Text style={styles.stockNum}>{part.stock}</Text>
          <Text style={styles.stockLabel}>in stock</Text>
          <View style={[styles.statusBadge, {backgroundColor: meta.bg}]}>
            <View style={[styles.statusDot, {backgroundColor: meta.dot}]} />
            <Text style={[styles.statusText, {color: meta.fg}]}>{meta.label}</Text>
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1},
  searchBox: {paddingHorizontal: spacing.lg, marginBottom: spacing.sm},
  list: {paddingHorizontal: spacing.lg, gap: spacing.sm},
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.lg,
    alignItems: 'flex-start',
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: radii.md,
    backgroundColor: colors.cardMuted,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImg: {width: '100%', height: '100%'},
  name: {
    fontSize: fontSize.bodyLg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  meta: {fontSize: fontSize.small, color: colors.textMuted, marginTop: 2},
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    marginTop: spacing.sm,
    flexWrap: 'wrap',
  },
  price: {
    fontSize: fontSize.subhead,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  profit: {
    fontSize: fontSize.small,
    fontWeight: fontWeight.semibold,
    color: colors.success,
    fontVariant: ['tabular-nums'],
  },
  cost: {
    fontSize: fontSize.caption,
    color: colors.textSubtle,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  right: {alignItems: 'flex-end', minWidth: 90, gap: spacing.xs},
  stockNum: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    color: colors.text,
    fontVariant: ['tabular-nums'],
    lineHeight: 28,
  },
  stockLabel: {
    fontSize: fontSize.caption,
    color: colors.textSubtle,
    marginTop: -2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
    marginTop: spacing.xs,
  },
  statusDot: {width: 6, height: 6, borderRadius: 3},
  statusText: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.2,
  },
});
