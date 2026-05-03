import React, {useMemo, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {Screen} from '../../components/Screen';
import {ScreenHeader} from '../../components/ScreenHeader';
import {AnimatedPressable} from '../../components/AnimatedPressable';
import {StatusPill} from '../../components/StatusPill';
import {EmptyState} from '../../components/EmptyState';
import {Input} from '../../components/Input';
import {Fab} from '../../components/Fab';
import {FilterChips, type FilterChip} from '../../components/FilterChips';
import {SearchIcon} from '../../components/icons';
import {colors, fontSize, fontWeight, radii, spacing} from '../../theme/tokens';
import {useStoreState} from '../../data/store';
import {formatINR} from '../../lib/currency';
import {formatRelative, isToday} from '../../lib/date';
import type {RootStackParamList} from '../../app/navigation/types';
import type {Job, JobStatus} from '../../data/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Filter = 'all' | 'today' | 'in_progress' | 'ready' | 'overdue';

const matchesFilter = (j: Job, f: Filter): boolean => {
  if (f === 'all') return j.status !== 'delivered' && j.status !== 'cancelled';
  if (f === 'today') return isToday(j.receivedAt);
  if (f === 'in_progress') {
    return (
      j.status === 'in_progress' || j.status === 'approved' || j.status === 'quoted'
    );
  }
  if (f === 'ready') return j.status === 'ready';
  if (f === 'overdue') {
    return (
      !!j.promisedAt &&
      new Date(j.promisedAt).getTime() < Date.now() &&
      j.status !== 'delivered' &&
      j.status !== 'ready'
    );
  }
  return true;
};

export const JobsListScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const jobs = useStoreState(s => s.jobs);
  const customers = useStoreState(s => s.customers);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const counts = useMemo(() => {
    const all = jobs.filter(j => matchesFilter(j, 'all')).length;
    const today = jobs.filter(j => matchesFilter(j, 'today')).length;
    const inProgress = jobs.filter(j => matchesFilter(j, 'in_progress')).length;
    const ready = jobs.filter(j => matchesFilter(j, 'ready')).length;
    const overdue = jobs.filter(j => matchesFilter(j, 'overdue')).length;
    return {all, today, in_progress: inProgress, ready, overdue};
  }, [jobs]);

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

  const chips: FilterChip[] = [
    {key: 'all', label: 'All', count: counts.all},
    {key: 'today', label: 'Today', count: counts.today},
    {key: 'in_progress', label: 'In progress', count: counts.in_progress},
    {key: 'ready', label: 'Ready', count: counts.ready},
    {key: 'overdue', label: 'Overdue', count: counts.overdue},
  ];

  return (
    <Screen>
      <ScreenHeader title="Jobs" subtitle={`${counts.all} active`} />

      <View style={styles.searchBox}>
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder="Search ticket, name, phone, device"
          leftAdornment={<SearchIcon size={18} color={colors.textMuted} />}
        />
      </View>

      <FilterChips
        chips={chips}
        activeKey={filter}
        onChange={k => setFilter(k as Filter)}
      />

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
          <View style={{height: 110}} />
        </ScrollView>
      )}

      <Fab onPress={() => nav.navigate('JobCreate')} />
    </Screen>
  );
};

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
          <View style={styles.flex}>
            <Text style={styles.ticket}>{job.ticketNo}</Text>
            <Text style={styles.customer} numberOfLines={1}>
              {customerName}
            </Text>
          </View>
          <StatusPill status={job.status as JobStatus} size="sm" />
        </View>

        <Text style={styles.device} numberOfLines={1}>
          {job.device.brand} {job.device.model}
          {job.issue ? ` · ${job.issue}` : ''}
        </Text>

        <View style={styles.rowFooter}>
          <Text style={styles.amount}>
            {formatINR(job.finalAmount ?? job.estimateAmount)}
          </Text>
          {isOverdue ? (
            <View style={styles.overdueBadge}>
              <Text style={styles.overdueText}>Overdue</Text>
            </View>
          ) : (
            <Text style={styles.time}>
              {formatRelative(job.receivedAt)}
            </Text>
          )}
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
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  ticket: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.bold,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  customer: {
    fontSize: fontSize.body,
    color: colors.text,
    fontWeight: fontWeight.semibold,
    marginTop: 2,
  },
  device: {fontSize: fontSize.small, color: colors.textMuted},
  rowFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  amount: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  time: {fontSize: fontSize.caption, color: colors.textSubtle},
  overdueBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
    backgroundColor: colors.dangerSoft,
  },
  overdueText: {
    fontSize: fontSize.caption,
    color: colors.danger,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.3,
  },
});
