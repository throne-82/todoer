import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../firebase/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly email = signal('throneeight2@gmail.com');
  readonly password = signal('');

  async login(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      await this.authService.loginWithEmailPassword(this.email(), this.password());
      await this.router.navigate(['/app']);
    } catch (error) {
      if (error instanceof Error && error.message === 'UNAUTHORIZED_EMAIL') {
        this.error.set('Acesso permitido apenas para throneeight2@gmail.com.');
      } else {
        this.error.set('Email ou senha inválidos.');
      }
    } finally {
      this.loading.set(false);
    }
  }
}
