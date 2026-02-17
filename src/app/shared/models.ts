import { Timestamp } from 'firebase/firestore';

export type TaskStatus = 'todo' | 'wip' | 'done';

export interface TodoList {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Task {
  id: string;
  userId: string;
  listId: string;
  title: string;
  description?: string;
  dueTime?: string;
  isImportant?: boolean;
  status: TaskStatus;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
