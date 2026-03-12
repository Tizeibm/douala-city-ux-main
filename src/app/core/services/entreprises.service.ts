import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Entreprise, Horaire, Localisation, Photo, ServiceOffert } from '../../shared/models/entreprise';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EntrepriseService {

  private entSubject = new BehaviorSubject<Entreprise[]>([]);
  ent$ = this.entSubject.asObservable();

  private pageSubject = new BehaviorSubject<number>(1);
  page$ = this.pageSubject.asObservable();

  private apiUrl = `${environment.apiUrl}/structures`;
  private publicUrl = `${environment.apiUrl}/structures/public`;

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
  updateStructure(entreprise: any, token: any, id: string): Observable<Entreprise> {
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
    return this.http.post<Photo>(`${environment.apiUrl}/photos/${structureId}/upload`, formData);
  }

  // Get photos for a structure (public)
  getPhotos(structureId: string): Observable<Photo[]> {
    return this.http.get<Photo[]>(`${environment.apiUrl}/photos/public/structure/${structureId}`);
  }

  // --- Sub-entity CRUD (Batch focused for new wizard) ---

  // Localisation Batch
  saveLocalisationsBatch(locs: any[], structureId: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/localisation/${structureId}`, locs);
  }

  // Service Batch
  saveServicesBatch(services: any[], structureId: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/services/${structureId}/services/batch`, services);
  }

  // Horaire Batch
  saveHorairesBatch(horaires: any[], structureId: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/horaires/${structureId}`, horaires);
  }

  // Individual CRUD — Localisation
  saveLocalisation(loc: any, token: any, structureId: string): Observable<Localisation> {
    return this.http.post<Localisation>(`${environment.apiUrl}/localisation/${structureId}`, [loc]);
  }
  editLocalisation(loc: any, id: string, token: any, structureId: string): Observable<Localisation> {
    return this.http.put<Localisation>(`${environment.apiUrl}/localisation/${structureId}/${id}`, loc);
  }
  removeLocalisation(id: string, token: any, structureId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/localisation/${structureId}/${id}`);
  }

  // Individual CRUD — Service
  saveService(service: any, token: any, structureId: string): Observable<ServiceOffert> {
    return this.http.post<ServiceOffert>(`${environment.apiUrl}/services/${structureId}/services/batch`, [service]);
  }
  editService(service: any, id: string, token: any, structureId: string): Observable<ServiceOffert> {
    return this.http.put<ServiceOffert>(`${environment.apiUrl}/services/${structureId}/services/${id}`, service);
  }
  removeService(id: string, token: any, structureId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/services/${structureId}/services/${id}`);
  }

  // Individual CRUD — Photo
  savePhoto(file: File, token: any, targetId: string): Observable<Photo> {
    const formData = new FormData();
    formData.append('File', file);
    return this.http.post<Photo>(`${environment.apiUrl}/photos/${targetId}/upload`, formData);
  }

  updateMainPhoto(file: File, token: any, structureId: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    // Guessing endpoint based on naming or common practice
    return this.http.post<any>(`${environment.apiUrl}/photos/${structureId}/main`, formData);
  }
  removePhoto(id: string, token: any, structureId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/photos/${id}`);
  }

  // Individual CRUD — Horaire
  saveHoraire(horaire: any, token: any, structureId: string): Observable<Horaire> {
    return this.http.post<Horaire>(`${environment.apiUrl}/horaires/${structureId}`, [horaire]);
  }
  editHoraire(horaire: any, id: string, token: any, structureId: string): Observable<Horaire> {
    return this.http.put<Horaire>(`${environment.apiUrl}/horaires/${structureId}`, [horaire]);
  }
  removeHoraire(id: string, token: any, structureId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/horaires/${structureId}/${id}`);
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
    return this.http.get<any>(`${environment.apiUrl}/structureStats/${id}/stats`);
  }

  recordView(id: string, userId?: string, visitorHash?: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/structureStats/${id}/view`, { userId, visitorHash });
  }

  recordContactClick(id: string, type: string, visitorHash?: string, userId?: string, clickedUrl?: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/structureStats/${id}/contact-click`, { type, visitorHash, userId, clickedUrl });
  }

  // --- MISSING ENDPOINTS (Admin & Fine-Tuned Data) ---

  // Admin: Get structures for a specific user
  getStructuresByUser(userId: string): Observable<Entreprise[]> {
    const params = new HttpParams().set('userId', userId);
    return this.http.get<Entreprise[]>(`${this.apiUrl}/users`, { params });
  }

  getPublicServices(structureId: string): Observable<ServiceOffert[]> {
    return this.http.get<ServiceOffert[]>(`${environment.apiUrl}/services/public/structure/${structureId}`);
  }

  getPublicHoraires(structureId: string): Observable<Horaire[]> {
    return this.http.get<Horaire[]>(`${environment.apiUrl}/horaires/public/${structureId}`);
  }

  getPublicLocalisation(structureId: string): Observable<Localisation> {
    return this.http.get<Localisation>(`${environment.apiUrl}/localisation/public/${structureId}/location`);
  }
}
