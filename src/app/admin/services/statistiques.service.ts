import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface StatisticsDto {
  totalStructures: number;
  totalValideStructures: number;
  totalWaitingStructures: number;
  totalAnnonces: number;
  totalUserAccounts: number;
  totalEnterpriseAccounts: number;
  totalAccounts: number;
}

@Injectable({
  providedIn: 'root'
})
export class StatistiquesService {

  private apiUrl = `${environment.apiUrl}/statistics`;

  constructor(private http: HttpClient) { }

  // OpenAPI: single endpoint GET /api/statistics → StatisticsDto
  getAllStatistiques(): Observable<StatisticsDto> {
    return this.http.get<StatisticsDto>(this.apiUrl);
  }
}
