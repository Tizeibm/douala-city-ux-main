import { Component } from '@angular/core';
import { Entreprise } from '../../entreprise';
import { EntreprisesService } from '../services/entreprises.service';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-filtrer-structures',
  standalone: false,
  templateUrl: './filtrer-structures.component.html',
  styleUrl: './filtrer-structures.component.scss'
})
export class FiltrerStructuresComponent {




  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;
  loading: boolean = false;





  filters = {
    nom: '',
    categorie: '',
    sousCategorie: '',
    quartier: ''
  };


  categories: { nom: string; sousCategories: string[] }[] =
    [
      {
        nom: 'Commerce',
        sousCategories:
          ["Alimentation", "Vêtements", "Électronique", "Meubles", "Livres"]
      },
      {
        nom: 'Autres',
        sousCategories:
          ["Autre"]
      },
      {
        nom: 'transport',
        sousCategories:
          ["Agence de voyage", "Location de voitures", "Taxi", "Transport en commun"]
      },
      {
        nom: 'Hébergement',
        sousCategories:
          ["Hôtel", "Auberge", "Chambre d'hôtes", "Camping"]
      },
      {
        nom: 'Loisirs',
        sousCategories:
          ["Cinéma", "Salle de sport", "Parc d'attractions", "Musée"]
      },
      {
        nom: 'Restauration',
        sousCategories:
          ["Restaurant", "Café", "Fast-food", "Boulangerie"]
      },
      {
        nom: 'Education',
        sousCategories:
          ["École", "Université", "Centre de formation"]
      },
      {
        nom: 'Santé',
        sousCategories:
          ["Pharmacie", "Clinique", "Hôpital", "Laboratoire"]
      },
      {
        nom: 'services',
        sousCategories:
          ["coiffure", "Mécanique", "Plomberie", "électricité", "nettoyage"]
      }

    ]

  getCategories(): string[] {
    return this.categories.map(c => c.nom);


  }
  getSousCategories(): string[] {

    const cat = this.categories.find(c => c.nom === this.filters.categorie);
    return cat ? cat.sousCategories : [];
  }

  onCategorieChange(): void {
    this.filters.sousCategorie = '';
    this.applyFilters();
  }

  allStructures: Entreprise[] = [];
  filteredStructures: Entreprise[] = [];

  constructor(private structureService: EntreprisesService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadStructures();
  }
  loadStructures() {
    const token: String | null = localStorage.getItem('token');
    this.structureService.getAllEntreprisesValid(token).subscribe({
      next: data => {
        this.allStructures = data;
        console.log(this.allStructures);
        this.loading = true;
        this.applyFilters();
      },
      error: err => {
        console.error('Erreur lors du chargement des structures', err);
      }
    });
  }
  applyFilters(): void {
    this.filteredStructures = this.allStructures.filter(s => {

      return (
        s.nom.toLowerCase().includes(this.filters.nom.toLowerCase()) &&
        (this.filters.categorie ? s.categorieNom === this.filters.categorie : true) &&
        (this.filters.sousCategorie ? s.sousCategorie === this.filters.sousCategorie : true) &&
        (this.filters.quartier ? s.localisation ? s.localisation.map(l => l.quartier?.toLowerCase().includes(this.filters.quartier.toLowerCase())).includes(true) : false : true))
    });

    this.structureService.setEntreprises(this.filteredStructures);
    this.totalPages = this.filteredStructures.length && Math.ceil(this.filteredStructures.length / this.itemsPerPage);
    this.currentPage = 1;
    this.structureService.setPage(this.currentPage);
    // Reset to first page after filtering
    this.updatePaginatedStructures();
    this.loading = false;
  }

  updatePaginatedStructures(): void {
    this.structureService.page$.subscribe(page => {
      this.currentPage = page;
    });
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.structureService.ent$.subscribe(data => {
      this.filteredStructures = data;
      this.filteredStructures = this.filteredStructures.slice(startIndex, endIndex);
    });

    console.log(this.filteredStructures);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.structureService.setPage(this.currentPage);
      this.updatePaginatedStructures();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.structureService.setPage(this.currentPage);
      this.updatePaginatedStructures();
    }
  }
  getpage(): number {
    this.structureService.page$.subscribe(page => {
      this.currentPage = page;
    });
    return this.currentPage;
  }

  consulter(structure: Entreprise): void {

    this.router.navigate(['/admin/structures', structure.id]);
  }

}



