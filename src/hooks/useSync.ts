// exemplo: src/hooks/useSync.ts
import { useEffect } from 'react';
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { syncIfOnline } from '../sync/syncService';

export function useSync() {
  useEffect(() => {
    // ao montar, tenta sync imediato
    syncIfOnline();

    // e sempre que voltar do background ou reconectar
    const subNet = NetInfo.addEventListener(state => state.isConnected && syncIfOnline());
    const subApp = AppState.addEventListener('change', next => {
      if (next === 'active') syncIfOnline();
    });

    return () => {
      subNet();
      subApp.remove();
    };
  }, []);
}