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
        const text = 'No pude procesar tu consulta. Intenta de nuevo.';
        this.push({ role: 'ai', text, html: this.renderMarkdown(text) });
      },
    });
  }

  private handleResponse(prompt: string, res: AiResponse): void {
    this.thinking.set(false);
    const text = res?.respuesta || res?.response || res?.message || 'Sin respuesta.';
    this.push({ role: 'ai', text, html: this.renderMarkdown(text) });
    this.saveHistory(prompt, text);
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
