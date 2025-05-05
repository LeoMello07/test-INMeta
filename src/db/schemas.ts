// src/db/schemas.ts
export type WorkOrder = {
  id: string;
  title: string;
  description: string;
  status: string;
  assignedTo: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  completed: boolean;
  deleted: boolean;
  pendingSync: boolean;
};

export const WorkOrderSchema: Realm.ObjectSchema = {
  name: 'WorkOrder',
  primaryKey: 'id',
  properties: {
    id: 'string',
    title: 'string',
    description: 'string',
    status: 'string',
    assignedTo: 'string',
    createdAt: 'date',
    updatedAt: 'date',
    deletedAt: 'date?',
    completed: 'bool',
    deleted: 'bool',
    pendingSync: { type: 'bool', default: false },
  },
};
