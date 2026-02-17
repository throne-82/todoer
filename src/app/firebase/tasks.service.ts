import { Injectable, inject } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
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

  getTasks(selectedListId: string | null): Observable<Task[]> {
    return this.authService.user$.pipe(
      switchMap((user) => {
        if (!user) {
          return of([]);
        }

        const ref = collection(this.firestore, 'tasks');
        const tasksQuery = selectedListId
          ? query(
              ref,
              where('userId', '==', user.uid),
              where('listId', '==', selectedListId),
              orderBy('updatedAt', 'desc')
            )
          : query(ref, where('userId', '==', user.uid), orderBy('updatedAt', 'desc'));

        return new Observable<Task[]>((subscriber) => {
          const unsubscribe = onSnapshot(
            tasksQuery,
            (snapshot) => {
              subscriber.next(
                snapshot.docs.map((item) => ({
                  id: item.id,
                  ...(item.data() as Omit<Task, 'id'>)
                }))
              );
            },
            (error) => subscriber.error(error)
          );

          return () => unsubscribe();
        });
      })
    );
  }

  async createTask(title: string, listId: string): Promise<void> {
    const uid = this.authService.getCurrentUidOrThrow();
    const ref = collection(this.firestore, 'tasks');

    await addDoc(ref, {
      userId: uid,
      listId,
      title: title.trim(),
      status: 'todo' as TaskStatus,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
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
}
