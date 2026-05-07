import React, {useMemo, useState} from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Animated, {FadeIn, ZoomIn} from 'react-native-reanimated';
import {Screen} from '../../components/Screen';
import {ScreenHeader} from '../../components/ScreenHeader';
import {Button} from '../../components/Button';
import {Input} from '../../components/Input';
import {StatusPill} from '../../components/StatusPill';
import {AnimatedPressable} from '../../components/AnimatedPressable';
import {PhotoGallery} from '../../components/PhotoGallery';
import {CheckIcon, TrashIcon} from '../../components/icons';
import {colors, fontSize, fontWeight, radii, spacing} from '../../theme/tokens';
import {
  addJobPhoto,
  addPartToJob,
  createInvoice,
  recordPayment,
  removeJobPhoto,
  removePartFromJob,
  setJobFinalAmount,
  transitionJob,
  useStoreState,
} from '../../data/store';
import {
  JOB_STATUS_LABEL,
  JOB_STATUS_ORDER,
  JobStatus,
  PaymentMode,
} from '../../data/types';
import {formatINR} from '../../lib/currency';
import {formatDateTime, formatRelative} from '../../lib/date';
import {splitGstFromInclusive} from '../../lib/gst';
import {callPhone, openWhatsApp} from '../../lib/whatsapp';
import {useToast} from '../../components/Toast';
import {success as hapticSuccess} from '../../lib/haptics';
import type {RootStackParamList} from '../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'JobDetail'>;

export const JobDetailScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const {jobId} = useRoute<Route>().params;
  const job = useStoreState(s => s.jobs.find(j => j.id === jobId));
  const customer = useStoreState(s =>
    job ? s.customers.find(c => c.id === job.customerId) : undefined,
  );
  const technician = useStoreState(s =>
    job?.technicianId
      ? s.technicians.find(t => t.id === job.technicianId)
      : undefined,
  );
  const invoice = useStoreState(s => s.invoices.find(i => i.jobId === jobId));
  const jobPayments = useStoreState(s =>
    s.payments.filter(p => p.jobId === jobId),
  );
  const shop = useStoreState(s => s.shop);
  const toast = useToast();
  const [partModalOpen, setPartModalOpen] = useState(false);
  const [statusOverlay, setStatusOverlay] = useState<JobStatus | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const totals = useMemo(() => {
    if (!job)
      return {
        total: 0,
        partsTotal: 0,
        paid: 0,
        due: 0,
        status: 'pending' as const,
      };
    const partsTotal = job.parts.reduce((s, p) => s + p.unitPrice * p.qty, 0);
    const total = job.finalAmount ?? job.estimateAmount ?? partsTotal;
    const paid = jobPayments.reduce((s, p) => s + p.amount, 0);
    const due = Math.max(0, total - paid);
    let status: 'paid' | 'partial' | 'pending' = 'pending';
    if (total > 0 && paid >= total) status = 'paid';
    else if (paid > 0) status = 'partial';
    return {total, partsTotal, paid, due, status};
  }, [job, jobPayments]);

  if (!job) {
    return (
      <Screen>
        <ScreenHeader title="Job not found" onBack={() => nav.goBack()} />
      </Screen>
    );
  }

  const currentIdx = JOB_STATUS_ORDER.indexOf(job.status);
  const next =
    currentIdx >= 0 && currentIdx < JOB_STATUS_ORDER.length - 1
      ? JOB_STATUS_ORDER[currentIdx + 1]
      : null;

  const advance = (target: JobStatus) => {
    transitionJob(job.id, target);
    if (target === 'ready') {
      setStatusOverlay('ready');
      hapticSuccess();
      setTimeout(() => setStatusOverlay(null), 1300);
    } else if (target === 'delivered') {
      hapticSuccess();
      toast.show('Marked as delivered');
    } else {
      toast.show(`Moved to ${JOB_STATUS_LABEL[target]}`);
    }
  };

  const generateInvoice = () => {
    if (totals.total <= 0) {
      Alert.alert(
        'Add an amount',
        'Set the final amount before generating an invoice.',
      );
      return;
    }
    const split = splitGstFromInclusive(totals.total, shop.gstRatePct);
    const inv = createInvoice(job.id, split);
    hapticSuccess();
    toast.show(`Invoice ${inv.invoiceNo} generated`);
    nav.navigate('InvoiceDetail', {invoiceId: inv.id});
  };

  const sendWhatsAppUpdate = () => {
    if (!customer) return;
    const msg = `Hi ${customer.name}, this is ${shop.name || 'your repair shop'}.\n\nJob ${job.ticketNo} (${job.device.brand} ${job.device.model}) is now: ${JOB_STATUS_LABEL[job.status]}.\n\nThank you!`;
    openWhatsApp(customer.phone, msg);
  };

  const photos = job.photos ?? [];

  return (
    <Screen>
      <ScreenHeader title="" onBack={() => nav.goBack()} />
      <Animated.View entering={FadeIn.duration(220)} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}>
          {photos.length > 0 ? (
            <PhotoHero photos={photos} />
          ) : null}

          <View style={styles.heroBlock}>
            <Text style={styles.ticket}>{job.ticketNo}</Text>
            <Text style={styles.device}>
              {job.device.brand} {job.device.model}
            </Text>
            <View style={styles.heroPillRow}>
              <StatusPill status={job.status} />
              <Text style={styles.received}>
                Received {formatRelative(job.receivedAt)}
              </Text>
            </View>
          </View>

          <Section title="Customer">
            <View style={styles.customerRow}>
              <View style={styles.flex}>
                <Text style={styles.customerName}>
                  {customer?.name ?? 'Walk-in'}
                </Text>
                <Text style={styles.customerSub}>+91 {customer?.phone}</Text>
              </View>
              <View style={styles.actionRow}>
                <Button
                  label="Call"
                  variant="secondary"
                  size="sm"
                  onPress={() => customer && callPhone(customer.phone)}
                />
                <Button
                  label="WhatsApp"
                  variant="secondary"
                  size="sm"
                  onPress={sendWhatsAppUpdate}
                />
              </View>
            </View>
          </Section>

          <Section title="Issue">
            <Text style={styles.issueText}>{job.issue}</Text>
            {[
              ['IMEI', job.device.imei],
              ['Colour', job.device.color],
              ['Lock', job.device.passwordNote],
              ['Accessories', job.device.accessories],
              ['Technician', technician?.name],
            ]
              .filter(([, v]) => !!v)
              .map(([label, value]) => (
                <View key={label as string} style={styles.metaRow}>
                  <Text style={styles.metaLabel}>{label}</Text>
                  <Text style={styles.metaValue}>{value as string}</Text>
                </View>
              ))}
          </Section>

          <Section title="Photos">
            <PhotoGallery
              photos={photos}
              onAdd={uri => addJobPhoto(job.id, uri)}
              onRemove={i => removeJobPhoto(job.id, i)}
              emptyHint="No photos yet — capture device condition before repair."
              max={6}
            />
          </Section>

          <Section title="Status timeline">
            {job.statusLog.map((entry, i) => {
              const isLast = i === job.statusLog.length - 1;
              return (
                <View
                  key={`${entry.status}-${entry.at}`}
                  style={styles.timelineEntry}>
                  <View style={styles.timelineMarker}>
                    <View
                      style={[
                        styles.timelineDot,
                        isLast && styles.timelineDotActive,
                      ]}
                    />
                    {!isLast ? <View style={styles.timelineLine} /> : null}
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.timelineStatus}>
                      {JOB_STATUS_LABEL[entry.status]}
                    </Text>
                    <Text style={styles.timelineTime}>
                      {formatDateTime(entry.at)}
                    </Text>
                    {entry.note ? (
                      <Text style={styles.timelineNote}>{entry.note}</Text>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </Section>

          <Section title="Parts used">
            {job.parts.length === 0 ? (
              <Text style={styles.emptyText}>No parts added.</Text>
            ) : (
              <View>
                {job.parts.map(p => (
                  <View key={p.partId} style={styles.partRow}>
                    <View style={styles.flex}>
                      <Text style={styles.partName}>{p.name}</Text>
                      <Text style={styles.partMeta}>
                        {p.qty} × {formatINR(p.unitPrice)}
                      </Text>
                    </View>
                    <Text style={styles.partTotal}>
                      {formatINR(p.qty * p.unitPrice)}
                    </Text>
                    <AnimatedPressable
                      onPress={() => removePartFromJob(job.id, p.partId)}
                      style={styles.removeBtn}
                      scaleTo={0.92}>
                      <TrashIcon size={14} color={colors.textSubtle} />
                    </AnimatedPressable>
                  </View>
                ))}
                <View style={styles.partSubtotalRow}>
                  <Text style={styles.partSubtotalLabel}>Parts subtotal</Text>
                  <Text style={styles.partSubtotalValue}>
                    {formatINR(totals.partsTotal)}
                  </Text>
                </View>
              </View>
            )}
            <Button
              label="Add part"
              variant="ghost"
              size="sm"
              onPress={() => setPartModalOpen(true)}
              style={styles.addPartBtn}
            />
          </Section>

          <Section title="Charges">
            <Input
              label="Final amount (₹)"
              value={String(job.finalAmount ?? job.estimateAmount ?? 0)}
              onChangeText={t => setJobFinalAmount(job.id, Number(t) || 0)}
              keyboardType="numeric"
              hint={`Estimate was ${formatINR(job.estimateAmount)}`}
            />

            <View style={styles.payRow}>
              <Text style={[styles.payStatus, payStatusStyle(totals.status)]}>
                {payStatusLabel(totals.status)}
              </Text>
              <View style={styles.flex}>
                <Text style={styles.payLine}>
                  Paid {formatINR(totals.paid)} of {formatINR(totals.total)}
                </Text>
                {totals.due > 0 ? (
                  <Text style={styles.payDue}>
                    Due {formatINR(totals.due)}
                  </Text>
                ) : null}
              </View>
            </View>

            <Button
              label={totals.due > 0 ? 'Record payment' : 'Add another payment'}
              variant="ghost"
              size="sm"
              onPress={() => setPaymentModalOpen(true)}
              style={styles.payBtn}
            />

            {jobPayments.length > 0 ? (
              <View style={styles.payList}>
                {jobPayments.map(p => (
                  <View key={p.id} style={styles.payItem}>
                    <Text style={styles.payMode}>{p.mode.toUpperCase()}</Text>
                    <Text style={styles.payAmt}>{formatINR(p.amount)}</Text>
                    <Text style={styles.payTime}>{formatRelative(p.at)}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {invoice ? (
              <View style={styles.invoiceBadge}>
                <CheckIcon size={14} color={colors.success} strokeWidth={2.4} />
                <Text style={styles.invoiceLabel}>
                  Invoice {invoice.invoiceNo} generated
                </Text>
              </View>
            ) : null}
          </Section>

          {(job.warrantyDays ?? 0) > 0 ? (
            <Section title="Warranty">
              <WarrantyBlock
                warrantyDays={job.warrantyDays!}
                deliveredAt={job.deliveredAt}
              />
            </Section>
          ) : null}

          <View style={{height: 140}} />
        </ScrollView>
      </Animated.View>

      <View style={styles.footer}>
        {next ? (
          <Button
            label={`Mark as ${JOB_STATUS_LABEL[next]}`}
            onPress={() => advance(next)}
            variant="primary"
            size="lg"
            style={styles.footerBtn}
          />
        ) : (
          <Button
            label="Job complete"
            onPress={() => {}}
            variant="primary"
            size="lg"
            disabled
            style={styles.footerBtn}
          />
        )}
        <Button
          label={invoice ? 'View invoice' : 'Generate invoice'}
          onPress={() =>
            invoice
              ? nav.navigate('InvoiceDetail', {invoiceId: invoice.id})
              : generateInvoice()
          }
          variant="secondary"
          size="lg"
          style={styles.footerBtn}
        />
      </View>

      <PartPickerModal
        visible={partModalOpen}
        onClose={() => setPartModalOpen(false)}
        onPick={(partId, qty) => {
          addPartToJob(job.id, partId, qty);
          setPartModalOpen(false);
          hapticSuccess();
          toast.show('Part added');
        }}
      />

      <PaymentModal
        visible={paymentModalOpen}
        amount={totals.total}
        onClose={() => setPaymentModalOpen(false)}
        onPay={(amount, mode) => {
          recordPayment(job.id, amount, mode);
          setPaymentModalOpen(false);
          hapticSuccess();
          toast.show('Payment recorded');
        }}
      />

      <SuccessOverlay
        visible={statusOverlay === 'ready'}
        message="Ready for pickup"
      />
    </Screen>
  );
};

const Section: React.FC<{title: string; children: React.ReactNode}> = ({
  title,
  children,
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionBody}>{children}</View>
  </View>
);

const PhotoHero: React.FC<{photos: string[]}> = ({photos}) => {
  const {width} = useWindowDimensions();
  const heroHeight = Math.min(280, Math.round(width * 0.55));
  return (
    <View style={[styles.photoHero, {height: heroHeight}]}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={width}
        decelerationRate="fast">
        {photos.map((uri, i) => (
          <View
            key={`hero-${i}`}
            style={[styles.photoHeroSlide, {width, height: heroHeight}]}>
            <Image source={{uri}} style={styles.photoHeroImg} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const payStatusLabel = (s: 'paid' | 'partial' | 'pending'): string =>
  s === 'paid' ? 'Paid' : s === 'partial' ? 'Partial' : 'Pending';

const payStatusStyle = (s: 'paid' | 'partial' | 'pending') => {
  if (s === 'paid') return {color: colors.success};
  if (s === 'partial') return {color: colors.warning};
  return {color: colors.danger};
};

const WarrantyBlock: React.FC<{warrantyDays: number; deliveredAt?: string}> = ({
  warrantyDays,
  deliveredAt,
}) => {
  if (!deliveredAt) {
    return (
      <Text style={styles.warrantyHint}>
        {warrantyDays}-day warranty starts on delivery.
      </Text>
    );
  }
  const expiry = new Date(deliveredAt);
  expiry.setDate(expiry.getDate() + warrantyDays);
  const daysLeft = Math.ceil(
    (expiry.getTime() - Date.now()) / (24 * 3600 * 1000),
  );
  const expired = daysLeft <= 0;
  return (
    <View>
      <Text style={[styles.warrantyTitle, expired && {color: colors.danger}]}>
        {expired
          ? 'Warranty expired'
          : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`}
      </Text>
      <Text style={styles.warrantySub}>
        {warrantyDays}-day cover · until{' '}
        {expiry.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })}
      </Text>
    </View>
  );
};

const PartPickerModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onPick: (partId: string, qty: number) => void;
}> = ({visible, onClose, onPick}) => {
  const parts = useStoreState(s => s.parts);
  const [query, setQuery] = useState('');
  const filtered = useMemo(
    () =>
      parts.filter(p => {
        if (!query) return true;
        const q = query.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          (p.brand?.toLowerCase().includes(q) ?? false) ||
          (p.compatModels?.toLowerCase().includes(q) ?? false)
        );
      }),
    [parts, query],
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <Screen edges={['top', 'bottom']}>
        <ScreenHeader title="Pick a part" onBack={onClose} />
        <View style={styles.searchBox}>
          <Input
            value={query}
            onChangeText={setQuery}
            placeholder="Search parts..."
            autoFocus
          />
        </View>
        <ScrollView
          contentContainerStyle={styles.modalList}
          showsVerticalScrollIndicator={false}>
          {filtered.map(p => (
            <AnimatedPressable
              key={p.id}
              onPress={() => p.stock > 0 && onPick(p.id, 1)}
              style={[
                styles.partOption,
                p.stock === 0 && styles.partOptionDisabled,
              ]}
              scaleTo={0.99}>
              <View style={styles.flex}>
                <Text style={styles.partOptionName}>{p.name}</Text>
                <Text style={styles.partOptionMeta}>
                  {p.brand ?? 'Generic'} · {p.compatModels ?? 'Universal'}
                </Text>
              </View>
              <View style={styles.partOptionRight}>
                <Text style={styles.partOptionPrice}>
                  {formatINR(p.sellPrice)}
                </Text>
                <Text
                  style={[
                    styles.stockTag,
                    p.stock <= p.lowStockAt && {color: colors.warning},
                    p.stock === 0 && {color: colors.danger},
                  ]}>
                  {p.stock} in stock
                </Text>
              </View>
            </AnimatedPressable>
          ))}
        </ScrollView>
      </Screen>
    </Modal>
  );
};

const PaymentModal: React.FC<{
  visible: boolean;
  amount: number;
  onClose: () => void;
  onPay: (amount: number, mode: PaymentMode) => void;
}> = ({visible, amount, onClose, onPay}) => {
  const [amt, setAmt] = useState(String(amount));
  const [mode, setMode] = useState<PaymentMode>('upi');

  React.useEffect(() => {
    setAmt(String(amount));
  }, [amount]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Record payment</Text>
          <Input
            label="Amount"
            value={amt}
            onChangeText={setAmt}
            keyboardType="numeric"
          />
          <View style={styles.modeRow}>
            {(['cash', 'upi', 'card'] as PaymentMode[]).map(m => (
              <AnimatedPressable
                key={m}
                onPress={() => setMode(m)}
                style={[styles.modeChip, mode === m && styles.modeChipActive]}
                scaleTo={0.96}>
                <Text
                  style={[
                    styles.modeLabel,
                    mode === m && styles.modeLabelActive,
                  ]}>
                  {m.toUpperCase()}
                </Text>
              </AnimatedPressable>
            ))}
          </View>
          <View style={styles.modalFooter}>
            <Button label="Cancel" variant="ghost" onPress={onClose} />
            <Button
              label="Confirm"
              variant="primary"
              onPress={() => onPay(Number(amt) || 0, mode)}
              fullWidth
              style={styles.flex}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const SuccessOverlay: React.FC<{visible: boolean; message: string}> = ({
  visible,
  message,
}) => {
  if (!visible) return null;
  return (
    <Animated.View entering={FadeIn.duration(160)} style={styles.successOverlay}>
      <Animated.View
        entering={ZoomIn.duration(280).springify()}
        style={styles.successCard}>
        <View style={styles.successIcon}>
          <CheckIcon size={36} color="#FFFFFF" strokeWidth={3} />
        </View>
        <Text style={styles.successText}>{message}</Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1},
  scroll: {paddingBottom: 0},

  photoHero: {
    overflow: 'hidden',
    backgroundColor: colors.primaryMuted,
  },
  photoHeroSlide: {overflow: 'hidden'},
  photoHeroImg: {width: '100%', height: '100%'},

  heroBlock: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: 4,
  },
  ticket: {
    fontSize: fontSize.display,
    color: colors.text,
    fontWeight: fontWeight.semibold,
    letterSpacing: -0.4,
    fontVariant: ['tabular-nums'],
  },
  device: {
    fontSize: fontSize.bodyLg,
    color: colors.textMuted,
  },
  heroPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  received: {
    fontSize: fontSize.caption,
    color: colors.textSubtle,
  },

  section: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  sectionBody: {gap: spacing.md},

  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  customerName: {
    fontSize: fontSize.bodyLg,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  customerSub: {
    marginTop: 2,
    fontSize: fontSize.small,
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  actionRow: {flexDirection: 'row', gap: spacing.sm},

  issueText: {
    fontSize: fontSize.body,
    color: colors.text,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metaLabel: {
    width: 100,
    fontSize: fontSize.small,
    color: colors.textMuted,
  },
  metaValue: {
    flex: 1,
    fontSize: fontSize.small,
    color: colors.text,
  },

  timelineEntry: {flexDirection: 'row', gap: spacing.md, paddingBottom: spacing.md},
  timelineMarker: {alignItems: 'center', width: 12, marginTop: 4},
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primaryMuted,
    borderWidth: 2,
    borderColor: colors.border,
  },
  timelineDotActive: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  timelineLine: {
    width: 1,
    flex: 1,
    backgroundColor: colors.border,
    marginTop: 4,
  },
  timelineStatus: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  timelineTime: {
    marginTop: 2,
    fontSize: fontSize.caption,
    color: colors.textSubtle,
  },
  timelineNote: {
    marginTop: 2,
    fontSize: fontSize.small,
    color: colors.textMuted,
  },

  partRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  partName: {
    fontSize: fontSize.body,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  partMeta: {
    marginTop: 2,
    fontSize: fontSize.caption,
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  partTotal: {
    fontSize: fontSize.body,
    color: colors.text,
    fontVariant: ['tabular-nums'],
    fontWeight: fontWeight.medium,
  },
  removeBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partSubtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  partSubtotalLabel: {
    fontSize: fontSize.body,
    color: colors.textMuted,
  },
  partSubtotalValue: {
    fontSize: fontSize.body,
    color: colors.text,
    fontWeight: fontWeight.medium,
    fontVariant: ['tabular-nums'],
  },
  addPartBtn: {alignSelf: 'flex-start', marginTop: spacing.sm, paddingHorizontal: 0},
  emptyText: {fontSize: fontSize.body, color: colors.textMuted},

  payRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  payStatus: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.medium,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  payLine: {
    fontSize: fontSize.body,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  payDue: {
    marginTop: 2,
    fontSize: fontSize.small,
    color: colors.danger,
    fontVariant: ['tabular-nums'],
  },
  payBtn: {alignSelf: 'flex-start', paddingHorizontal: 0},
  payList: {marginTop: spacing.sm, gap: spacing.xs},
  payItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  payMode: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
    letterSpacing: 0.5,
    width: 56,
  },
  payAmt: {
    flex: 1,
    fontSize: fontSize.body,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  payTime: {fontSize: fontSize.caption, color: colors.textSubtle},

  invoiceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  invoiceLabel: {
    fontSize: fontSize.small,
    color: colors.success,
    fontWeight: fontWeight.medium,
  },

  warrantyHint: {
    fontSize: fontSize.body,
    color: colors.textMuted,
  },
  warrantyTitle: {
    fontSize: fontSize.subhead,
    color: colors.text,
    fontWeight: fontWeight.semibold,
  },
  warrantySub: {
    marginTop: 4,
    fontSize: fontSize.small,
    color: colors.textMuted,
  },

  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  footerBtn: {flex: 1},

  searchBox: {paddingHorizontal: spacing.xl, marginBottom: spacing.sm},
  modalList: {paddingHorizontal: spacing.xl, paddingBottom: spacing.huge},
  partOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  partOptionDisabled: {opacity: 0.4},
  partOptionName: {
    fontSize: fontSize.body,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  partOptionMeta: {
    marginTop: 2,
    fontSize: fontSize.small,
    color: colors.textMuted,
  },
  partOptionRight: {alignItems: 'flex-end'},
  partOptionPrice: {
    fontSize: fontSize.body,
    color: colors.text,
    fontWeight: fontWeight.medium,
    fontVariant: ['tabular-nums'],
  },
  stockTag: {
    marginTop: 2,
    fontSize: fontSize.caption,
    color: colors.textSubtle,
    fontVariant: ['tabular-nums'],
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.bg,
    padding: spacing.xl,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    gap: spacing.md,
  },
  modalTitle: {
    fontSize: fontSize.subhead,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  modeRow: {flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs},
  modeChip: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  modeChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modeLabel: {
    fontSize: fontSize.small,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
    letterSpacing: 0.5,
  },
  modeLabelActive: {color: colors.textOnPrimary},
  modalFooter: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },

  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  successCard: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xl,
    borderRadius: radii.xxl,
    alignItems: 'center',
    gap: spacing.md,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    fontSize: fontSize.subhead,
    color: colors.text,
    fontWeight: fontWeight.semibold,
  },
});
