import {create} from 'zustand';
import {WorkOrder} from '../db/schemas';
import {normalizeId} from '../sync/syncService';

type State = {
  workOrders: WorkOrder[];
  setOrders: (arr: WorkOrder[]) => void;
  upsertOrder: (wo: WorkOrder) => void;
  removeOrder: (id: string) => void;
  lastSync: string | null;
  setLastSync: (date: string | null) => void;
};

export const useWorkOrdersStore = create<State>(set => ({
  lastSync: null,
  setLastSync: date => set({lastSync: date}),
  workOrders: [],
  setOrders: arr =>
    set({workOrders: arr.map(w => ({...w, id: normalizeId(w.id)}))}),

  upsertOrder: wo =>
    set(s => {
      const id = normalizeId(wo.id);
      const idx = s.workOrders.findIndex(x => normalizeId(x.id) === id);

      if (idx >= 0) s.workOrders[idx] = {...wo, id};
      else s.workOrders.push({...wo, id});

      return {workOrders: [...s.workOrders]};
    }),

  removeOrder: id =>
    set(s => ({
      workOrders: s.workOrders.filter(
        w => normalizeId(w.id) !== normalizeId(id),
      ),
    })),
}));
