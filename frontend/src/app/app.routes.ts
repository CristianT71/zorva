import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './shared/components/layout/layout.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },

  // Authenticated shell — sidebar + lazily loaded feature screens.
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'ai-chat',
        loadComponent: () =>
          import('./features/ai-chat/ai-chat/ai-chat.component').then((m) => m.AiChatComponent),
      },
      {
        path: 'catalog',
        loadComponent: () =>
          import('./features/catalog/catalog/catalog.component').then((m) => m.CatalogComponent),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/orders/orders/orders.component').then((m) => m.OrdersComponent),
      },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
