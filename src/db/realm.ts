// db/realm.ts
import Realm from 'realm';
import { WorkOrderSchema } from './schemas';

let realmInstance: Realm;

export const getRealm = async () => {
  if (realmInstance) return realmInstance;

  realmInstance = await Realm.open({
    schema: [WorkOrderSchema],
    schemaVersion: 2,          // ← 1 → 2 ou o número seguinte ao que já usava
    migration: (oldRealm, newRealm) => {
      if (oldRealm.schemaVersion < 2) {
        const oldObjects = oldRealm.objects('WorkOrder');
        const newObjects = newRealm.objects('WorkOrder');

        // para cada item antigo, seta valor default do novo campo
        for (let i = 0; i < oldObjects.length; i++) {
          // @ts-ignore
          newObjects[i].localCreated = false;
        }
      }
    },
  });

  return realmInstance;
};
