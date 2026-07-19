import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Categoria, Producto } from '../models';

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/productos`;

  getProductos(opts?: { search?: string; stockCritico?: boolean }): Observable<Producto[]> {
    let params = new HttpParams();
    if (opts?.search) params = params.set('search', opts.search);
    if (opts?.stockCritico) params = params.set('stock_critico', 'true');
    return this.http.get<Producto[]>(this.base, { params });
  }

  getProducto(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.base}/${id}`);
  }

  createProducto(payload: Partial<Producto>): Observable<Producto> {
    return this.http.post<Producto>(this.base, payload);
  }

  updateProducto(id: number, payload: Partial<Producto>): Observable<Producto> {
    return this.http.put<Producto>(`${this.base}/${id}`, payload);
  }

  /** Soft delete — backend marks activo: false. */
  deleteProducto(id: number): Observable<unknown> {
    return this.http.delete(`${this.base}/${id}`);
  }

  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${environment.apiUrl}/categorias`);
  }
}
