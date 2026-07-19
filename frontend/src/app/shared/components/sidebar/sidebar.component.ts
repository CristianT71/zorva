import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationsService } from '../../../core/services/notifications.service';

interface NavItem {
  label: string;
  route: string;
  icon: string; // inline svg path data
  alertsOrders?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, UpperCasePipe],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  protected auth = inject(AuthService);
  protected notifications = inject(NotificationsService);

  protected mobileOpen = signal(false);

  protected readonly nav: NavItem[] = [
    {
      label: 'Dashboard',
      route: '/dashboard',
      icon: 'M3 3h7v9H3V3Zm11 0h7v5h-7V3ZM3 16h7v5H3v-5Zm11-3h7v8h-7v-8Z',
    },
    {
      label: 'AI Chat',
      route: '/ai-chat',
      icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z',
    },
    {
      label: 'Catálogo',
      route: '/catalog',
      icon: 'M20 7 12 3 4 7m16 0-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    },
    {
      label: 'Orders Hub',
      route: '/orders',
      icon: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6ZM3 6h18M16 10a4 4 0 0 1-8 0',
      alertsOrders: true,
    },
  ];

  toggleMobile(): void {
    this.mobileOpen.update((v) => !v);
  }

  closeMobile(): void {
    this.mobileOpen.set(false);
  }

  logout(): void {
    this.auth.logout();
  }
}
