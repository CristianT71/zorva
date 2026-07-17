import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ToastContainerComponent } from '../toast/toast-container.component';
import { NotificationsService } from '../../../core/services/notifications.service';

/**
 * Shell for every authenticated screen: a persistent sidebar plus the routed
 * content. Kicks off the WebSocket connection once so the sidebar pulse and
 * live order feed work across navigations.
 */
@Component({
  selector: 'app-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, SidebarComponent, ToastContainerComponent],
  template: `
    <app-sidebar />
    <main class="content">
      <router-outlet />
    </main>
    <app-toast-container />
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .content {
        margin-left: 248px;
        min-height: 100vh;
        height: 100vh;
        overflow-y: auto;
      }
      @media (max-width: 1023px) {
        .content {
          margin-left: 0;
        }
      }
    `,
  ],
})
export class LayoutComponent implements OnInit {
  private notifications = inject(NotificationsService);

  ngOnInit(): void {
    this.notifications.start();
  }
}
