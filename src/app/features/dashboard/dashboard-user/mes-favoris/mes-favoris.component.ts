import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FavorisService, FavoriResponse } from '../../../../core/services/favoris.service';
import { HapticService } from '../../../../core/services/haptic.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-mes-favoris',
  standalone: false,
  templateUrl: './mes-favoris.component.html',
  styleUrls: ['./mes-favoris.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MesFavorisComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  favoris: FavoriResponse[] = [];
  loading = true;
  apiUrl = environment.apiUrl;

  constructor(
    private favorisService: FavorisService,
    private router: Router,
    private haptic: HapticService
  ) {}

  ngOnInit(): void {
    this.chargerFavoris();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  chargerFavoris(): void {
    this.loading = true;
    this.favorisService.getMesFavoris().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.favoris = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getPhotoUrl(photoPrincipal: string | null): string {
    if (!photoPrincipal) return '';
    if (photoPrincipal.length > 20) {
      return `${this.apiUrl}/photos/public/${photoPrincipal}/image`;
    }
    return '';
  }

  consulter(structureId: string): void {
    this.haptic.navigation();
    this.router.navigate(['/structdet', structureId]);
  }

  retirerFavori(structureId: string, event: Event): void {
    event.stopPropagation();
    this.haptic.tap();
    this.favorisService.supprimerFavori(structureId).subscribe(() => {
      this.favoris = this.favoris.filter(f => f.structureId !== structureId);
    });
  }
}
