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
import {PhoneIcon, SearchIcon, WhatsAppIcon} from '../../components/icons';
import {colors, fontSize, fontWeight, radii, spacing} from '../../theme/tokens';
import {useStoreState} from '../../data/store';
import {formatINR} from '../../lib/currency';
import {formatRelative} from '../../lib/date';
import {callPhone, openWhatsApp} from '../../lib/whatsapp';
import type {Customer, Job} from '../../data/types';
import type {RootStackParamList} from '../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Tab = 'all' | 'active' | 'frequent' | 'new';

const FREQUENT_THRESHOLD = 3; // jobs
const HIGH_VALUE_THRESHOLD = 10000; // ₹
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

  const decorated = useMemo(() => {
    return customers.map(c => ({customer: c, stats: computeStats(c, jobs)}));
  }, [customers, jobs]);

  const counts = useMemo(() => {
    const newCutoff = Date.now() - NEW_DAYS * 24 * 3600 * 1000;
    return {
      all: decorated.length,
      active: decorated.filter(d => d.stats.activeJobCount > 0).length,
      frequent: decorated.filter(d => d.stats.jobCount >= FREQUENT_THRESHOLD)
        .length,
      new: decorated.filter(d => new Date(d.customer.createdAt).getTime() > newCutoff)
        .length,
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
        // Sort: active jobs first, then most recent visit
        if (a.stats.activeJobCount !== b.stats.activeJobCount) {
          return b.stats.activeJobCount - a.stats.activeJobCount;
        }
        const av = a.stats.lastVisit ?? a.customer.createdAt;
        const bv = b.stats.lastVisit ?? b.customer.createdAt;
        return bv.localeCompare(av);
      });
  }, [decorated, query, tab]);

  const tabs: {key: Tab; label: string; count: number}[] = [
    {key: 'all', label: 'All', count: counts.all},
    {key: 'active', label: 'Active', count: counts.active},
    {key: 'frequent', label: 'Frequent', count: counts.frequent},
    {key: 'new', label: 'New', count: counts.new},
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Customers" subtitle={`${customers.length} total`} />

      <View style={styles.searchBox}>
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name or phone"
          leftAdornment={<SearchIcon size={18} color={colors.textMuted} />}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsRow}>
        {tabs.map(t => (
          <Chip
            key={t.key}
            active={tab === t.key}
            label={t.label}
            count={t.count}
            onPress={() => setTab(t.key)}
          />
        ))}
      </ScrollView>

      {filtered.length === 0 ? (
        <View style={styles.flex}>
          <EmptyState
            kind="customers"
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
          {filtered.map(({customer, stats}, i) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              stats={stats}
              onPress={() =>
                nav.navigate('CustomerDetail', {customerId: customer.id})
              }
              delay={i * 30}
            />
          ))}
          <View style={{height: spacing.huge}} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const Chip: React.FC<{
  active: boolean;
  label: string;
  count: number;
  onPress: () => void;
}> = ({active, label, count, onPress}) => (
  <AnimatedPressable
    onPress={onPress}
    style={[styles.chip, active && styles.chipActive]}
    scaleTo={0.95}>
    <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
      {label}
    </Text>
    {count > 0 ? (
      <View style={[styles.chipBadge, active && styles.chipBadgeActive]}>
        <Text style={[styles.chipBadgeText, active && styles.chipBadgeTextActive]}>
          {count}
        </Text>
      </View>
    ) : null}
  </AnimatedPressable>
);

const CustomerCard: React.FC<{
  customer: Customer;
  stats: CustomerStats;
  onPress: () => void;
  delay: number;
}> = ({customer, stats, onPress, delay}) => {
  const isFrequent = stats.jobCount >= FREQUENT_THRESHOLD;
  const isHighValue = stats.lifetimeSpend >= HIGH_VALUE_THRESHOLD;

  return (
    <Animated.View
      entering={FadeInDown.duration(260).delay(delay).springify().damping(18)}>
      <AnimatedPressable onPress={onPress} style={styles.row} scaleTo={0.99}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(customer.name) || '?'}</Text>
        </View>

        <View style={styles.middle}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {customer.name}
            </Text>
            {isHighValue ? (
              <View style={[styles.tag, styles.tagHighValue]}>
                <Text style={styles.tagTextHighValue}>VIP</Text>
              </View>
            ) : isFrequent ? (
              <View style={[styles.tag, styles.tagFrequent]}>
                <Text style={styles.tagTextFrequent}>Frequent</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.phone}>+91 {customer.phone}</Text>
          <Text style={styles.meta} numberOfLines={1}>
            {stats.jobCount} job{stats.jobCount === 1 ? '' : 's'}
            {stats.activeJobCount > 0 ? (
              <Text style={styles.metaActive}>
                {' '}
                · {stats.activeJobCount} active
              </Text>
            ) : null}
            {stats.lastVisit
              ? ` · last ${formatRelative(stats.lastVisit)}`
              : ` · joined ${formatRelative(customer.createdAt)}`}
          </Text>
          {stats.lifetimeSpend > 0 ? (
            <Text style={styles.spend}>
              Spent {formatINR(stats.lifetimeSpend)}
            </Text>
          ) : null}
        </View>

        <View style={styles.actions}>
          <AnimatedPressable
            onPress={() => callPhone(customer.phone)}
            style={[styles.actionBtn, styles.actionCall]}
            scaleTo={0.9}>
            <PhoneIcon size={18} color={colors.primary} />
          </AnimatedPressable>
          <AnimatedPressable
            onPress={() =>
              openWhatsApp(customer.phone, `Hi ${customer.name}!`)
            }
            style={[styles.actionBtn, styles.actionWa]}
            scaleTo={0.9}>
            <WhatsAppIcon size={18} color={colors.success} />
          </AnimatedPressable>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  flex: {flex: 1},
  searchBox: {paddingHorizontal: spacing.lg, marginBottom: spacing.sm},
  tabsRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 36,
  },
  chipActive: {backgroundColor: colors.primary, borderColor: colors.primary},
  chipLabel: {
    fontSize: fontSize.small,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
  },
  chipLabelActive: {color: colors.textOnPrimary},
  chipBadge: {
    minWidth: 20,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    backgroundColor: colors.cardMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipBadgeActive: {backgroundColor: 'rgba(255,255,255,0.18)'},
  chipBadgeText: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  chipBadgeTextActive: {color: colors.textOnPrimary},
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
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: fontSize.bodyLg,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  middle: {flex: 1, minWidth: 0},
  nameRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
  name: {
    fontSize: fontSize.bodyLg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    flexShrink: 1,
  },
  phone: {
    fontSize: fontSize.small,
    color: colors.textMuted,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  meta: {fontSize: fontSize.caption, color: colors.textSubtle, marginTop: 4},
  metaActive: {color: colors.warning, fontWeight: fontWeight.bold},
  spend: {
    fontSize: fontSize.caption,
    color: colors.success,
    fontWeight: fontWeight.semibold,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  actions: {flexDirection: 'row', gap: spacing.sm},
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCall: {backgroundColor: colors.primaryMuted},
  actionWa: {backgroundColor: colors.successSoft},
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
  },
  tagFrequent: {backgroundColor: colors.warningSoft},
  tagTextFrequent: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.bold,
    color: '#92400E',
    letterSpacing: 0.3,
  },
  tagHighValue: {backgroundColor: colors.accent},
  tagTextHighValue: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.bold,
    color: colors.textOnAccent,
    letterSpacing: 0.5,
  },
});
