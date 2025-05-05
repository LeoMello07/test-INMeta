import NetInfo from '@react-native-community/netinfo';
import { getRealm } from '../db/realm';
import { WorkOrder } from '../db/schemas';
import { useWorkOrdersStore } from '../store/workOrdersStores';
import { workOrdersApi } from '../modules/api/workOrders';

export const normalizeId = (id: any) => id.toString();

let isSyncing = false;

const realmWrite = async (cb: (realm: Realm) => void) => {
  const realm = await getRealm();
  realm.write(() => cb(realm));
};

const buildPayload = (w: WorkOrder) => ({
  title: w.title,
  description: w.description,
  status: w.status,
  assignedTo: w.assignedTo,
});

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
        if (wo.deleted) {
          await workOrdersApi.remove(wo.id);
          realmWrite((r) => {
            const obj = r.objectForPrimaryKey('WorkOrder', wo.id);
            if (obj) r.delete(obj);
          });
          removeOrder(wo.id);
          continue;
        }

        const payload = buildPayload(wo);
        const offlineId = wo.id.length > 10;
        let resp;

        if (offlineId) {
          resp = await workOrdersApi.create(payload);

          if (resp.status !== wo.status) {
            resp = await workOrdersApi.update(resp.id, {
              ...payload,
              status: wo.status,
            });
          }

          removeOrder(wo.id);
        } else {
          try {
            resp = await workOrdersApi.update(wo.id, payload);
          } catch (e: any) {
            const msg = e.response?.data?.message ?? '';
            const notFound =
              e.response?.status === 404 ||
              (e.response?.status === 500 && msg.includes('No document'));

            if (notFound) {
              resp = await workOrdersApi.create(payload);
              removeOrder(wo.id);
            } else {
              throw e;
            }
          }
        }

        const serverWO: WorkOrder = {
          ...resp,
          id: normalizeId(resp.id),
          createdAt: new Date(resp.createdAt),
          updatedAt: new Date(resp.updatedAt),
          deletedAt: resp.deletedAt ? new Date(resp.deletedAt) : undefined,
          status: wo.status,
          pendingSync: false,
        };

        realmWrite((r) => {
          const old = r.objectForPrimaryKey('WorkOrder', wo.id);
          if (old) r.delete(old);
          r.create('WorkOrder', serverWO, 'modified');
        });

        upsertOrder(serverWO);
      } catch (err: any) {
        console.warn('[sync] Falha ao sincronizar – mantém pendingSync', err);
      }
    }
  } finally {
    isSyncing = false;
  }
};

export const pullFromServer = async () => {
  const { setLastSync, upsertOrder } =
    useWorkOrdersStore.getState();

  const data = await workOrdersApi.getAll();

  if (!Array.isArray(data)) {
    console.warn('[pullFromServer] Erro ao buscar dados', data);
    return;
  }

  await realmWrite((realm) => {
    data.forEach((wo) => {
      realm.create(
        'WorkOrder',
        { ...wo, id: normalizeId(wo.id), pendingSync: false },
        'modified',
      );
      upsertOrder({ ...wo, id: normalizeId(wo.id), pendingSync: false });
    });
  });

  setLastSync(new Date().toISOString());
};

export const syncIfOnline = async () => {
  const state = await NetInfo.fetch();
  if (!state.isConnected) return;

  await pushLocalChanges();
  await pullFromServer();
};
