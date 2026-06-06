import { Component, ChangeDetectionStrategy, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Entreprise } from '../../../shared/models/entreprise';
import { EntrepriseService } from '../../../core/services/entreprises.service';
import { Router } from '@angular/router';
import { EntreprisesService } from '../../../admin/services/entreprises.service';
import { HapticService } from '../../../core/services/haptic.service';

@Component({
  selector: 'app-structure-user',
  standalone: false,
  templateUrl: './structure-user.component.html',
  styleUrl: './structure-user.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StructureUserComponent implements OnInit {

  structures: Entreprise[] = [];
  selected?: Entreprise;
  loading = true;
  error?: string;

  search: string = '';
  filtered: Entreprise[] = [];
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 0;
  moyenneAvis = 3;
  totalAvis = 5;

  constructor(private structureService: EntrepriseService,
    private router: Router,
    private structService: EntreprisesService,
    private haptic: HapticService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    this.loadStructures();
  }

  loadStructures() {
    if (isPlatformBrowser(this.platformId)) {
      this.loading = true;
      const token: String | null = localStorage.getItem('token');
      this.structureService.getMesEntreprisesValides().subscribe({
        next: (data: any) => {
          this.structures = data;
          this.structService.setEntreprises(this.filtered);
          this.loading = false;
        },
        error: (err: any) => {
          this.error = 'impossible de charger vos structures';
          console.error(err);
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }

  consulter(structure: Entreprise): void {
    this.haptic.navigation();
    this.router.navigate(['/dashboard-user/structures', structure.id]);
  }

  edit(struct: Entreprise) {
    this.selected = struct;
  }

  onUpdated() {
    this.loadStructures();
    this.selected = undefined;
  }

  get filteredStructures(): Entreprise[] {
    this.filtered = this.structures.filter(s => s.nom.toLowerCase().includes(
      this.search.toLowerCase()));
    this.structService.setEntreprises(this.filtered);
    this.structService.ent$.subscribe(data => {
      this.filtered = data;
    });
    this.totalPages = this.filtered.length && Math.ceil(this.filtered.length / this.itemsPerPage);

    console.log(this.totalPages);
    // Reset to first page after filtering
    this.updatePaginatedStructures();
    this.loading = false;
    return this.filtered;
  }

  updatePaginatedStructures(): void {
    this.structService.page$.subscribe((page: any) => {
      this.currentPage = page;
    });
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.structService.ent$.subscribe(data => {
      this.filtered = data;
      this.filtered = this.filtered.slice(startIndex, endIndex);
    });
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.structService.setPage(this.currentPage);
      this.updatePaginatedStructures();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.structService.setPage(this.currentPage);
      this.updatePaginatedStructures();
    }
  }
}
