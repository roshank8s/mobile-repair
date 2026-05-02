import React, {useMemo} from 'react';
import {ScrollView, Share, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {ScreenHeader} from '../../components/ScreenHeader';
import {Card} from '../../components/Card';
import {Button} from '../../components/Button';
import {WhatsAppIcon} from '../../components/icons';
import {colors, fontSize, fontWeight, radii, shadows, spacing} from '../../theme/tokens';
import {useStoreState} from '../../data/store';
import {formatINR} from '../../lib/currency';
import {formatDate} from '../../lib/date';
import {numberToIndianWords, REPAIR_HSN} from '../../lib/gst';
import {openWhatsApp} from '../../lib/whatsapp';
import {useToast} from '../../components/Toast';
import type {RootStackParamList} from '../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'InvoiceDetail'>;

export const InvoiceDetailScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const {invoiceId} = useRoute<Route>().params;
  const invoice = useStoreState(s => s.invoices.find(i => i.id === invoiceId));
  const job = useStoreState(s =>
    invoice ? s.jobs.find(j => j.id === invoice.jobId) : undefined,
  );
  const customer = useStoreState(s =>
    invoice ? s.customers.find(c => c.id === invoice.customerId) : undefined,
  );
  const shop = useStoreState(s => s.shop);
  const toast = useToast();

  const totalInWords = useMemo(
    () => (invoice ? numberToIndianWords(invoice.total) : ''),
    [invoice],
  );

  if (!invoice || !job) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Not found" onBack={() => nav.goBack()} />
      </SafeAreaView>
    );
  }

  const buildMessage = () => {
    const lines = [
      `*${shop.name || 'Repair Shop'}* — Invoice ${invoice.invoiceNo}`,
      `Date: ${formatDate(invoice.createdAt)}`,
      ``,
      `Customer: ${customer?.name ?? '-'}`,
      `Device: ${job.device.brand} ${job.device.model}`,
      `Ticket: ${job.ticketNo}`,
      ``,
      `Service charges (HSN ${REPAIR_HSN})`,
      `Subtotal: ${formatINR(invoice.subtotal, {showDecimals: true})}`,
    ];
    if (invoice.cgst) lines.push(`CGST @ ${invoice.ratePct / 2}%: ${formatINR(invoice.cgst, {showDecimals: true})}`);
    if (invoice.sgst) lines.push(`SGST @ ${invoice.ratePct / 2}%: ${formatINR(invoice.sgst, {showDecimals: true})}`);
    if (invoice.igst) lines.push(`IGST @ ${invoice.ratePct}%: ${formatINR(invoice.igst, {showDecimals: true})}`);
    lines.push(`*Total: ${formatINR(invoice.total, {showDecimals: true})}*`);
    lines.push('', `Thank you for your business!`);
    if (shop.gstin) lines.push(`GSTIN: ${shop.gstin}`);
    return lines.join('\n');
  };

  const shareViaWhatsApp = () => {
    if (!customer) return;
    openWhatsApp(customer.phone, buildMessage());
  };

  const shareGeneric = async () => {
    try {
      await Share.share({message: buildMessage()});
    } catch {
      toast.show('Could not share', 'error');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title={invoice.invoiceNo}
        subtitle={`Generated ${formatDate(invoice.createdAt)}`}
        onBack={() => nav.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(260)}>
          <View style={styles.docCard}>
            <View style={styles.docHeader}>
              <View>
                <Text style={styles.docShop}>{shop.name || 'Repair Shop'}</Text>
                {shop.address ? (
                  <Text style={styles.docAddr}>{shop.address}</Text>
                ) : null}
                {shop.phone ? (
                  <Text style={styles.docAddr}>Ph: {shop.phone}</Text>
                ) : null}
                {shop.gstin ? (
                  <Text style={styles.docAddr}>GSTIN: {shop.gstin}</Text>
                ) : null}
              </View>
              <View style={styles.docInvoiceTag}>
                <Text style={styles.docTagLabel}>TAX INVOICE</Text>
                <Text style={styles.docTagNumber}>{invoice.invoiceNo}</Text>
              </View>
            </View>

            <View style={styles.docDivider} />

            <View style={styles.docTwoCol}>
              <View style={styles.flex}>
                <Text style={styles.docColLabel}>Bill to</Text>
                <Text style={styles.docColValue}>{customer?.name}</Text>
                <Text style={styles.docColMuted}>+91 {customer?.phone}</Text>
                {customer?.address ? (
                  <Text style={styles.docColMuted}>{customer.address}</Text>
                ) : null}
              </View>
              <View style={styles.flex}>
                <Text style={styles.docColLabel}>Job ticket</Text>
                <Text style={styles.docColValue}>{job.ticketNo}</Text>
                <Text style={styles.docColMuted}>
                  {job.device.brand} {job.device.model}
                </Text>
                {job.device.imei ? (
                  <Text style={styles.docColMuted}>
                    IMEI: {job.device.imei}
                  </Text>
                ) : null}
              </View>
            </View>

            <View style={styles.docDivider} />

            <View style={styles.lineItemHeader}>
              <Text style={[styles.lineCell, {flex: 3}]}>DESCRIPTION</Text>
              <Text style={[styles.lineCell, {flex: 1}]}>HSN</Text>
              <Text style={[styles.lineCell, styles.lineCellRight, {flex: 1.2}]}>
                AMOUNT
              </Text>
            </View>
            <View style={styles.lineItemRow}>
              <View style={{flex: 3}}>
                <Text style={styles.lineDesc}>
                  Repair service: {job.issue}
                </Text>
                {job.parts.map(p => (
                  <Text key={p.partId} style={styles.linePart}>
                    + {p.name} × {p.qty}
                  </Text>
                ))}
              </View>
              <Text style={[styles.lineCell, {flex: 1}]}>{REPAIR_HSN}</Text>
              <Text style={[styles.lineAmt, {flex: 1.2}]}>
                {formatINR(invoice.subtotal, {showDecimals: true})}
              </Text>
            </View>

            <View style={styles.docDivider} />

            <SummaryRow label="Subtotal" value={invoice.subtotal} />
            {invoice.cgst > 0 ? (
              <SummaryRow
                label={`CGST @ ${invoice.ratePct / 2}%`}
                value={invoice.cgst}
              />
            ) : null}
            {invoice.sgst > 0 ? (
              <SummaryRow
                label={`SGST @ ${invoice.ratePct / 2}%`}
                value={invoice.sgst}
              />
            ) : null}
            {invoice.igst > 0 ? (
              <SummaryRow
                label={`IGST @ ${invoice.ratePct}%`}
                value={invoice.igst}
              />
            ) : null}
            <View style={styles.docDivider} />
            <SummaryRow label="Total" value={invoice.total} highlight />
            <Text style={styles.inWords}>{totalInWords}</Text>

            <View style={styles.docFooter}>
              <Text style={styles.thanks}>Thank you for your business!</Text>
              <Text style={styles.footerNote}>
                Computer-generated invoice. No signature required.
              </Text>
            </View>
          </View>
        </Animated.View>

        <Card style={{marginTop: spacing.md}}>
          <Text style={styles.sectionTitle}>Share</Text>
          <View style={styles.shareRow}>
            <Button
              label="WhatsApp"
              variant="primary"
              onPress={shareViaWhatsApp}
              leftIcon={<WhatsAppIcon size={18} color="#FFFFFF" />}
              fullWidth
              style={styles.flex}
            />
            <Button
              label="Other apps"
              variant="outline"
              onPress={shareGeneric}
              fullWidth
              style={styles.flex}
            />
          </View>
        </Card>
        <View style={{height: spacing.huge}} />
      </ScrollView>
    </SafeAreaView>
  );
};

const SummaryRow: React.FC<{label: string; value: number; highlight?: boolean}> = ({
  label,
  value,
  highlight,
}) => (
  <View style={styles.summaryRow}>
    <Text style={[styles.summaryLabel, highlight && styles.summaryLabelHi]}>
      {label}
    </Text>
    <Text style={[styles.summaryValue, highlight && styles.summaryValueHi]}>
      {formatINR(value, {showDecimals: true})}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  flex: {flex: 1},
  scroll: {paddingHorizontal: spacing.lg, paddingBottom: spacing.huge},
  docCard: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    ...shadows.card,
  },
  docHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  docShop: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  docAddr: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  docInvoiceTag: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'flex-end',
  },
  docTagLabel: {
    fontSize: fontSize.caption,
    color: colors.textOnPrimary,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.6,
  },
  docTagNumber: {
    fontSize: fontSize.body,
    color: colors.textOnPrimary,
    fontWeight: fontWeight.bold,
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
  docDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
  docTwoCol: {flexDirection: 'row', gap: spacing.lg},
  docColLabel: {
    fontSize: fontSize.caption,
    color: colors.textSubtle,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  docColValue: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginTop: 2,
  },
  docColMuted: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  lineItemHeader: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    backgroundColor: colors.cardMuted,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
  },
  lineCell: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 0.6,
  },
  lineCellRight: {textAlign: 'right'},
  lineItemRow: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  lineDesc: {
    fontSize: fontSize.body,
    color: colors.text,
    fontWeight: fontWeight.semibold,
  },
  linePart: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  lineAmt: {
    fontSize: fontSize.body,
    color: colors.text,
    fontWeight: fontWeight.semibold,
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryLabel: {fontSize: fontSize.body, color: colors.textMuted},
  summaryValue: {
    fontSize: fontSize.body,
    color: colors.text,
    fontWeight: fontWeight.semibold,
    fontVariant: ['tabular-nums'],
  },
  summaryLabelHi: {
    fontSize: fontSize.bodyLg,
    color: colors.text,
    fontWeight: fontWeight.bold,
  },
  summaryValueHi: {
    fontSize: fontSize.title,
    color: colors.primary,
    fontWeight: fontWeight.bold,
  },
  inWords: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  docFooter: {marginTop: spacing.lg, alignItems: 'center'},
  thanks: {
    fontSize: fontSize.body,
    color: colors.text,
    fontWeight: fontWeight.semibold,
  },
  footerNote: {
    fontSize: fontSize.caption,
    color: colors.textSubtle,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: fontSize.subhead,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  shareRow: {flexDirection: 'row', gap: spacing.md},
});
