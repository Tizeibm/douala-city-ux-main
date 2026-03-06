import { HttpClient } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Utilisateur } from './website/registration/services/inscription.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private utilisateurSubject: BehaviorSubject<any | null> = new BehaviorSubject<any | null>(null);
  public utilisateur$: Observable<any | null>;
  private estConnecteSubject = new BehaviorSubject<boolean>(false);
  estConnecte$ = this.estConnecteSubject.asObservable();

  private apiUrl = 'http://localhost:8080/api/auth';
  private isBrowser: boolean;

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      const storedUser = localStorage.getItem('utilisateur');
      const token = localStorage.getItem('token');

      if (storedUser && token) {
        try {
          this.utilisateurSubject.next(JSON.parse(storedUser));
          this.estConnecteSubject.next(true);
        } catch (e) {
          console.error('Error parsing stored user', e);
          this.logout(); // Clear invalid data
        }
      } else {
        // If one is missing, ensure both are cleared
        this.utilisateurSubject.next(null);
        this.estConnecteSubject.next(false);
      }
    }

    this.utilisateur$ = this.utilisateurSubject.asObservable();
  }

  connecter(utilisateur: Utilisateur, token: string) {
    if (this.isBrowser) {
      localStorage.setItem('token', token);
      localStorage.setItem('utilisateur', JSON.stringify(utilisateur));
      localStorage.setItem('role', utilisateur.role || '');
    }
    this.utilisateurSubject.next(utilisateur);
    this.estConnecteSubject.next(true);
  }

  chargerUtilisateurDepuisStorage() {
    if (!this.isBrowser) return;

    const data = localStorage.getItem('utilisateur');
    console.log(data);
    if (data) {
      try {
        const user = JSON.parse(data);
        this.utilisateurSubject.next(user);
        this.estConnecteSubject.next(true);
      } catch (e) {
        console.error('Error parsing user data', e);
      }
    }
  }

  deconnecter() {
    this.estConnecteSubject.next(false);
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('utilisateur');
    }
    this.utilisateurSubject.next(null);
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/user/login`, { email, password }).pipe(
      tap(res => {
        console.log("b");
        if (this.isBrowser) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('utilisateur', JSON.stringify(res.userDto));
          localStorage.setItem('role', res.userDto.role);
        }
        this.utilisateurSubject.next(res.userDto);
        this.estConnecteSubject.next(true);
      })
    );
  }

  estConnecte(): boolean {
    return this.estConnecteSubject.value;
  }

  getNomUtilisateur(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('utilisateurNom');
  }

  getUtilisateurId(): string {
    if (!this.isBrowser) return '';
    const utilisateur = JSON.parse(localStorage.getItem('utilisateur') || '{}');
    return utilisateur.id || '';
  }

  getUser() {
    return this.utilisateurSubject.value;
  }

  getRole(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('role');
  }

  logout() {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('utilisateur');
      localStorage.clear();
    }
    this.utilisateurSubject.next(null);
    this.estConnecteSubject.next(false);
  }

  isLoggedIn(): boolean {
    return !!this.utilisateurSubject.value;
  }
}
