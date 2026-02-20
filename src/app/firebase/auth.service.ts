import { Injectable } from '@angular/core';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { Observable } from 'rxjs';
import { firebaseAuth } from './firebase.client';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly auth = firebaseAuth;

  readonly user$ = new Observable<User | null>((subscriber) => {
    const unsubscribe = onAuthStateChanged(
      this.auth,
      (user) => subscriber.next(user),
      (error) => subscriber.error(error),
      () => subscriber.complete()
    );

    return () => unsubscribe();
  });

  async loginWithEmailPassword(email: string, password: string): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();
    // simply sign in; any account registered in Firebase Auth will work
    await signInWithEmailAndPassword(this.auth, normalizedEmail, password);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  getCurrentUidOrThrow(): string {
    const uid = this.auth.currentUser?.uid;
    if (!uid) {
      throw new Error('User must be authenticated to perform this operation.');
    }

    return uid;
  }

  /**
   * In previous versions we restricted access to a single hard‑coded
   * address.  Now every authenticated user is permitted.
   */
  isAllowedUser(user: User | null): boolean {
    return !!user;
  }
}
