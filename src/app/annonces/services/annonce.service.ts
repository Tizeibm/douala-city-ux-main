import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Annonce, AnnonceType } from '../models/annonce';

@Injectable({
    providedIn: 'root'
})
export class AnnonceService {
    private apiUrl = 'http://localhost:8080/api/annonce';

    constructor(private http: HttpClient) { }

    // Get all announcements (paginated)
    getAnnonces(page: number = 0, size: number = 10): Observable<any> {
        const params = new HttpParams().set('page', page).set('size', size);
        return this.http.get<any>(`${this.apiUrl}/public`, { params });
    }

    // Create an announcement
    createAnnonce(annonce: Annonce, userId: string): Observable<Annonce> {
        return this.http.post<Annonce>(`${this.apiUrl}/${userId}`, annonce);
    }

    // Update an announcement
    updateAnnonce(annonce: Annonce, annonceId: string, userId: string): Observable<Annonce> {
        return this.http.put<Annonce>(`${this.apiUrl}/update/${annonceId}/${userId}`, annonce);
    }

    // Get announcements for a specific user
    getUserAnnonces(userId: string): Observable<Annonce[]> {
        return this.http.get<Annonce[]>(`${this.apiUrl}/${userId}/user`);
    }

    // Delete an announcement
    deleteAnnonce(annonceId: string, userId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/delete/${annonceId}/${userId}`);
    }

    // Get announcements by type
    getAnnoncesByType(type: AnnonceType): Observable<Annonce[]> {
        const params = new HttpParams().set('type', type);
        return this.http.get<Annonce[]>(`${this.apiUrl}/public/type`, { params });
    }

    getAnnonceById(id: string): Observable<Annonce> {
        return this.http.get<Annonce>(`${this.apiUrl}/public/${id}/annonce`);
    }

    searchAnnonces(query: string, page: number = 0, size: number = 10): Observable<any> {
        const params = new HttpParams().set('query', query).set('page', page).set('size', size);
        return this.http.get<any>(`${this.apiUrl}/public/search`, { params });
    }
}
