import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { HapticService } from '../core/services/haptic.service';
import { Utilisateur } from '../website/registration/services/inscription.service';

@Component({
    selector: 'app-profile-settings',
    standalone: false,
    templateUrl: './profile-settings.component.html',
    styleUrl: './profile-settings.component.scss'
})
export class ProfileSettingsComponent implements OnInit {
    utilisateur: Utilisateur | null = null;
    loading = false;
    successMessage = '';
    errorMessage = '';

    constructor(
        private authService: AuthService,
        private router: Router,
        private haptic: HapticService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    ngOnInit(): void {
        this.authService.utilisateur$.subscribe(u => {
            this.utilisateur = u;
        });
        this.authService.chargerUtilisateurDepuisStorage();
    }

    onUpdateProfile(): void {
        this.haptic.success();
        this.successMessage = 'Profil mis à jour avec succès (Démo)';
        setTimeout(() => this.successMessage = '', 3000);
    }

    logout(): void {
        this.haptic.navigation();
        this.authService.logout();
        this.router.navigate(['/accueil']);
    }
}
