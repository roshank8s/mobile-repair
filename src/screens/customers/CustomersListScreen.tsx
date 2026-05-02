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
import {ChevronRightIcon, SearchIcon} from '../../components/icons';
import {colors, fontSize, fontWeight, radii, spacing} from '../../theme/tokens';
import {useStoreState} from '../../data/store';
import {formatRelative} from '../../lib/date';
import type {RootStackParamList} from '../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map(p => p[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');

export const CustomersListScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const customers = useStoreState(s => s.customers);
  const jobs = useStoreState(s => s.jobs);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email?.toLowerCase().includes(q) ?? false),
    );
  }, [customers, query]);

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

      {filtered.length === 0 ? (
        <View style={styles.flex}>
          <EmptyState
            kind="customers"
            title={query ? 'No matches' : 'No customers yet'}
            message={
              query
                ? 'Try a different name or phone number.'
                : 'Customers are added automatically when you create a job.'
            }
          />
        </View>
      ) : (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}>
          {filtered.map((c, i) => {
            const count = jobs.filter(j => j.customerId === c.id).length;
            return (
              <Animated.View
                key={c.id}
                entering={FadeInDown.duration(260)
                  .delay(i * 30)
                  .springify()
                  .damping(18)}>
                <AnimatedPressable
                  onPress={() =>
                    nav.navigate('CustomerDetail', {customerId: c.id})
                  }
                  style={styles.row}
                  scaleTo={0.99}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials(c.name)}</Text>
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.rowTitle}>{c.name}</Text>
                    <Text style={styles.rowSub}>+91 {c.phone}</Text>
                    <Text style={styles.rowMeta}>
                      {count} job{count === 1 ? '' : 's'} · joined{' '}
                      {formatRelative(c.createdAt)}
                    </Text>
                  </View>
                  <ChevronRightIcon size={20} color={colors.textSubtle} />
                </AnimatedPressable>
              </Animated.View>
            );
          })}
          <View style={{height: 96}} />
        </ScrollView>
      )}
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
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  rowTitle: {
    fontSize: fontSize.bodyLg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  rowSub: {fontSize: fontSize.small, color: colors.textMuted, marginTop: 2},
  rowMeta: {fontSize: fontSize.caption, color: colors.textSubtle, marginTop: 2},
});
