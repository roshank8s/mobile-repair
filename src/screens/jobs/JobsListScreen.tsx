import React, {useMemo, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {ScreenHeader} from '../../components/ScreenHeader';
import {AnimatedPressable} from '../../components/AnimatedPressable';
import {StatusPill} from '../../components/StatusPill';
import {EmptyState} from '../../components/EmptyState';
import {Input} from '../../components/Input';
import {Fab} from '../../components/Fab';
import {SearchIcon} from '../../components/icons';
import {colors, fontSize, fontWeight, radii, spacing} from '../../theme/tokens';
import {useStoreState} from '../../data/store';
import {formatINR} from '../../lib/currency';
import {formatRelative, isToday} from '../../lib/date';
import type {RootStackParamList} from '../../app/navigation/types';
import type {Job, JobStatus} from '../../data/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Filter = 'all' | 'today' | 'in_progress' | 'ready' | 'overdue';

const FILTERS: {key: Filter; label: string}[] = [
  {key: 'all', label: 'All'},
  {key: 'today', label: 'Today'},
  {key: 'in_progress', label: 'In progress'},
  {key: 'ready', label: 'Ready'},
  {key: 'overdue', label: 'Overdue'},
];

const matchesFilter = (j: Job, f: Filter): boolean => {
  if (f === 'all') return j.status !== 'delivered' && j.status !== 'cancelled';
  if (f === 'today') return isToday(j.receivedAt);
  if (f === 'in_progress')
    return (
      j.status === 'in_progress' || j.status === 'approved' || j.status === 'quoted'
    );
  if (f === 'ready') return j.status === 'ready';
  if (f === 'overdue')
    return (
      !!j.promisedAt &&
      new Date(j.promisedAt).getTime() < Date.now() &&
      j.status !== 'delivered' &&
      j.status !== 'ready'
    );
  return true;
};

export const JobsListScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const jobs = useStoreState(s => s.jobs);
  const customers = useStoreState(s => s.customers);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs
      .filter(j => matchesFilter(j, filter))
      .filter(j => {
        if (!q) return true;
        const cust = customers.find(c => c.id === j.customerId);
        return (
          j.ticketNo.toLowerCase().includes(q) ||
          j.issue.toLowerCase().includes(q) ||
          j.device.brand.toLowerCase().includes(q) ||
          j.device.model.toLowerCase().includes(q) ||
          (cust?.name.toLowerCase().includes(q) ?? false) ||
          (cust?.phone.includes(q) ?? false)
        );
      });
  }, [jobs, customers, filter, query]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title="Jobs"
        subtitle={`${jobs.filter(j => j.status !== 'delivered' && j.status !== 'cancelled').length} active`}
      />

      <View style={styles.searchBox}>
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder="Search ticket, name, phone, device"
          leftAdornment={<SearchIcon size={18} color={colors.textMuted} />}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}>
        {FILTERS.map(f => (
          <Chip
            key={f.key}
            active={filter === f.key}
            label={f.label}
            onPress={() => setFilter(f.key)}
          />
        ))}
      </ScrollView>

      {filtered.length === 0 ? (
        <View style={styles.flex}>
          <EmptyState
            kind="jobs"
            title="No jobs match"
            message={
              query
                ? 'Try clearing the search or switching the filter.'
                : 'Tap + to log your first job.'
            }
          />
        </View>
      ) : (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}>
          {filtered.map((j, i) => (
            <JobRow
              key={j.id}
              job={j}
              customerName={
                customers.find(c => c.id === j.customerId)?.name ?? 'Walk-in'
              }
              onPress={() => nav.navigate('JobDetail', {jobId: j.id})}
              delay={i * 40}
            />
          ))}
          <View style={{height: 96}} />
        </ScrollView>
      )}

      <Fab onPress={() => nav.navigate('JobCreate')} />
    </SafeAreaView>
  );
};

const Chip: React.FC<{active: boolean; label: string; onPress: () => void}> = ({
  active,
  label,
  onPress,
}) => (
  <AnimatedPressable
    onPress={onPress}
    style={[styles.chip, active && styles.chipActive]}
    scaleTo={0.95}>
    <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
      {label}
    </Text>
  </AnimatedPressable>
);

const JobRow: React.FC<{
  job: Job;
  customerName: string;
  onPress: () => void;
  delay: number;
}> = ({job, customerName, onPress, delay}) => {
  const isOverdue =
    !!job.promisedAt &&
    new Date(job.promisedAt).getTime() < Date.now() &&
    job.status !== 'ready' &&
    job.status !== 'delivered';
  return (
    <Animated.View
      entering={FadeInDown.duration(260).delay(delay).springify().damping(18)}>
      <AnimatedPressable onPress={onPress} style={styles.row} scaleTo={0.99}>
        <View style={styles.rowHeader}>
          <Text style={styles.ticket}>{job.ticketNo}</Text>
          <StatusPill status={job.status as JobStatus} size="sm" />
        </View>
        <Text style={styles.customer}>{customerName}</Text>
        <Text style={styles.device}>
          {job.device.brand} {job.device.model}
        </Text>
        <Text style={styles.issue} numberOfLines={1}>
          {job.issue}
        </Text>
        <View style={styles.rowFooter}>
          <Text style={styles.estimate}>
            {formatINR(job.finalAmount ?? job.estimateAmount)}
          </Text>
          <Text style={[styles.received, isOverdue && styles.overdue]}>
            {isOverdue
              ? 'Overdue'
              : 'Received ' + formatRelative(job.receivedAt)}
          </Text>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  flex: {flex: 1},
  searchBox: {paddingHorizontal: spacing.lg, marginBottom: spacing.sm},
  filtersRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipLabel: {
    fontSize: fontSize.small,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
  },
  chipLabelActive: {color: colors.textOnPrimary},
  list: {paddingHorizontal: spacing.lg, gap: spacing.sm},
  row: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: 4,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  ticket: {
    fontSize: fontSize.bodyLg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  customer: {
    fontSize: fontSize.body,
    color: colors.text,
    fontWeight: fontWeight.semibold,
  },
  device: {fontSize: fontSize.small, color: colors.textMuted},
  issue: {fontSize: fontSize.small, color: colors.textMuted},
  rowFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  estimate: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  received: {fontSize: fontSize.caption, color: colors.textSubtle},
  overdue: {color: colors.danger, fontWeight: fontWeight.bold},
});
