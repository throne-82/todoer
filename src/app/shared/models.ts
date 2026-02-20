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
  /**
   * Optional ID of the parent task when this task is a subtask.
   * Stored as a field rather than a separate collection so we can
   * query the `tasks` collection by parentId. A value of `undefined`
   * or an empty string indicates a top‑level task.
   */
  parentId?: string;
  title: string;
  description?: string;
  dueTime?: string;
  isImportant?: boolean;
  status: TaskStatus;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
