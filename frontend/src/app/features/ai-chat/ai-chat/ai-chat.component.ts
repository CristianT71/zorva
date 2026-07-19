import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AiService } from '../../../core/services/ai.service';
import { AiResponse } from '../../../core/models';
import { RobotMascotComponent } from '../robot-mascot/robot-mascot.component';

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
  html?: SafeHtml; // pre-rendered markdown for AI bubbles
}

interface HistoryItem {
  prompt: string;
  response: string;
}

const HISTORY_KEY = 'zorva_ai_history';

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [RobotMascotComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ai-chat.component.html',
  styleUrl: './ai-chat.component.scss',
})
export class AiChatComponent implements AfterViewChecked {
  private ai = inject(AiService);
  private sanitizer = inject(DomSanitizer);

  private scrollAnchor = viewChild<ElementRef<HTMLDivElement>>('scrollAnchor');
  private pendingScroll = false;

  protected messages = signal<ChatMessage[]>([]);
  protected history = signal<HistoryItem[]>(this.readHistory());
  protected input = signal('');
  protected thinking = signal(false);
  protected hasError = signal(false);
  protected hasSuccess = signal(false);
  private errorTimeout?: ReturnType<typeof setTimeout>;
  private successTimeout?: ReturnType<typeof setTimeout>;

  ngAfterViewChecked(): void {
    if (this.pendingScroll) {
      this.scrollAnchor()?.nativeElement.scrollIntoView({ behavior: 'smooth' });
      this.pendingScroll = false;
    }
  }

  protected onInput(event: Event): void {
    this.input.set((event.target as HTMLTextAreaElement).value);
  }

  protected onEnter(event: Event): void {
    const ke = event as KeyboardEvent;
    if (!ke.shiftKey) {
      ke.preventDefault();
      this.send();
    }
  }

  protected restore(item: HistoryItem): void {
    this.input.set(item.prompt);
  }

  protected onRobotPoke(): void {
    // Gancho por si quieres que el robot responda algo al hacerle click manual
  }

  send(): void {
    const prompt = this.input().trim();
    if (!prompt || this.thinking()) return;

    this.push({ role: 'user', text: prompt });
    this.input.set('');
    this.thinking.set(true);

    this.ai.send(prompt).subscribe({
      next: (res) => this.handleResponse(prompt, res),
      error: () => {
        this.thinking.set(false);
        this.flagError();
        const text = 'No pude procesar tu consulta. Intenta de nuevo.';
        this.push({ role: 'ai', text, html: this.renderMarkdown(text) });
      },
    });
  }

  private handleResponse(prompt: string, res: AiResponse): void {
    this.thinking.set(false);
    const text = res?.respuesta_texto || res?.respuesta || res?.response || res?.message || 'Sin respuesta.';
    this.push({ role: 'ai', text, html: this.renderMarkdown(text) });
    this.saveHistory(prompt, text);
    this.flagSuccess();
  }

  private flagError(): void {
    this.hasError.set(true);
    clearTimeout(this.errorTimeout);
    this.errorTimeout = setTimeout(() => this.hasError.set(false), 1500);
  }

  private flagSuccess(): void {
    this.hasSuccess.set(true);
    clearTimeout(this.successTimeout);
    this.successTimeout = setTimeout(() => this.hasSuccess.set(false), 1200);
  }

  private push(msg: ChatMessage): void {
    this.messages.update((list) => [...list, msg]);
    this.pendingScroll = true;
  }

  /** Minimal markdown: **bold** and newlines. Escaped first to stay XSS-safe. */
  private renderMarkdown(text: string): SafeHtml {
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const html = escaped
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  // ---------- History persistence ----------

  private readHistory(): HistoryItem[] {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
    } catch {
      return [];
    }
  }

  private saveHistory(prompt: string, response: string): void {
    const next = [{ prompt, response }, ...this.history()].slice(0, 20);
    this.history.set(next);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  }
}
