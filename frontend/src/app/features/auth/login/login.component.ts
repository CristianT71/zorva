import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  protected loading = signal(false);
  protected showPassword = signal(false);
  protected errorMsg = signal<string | null>(null);

  protected form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  submit(): void {
    if (this.form.invalid || this.loading()) return;

    this.loading.set(true);
    this.errorMsg.set(null);
    const { email, password } = this.form.getRawValue();

    this.auth.login(email, password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(
          err.status === 401
            ? 'Credenciales inválidas. Verifica tu email y contraseña.'
            : err.error?.message || 'No se pudo iniciar sesión. Intenta de nuevo.',
        );
      },
    });
  }
}
