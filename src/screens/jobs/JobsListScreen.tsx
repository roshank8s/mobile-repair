import React, {useMemo, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Animated, {FadeIn} from 'react-native-reanimated';
import {Screen} from '../../components/Screen';
import {AnimatedPressable} from '../../components/AnimatedPressable';
import {StatusPill} from '../../components/StatusPill';
import {EmptyState} from '../../components/EmptyState';
import {Input} from '../../components/Input';
import {Fab} from '../../components/Fab';
import {FilterChips, type FilterChip} from '../../components/FilterChips';
import {SearchIcon} from '../../components/icons';
import {colors, fontSize, fontWeight, spacing} from '../../theme/tokens';
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
      <Animated.View entering={FadeIn.duration(220)} style={styles.flex}>
        <View style={styles.header}>
          <Text style={styles.title}>Jobs</Text>
          <Text style={styles.subtitle}>{counts.all} active</Text>
        </View>

        <View style={styles.searchBox}>
          <Input
            value={query}
            onChangeText={setQuery}
            placeholder="Search ticket, name, device"
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
            {filtered.map(j => {
              const cust = customers.find(c => c.id === j.customerId);
              return (
                <JobRow
                  key={j.id}
                  job={j}
                  customerName={cust?.name ?? 'Walk-in'}
                  onPress={() => nav.navigate('JobDetail', {jobId: j.id})}
                />
              );
            })}
            <View style={{height: 110}} />
          </ScrollView>
        )}
      </Animated.View>

      <Fab onPress={() => nav.navigate('JobCreate')} />
    </Screen>
  );
};

const JobRow: React.FC<{
  job: Job;
  customerName: string;
  onPress: () => void;
}> = ({job, customerName, onPress}) => {
  const isOverdue =
    !!job.promisedAt &&
    new Date(job.promisedAt).getTime() < Date.now() &&
    job.status !== 'ready' &&
    job.status !== 'delivered';

  return (
    <AnimatedPressable onPress={onPress} style={styles.row} scaleTo={0.99}>
      <View style={styles.rowMain}>
        <View style={styles.rowTop}>
          <Text style={styles.customer} numberOfLines={1}>
            {customerName}
          </Text>
          <StatusPill status={job.status as JobStatus} size="sm" />
        </View>
        <Text style={styles.device} numberOfLines={1}>
          {job.ticketNo} · {job.device.brand} {job.device.model}
        </Text>
        {job.issue ? (
          <Text style={styles.issue} numberOfLines={1}>
            {job.issue}
          </Text>
        ) : null}
      </View>
      <View style={styles.rowSide}>
        <Text style={styles.amount}>
          {formatINR(job.finalAmount ?? job.estimateAmount)}
        </Text>
        {isOverdue ? (
          <Text style={styles.overdue}>Overdue</Text>
        ) : (
          <Text style={styles.time}>{formatRelative(job.receivedAt)}</Text>
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
    paddingVertical: spacing.lg,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowMain: {flex: 1, gap: 4},
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  customer: {
    flex: 1,
    fontSize: fontSize.bodyLg,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  device: {
    fontSize: fontSize.small,
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  issue: {fontSize: fontSize.small, color: colors.textSubtle},
  rowSide: {alignItems: 'flex-end', gap: 4},
  amount: {
    fontSize: fontSize.body,
    color: colors.text,
    fontWeight: fontWeight.medium,
    fontVariant: ['tabular-nums'],
  },
  time: {fontSize: fontSize.caption, color: colors.textSubtle},
  overdue: {
    fontSize: fontSize.caption,
    color: colors.danger,
    fontWeight: fontWeight.medium,
  },
});
