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

  // Individual CRUD (maintained for existing compatibility)
  saveLocalisation(loc: any, token: any, structureId: string | number): Observable<Localisation> {
    return this.http.post<Localisation>(`${this.apiUrl}/${structureId}/localisations`, loc);
  }
  editLocalisation(loc: any, id: string, token: any, structureId: string | number): Observable<Localisation> {
    return this.http.put<Localisation>(`${this.apiUrl}/${structureId}/localisations/${id}`, loc);
  }
  removeLocalisation(id: string, token: any, structureId: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${structureId}/localisations/${id}`);
  }

  // Service
  saveService(service: any, token: any, structureId: string | number): Observable<ServiceOffert> {
    return this.http.post<ServiceOffert>(`${this.apiUrl}/${structureId}/services`, service);
  }
  editService(service: any, id: string, token: any, structureId: string | number): Observable<ServiceOffert> {
    return this.http.put<ServiceOffert>(`${this.apiUrl}/${structureId}/services/${id}`, service);
  }
  removeService(id: string, token: any, structureId: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${structureId}/services/${id}`);
  }

  // Photo
  savePhoto(photo: any, token: any, structureId: string | number): Observable<Photo> {
    return this.http.post<Photo>(`${this.apiUrl}/${structureId}/photos`, photo);
  }
  removePhoto(id: string, token: any, structureId: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${structureId}/photos/${id}`);
  }

  // Horaire
  saveHoraire(horaire: any, token: any, structureId: string | number): Observable<Horaire> {
    return this.http.post<Horaire>(`${this.apiUrl}/${structureId}/horaires`, horaire);
  }
  editHoraire(horaire: any, id: string, token: any, structureId: string | number): Observable<Horaire> {
    return this.http.put<Horaire>(`${this.apiUrl}/${structureId}/horaires/${id}`, horaire);
  }
  removeHoraire(id: string, token: any, structureId: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${structureId}/horaires/${id}`);
  }

  searchEntreprises(query: string, page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams().set('query', query).set('page', page).set('size', size);
    return this.http.get<any>(`${this.publicUrl}/search`, { params });
  }
}
