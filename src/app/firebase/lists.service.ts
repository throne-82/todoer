import { Injectable, inject } from '@angular/core';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore';
import { Observable, of, switchMap } from 'rxjs';
import { AuthService } from './auth.service';
import { TodoList } from '../shared/models';
import { firestoreDb } from './firebase.client';

@Injectable({
  providedIn: 'root'
})
export class ListsService {
  private readonly firestore = firestoreDb;
  private readonly authService = inject(AuthService);

  getLists(): Observable<TodoList[]> {
    return this.authService.user$.pipe(
      switchMap((user) => {
        if (!user) {
          return of([]);
        }

        const ref = collection(this.firestore, 'lists');
        const listsQuery = query(ref, where('userId', '==', user.uid), orderBy('updatedAt', 'desc'));

        return new Observable<TodoList[]>((subscriber) => {
          const unsubscribe = onSnapshot(
            listsQuery,
            (snapshot) => {
              subscriber.next(
                snapshot.docs.map((item) => ({
                  id: item.id,
                  ...(item.data() as Omit<TodoList, 'id'>)
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

  async createList(name: string, color: string): Promise<void> {
    const uid = this.authService.getCurrentUidOrThrow();
    const ref = collection(this.firestore, 'lists');

    await addDoc(ref, {
      userId: uid,
      name: name.trim(),
      color,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  async updateList(listId: string, name: string, color: string): Promise<void> {
    const ref = doc(this.firestore, 'lists', listId);
    await updateDoc(ref, {
      name: name.trim(),
      color,
      updatedAt: serverTimestamp()
    });
  }

  async deleteList(listId: string): Promise<void> {
    const uid = this.authService.getCurrentUidOrThrow();
    const batch = writeBatch(this.firestore);

    const tasksRef = collection(this.firestore, 'tasks');
    const tasksQuery = query(tasksRef, where('userId', '==', uid), where('listId', '==', listId));
    const tasksSnapshot = await getDocs(tasksQuery);

    tasksSnapshot.docs.forEach((taskDoc) => batch.delete(taskDoc.ref));
    batch.delete(doc(this.firestore, 'lists', listId));

    await batch.commit();
  }
}
