import React, {useMemo, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Animated, {FadeIn} from 'react-native-reanimated';
import {Screen} from '../../components/Screen';
import {Input} from '../../components/Input';
import {AnimatedPressable} from '../../components/AnimatedPressable';
import {Avatar} from '../../components/Avatar';
import {EmptyState} from '../../components/EmptyState';
import {FilterChips, type FilterChip} from '../../components/FilterChips';
import {SearchIcon} from '../../components/icons';
import {colors, fontSize, fontWeight, spacing} from '../../theme/tokens';
import {useStoreState} from '../../data/store';
import {formatRelative} from '../../lib/date';
import type {Customer, Job} from '../../data/types';
import type {RootStackParamList} from '../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Tab = 'all' | 'active' | 'frequent' | 'new';

const FREQUENT_THRESHOLD = 3;
const NEW_DAYS = 30;
const ACTIVE_STATUSES = new Set([
  'received',
  'diagnosed',
  'quoted',
  'approved',
  'in_progress',
  'ready',
]);

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map(p => p[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');

type CustomerStats = {
  jobCount: number;
  activeJobCount: number;
  lifetimeSpend: number;
  lastVisit?: string;
};

const computeStats = (customer: Customer, jobs: Job[]): CustomerStats => {
  const cjobs = jobs.filter(j => j.customerId === customer.id);
  const lifetimeSpend = cjobs
    .filter(j => j.status === 'delivered')
    .reduce((s, j) => s + (j.finalAmount ?? j.estimateAmount ?? 0), 0);
  const sorted = [...cjobs].sort((a, b) =>
    b.receivedAt.localeCompare(a.receivedAt),
  );
  return {
    jobCount: cjobs.length,
    activeJobCount: cjobs.filter(j => ACTIVE_STATUSES.has(j.status)).length,
    lifetimeSpend,
    lastVisit: sorted[0]?.receivedAt,
  };
};

export const CustomersListScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const customers = useStoreState(s => s.customers);
  const jobs = useStoreState(s => s.jobs);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<Tab>('all');

  const decorated = useMemo(
    () => customers.map(c => ({customer: c, stats: computeStats(c, jobs)})),
    [customers, jobs],
  );

  const counts = useMemo(() => {
    const newCutoff = Date.now() - NEW_DAYS * 24 * 3600 * 1000;
    return {
      all: decorated.length,
      active: decorated.filter(d => d.stats.activeJobCount > 0).length,
      frequent: decorated.filter(d => d.stats.jobCount >= FREQUENT_THRESHOLD).length,
      new: decorated.filter(
        d => new Date(d.customer.createdAt).getTime() > newCutoff,
      ).length,
    };
  }, [decorated]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const newCutoff = Date.now() - NEW_DAYS * 24 * 3600 * 1000;
    return decorated
      .filter(({customer, stats}) => {
        if (tab === 'all') return true;
        if (tab === 'active') return stats.activeJobCount > 0;
        if (tab === 'frequent') return stats.jobCount >= FREQUENT_THRESHOLD;
        if (tab === 'new')
          return new Date(customer.createdAt).getTime() > newCutoff;
        return true;
      })
      .filter(({customer}) => {
        if (!q) return true;
        return (
          customer.name.toLowerCase().includes(q) ||
          customer.phone.includes(q) ||
          (customer.email?.toLowerCase().includes(q) ?? false)
        );
      })
      .sort((a, b) => {
        if (a.stats.activeJobCount !== b.stats.activeJobCount) {
          return b.stats.activeJobCount - a.stats.activeJobCount;
        }
        const av = a.stats.lastVisit ?? a.customer.createdAt;
        const bv = b.stats.lastVisit ?? b.customer.createdAt;
        return bv.localeCompare(av);
      });
  }, [decorated, query, tab]);

  const chips: FilterChip[] = [
    {key: 'all', label: 'All', count: counts.all},
    {key: 'active', label: 'Active', count: counts.active},
    {key: 'frequent', label: 'Frequent', count: counts.frequent},
    {key: 'new', label: 'New', count: counts.new},
  ];

  return (
    <Screen>
      <Animated.View entering={FadeIn.duration(220)} style={styles.flex}>
        <View style={styles.header}>
          <Text style={styles.title}>Customers</Text>
          <Text style={styles.subtitle}>{customers.length} total</Text>
        </View>

        <View style={styles.searchBox}>
          <Input
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name or phone"
            leftAdornment={<SearchIcon size={18} color={colors.textMuted} />}
          />
        </View>

        <FilterChips
          chips={chips}
          activeKey={tab}
          onChange={k => setTab(k as Tab)}
        />

        {filtered.length === 0 ? (
          <View style={styles.flex}>
            <EmptyState
              title={query || tab !== 'all' ? 'No matches' : 'No customers yet'}
              message={
                query || tab !== 'all'
                  ? 'Try a different keyword or tab.'
                  : 'Customers are added automatically when you create a job.'
              }
            />
          </View>
        ) : (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}>
            {filtered.map(({customer, stats}) => (
              <CustomerRow
                key={customer.id}
                customer={customer}
                stats={stats}
                onPress={() =>
                  nav.navigate('CustomerDetail', {customerId: customer.id})
                }
              />
            ))}
            <View style={{height: spacing.huge}} />
          </ScrollView>
        )}
      </Animated.View>
    </Screen>
  );
};

const CustomerRow: React.FC<{
  customer: Customer;
  stats: CustomerStats;
  onPress: () => void;
}> = ({customer, stats, onPress}) => {
  return (
    <AnimatedPressable onPress={onPress} style={styles.row} scaleTo={0.99}>
      <Avatar
        uri={customer.avatarUri}
        fallback={initials(customer.name) || '?'}
        seed={customer.id}
        size={44}
      />
      <View style={styles.middle}>
        <Text style={styles.name} numberOfLines={1}>
          {customer.name}
        </Text>
        <Text style={styles.phone} numberOfLines={1}>
          +91 {customer.phone}
        </Text>
      </View>
      <View style={styles.right}>
        {stats.activeJobCount > 0 ? (
          <Text style={styles.activeMark}>{stats.activeJobCount} active</Text>
        ) : stats.lastVisit ? (
          <Text style={styles.last}>{formatRelative(stats.lastVisit)}</Text>
        ) : (
          <Text style={styles.last}>New</Text>
        )}
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
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  middle: {flex: 1, minWidth: 0},
  name: {
    fontSize: fontSize.bodyLg,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  phone: {
    fontSize: fontSize.small,
    color: colors.textMuted,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  right: {alignItems: 'flex-end'},
  activeMark: {
    fontSize: fontSize.caption,
    color: colors.brand,
    fontWeight: fontWeight.medium,
  },
  last: {
    fontSize: fontSize.caption,
    color: colors.textSubtle,
  },
});
