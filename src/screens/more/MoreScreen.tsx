import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {ScreenHeader} from '../../components/ScreenHeader';
import {AnimatedPressable} from '../../components/AnimatedPressable';
import {
  ChevronRightIcon,
  FileTextIcon,
  SettingsIcon,
  UsersIcon,
  WrenchIcon,
} from '../../components/icons';
import {colors, fontSize, fontWeight, radii, spacing} from '../../theme/tokens';
import {useStoreState} from '../../data/store';
import type {RootStackParamList} from '../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const MoreScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const shop = useStoreState(s => s.shop);
  const items = [
    {
      icon: FileTextIcon,
      title: 'Invoices',
      sub: 'Past GST invoices',
      onPress: () => nav.navigate('InvoicesList'),
    },
    {
      icon: SettingsIcon,
      title: 'Settings',
      sub: 'Shop info, technicians, GST',
      onPress: () => nav.navigate('Settings'),
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="More" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <Animated.View
          entering={FadeInDown.duration(280).springify().damping(18)}
          style={styles.shopCard}>
          <View style={styles.shopIcon}>
            <WrenchIcon size={24} color={colors.accent} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.shopName}>{shop.name || 'Repair Shop'}</Text>
            <Text style={styles.shopMeta}>
              {shop.ownerName || 'Owner'}
              {shop.gstin ? ` · GSTIN ${shop.gstin}` : ''}
            </Text>
          </View>
        </Animated.View>

        {items.map((it, i) => (
          <Animated.View
            key={it.title}
            entering={FadeInDown.duration(260)
              .delay(60 + i * 40)
              .springify()
              .damping(18)}>
            <AnimatedPressable onPress={it.onPress} style={styles.row} scaleTo={0.99}>
              <View style={styles.rowIcon}>
                <it.icon size={20} color={colors.primary} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.rowTitle}>{it.title}</Text>
                <Text style={styles.rowSub}>{it.sub}</Text>
              </View>
              <ChevronRightIcon size={20} color={colors.textSubtle} />
            </AnimatedPressable>
          </Animated.View>
        ))}

        <View style={styles.about}>
          <Text style={styles.aboutText}>
            Built for India's mobile repair shops · v1.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

void UsersIcon;

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  flex: {flex: 1},
  scroll: {paddingHorizontal: spacing.lg, paddingBottom: spacing.huge, gap: spacing.sm},
  shopCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
  },
  shopIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#312E81',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopName: {
    fontSize: fontSize.subhead,
    fontWeight: fontWeight.bold,
    color: colors.textOnPrimary,
  },
  shopMeta: {
    fontSize: fontSize.small,
    color: '#C7D2FE',
    marginTop: 2,
  },
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
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  rowSub: {fontSize: fontSize.small, color: colors.textMuted, marginTop: 2},
  about: {alignItems: 'center', marginTop: spacing.huge},
  aboutText: {fontSize: fontSize.caption, color: colors.textSubtle},
});
