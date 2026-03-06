import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Entreprise, Horaire, Localisation, Photo, ServiceOffert } from '../entreprise';

@Injectable({
  providedIn: 'root'
})
export class EntrepriseService {

  private entSubject = new BehaviorSubject<Entreprise[]>([]);
  ent$ = this.entSubject.asObservable();

  private pageSubject = new BehaviorSubject<number>(1);
  page$ = this.pageSubject.asObservable();

  private apiUrl = 'http://localhost:8080/api/structures';
  private publicUrl = 'http://localhost:8080/api/structures/public';

  constructor(private http: HttpClient) { }

  setEntreprises(structure: Entreprise[]) {
    this.entSubject.next(structure);
  }

  setPage(page: number) {
    this.pageSubject.next(page);
  }

  // Get all structures for the logged-in user
  getMesEntreprises(token?: any): Observable<Entreprise[]> {
    return this.http.get<Entreprise[]>(`${this.apiUrl}/mesStrucuture`);
  }

  // Get validated structures for the logged-in user
  getMesEntreprisesValides(token?: any): Observable<Entreprise[]> {
    return this.http.get<Entreprise[]>(`${this.apiUrl}/mesStructuresValide`);
  }

  // Add a new enterprise
  ajouterEntreprise(entreprise: Entreprise): Observable<Entreprise> {
    return this.http.post<Entreprise>(this.apiUrl, entreprise);
  }

  // Update an existing enterprise
  updateStructure(entreprise: any, token: any, id: string | number): Observable<Entreprise> {
    return this.http.put<Entreprise>(`${this.apiUrl}/${id}`, entreprise);
  }

  // Delete an enterprise
  deleteStructure(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Public: Get all structures (paginated)
  getStructures(page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<any>(this.publicUrl, { params });
  }

  // Public: Get structure by ID
  getStructureById(token: any, id: string): Observable<Entreprise> {
    return this.http.get<Entreprise>(`${this.publicUrl}/${id}`);
  }

  // Also provide an alias if needed, or just follow what component expects
  getEntreprisesById(token: any, id: string): Observable<Entreprise> {
    return this.getStructureById(token, id);
  }

  // Public: Get structures by category
  getByCategorie(categorie: string, page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('categorie', categorie)
      .set('page', page)
      .set('size', size);
    return this.http.get<any>(`${this.publicUrl}/categorie`, { params });
  }

  // Public: Get structures by sub-category
  getBySousCategorie(sousCategorie: string, page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('sousCategorie', sousCategorie)
      .set('page', page)
      .set('size', size);
    return this.http.get<any>(`${this.publicUrl}/sousCategorie`, { params });
  }

  // Implementation for photo upload
  uploadPhoto(structureId: string, formData: FormData): Observable<Photo> {
    return this.http.post<Photo>(`http://localhost:8080/api/photos/${structureId}/upload`, formData);
  }

  // Get photos for a structure (public)
  getPhotos(structureId: string): Observable<Photo[]> {
    return this.http.get<Photo[]>(`http://localhost:8080/api/photos/public/${structureId}`);
  }

  // --- Sub-entity CRUD (Batch focused for new wizard) ---

  // Localisation Batch
  saveLocalisationsBatch(locs: any[], structureId: string): Observable<void> {
    return this.http.post<void>(`http://localhost:8080/api/localisation/${structureId}`, locs);
  }

  // Service Batch
  saveServicesBatch(services: any[], structureId: string): Observable<void> {
    return this.http.post<void>(`http://localhost:8080/api/services/${structureId}/services/batch`, services);
  }

  // Horaire Batch
  saveHorairesBatch(horaires: any[], structureId: string): Observable<void> {
    return this.http.post<void>(`http://localhost:8080/api/horaires/${structureId}`, horaires);
  }

  // Individual CRUD — Localisation
  saveLocalisation(loc: any, token: any, structureId: string | number): Observable<Localisation> {
    return this.http.post<Localisation>(`http://localhost:8080/api/localisation/${structureId}`, [loc]);
  }
  editLocalisation(loc: any, id: string, token: any, structureId: string | number): Observable<Localisation> {
    return this.http.put<Localisation>(`http://localhost:8080/api/localisation/${structureId}/${id}`, loc);
  }
  removeLocalisation(id: string, token: any, structureId: string | number): Observable<void> {
    return this.http.delete<void>(`http://localhost:8080/api/localisation/${structureId}/${id}`);
  }

  // Individual CRUD — Service
  saveService(service: any, token: any, structureId: string | number): Observable<ServiceOffert> {
    return this.http.post<ServiceOffert>(`http://localhost:8080/api/services/${structureId}/services/batch`, [service]);
  }
  editService(service: any, id: string, token: any, structureId: string | number): Observable<ServiceOffert> {
    return this.http.put<ServiceOffert>(`http://localhost:8080/api/services/${structureId}/services/${id}`, service);
  }
  removeService(id: string, token: any, structureId: string | number): Observable<void> {
    return this.http.delete<void>(`http://localhost:8080/api/services/${structureId}/services/${id}`);
  }

  // Individual CRUD — Photo
  savePhoto(file: File, token: any, targetId: string | number): Observable<Photo> {
    const formData = new FormData();
    formData.append('File', file);
    return this.http.post<Photo>(`http://localhost:8080/api/photos/${targetId}/upload`, formData);
  }

  updateMainPhoto(file: File, token: any, structureId: string | number): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    // Guessing endpoint based on naming or common practice
    return this.http.post<any>(`http://localhost:8080/api/photos/${structureId}/main`, formData);
  }
  removePhoto(id: string, token: any, structureId: string | number): Observable<void> {
    return this.http.delete<void>(`http://localhost:8080/api/photos/${id}`);
  }

  // Individual CRUD — Horaire
  saveHoraire(horaire: any, token: any, structureId: string | number): Observable<Horaire> {
    return this.http.post<Horaire>(`http://localhost:8080/api/horaires/${structureId}`, [horaire]);
  }
  editHoraire(horaire: any, id: string, token: any, structureId: string | number): Observable<Horaire> {
    return this.http.put<Horaire>(`http://localhost:8080/api/horaires/${structureId}`, [horaire]);
  }
  removeHoraire(id: string, token: any, structureId: string | number): Observable<void> {
    return this.http.delete<void>(`http://localhost:8080/api/horaires/${structureId}/${id}`);
  }

  searchEntreprises(query: string, zone?: string, page: number = 0, size: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    const body: any = {};
    if (query) body.nom = query;
    if (zone) body.quartier = zone;

    return this.http.post<any>(`${this.publicUrl}/search`, body, { params });
  }

  // --- STATS ---
  getStructureStats(id: string): Observable<any> {
    return this.http.get<any>(`http://localhost:8080/api/structureStats/${id}/stats`);
  }

  recordView(id: string, userId?: string, visitorHash?: string): Observable<void> {
    return this.http.post<void>(`http://localhost:8080/api/structureStats/${id}/view`, { userId, visitorHash });
  }

  recordContactClick(id: string, type: string, visitorHash?: string, userId?: string, clickedUrl?: string): Observable<void> {
    return this.http.post<void>(`http://localhost:8080/api/structureStats/${id}/contact-click`, { type, visitorHash, userId, clickedUrl });
  }
}
