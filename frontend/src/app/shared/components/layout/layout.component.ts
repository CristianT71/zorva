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
    <div class="fade-edge fade-edge--top" aria-hidden="true"></div>
    <main class="content">
      <router-outlet />
    </main>
    <div class="fade-edge fade-edge--bottom" aria-hidden="true"></div>
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
        scroll-behavior: smooth;
      }

      /* Vignette fade at the top and bottom edge of the scrollable area --
         a soft fade to black so content never feels like it cuts off hard
         against the window edge. Fixed to the viewport (not the scroll
         container) so it stays put while the page underneath scrolls, and
         pointer-events: none so it never blocks clicks. */
      .fade-edge {
        position: fixed;
        left: 248px;
        right: 0;
        height: 72px;
        pointer-events: none;
        z-index: 40;
      }
      .fade-edge--top {
        top: 0;
        background: linear-gradient(to bottom, rgba(7, 7, 11, 0.92), rgba(7, 7, 11, 0));
      }
      .fade-edge--bottom {
        bottom: 0;
        background: linear-gradient(to top, rgba(7, 7, 11, 0.92), rgba(7, 7, 11, 0));
      }

      @media (max-width: 1023px) {
        .content {
          margin-left: 0;
        }
        .fade-edge {
          left: 0;
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
