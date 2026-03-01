import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Avis } from '../models/avis';
import { ReponseAvis } from '../models/reponse-avis';

@Injectable({
  providedIn: 'root'
})
export class AvisService {
  private apiUrl = 'http://localhost:8080/api/avis';
  private replyUrl = 'http://localhost:8080/api/reponseAvis';

  constructor(private http: HttpClient) { }

  addAvis(avis: Avis): Observable<Avis> {
    return this.http.post<Avis>(this.apiUrl, avis);
  }

  getAvisByStructure(idStructure: string): Observable<Avis[]> {
    return this.http.get<Avis[]>(`${this.apiUrl}/structure/${idStructure}`);
  }

  publierAvis(avisId: string): Observable<Avis> {
    const params = new HttpParams().set('avisId', avisId);
    return this.http.post<Avis>(`${this.apiUrl}/publier`, null, { params });
  }

  rejeterAvis(avisId: string, raison: string): Observable<Avis> {
    const params = new HttpParams().set('avisId', avisId);
    return this.http.post<Avis>(`${this.apiUrl}/rejeter`, raison, { params, headers: { 'Content-Type': 'text/plain' } });
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
