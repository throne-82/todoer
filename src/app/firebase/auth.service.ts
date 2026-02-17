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
  private readonly allowedEmail = 'throneeight2@gmail.com';
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
    if (normalizedEmail !== this.allowedEmail) {
      throw new Error('UNAUTHORIZED_EMAIL');
    }

    const credential = await signInWithEmailAndPassword(this.auth, normalizedEmail, password);
    const signedEmail = credential.user.email?.toLowerCase();

    if (signedEmail !== this.allowedEmail) {
      await signOut(this.auth);
      throw new Error('UNAUTHORIZED_EMAIL');
    }
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

  isAllowedUser(user: User | null): boolean {
    return user?.email?.toLowerCase() === this.allowedEmail;
  }
}
