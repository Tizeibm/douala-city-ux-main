import { Component, ChangeDetectionStrategy, HostListener, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { Utilisateur } from '../../../features/auth/registration/services/inscription.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit, OnDestroy {

  menuOuvert = false;
  isMobile = false;
  searchQuery = '';
  isAccueil = false;

  utilisateur: Utilisateur | null = null;
  estConnecte: boolean = false;
  utilisateurNom: string | null = null;

  isAnnuaireOpen = false;
  isBrowser: boolean;
  private routerSub: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  toggleAnnuaire() {
    this.isAnnuaireOpen = !this.isAnnuaireOpen;
  }

  toggleMobile() {
    if (this.isMobile) {
      this.menuOuvert = false;
      this.isAnnuaireOpen = false;
    }
  }

  mobileOpen() {

  }

  ngOnInit(): void {
    this.checkViewport();
    this.mettreAJourHeader();
    this.routerSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isAccueil = event.urlAfterRedirects === '/accueil' || event.urlAfterRedirects === '/';
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routerSub) this.routerSub.unsubscribe();
  }

  onHeaderSearch() {
    if (!this.searchQuery.trim()) return;
    this.router.navigate(['/resultats'], { queryParams: { q: this.searchQuery } });
    this.searchQuery = '';
    this.closeMenu();
  }

  @HostListener('window: resize')
  onResize(): void {
    this.checkViewport();
  }

  private checkViewport(): void {
    if (this.isBrowser) {
      this.isMobile = window.innerWidth <= 768;
      if (!this.isMobile) this.menuOuvert = false;
    }
  }

  toggleMenu(e?: Event): void {
    if (e) e.stopPropagation();
    this.menuOuvert = !this.menuOuvert;
  }

  closeMenu(): void {
    if (this.isMobile) this.menuOuvert = false;
  }

  mettreAJourHeader() {
    this.authService.estConnecte$.subscribe((etat) => this.estConnecte = etat);
    this.authService.utilisateur$.subscribe(u => {
      this.utilisateur = u;
    });
    this.authService.chargerUtilisateurDepuisStorage();
  }

  logout() {
    this.authService.logout();
    this.mettreAJourHeader();
    this.router.navigate(['/login']);
  }
}
