import { Component, ChangeDetectionStrategy, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { HapticService } from '../../../core/services/haptic.service';
import { Utilisateur } from '../../auth/registration/services/inscription.service';
import { UserService } from '../../../core/services/user.service';

@Component({
    selector: 'app-profile-settings',
    standalone: false,
    templateUrl: './profile-settings.component.html',
    styleUrl: './profile-settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileSettingsComponent implements OnInit {
    utilisateur: Utilisateur | null = null;
    loading = false;
    loadingPassword = false;
    successMessage = '';
    errorMessage = '';

    profileData = { nom: '', telephone: '' };
    passwordData = { oldPassword: '', newPassword: '' };

    constructor(
        private authService: AuthService,
        private userService: UserService,
        private router: Router,
        private haptic: HapticService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    ngOnInit(): void {
        this.authService.utilisateur$.subscribe(u => {
            if (u) {
                this.utilisateur = u;
                this.profileData.nom = u.nom || '';
                this.profileData.telephone = u.telephone || '';
            }
        });
        this.authService.chargerUtilisateurDepuisStorage();
    }

    onUpdateProfile(): void {
        this.loading = true;
        this.userService.updateProfile({ nom: this.profileData.nom, telephone: this.profileData.telephone }).subscribe({
            next: (updatedUser) => {
                this.loading = false;
                this.haptic.success();
                this.successMessage = 'Profil mis à jour avec succès';
                // Mettre à jour le cache local
                const token = localStorage.getItem('token');
                if (token) this.authService.connecter(updatedUser, token);
                setTimeout(() => this.successMessage = '', 3000);
            },
            error: (err) => {
                this.loading = false;
                this.errorMessage = 'Erreur lors de la mise à jour';
                setTimeout(() => this.errorMessage = '', 3000);
            }
        });
    }

    onChangePassword(): void {
        if (!this.passwordData.oldPassword || !this.passwordData.newPassword) return;
        this.loadingPassword = true;
        this.userService.changePassword(this.passwordData).subscribe({
            next: () => {
                this.loadingPassword = false;
                this.haptic.success();
                this.successMessage = 'Mot de passe changé avec succès';
                this.passwordData = { oldPassword: '', newPassword: '' };
                setTimeout(() => this.successMessage = '', 3000);
            },
            error: (err) => {
                this.loadingPassword = false;
                this.errorMessage = 'Erreur lors du changement de mot de passe';
                setTimeout(() => this.errorMessage = '', 3000);
            }
        });
    }

    logout(): void {
        this.haptic.navigation();
        this.authService.logout();
        this.router.navigate(['/accueil']);
    }
}

