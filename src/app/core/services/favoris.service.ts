import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface FavoriResponse {
  id: string;
  structureId: string;
  structureNom: string;
  categorieNom: string;
  photoPrincipal: string | null;
  createdAt: string;
}

/**
 * Service centralisé pour la gestion des favoris.
 * Maintient un cache local des IDs favoris pour éviter les appels réseau redondants.
 */
@Injectable({
  providedIn: 'root'
})
export class FavorisService {
  private apiUrl = `${environment.apiUrl}/favoris`;

  // Cache des IDs de structures en favori (Set pour O(1) lookup)
  private favorisIdsSubject = new BehaviorSubject<Set<string>>(new Set());
  favorisIds$ = this.favorisIdsSubject.asObservable();

  private chargementEffectue = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Recharger les favoris quand l'utilisateur se connecte/déconnecte
    this.authService.estConnecte$.subscribe(connecte => {
      if (connecte) {
        this.chargerFavoris();
      } else {
        this.favorisIdsSubject.next(new Set());
        this.chargementEffectue = false;
      }
    });
  }

  /**
   * Charger les IDs de favoris depuis le backend (une seule fois par session).
   */
  chargerFavoris(): void {
    if (this.chargementEffectue || !this.authService.estConnecte()) return;

    this.http.get<string[]>(`${this.apiUrl}/ids`).pipe(
      catchError(() => of([]))
    ).subscribe(ids => {
      this.favorisIdsSubject.next(new Set(ids));
      this.chargementEffectue = true;
    });
  }

  /**
   * Vérifier si une structure est en favori (depuis le cache local).
   */
  estFavori(structureId: string): boolean {
    return this.favorisIdsSubject.value.has(structureId);
  }

  /**
   * Basculer le statut favori d'une structure (toggle).
   * Retourne un Observable<boolean> indiquant le nouveau statut.
   */
  toggleFavori(structureId: string): Observable<boolean> {
    if (this.estFavori(structureId)) {
      return this.supprimerFavori(structureId);
    } else {
      return this.ajouterFavori(structureId);
    }
  }

  /**
   * Ajouter une structure aux favoris.
   */
  ajouterFavori(structureId: string): Observable<boolean> {
    return this.http.post<{ favori: boolean }>(`${this.apiUrl}/${structureId}`, {}).pipe(
      tap(() => {
        const ids = new Set(this.favorisIdsSubject.value);
        ids.add(structureId);
        this.favorisIdsSubject.next(ids);
      }),
      tap(() => true),
      catchError(() => of(false))
    ) as unknown as Observable<boolean>;
  }

  /**
   * Retirer une structure des favoris.
   */
  supprimerFavori(structureId: string): Observable<boolean> {
    return this.http.delete<{ favori: boolean }>(`${this.apiUrl}/${structureId}`).pipe(
      tap(() => {
        const ids = new Set(this.favorisIdsSubject.value);
        ids.delete(structureId);
        this.favorisIdsSubject.next(ids);
      }),
      tap(() => false),
      catchError(() => of(true))
    ) as unknown as Observable<boolean>;
  }

  /**
   * Récupérer la liste complète des favoris avec les infos de la structure.
   */
  getMesFavoris(): Observable<FavoriResponse[]> {
    return this.http.get<FavoriResponse[]>(this.apiUrl);
  }

  /**
   * Compter le nombre de favoris de l'utilisateur.
   */
  compterFavoris(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/count`);
  }
}
