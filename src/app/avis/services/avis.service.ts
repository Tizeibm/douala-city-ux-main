import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Avis } from '../models/avis';
import { ReponseAvis } from '../models/reponse-avis';

@Injectable({
  providedIn: 'root'
})
export class AvisService {
  private apiUrl = 'http://localhost:8080/api/avis';
  private replyUrl = 'http://localhost:8080/api/reponseAvis';

  private avisAddedSubject = new BehaviorSubject<void>(undefined);
  avisAdded$ = this.avisAddedSubject.asObservable();

  constructor(private http: HttpClient) { }

  notifyAvisAdded() {
    this.avisAddedSubject.next();
  }

  addAvis(avis: Avis): Observable<Avis> {
    return this.http.post<Avis>(this.apiUrl, avis);
  }

  // OpenAPI: GET /api/avis/public?structureId={id}
  getAvisByStructure(idStructure: string): Observable<Avis[]> {
    const params = new HttpParams().set('structureId', idStructure);
    return this.http.get<Avis[]>(`${this.apiUrl}/public`, { params });
  }

  publierAvis(avisId: string): Observable<Avis> {
    const params = new HttpParams().set('avisId', avisId);
    return this.http.post<Avis>(`${this.apiUrl}/publier`, null, { params });
  }

  // OpenAPI: POST /api/avis/rejeter?avisId={id} with JSON string body
  rejeterAvis(avisId: string, raison: string): Observable<Avis> {
    const params = new HttpParams().set('avisId', avisId);
    return this.http.post<Avis>(`${this.apiUrl}/rejeter`, JSON.stringify(raison), {
      params,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  signalerAvis(avisId: string): Observable<void> {
    const params = new HttpParams().set('avisId', avisId);
    return this.http.post<void>(`${this.apiUrl}/signaler`, null, { params });
  }

  // Replies
  addReponseAvis(reponse: any): Observable<ReponseAvis> {
    return this.http.post<ReponseAvis>(this.replyUrl, reponse);
  }

  getReponsesByAvis(avisId: string): Observable<ReponseAvis[]> {
    const params = new HttpParams().set('avisId', avisId);
    return this.http.get<ReponseAvis[]>(this.replyUrl, { params });
  }
}
