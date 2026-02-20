import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirebaseError } from 'firebase/app';
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
      } else if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/wrong-password':
          case 'auth/user-not-found':
          case 'auth/invalid-credential':
            this.error.set('Email ou senha inválidos.');
            break;
          case 'auth/invalid-api-key':
          case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
            this.error.set('Config Firebase inválida no deploy (apiKey).');
            break;
          case 'auth/operation-not-allowed':
            this.error.set('Ative Email/Senha em Firebase Authentication.');
            break;
          case 'auth/network-request-failed':
            this.error.set('Falha de rede. Tente novamente.');
            break;
          default:
            this.error.set(`Erro Firebase: ${error.code}`);
        }
      } else {
        this.error.set('Email ou senha inválidos.');
      }
    } finally {
      this.loading.set(false);
    }
  }
}
