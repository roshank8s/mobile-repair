import type {NavigatorScreenParams} from '@react-navigation/native';

export type AppTabsParamList = {
  Dashboard: undefined;
  Jobs: undefined;
  Customers: undefined;
  Inventory: undefined;
  More: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  AppTabs: NavigatorScreenParams<AppTabsParamList>;
  JobCreate: undefined;
  JobDetail: {jobId: string};
  CustomerDetail: {customerId: string};
  PartEdit: {partId?: string} | undefined;
  InvoicesList: undefined;
  InvoiceDetail: {invoiceId: string};
  Settings: undefined;
};
