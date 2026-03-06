import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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

  private apiUrl = 'http://localhost:8080/api/statistics';

  constructor(private http: HttpClient) { }

  // OpenAPI: single endpoint GET /api/statistics → StatisticsDto
  getAllStatistiques(): Observable<StatisticsDto> {
    return this.http.get<StatisticsDto>(this.apiUrl);
  }
}
