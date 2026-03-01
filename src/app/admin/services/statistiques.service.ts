import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatistiquesService {



  private apiUrl = 'http://localhost:8080/api/statistics';

  constructor(private http: HttpClient) { }

  getNombreEntreprises():
    Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/entreprises`);
  }

  getNombreEntreprisesValidees():
    Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/entreprises-validees`);
  }

  getNombreEntreprisesEnAttente():
    Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/entreprises-en-attente`);
  }

  getEntreprisesParCategorie():
    Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/par-categorie`);
  }

  getEntreprisesParType():
    Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/par-type`);
  }

  getAllStatistiques():
    Observable<any> {
    return this.http.get<any>(`${this.apiUrl}`);
  }


}
