import { DOCUMENT } from '@angular/common';
import { Injectable, computed, inject, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly storageKey = 'todoer-theme';
  private readonly document = inject(DOCUMENT);
  private readonly darkSignal = signal(false);

  readonly isDark = computed(() => this.darkSignal());

  constructor() {
    this.initTheme();
  }

  toggleTheme(): void {
    this.setTheme(!this.darkSignal());
  }

  setTheme(isDark: boolean): void {
    this.darkSignal.set(isDark);
    const body = this.document.body;
    body.classList.toggle('dark', isDark);
    localStorage.setItem(this.storageKey, isDark ? 'dark' : 'light');
  }

  private initTheme(): void {
    const savedTheme = localStorage.getItem(this.storageKey);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    this.setTheme(shouldUseDark);
  }
}
