import { Injectable, inject } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { Observable, of, switchMap } from 'rxjs';
import { AuthService } from './auth.service';
import { Task, TaskStatus } from '../shared/models';
import { firestoreDb } from './firebase.client';

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private readonly firestore = firestoreDb;
  private readonly authService = inject(AuthService);
  private permissionErrorShown = false;

  getTasks(
    selectedListId: string | null,
    /**
     * when provided the call will only return tasks whose `parentId` matches
     * the value. Passing `null` returns only top-level tasks (parentId absent or
     * empty) while `undefined` means "do not filter by parent" and behaves like
     * the previous implementation.
     */
    parentId?: string | null
  ): Observable<Task[]> {
    return this.authService.user$.pipe(
      switchMap((user) => {
        if (!user) {
          return of([]);
        }

        const ref = collection(this.firestore, 'tasks');
        let tasksQuery: any = query(ref, where('userId', '==', user.uid));

        if (selectedListId) {
          tasksQuery = query(tasksQuery, where('listId', '==', selectedListId));
        }

        if (parentId !== undefined) {
          // Firestore stores missing fields as absent, so we treat null and ''
          // interchangeably when looking for top‑level tasks.
          if (parentId === null) {
            tasksQuery = query(tasksQuery, where('parentId', 'in', ['', null]));
          } else {
            tasksQuery = query(tasksQuery, where('parentId', '==', parentId));
          }
        }

        return new Observable<Task[]>((subscriber) => {
          const unsubscribe = onSnapshot(
            tasksQuery,
            (snapshot: any) => {
              const tasks = snapshot.docs
                .map((item: any) => ({
                  id: item.id,
                  ...(item.data() as Omit<Task, 'id'>)
                }))
                .sort((a: Task, b: Task) => {
                  const aTime = a.updatedAt?.toMillis() ?? a.createdAt?.toMillis() ?? 0;
                  const bTime = b.updatedAt?.toMillis() ?? b.createdAt?.toMillis() ?? 0;
                  return bTime - aTime;
                });

              subscriber.next(tasks);
            },
            (error: any) => {
              console.error('Firestore tasks listener error:', error);
              const code = (error as { code?: string })?.code;
              if (code === 'permission-denied' && !this.permissionErrorShown) {
                this.permissionErrorShown = true;
                window.alert(
                  'Firestore: Missing or insufficient permissions. Verifique login, rules e deploy.'
                );
              }
              subscriber.next([]);
            }
          );

          return () => unsubscribe();
        });
      })
    );
  }

  async createTask(title: string, listId: string, parentId?: string): Promise<void> {
    const uid = this.authService.getCurrentUidOrThrow();
    const ref = collection(this.firestore, 'tasks');

    const payload: any = {
      userId: uid,
      listId,
      title: title.trim(),
      description: '',
      dueTime: '',
      isImportant: false,
      status: 'todo' as TaskStatus,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    if (parentId) {
      payload.parentId = parentId;
    }

    await addDoc(ref, payload);
  }

  async updateTaskTitle(taskId: string, title: string): Promise<void> {
    const ref = doc(this.firestore, 'tasks', taskId);
    await updateDoc(ref, {
      title: title.trim(),
      updatedAt: serverTimestamp()
    });
  }

  async cycleTaskStatus(task: Task): Promise<void> {
    const nextStatus: TaskStatus =
      task.status === 'todo' ? 'wip' : task.status === 'wip' ? 'done' : 'todo';

    const ref = doc(this.firestore, 'tasks', task.id);
    await updateDoc(ref, {
      status: nextStatus,
      updatedAt: serverTimestamp()
    });
  }

  async deleteTask(taskId: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'tasks', taskId));
  }

  async updateTaskDetails(
    taskId: string,
    payload: { description: string; dueTime: string; isImportant: boolean }
  ): Promise<void> {
    const ref = doc(this.firestore, 'tasks', taskId);
    await updateDoc(ref, {
      description: payload.description.trim(),
      dueTime: payload.dueTime,
      isImportant: payload.isImportant,
      updatedAt: serverTimestamp()
    });
  }
}
