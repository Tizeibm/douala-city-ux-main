import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Entreprise, Horaire, Localisation, Photo, ServiceOffert } from '../../shared/models/entreprise';
import { environment } from '../../../environments/environment';

// Interface pour la réponse paginée du backend
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Interface pour le corps de recherche
interface SearchBody {
  nom?: string;
  quartier?: string;
  latitude?: number;
  longitude?: number;
  rayonKm?: number;
}

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

  getMesEntreprises(): Observable<Entreprise[]> {
    return this.http.get<Entreprise[]>(`${this.apiUrl}/mesStrucuture`);
  }

  getMesEntreprisesValides(): Observable<Entreprise[]> {
    return this.http.get<Entreprise[]>(`${this.apiUrl}/mesStructuresValide`);
  }

  // Ajouter une nouvelle entreprise
  ajouterEntreprise(entreprise: Entreprise): Observable<Entreprise> {
    return this.http.post<Entreprise>(this.apiUrl, entreprise);
  }

  updateStructure(entreprise: Partial<Entreprise>, token: string | null, id: string): Observable<Entreprise> {
    return this.http.put<Entreprise>(`${this.apiUrl}/${id}`, entreprise);
  }

  // Supprimer une entreprise
  deleteStructure(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getStructures(page: number = 0, size: number = 10): Observable<PageResponse<Entreprise>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<Entreprise>>(this.publicUrl, { params });
  }

  getStructureById(id: string): Observable<Entreprise> {
    return this.http.get<Entreprise>(`${this.publicUrl}/${id}`);
  }

  /** @deprecated Utiliser getStructureById() directement */
  getEntreprisesById(token: string | null, id: string): Observable<Entreprise> {
    return this.getStructureById(id);
  }

  getByCategorie(categorie: string, page: number = 0, size: number = 10): Observable<PageResponse<Entreprise>> {
    const params = new HttpParams()
      .set('categorie', categorie)
      .set('page', page)
      .set('size', size);
    return this.http.get<PageResponse<Entreprise>>(`${this.publicUrl}/categorie`, { params });
  }

  getBySousCategorie(sousCategorie: string, page: number = 0, size: number = 10): Observable<PageResponse<Entreprise>> {
    const params = new HttpParams()
      .set('sousCategorie', sousCategorie)
      .set('page', page)
      .set('size', size);
    return this.http.get<PageResponse<Entreprise>>(`${this.publicUrl}/sousCategorie`, { params });
  }

  // Implémentation de l'envoi de photo
  uploadPhoto(structureId: string, formData: FormData): Observable<Photo> {
    return this.http.post<Photo>(`${environment.apiUrl}/photos/${structureId}/upload`, formData);
  }

  // Obtenir les photos d'une structure (public)
  getPhotos(structureId: string): Observable<Photo[]> {
    return this.http.get<Photo[]>(`${environment.apiUrl}/photos/public/structure/${structureId}`);
  }

  saveLocalisationsBatch(locs: Partial<Localisation>[], structureId: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/localisation/${structureId}`, locs);
  }

  saveServicesBatch(services: Partial<ServiceOffert>[], structureId: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/services/${structureId}/services/batch`, services);
  }

  saveHorairesBatch(horaires: Partial<Horaire>[], structureId: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/horaires/${structureId}`, horaires);
  }

  saveLocalisation(loc: Partial<Localisation>, token: string | null, structureId: string): Observable<Localisation> {
    return this.http.post<Localisation>(`${environment.apiUrl}/localisation/${structureId}`, [loc]);
  }
  editLocalisation(loc: Partial<Localisation>, id: string, token: string | null, structureId: string): Observable<Localisation> {
    return this.http.put<Localisation>(`${environment.apiUrl}/localisation/${structureId}/${id}`, loc);
  }
  removeLocalisation(id: string, token: string | null, structureId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/localisation/${structureId}/${id}`);
  }

  saveService(service: Partial<ServiceOffert>, token: string | null, structureId: string): Observable<ServiceOffert> {
    return this.http.post<ServiceOffert>(`${environment.apiUrl}/services/${structureId}/services/batch`, [service]);
  }
  editService(service: Partial<ServiceOffert>, id: string, token: string | null, structureId: string): Observable<ServiceOffert> {
    return this.http.put<ServiceOffert>(`${environment.apiUrl}/services/${structureId}/services/${id}`, service);
  }
  removeService(id: string, token: string | null, structureId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/services/${structureId}/services/${id}`);
  }

  savePhoto(file: File, token: string | null, targetId: string): Observable<Photo> {
    const formData = new FormData();
    formData.append('File', file);
    return this.http.post<Photo>(`${environment.apiUrl}/photos/${targetId}/upload`, formData);
  }

  updateMainPhoto(photoId: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/photos/${photoId}/main`, {});
  }
  removePhoto(id: string, token: string | null, structureId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/photos/${id}`);
  }

  saveHoraire(horaire: Partial<Horaire>, token: string | null, structureId: string): Observable<Horaire> {
    return this.http.post<Horaire>(`${environment.apiUrl}/horaires/${structureId}`, [horaire]);
  }
  editHoraire(horaire: Partial<Horaire>, id: string, token: string | null, structureId: string): Observable<Horaire> {
    return this.http.put<Horaire>(`${environment.apiUrl}/horaires/${structureId}`, [horaire]);
  }
  removeHoraire(id: string, token: string | null, structureId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/horaires/${structureId}/${id}`);
  }

  searchEntreprises(query: string, zone?: string, page: number = 0, size: number = 10, lat?: number, lng?: number, rayon?: number): Observable<PageResponse<Entreprise>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    const body: SearchBody = {};
    if (query) body.nom = query;
    if (zone) body.quartier = zone;
    if (lat) body.latitude = lat;
    if (lng) body.longitude = lng;
    if (rayon) body.rayonKm = rayon;

    return this.http.post<PageResponse<Entreprise>>(`${this.publicUrl}/search`, body, { params });
  }

  // --- STATISTIQUES ---
  getStructureStats(id: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/structureStats/${id}/stats`);
  }

  recordView(id: string, userId?: string, visitorHash?: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/structureStats/${id}/view`, { userId, visitorHash });
  }

  recordContactClick(id: string, type: string, visitorHash?: string, userId?: string, clickedUrl?: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/structureStats/${id}/contact-click`, { type, visitorHash, userId, clickedUrl });
  }

  // --- POINTS D'ACCÈS MANQUANTS (Admin et données fines) ---

  /**
   * @deprecated Le backend n'a pas de route /api/structures/users.
   * Utiliser getMesEntreprises() à la place — retourne les structures de l'utilisateur authentifié.
   */
  getStructuresByUser(_userId: string): Observable<Entreprise[]> {
    console.warn('[EntrepriseService] getStructuresByUser is deprecated — no backend endpoint exists. Falling back to getMesEntreprises().');
    return this.getMesEntreprises();
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

  // Admin-specific methods for managing structure validation
  getAllEntreprises(page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<any>(`${this.apiUrl}/public`, { params });
  }

  getEntreprisesEnAttente(page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams().set('s', 'EN_ATTENTE').set('page', page).set('size', size);
    return this.http.get<any>(`${this.apiUrl}/status`, { params });
  }

  getAllEntreprisesValid(token?: any, page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams().set('s', 'VALIDE').set('page', page).set('size', size);
    return this.http.get<any>(`${this.apiUrl}/status`, { params });
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

  setEntreprise(structure: Entreprise | null) {
    const structureSubject = new BehaviorSubject<Entreprise | null>(null);
    structureSubject.next(structure);
  }
}
