import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ServiceOffert } from '../../../entreprise';

export interface Utilisateur {
  id?: string;
  nom: string;
  email: string;
  motDePasse: string;
  role: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class InscriptionService {

  private baseUrl = 'http://localhost:8080/api';
  constructor(private http: HttpClient) { }

  // OpenAPI: POST /api/auth/user/register
  inscrireUtilisateur(utilisateur: Utilisateur): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/user/register`, utilisateur);
  }

  // OpenAPI: POST /api/services/{structureId}/services/batch
  addServiceToStructure(structureId: string, service: ServiceOffert): Observable<ServiceOffert> {
    return this.http.post<ServiceOffert>(`${this.baseUrl}/services/${structureId}/services/batch`, [service]);
  }
}
