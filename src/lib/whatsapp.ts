import {Alert, Linking, Platform} from 'react-native';

const cleanPhone = (raw: string): string => {
  let p = raw.replace(/[^\d]/g, '');
  if (p.length === 10) p = '91' + p; // assume India when only 10 digits
  return p;
};

export const openWhatsApp = async (phone: string, message: string) => {
  const num = cleanPhone(phone);
  const text = encodeURIComponent(message);
  // whatsapp:// is more reliable on Android; api.whatsapp.com fallback works everywhere.
  const native = `whatsapp://send?phone=${num}&text=${text}`;
  const web = `https://api.whatsapp.com/send?phone=${num}&text=${text}`;
  try {
    const can = await Linking.canOpenURL(native);
    await Linking.openURL(can ? native : web);
  } catch {
    Alert.alert('WhatsApp', 'Could not open WhatsApp on this device.');
  }
};

export const callPhone = (phone: string) => {
  const num = cleanPhone(phone);
  const url = Platform.OS === 'android' ? `tel:${num}` : `telprompt:${num}`;
  Linking.openURL(url).catch(() => {
    Alert.alert('Call', 'Could not start the call.');
  });
};
