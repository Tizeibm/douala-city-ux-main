import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Utilisateur } from '../../features/auth/registration/services/inscription.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private utilisateurSubject: BehaviorSubject<Utilisateur | null> = new BehaviorSubject<Utilisateur | null>(null);
  public utilisateur$: Observable<Utilisateur | null>;
  private estConnecteSubject = new BehaviorSubject<boolean>(false);
  estConnecte$ = this.estConnecteSubject.asObservable();

  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('utilisateur');
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      try {
        this.utilisateurSubject.next(JSON.parse(storedUser));
        this.estConnecteSubject.next(true);
      } catch (e) {
        console.error('Erreur de parsing utilisateur stocké', e);
        this.logout();
      }
    } else {
      // Si l'un est manquant, s'assurer que les deux sont nettoyés
      this.utilisateurSubject.next(null);
      this.estConnecteSubject.next(false);
    }

    this.utilisateur$ = this.utilisateurSubject.asObservable();
  }

  connecter(utilisateur: Utilisateur, token: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('utilisateur', JSON.stringify(utilisateur));
    localStorage.setItem('role', utilisateur.role || '');
    this.utilisateurSubject.next(utilisateur);
    this.estConnecteSubject.next(true);
  }

  chargerUtilisateurDepuisStorage() {
    const data = localStorage.getItem('utilisateur');
    if (data) {
      try {
        const user = JSON.parse(data);
        this.utilisateurSubject.next(user);
        this.estConnecteSubject.next(true);
      } catch (e) {
        console.error('Erreur de parsing des données utilisateur', e);
      }
    }
  }

  deconnecter() {
    this.logout();
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/user/login`, { email, password }).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('utilisateur', JSON.stringify(res.userDto));
        localStorage.setItem('role', res.userDto.role);
        this.utilisateurSubject.next(res.userDto);
        this.estConnecteSubject.next(true);
      })
    );
  }

  estConnecte(): boolean {
    return this.estConnecteSubject.value;
  }

  getNomUtilisateur(): string | null {
    try {
      const utilisateur = JSON.parse(localStorage.getItem('utilisateur') || 'null');
      return utilisateur?.nom || null;
    } catch {
      return null;
    }
  }

  getUtilisateurId(): string {
    const utilisateur = JSON.parse(localStorage.getItem('utilisateur') || '{}');
    return utilisateur.id || '';
  }

  getUser() {
    return this.utilisateurSubject.value;
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  logout() {
    this.http.post(`${this.apiUrl}/user/logout`, {}).subscribe({
      next: () => this.clearLocalSession(),
      error: () => this.clearLocalSession()
    });
  }

  private clearLocalSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('utilisateur');
    localStorage.removeItem('role');
    this.utilisateurSubject.next(null);
    this.estConnecteSubject.next(false);
  }

  isLoggedIn(): boolean {
    return !!this.utilisateurSubject.value;
  }
}
