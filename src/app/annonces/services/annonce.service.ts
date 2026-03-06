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
    createAnnonce(annonce: Annonce): Observable<Annonce> {
        return this.http.post<Annonce>(this.apiUrl, annonce);
    }

    // Create an announcement for a specific structure
    createAnnonceByStructure(structureId: string, annonce: Annonce): Observable<Annonce> {
        return this.http.post<Annonce>(`${this.apiUrl}/${structureId}/structure`, annonce);
    }

    // Get announcements for a specific structure
    getAnnoncesByStructure(structureId: string): Observable<Annonce[]> {
        return this.http.get<Annonce[]>(`${this.apiUrl}/${structureId}/structure`);
    }

    // Update an announcement
    updateAnnonce(annonce: Annonce, annonceId: string): Observable<Annonce> {
        return this.http.put<Annonce>(`${this.apiUrl}/update/${annonceId}`, annonce);
    }

    // Get announcements for the logged-in user (JWT auth)
    getUserAnnonces(): Observable<Annonce[]> {
        return this.http.get<Annonce[]>(`${this.apiUrl}/user`);
    }

    // Delete an announcement 
    deleteAnnonce(annonceId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/delete/${annonceId}`);
    }

    // Get announcements by type
    getAnnoncesByType(type: AnnonceType): Observable<Annonce[]> {
        const params = new HttpParams().set('type', type);
        return this.http.get<Annonce[]>(`${this.apiUrl}/public/type`, { params });
    }

    // Get single announcement by ID
    getAnnonceById(id: string): Observable<Annonce> {
        return this.http.get<Annonce>(`${this.apiUrl}/public/${id}/annonce`);
    }
}
