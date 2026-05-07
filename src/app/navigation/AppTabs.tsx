import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {DashboardScreen} from '../../screens/dashboard/DashboardScreen';
import {JobsListScreen} from '../../screens/jobs/JobsListScreen';
import {CustomersListScreen} from '../../screens/customers/CustomersListScreen';
import {InventoryListScreen} from '../../screens/inventory/InventoryListScreen';
import {MoreScreen} from '../../screens/more/MoreScreen';
import type {AppTabsParamList} from './types';
import {
  HomeIcon,
  ClipboardIcon,
  UsersIcon,
  PackageIcon,
  SettingsIcon,
} from '../../components/icons';
import {colors, fontSize, fontWeight, spacing} from '../../theme/tokens';

const Tabs = createBottomTabNavigator<AppTabsParamList>();

const TabIcon: React.FC<{
  Icon: React.ComponentType<{size?: number; color?: string; strokeWidth?: number}>;
  focused: boolean;
  label: string;
}> = ({Icon, focused, label}) => {
  return (
    <View style={styles.tabBtn}>
      <Icon
        size={22}
        color={focused ? colors.text : colors.textSubtle}
        strokeWidth={focused ? 2.2 : 1.8}
      />
      <Text
        style={[
          styles.tabLabel,
          {color: focused ? colors.text : colors.textSubtle},
        ]}>
        {label}
      </Text>
    </View>
  );
};

export const AppTabs: React.FC = () => {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarHideOnKeyboard: true,
      }}>
      <Tabs.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon Icon={HomeIcon} focused={focused} label="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="Jobs"
        component={JobsListScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon Icon={ClipboardIcon} focused={focused} label="Jobs" />
          ),
        }}
      />
      <Tabs.Screen
        name="Customers"
        component={CustomersListScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon Icon={UsersIcon} focused={focused} label="Customers" />
          ),
        }}
      />
      <Tabs.Screen
        name="Inventory"
        component={InventoryListScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon Icon={PackageIcon} focused={focused} label="Parts" />
          ),
        }}
      />
      <Tabs.Screen
        name="More"
        component={MoreScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon Icon={SettingsIcon} focused={focused} label="More" />
          ),
        }}
      />
    </Tabs.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: 70,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bgRaised,
    paddingTop: 8,
    paddingBottom: 10,
    elevation: 0,
  },
  tabBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingTop: spacing.xs,
    width: 64,
  },
  tabLabel: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.medium,
  },
});
