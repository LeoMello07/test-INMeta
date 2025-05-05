// src/utils/offlineNotice.ts
import {Platform, ToastAndroid, Alert} from 'react-native';

export const showOfflineNotice = () => {
  const msg = 'As alterações entrarão em vigor ao ter conexão com a internet';
  if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.LONG);
  else Alert.alert('Modo off-line', msg);
};
