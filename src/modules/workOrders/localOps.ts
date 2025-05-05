import { getRealm } from '../../db/realm';
import { WorkOrder } from '../../db/schemas';
import uuid from 'react-native-uuid';
import { useWorkOrdersStore } from '../../store/workOrdersStores';

export const saveWorkOrderLocally = async (
  data: Partial<WorkOrder>,
  isNew: boolean,
  pending = true,
) => {
  const id = data.id ?? (uuid.v4() as string);

  const realm = await getRealm();
  realm.write(() => {
    realm.create(
      'WorkOrder',
      {
        ...data,
        id,
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
        updatedAt: new Date(),
        completed: data.status === 'Completed',
        deleted: false,
        pendingSync: pending,
      },
      'modified',
    );
  });

  useWorkOrdersStore
    .getState()
    .upsertOrder({ ...(data as WorkOrder), id, pendingSync: pending });

  return { ...(data as WorkOrder), id };
};
