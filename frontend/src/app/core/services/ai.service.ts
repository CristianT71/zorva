import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AiResponse } from '../models';

// Verbs that signal a mutation over stock rather than a read-only question.
const ACTION_WORDS = ['agrega', 'añade', 'anade', 'actualiza', 'modifica', 'suma', 'resta', 'cambia', 'establece'];

@Injectable({ providedIn: 'root' })
export class AiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/ai`;

  /** Heuristic: does the prompt ask to change stock, or just query it? */
  isStockUpdate(prompt: string): boolean {
    const p = prompt.toLowerCase();
    return ACTION_WORDS.some((w) => p.includes(w));
  }

  query(prompt: string): Observable<AiResponse> {
    return this.http.post<AiResponse>(`${this.base}/query`, { prompt });
  }

  stockUpdate(prompt: string): Observable<AiResponse> {
    return this.http.post<AiResponse>(`${this.base}/stock-update`, { prompt });
  }

  send(prompt: string): Observable<AiResponse> {
    return this.isStockUpdate(prompt) ? this.stockUpdate(prompt) : this.query(prompt);
  }
}
