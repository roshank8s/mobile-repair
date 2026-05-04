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
import Animated, {FadeInDown, FadeIn, ZoomIn} from 'react-native-reanimated';
import {Screen} from '../../components/Screen';
import {ScreenHeader} from '../../components/ScreenHeader';
import {Card} from '../../components/Card';
import {Button} from '../../components/Button';
import {Input} from '../../components/Input';
import {StatusPill} from '../../components/StatusPill';
import {AnimatedPressable} from '../../components/AnimatedPressable';
import {Avatar} from '../../components/Avatar';
import {PhotoGallery} from '../../components/PhotoGallery';
import {
  CalendarIcon,
  CheckIcon,
  PhoneIcon,
  TrashIcon,
  WhatsAppIcon,
} from '../../components/icons';
import {colors, fontSize, fontWeight, radii, shadows, spacing} from '../../theme/tokens';
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
import {success as hapticSuccess, warn as hapticWarn} from '../../lib/haptics';
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
  const shop = useStoreState(s => s.shop);
  const toast = useToast();
  const [partModalOpen, setPartModalOpen] = useState(false);
  const [statusOverlay, setStatusOverlay] = useState<JobStatus | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const totals = useMemo(() => {
    if (!job) return {total: 0, partsTotal: 0};
    const partsTotal = job.parts.reduce(
      (s, p) => s + p.unitPrice * p.qty,
      0,
    );
    const total = job.finalAmount ?? job.estimateAmount ?? partsTotal;
    return {total, partsTotal};
  }, [job]);

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
      Alert.alert('Add an amount', 'Set the final amount before generating an invoice.');
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

  return (
    <Screen>
      <ScreenHeader
        title={job.ticketNo}
        subtitle={`${job.device.brand} ${job.device.model}`}
        onBack={() => nav.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        {(job.photos ?? []).length > 0 ? (
          <PhotoHero
            photos={job.photos ?? []}
            status={job.status}
            ticketNo={job.ticketNo}
          />
        ) : (
          <Animated.View entering={FadeIn.duration(220)} style={styles.statusBox}>
            <StatusPill status={job.status} />
            <Text style={styles.received}>
              Received {formatRelative(job.receivedAt)}
            </Text>
          </Animated.View>
        )}

        <SectionTitle>Customer</SectionTitle>
        <Card>
          <View style={styles.row}>
            <Avatar
              uri={customer?.avatarUri}
              fallback={(customer?.name ?? 'W')
                .split(' ')
                .map(p => p[0] ?? '')
                .join('')}
              size={44}
              style={{marginRight: 12}}
            />
            <View style={styles.flex}>
              <Text style={styles.cardTitle}>{customer?.name ?? 'Walk-in'}</Text>
              <Text style={styles.cardSub}>+91 {customer?.phone}</Text>
            </View>
            <View style={styles.actionRow}>
              <AnimatedPressable
                onPress={() => customer && callPhone(customer.phone)}
                style={styles.miniBtn}
                scaleTo={0.92}>
                <PhoneIcon size={18} color={colors.primary} />
              </AnimatedPressable>
              <AnimatedPressable
                onPress={sendWhatsAppUpdate}
                style={[styles.miniBtn, {backgroundColor: '#E7F8EE'}]}
                scaleTo={0.92}>
                <WhatsAppIcon size={18} color={colors.success} />
              </AnimatedPressable>
            </View>
          </View>
        </Card>

        <SectionTitle>Issue</SectionTitle>
        <Card>
          <Text style={styles.issueText}>{job.issue}</Text>
          {job.device.imei ? (
            <Text style={styles.metaText}>IMEI: {job.device.imei}</Text>
          ) : null}
          {job.device.color ? (
            <Text style={styles.metaText}>Colour: {job.device.color}</Text>
          ) : null}
          {job.device.passwordNote ? (
            <Text style={styles.metaText}>Lock: {job.device.passwordNote}</Text>
          ) : null}
          {job.device.accessories ? (
            <Text style={styles.metaText}>
              Accessories: {job.device.accessories}
            </Text>
          ) : null}
          {technician ? (
            <Text style={styles.metaText}>Technician: {technician.name}</Text>
          ) : null}
        </Card>

        <SectionTitle>Device condition photos</SectionTitle>
        <Card>
          <PhotoGallery
            photos={job.photos ?? []}
            onAdd={uri => addJobPhoto(job.id, uri)}
            onRemove={i => removeJobPhoto(job.id, i)}
            emptyHint="No photos yet — tap Camera to capture device condition."
            max={6}
          />
        </Card>

        <SectionTitle>Status timeline</SectionTitle>
        <Card>
          {job.statusLog.map((entry, i) => (
            <Animated.View
              key={`${entry.status}-${entry.at}`}
              entering={FadeInDown.duration(220).delay(i * 50)}
              style={styles.timelineRow}>
              <View style={styles.timelineCol}>
                <View style={styles.timelineDot} />
                {i < job.statusLog.length - 1 ? (
                  <View style={styles.timelineLine} />
                ) : null}
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
            </Animated.View>
          ))}
        </Card>

        <SectionTitle>Parts used</SectionTitle>
        <Card>
          {job.parts.length === 0 ? (
            <Text style={styles.emptyText}>No parts added yet.</Text>
          ) : (
            <View style={styles.gap}>
              {job.parts.map(p => (
                <View key={p.partId} style={styles.partRow}>
                  <View style={styles.flex}>
                    <Text style={styles.partName}>{p.name}</Text>
                    <Text style={styles.partMeta}>
                      {p.qty} × {formatINR(p.unitPrice)}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.partTotal}>
                      {formatINR(p.qty * p.unitPrice)}
                    </Text>
                    <AnimatedPressable
                      onPress={() => removePartFromJob(job.id, p.partId)}
                      style={styles.miniBtn}
                      scaleTo={0.9}>
                      <TrashIcon size={16} color={colors.danger} />
                    </AnimatedPressable>
                  </View>
                </View>
              ))}
              <View style={styles.divider} />
              <View style={styles.partRow}>
                <Text style={styles.partsTotal}>Parts subtotal</Text>
                <Text style={styles.partsTotalAmt}>
                  {formatINR(totals.partsTotal)}
                </Text>
              </View>
            </View>
          )}
          <Button
            label="Add part from inventory"
            onPress={() => setPartModalOpen(true)}
            variant="outline"
            size="sm"
            style={{marginTop: spacing.md}}
          />
        </Card>

        <SectionTitle>Charges</SectionTitle>
        <Card>
          <View style={styles.gap}>
            <Input
              label="Final amount (₹)"
              value={String(job.finalAmount ?? job.estimateAmount ?? 0)}
              onChangeText={t => setJobFinalAmount(job.id, Number(t) || 0)}
              keyboardType="numeric"
              hint={`Estimate was ${formatINR(job.estimateAmount)}`}
            />
            {invoice ? (
              <View style={styles.invoiceBadge}>
                <CheckIcon size={16} color={colors.success} />
                <Text style={styles.invoiceLabel}>
                  Invoice {invoice.invoiceNo} generated
                </Text>
              </View>
            ) : null}
          </View>
        </Card>

        <View style={{height: spacing.huge}} />
      </ScrollView>

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
          variant="accent"
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
        message="Ready for pickup!"
      />
    </Screen>
  );
};

const PhotoHero: React.FC<{
  photos: string[];
  status: JobStatus;
  ticketNo: string;
}> = ({photos, status, ticketNo}) => {
  const {width} = useWindowDimensions();
  const heroHeight = Math.min(280, Math.round(width * 0.62));
  const itemWidth = Math.min(width, 720) - spacing.lg * 2;
  return (
    <View style={[styles.photoHero, {height: heroHeight}]}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={itemWidth}
        decelerationRate="fast"
        contentContainerStyle={styles.photoHeroScroll}>
        {photos.map((uri, i) => (
          <View
            key={`hero-${i}`}
            style={[styles.photoHeroSlide, {width: itemWidth, height: heroHeight}]}>
            <Image source={{uri}} style={styles.photoHeroImg} />
          </View>
        ))}
      </ScrollView>
      <View style={styles.photoHeroOverlay} pointerEvents="none">
        <View style={styles.photoHeroPill}>
          <StatusPill status={status} size="sm" />
        </View>
        <View style={styles.photoHeroCount}>
          <Text style={styles.photoHeroCountText}>
            {ticketNo} · {photos.length} photo{photos.length === 1 ? '' : 's'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const SectionTitle: React.FC<{children: React.ReactNode}> = ({children}) => (
  <Text style={styles.sectionTitle}>{children}</Text>
);

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
                <Text style={styles.cardTitle}>{p.name}</Text>
                <Text style={styles.cardSub}>
                  {p.brand ?? 'Generic'} · {p.compatModels ?? 'Universal'}
                </Text>
              </View>
              <View style={styles.partOptionRight}>
                <Text style={styles.partTotal}>{formatINR(p.sellPrice)}</Text>
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
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Record payment</Text>
          <Input
            label="Amount"
            value={amt}
            onChangeText={setAmt}
            keyboardType="numeric"
          />
          <View style={[styles.row, {marginTop: spacing.md, gap: spacing.sm}]}>
            {(['cash', 'upi', 'card'] as PaymentMode[]).map(m => (
              <AnimatedPressable
                key={m}
                onPress={() => setMode(m)}
                style={[styles.modeChip, mode === m && styles.modeChipActive]}
                scaleTo={0.95}>
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
          <View style={[styles.row, {marginTop: spacing.lg, gap: spacing.md}]}>
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
    <Animated.View
      entering={FadeIn.duration(160)}
      style={styles.successOverlay}>
      <Animated.View entering={ZoomIn.duration(280).springify()} style={styles.successCard}>
        <View style={styles.successIcon}>
          <CheckIcon size={40} color="#FFFFFF" strokeWidth={3} />
        </View>
        <Text style={styles.successText}>{message}</Text>
      </Animated.View>
    </Animated.View>
  );
};

// styles
const styles = StyleSheet.create({
  flex: {flex: 1},
  scroll: {paddingHorizontal: spacing.lg, paddingBottom: 120},
  statusBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  photoHero: {
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  photoHeroScroll: {paddingHorizontal: 0},
  photoHeroSlide: {
    backgroundColor: colors.cardMuted,
    overflow: 'hidden',
    borderRadius: radii.xl,
    marginRight: 0,
  },
  photoHeroImg: {width: '100%', height: '100%'},
  photoHeroOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  photoHeroPill: {alignSelf: 'flex-start'},
  photoHeroCount: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  photoHeroCountText: {
    color: '#FFFFFF',
    fontSize: fontSize.caption,
    fontWeight: fontWeight.bold,
    fontVariant: ['tabular-nums'],
  },
  received: {fontSize: fontSize.small, color: colors.textSubtle},
  sectionTitle: {
    fontSize: fontSize.small,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  row: {flexDirection: 'row', alignItems: 'center'},
  gap: {gap: spacing.md},
  cardTitle: {
    fontSize: fontSize.bodyLg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  cardSub: {fontSize: fontSize.small, color: colors.textMuted, marginTop: 2},
  actionRow: {flexDirection: 'row', gap: spacing.sm, alignItems: 'center'},
  miniBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardMuted,
  },
  issueText: {
    fontSize: fontSize.body,
    color: colors.text,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  metaText: {
    fontSize: fontSize.small,
    color: colors.textMuted,
    marginTop: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  timelineCol: {alignItems: 'center', width: 16},
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...shadows.card,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border,
    marginTop: 4,
  },
  timelineStatus: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  timelineTime: {fontSize: fontSize.caption, color: colors.textSubtle, marginTop: 2},
  timelineNote: {
    fontSize: fontSize.small,
    color: colors.textMuted,
    marginTop: 4,
    fontStyle: 'italic',
  },
  emptyText: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  partRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.md},
  partName: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  partMeta: {fontSize: fontSize.small, color: colors.textMuted, marginTop: 2},
  partTotal: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.bold,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  divider: {height: 1, backgroundColor: colors.divider, marginVertical: spacing.xs},
  partsTotal: {
    flex: 1,
    fontSize: fontSize.body,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
  },
  partsTotalAmt: {
    fontSize: fontSize.subhead,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  invoiceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.successSoft,
    padding: spacing.sm,
    borderRadius: radii.md,
  },
  invoiceLabel: {
    fontSize: fontSize.small,
    fontWeight: fontWeight.semibold,
    color: '#166534',
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  footerBtn: {flex: 1},
  searchBox: {paddingHorizontal: spacing.lg, marginBottom: spacing.md},
  modalList: {paddingHorizontal: spacing.lg, gap: spacing.sm},
  partOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  partOptionDisabled: {opacity: 0.5},
  partOptionRight: {alignItems: 'flex-end'},
  stockTag: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: fontWeight.semibold,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(10,10,10,0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.xl,
  },
  modalTitle: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  modeChip: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  modeChipActive: {backgroundColor: colors.primary, borderColor: colors.primary},
  modeLabel: {
    fontSize: fontSize.small,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  modeLabelActive: {color: colors.textOnPrimary},
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,10,10,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCard: {
    backgroundColor: colors.card,
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.huge,
    borderRadius: radii.xl,
    alignItems: 'center',
    ...shadows.raised,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  successText: {
    fontSize: fontSize.subhead,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
});

// avoid lint warning for unused warn helper
void hapticWarn;
void CalendarIcon;
