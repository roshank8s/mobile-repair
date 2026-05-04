import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import type {RootStackParamList} from './types';
import {AppTabs} from './AppTabs';
import {OnboardingScreen} from '../../screens/onboarding/OnboardingScreen';
import {JobCreateScreen} from '../../screens/jobs/JobCreateScreen';
import {JobDetailScreen} from '../../screens/jobs/JobDetailScreen';
import {CustomerDetailScreen} from '../../screens/customers/CustomerDetailScreen';
import {PartEditScreen} from '../../screens/inventory/PartEditScreen';
import {InvoicesListScreen} from '../../screens/invoices/InvoicesListScreen';
import {InvoiceDetailScreen} from '../../screens/invoices/InvoiceDetailScreen';
import {SettingsScreen} from '../../screens/settings/SettingsScreen';
import {useStoreState} from '../../data/store';
import {colors} from '../../theme/tokens';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  dark: false,
  colors: {
    primary: colors.primary,
    background: colors.bg,
    card: colors.card,
    text: colors.text,
    border: colors.border,
    notification: colors.accent,
  },
  fonts: {
    regular: {fontFamily: 'System', fontWeight: '400' as const},
    medium: {fontFamily: 'System', fontWeight: '500' as const},
    bold: {fontFamily: 'System', fontWeight: '700' as const},
    heavy: {fontFamily: 'System', fontWeight: '800' as const},
  },
};

export const RootNavigator: React.FC = () => {
  const onboarded = useStoreState(s => s.shop.onboarded);

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: {backgroundColor: colors.bg},
        }}>
        {!onboarded ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <>
            <Stack.Screen name="AppTabs" component={AppTabs} />
            <Stack.Screen
              name="JobCreate"
              component={JobCreateScreen}
              options={{animation: 'slide_from_bottom', presentation: 'modal'}}
            />
            <Stack.Screen name="JobDetail" component={JobDetailScreen} />
            <Stack.Screen
              name="CustomerDetail"
              component={CustomerDetailScreen}
            />
            <Stack.Screen
              name="PartEdit"
              component={PartEditScreen}
              options={{animation: 'slide_from_bottom', presentation: 'modal'}}
            />
            <Stack.Screen name="InvoicesList" component={InvoicesListScreen} />
            <Stack.Screen
              name="InvoiceDetail"
              component={InvoiceDetailScreen}
            />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
