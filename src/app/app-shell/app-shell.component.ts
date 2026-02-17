import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { User } from 'firebase/auth';
import { AuthService } from '../firebase/auth.service';
import { ThemeService } from '../shared/theme.service';
import { ListsSidebarComponent } from './lists-sidebar.component';
import { TasksBoardComponent } from './tasks-board.component';

@Component({
  selector: 'app-app-shell',
  standalone: true,
  imports: [ListsSidebarComponent, TasksBoardComponent],
  templateUrl: './app-shell.component.html'
})
export class AppShellComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly themeService = inject(ThemeService);

  readonly selectedListId = signal<string | null>(null);
  readonly user = toSignal(this.authService.user$, { initialValue: null as User | null });

  readonly userLabel = computed(() => this.user()?.displayName || this.user()?.email || 'Usuário');

  async logout(): Promise<void> {
    await this.authService.logout();
    await this.router.navigate(['/login']);
  }
}
