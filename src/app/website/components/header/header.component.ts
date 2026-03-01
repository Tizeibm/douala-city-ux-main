import { Component, HostListener, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../../auth.service';
import { Router } from '@angular/router';
import { Utilisateur } from '../../registration/services/inscription.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {

  menuOuvert = false;
  isMobile = false;

  utilisateur: Utilisateur | null = null;
  estConnecte: boolean = false;
  utilisateurNom: string | null = null;

  isAnnuaireOpen = false;
  isBrowser: boolean;

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
    console.log('menuOuvert =', this.menuOuvert);
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
