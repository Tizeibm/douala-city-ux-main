import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Entreprise } from '../../entreprise';

@Injectable({
  providedIn: 'root'
})
export class EntreprisesService {

  private structureSubject = new BehaviorSubject<Entreprise | null>(null);
  structure$ = this.structureSubject.asObservable();

  private entSubject = new BehaviorSubject<Entreprise[]>([]);
  ent$ = this.entSubject.asObservable();

  private pageSubject = new BehaviorSubject<number>(1);
  page$ = this.pageSubject.asObservable();

  private apiUrl = 'http://localhost:8080/api/structures';

  constructor(private http: HttpClient) { }

  setEntreprises(structure: Entreprise[]) {
    this.entSubject.next(structure);
  }

  setPage(page: number) {
    this.pageSubject.next(page);
  }

  getAllEntreprises(page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<any>(this.apiUrl, { params });
  }

  getEntreprisesEnAttente(page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams().set('s', 'EN_ATTENTE').set('page', page).set('size', size);
    return this.http.get<any>(`${this.apiUrl}/status`, { params });
  }

  getAllEntreprisesValid(token?: any, page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams().set('s', 'VALIDE').set('page', page).set('size', size);
    return this.http.get<any>(`${this.apiUrl}/status`, { params });
  }

  getEntreprisesById(token: any, id: string): Observable<Entreprise> {
    return this.http.get<Entreprise>(`${this.apiUrl}/public/${id}`);
  }

  updateEntreprise(id: string, entreprise: Entreprise): Observable<Entreprise> {
    return this.http.put<Entreprise>(`${this.apiUrl}/${id}`, entreprise);
  }

  deleteEntreprise(token: any, id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  validerEntreprise(id: string): Observable<Entreprise> {
    return this.http.patch<Entreprise>(`${this.apiUrl}/valider/${id}`, {});
  }

  rejeterEntreprise(id: string): Observable<Entreprise> {
    return this.http.patch<Entreprise>(`${this.apiUrl}/rejeter/${id}`, {});
  }

  searchEntreprises(query: string, page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams().set('query', query).set('page', page).set('size', size);
    return this.http.get<any>(`${this.apiUrl}/search`, { params });
  }

  setEntreprise(structure: Entreprise | null) {
    this.structureSubject.next(structure);
  }
}
