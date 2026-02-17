import { Injectable, inject } from '@angular/core';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
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
  private permissionErrorShown = false;

  getLists(): Observable<TodoList[]> {
    return this.authService.user$.pipe(
      switchMap((user) => {
        if (!user) {
          return of([]);
        }

        const ref = collection(this.firestore, 'lists');
        const listsQuery = query(ref, where('userId', '==', user.uid));

        return new Observable<TodoList[]>((subscriber) => {
          const unsubscribe = onSnapshot(
            listsQuery,
            (snapshot) => {
              const lists = snapshot.docs
                .map((item) => ({
                  id: item.id,
                  ...(item.data() as Omit<TodoList, 'id'>)
                }))
                .sort((a, b) => {
                  const aTime = a.updatedAt?.toMillis() ?? a.createdAt?.toMillis() ?? 0;
                  const bTime = b.updatedAt?.toMillis() ?? b.createdAt?.toMillis() ?? 0;
                  return bTime - aTime;
                });

              subscriber.next(lists);
            },
            (error) => {
              console.error('Firestore lists listener error:', error);
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

  async createList(name: string, color: string): Promise<string> {
    const uid = this.authService.getCurrentUidOrThrow();
    const ref = collection(this.firestore, 'lists');

    const created = await addDoc(ref, {
      userId: uid,
      name: name.trim(),
      color,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return created.id;
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
