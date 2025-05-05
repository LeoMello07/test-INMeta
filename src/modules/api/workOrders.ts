// src/modules/api/workOrders.ts
import { api } from '../../api/client';
import { WorkOrder } from '../../db/schemas';

export type ApiError = { message: string; code?: string };

const errorToMessage = (err: any, context: string): ApiError => {
  if (err?.response?.data?.message) return { message: err.response.data.message };
  return { message: `[${context}] Erro inesperado` };
};

/* ------------------------------------------------------------------ */
/* GET /work-orders  – lista completa                                 */
/* ------------------------------------------------------------------ */
export const getAllWorkOrders = async (): Promise<WorkOrder[] | ApiError> => {
  try {
    const { data } = await api.get('/work-orders');
    return data as WorkOrder[];
  } catch (error) {
    return errorToMessage(error, 'Erro ao obter lista de OS');
  }
};

/* ------------------------------------------------------------------ */
/* POST /work-orders  – criar                                         */
/* ------------------------------------------------------------------ */
export const createWorkOrder = async (
  payload: Partial<WorkOrder>
): Promise<WorkOrder> => {
  const res = await api.post<WorkOrder>('/work-orders', payload);
  return res.data;       
};

/* ------------------------------------------------------------------ */
/* GET /work-orders/:id                                               */
/* ------------------------------------------------------------------ */
export const getWorkOrder = async (id: string): Promise<WorkOrder | ApiError> => {
  try {
    const { data } = await api.get(`/work-orders/${id}`);
    return data as WorkOrder;
  } catch (error) {
    return errorToMessage(error, 'Erro ao obter OS');
  }
};

/* ------------------------------------------------------------------ */
/* PUT /work-orders/:id                                               */
/* ------------------------------------------------------------------ */
export const updateWorkOrder = async (
  id: string,
  payload: Partial<WorkOrder>
): Promise<WorkOrder> => {
  const res = await api.put<WorkOrder>(`/work-orders/${id}`, payload);
  return res.data;           // ← devolve só o body
};

/* ------------------------------------------------------------------ */
/* DELETE /work-orders/:id  (soft-delete)                             */
/* ------------------------------------------------------------------ */
export const deleteWorkOrder = async (id: string): Promise<boolean | ApiError> => {
  try {
    await api.delete(`/work-orders/${id}`);
    return true;
  } catch (error) {
    return errorToMessage(error, 'Erro ao remover OS');
  }
};

/* ------------------------------------------------------------------ */
/* OBJETO ÚNICO com todos os métodos – é o que a tela vai importar    */
/* ------------------------------------------------------------------ */
export const workOrdersApi = {
  getAll: getAllWorkOrders,
  getOne: getWorkOrder,
  create: createWorkOrder,
  update: updateWorkOrder,
  remove: deleteWorkOrder,
};
