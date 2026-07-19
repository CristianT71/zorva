import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EstadisticasVentas, ProductoMasVendido } from '../models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/dashboard`;

  getEstadisticas(periodo: 'dia' | 'semana' | 'mes' = 'dia'): Observable<EstadisticasVentas> {
    const params = new HttpParams().set('periodo', periodo);
    return this.http.get<EstadisticasVentas>(`${this.base}/estadisticas`, { params });
  }

  getProductosMasVendidos(): Observable<ProductoMasVendido[]> {
    return this.http.get<ProductoMasVendido[]>(`${this.base}/productos-mas-vendidos`);
  }
}
