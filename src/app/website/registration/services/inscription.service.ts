import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ROLE } from '../../../login-logout/login-logout.component';
import { ServiceOffert } from '../../../entreprise';




export interface Utilisateur {
  id?: string;
  nom: string;
  email: string;
  motDePasse: string;
  role: ROLE | null;
}

export interface Structure {
  id?: string;
  name: string;
  email: string;
  motDePasse: string;
  categorie: string;
  adresse: string;
  telephone: string;
  utilisateurId: string;
}


@Injectable({
  providedIn: 'root'
})
export class InscriptionService {

  private baseUrl = 'http://localhost:8080/api';
  constructor(private http: HttpClient) { }


  inscrireUtilisateur(utilisateur: Utilisateur): Observable<Utilisateur> {

    return this.http.post<Utilisateur>(`${this.baseUrl}/auth/user/register`, utilisateur)
  }


  inscrireEntreprise(entreprise: any) {
    return this.http.post(this.baseUrl, entreprise);
  }
  validerEntreprise(entreprise: any):
    Observable<any> {

    let endpoint = '';

    switch (entreprise.type) {
      case 'Restaurant':
        endpoint = '/restaurants';
        break;

      case 'Hôtel':
        endpoint = '/hotels';
        break;

      case 'Service public':
        endpoint = '/entreprises';

    }
    return this.http.post(`${this.baseUrl}$endpoint`, entreprise);

  }




  addServiceToStructure(structureId: string, service: ServiceOffert): Observable<ServiceOffert> {
    return this.http.post<ServiceOffert>(`${this.baseUrl}/structures/${structureId}/services`, service);
  }
}
