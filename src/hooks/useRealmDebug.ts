// src/hooks/useRealmDebug.ts
import { useEffect } from 'react';
import { getRealm } from '../db/realm';

export const useRealmDebug = () => {
  useEffect(() => {
    (async () => {
      const realm = await getRealm();

      const objs = realm.objects('WorkOrder');
      console.log(
        `[Realm] total = ${objs.length}`,
        objs.map((o: any) => ({
          id: o.id,
          pendingSync: o.pendingSync,
          deleted: o.deleted,
        })),
      );
    })();
  }, []);
};

export const wipeRealm = async () => {
    const realm = await getRealm();
    realm.write(() => {
      realm.deleteAll();
    });
    console.log('[Realm] banco zerado');
  };
