// src/sync/syncService.ts
import NetInfo from '@react-native-community/netinfo';
import { api } from '../api/client';
import { getRealm } from '../db/realm';
import { WorkOrder } from '../db/schemas';
import { useWorkOrdersStore } from '../store/workOrdersStores';

export const normalizeId = (id: any) => id.toString();
let isSyncing = false;

type SyncPayload = {
  created: WorkOrder[];
  updated: WorkOrder[];
  deleted: string[];
};

const realmWrite = async (cb: (realm: Realm) => void) => {
  const realm = await getRealm();
  realm.write(() => cb(realm));
};

/**
 * Envia alterações locais pendentes para o servidor
 */
export const pushLocalChanges = async () => {
  if (isSyncing) return;
  isSyncing = true;

  try {
    const realm = await getRealm();
    const { upsertOrder, removeOrder } = useWorkOrdersStore.getState();
    const pendentes = realm
      .objects<WorkOrder>('WorkOrder')
      .filtered('pendingSync == true')
      .map((r) => ({ ...r, id: normalizeId(r.id) }));

    for (const wo of pendentes) {
      try {
        // deletions
        if (wo.deleted) {
          await api.delete(`/work-orders/${wo.id}`);
          realmWrite((r) => {
            const obj = r.objectForPrimaryKey('WorkOrder', wo.id);
            if (obj) r.delete(obj);
          });
          removeOrder(wo.id);
          continue;
        }

        // build payload
        const payload = {
          title: wo.title,
          description: wo.description,
          status: wo.status,
          assignedTo: wo.assignedTo,
        };

        let resp;
        const offlineId = wo.id.length > 10;

        if (offlineId) {
          // POST
          resp = await api.post<WorkOrder>('/work-orders', payload);
          // ensure status
          if (resp.data.status !== wo.status) {
            resp = await api.put<WorkOrder>(`/work-orders/${resp.data.id}`, {
              ...payload,
              status: wo.status,
            });
          }
          removeOrder(wo.id);
        } else {
          // PUT
          try {
            resp = await api.put<WorkOrder>(`/work-orders/${wo.id}`, payload);
          } catch (e: any) {
            const msg = e.response?.data?.message ?? '';
            const notFound = e.response?.status === 404 || (e.response?.status === 500 && msg.includes('No document'));
            if (notFound) {
              resp = await api.post<WorkOrder>('/work-orders', payload);
              removeOrder(wo.id);
            } else throw e;
          }
        }

        // grava servidor no Realm
        const serverWO: WorkOrder = {
          ...resp.data,
          id: normalizeId(resp.data.id),
          createdAt: new Date(resp.data.createdAt),
          updatedAt: new Date(resp.data.updatedAt),
          deletedAt: resp.data.deletedAt ? new Date(resp.data.deletedAt) : undefined,
          pendingSync: false,
        };

        realmWrite((r) => {
          const old = r.objectForPrimaryKey('WorkOrder', normalizeId(wo.id));
          if (old) r.delete(old);
          r.create('WorkOrder', serverWO, 'modified');
        });
        upsertOrder(serverWO);
      } catch (err) {
        console.warn('[sync] Falha ao sincronizar – mantém pendingSync', err);
      }
    }
  } finally {
    isSyncing = false;
  }
};

/**
 * Busca apenas deltas no servidor desde a última sincronização
 */
export const pullFromServer = async () => {
  const { lastSync, setLastSync, upsertOrder, removeOrder } = useWorkOrdersStore.getState();

  const since = lastSync ?? new Date(0).toISOString();
  const response = await api.get<SyncPayload>('/work-orders/sync', {
    params: { since },
  });
  const { created, updated, deleted } = response.data;

  await realmWrite((realm) => {
    // Creates and updates
    [...created, ...updated].forEach((wo) => {
      realm.create(
        'WorkOrder',
        { ...wo, id: normalizeId(wo.id), pendingSync: false },
        'modified'
      );
      upsertOrder({ ...wo, id: normalizeId(wo.id), pendingSync: false });
    });
    // Deletions
    deleted.forEach((id) => {
      const key = normalizeId(id);
      const obj = realm.objectForPrimaryKey<WorkOrder>('WorkOrder', key);
      if (obj) realm.delete(obj);
      removeOrder(key);
    });
  });

  setLastSync(new Date().toISOString());
};

/**
 * Orquestra sync completo quando online
 */
export const syncIfOnline = async () => {
  const state = await NetInfo.fetch();
  if (!state.isConnected) return;
  await pushLocalChanges();
  await pullFromServer();
};
