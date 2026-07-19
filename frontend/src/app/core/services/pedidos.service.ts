import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EstadoPedido, Pedido } from '../models';

@Injectable({ providedIn: 'root' })
export class PedidosService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/pedidos`;

  getPedidos(opts?: { canal?: string; estado?: string }): Observable<Pedido[]> {
    let params = new HttpParams();
    if (opts?.canal) params = params.set('canal', opts.canal);
    if (opts?.estado) params = params.set('estado', opts.estado);
    return this.http.get<Pedido[]>(this.base, { params });
  }

  updateEstado(id: number, estado: EstadoPedido): Observable<Pedido> {
    return this.http.patch<Pedido>(`${this.base}/${id}/estado`, { estado });
  }
}
