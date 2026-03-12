import { Component, OnInit } from '@angular/core';
import { AnnonceService } from '../../services/annonce.service';
import { Annonce } from '../../models/annonce';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { environment } from '../../../../../../environments/environment';

@Component({
    selector: 'app-mes-annonces',
    templateUrl: './mes-annonces.component.html',
    styleUrls: ['./mes-annonces.component.scss'],
    standalone: false
})
export class MesAnnoncesComponent implements OnInit {
    annonces: Annonce[] = [];
    loading = true;
    backendUrl = environment.apiUrl;

    constructor(
        private annonceService: AnnonceService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadAnnonces();
    }

    loadAnnonces(): void {
        this.loading = true;
        this.annonceService.getUserAnnonces().subscribe({
            next: (data: any) => {
                this.annonces = data;
                this.loading = false;
            },
            error: (err: any) => {
                console.error('Erreur lors du chargement de vos annonces', err);
                this.loading = false;
            }
        });
    }

    deleteAnnonce(id: string | undefined): void {
        if (!id) return;
        Swal.fire({
            title: 'Êtes-vous sûr ?',
            text: "Voulez-vous vraiment supprimer cette annonce ? Cette action est irréversible.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Oui, supprimer !',
            cancelButtonText: 'Annuler'
        }).then((result: any) => {
            if (result.isConfirmed) {
                this.annonceService.deleteAnnonce(id).subscribe({
                    next: () => {
                        Swal.fire('Supprimée!', 'Votre annonce a été supprimée.', 'success');
                        this.loadAnnonces();
                    },
                    error: (err: any) => {
                        console.error('Erreur suppression', err);
                        Swal.fire('Erreur', 'Impossible de supprimer cette annonce.', 'error');
                    }
                });
            }
        });
    }
}
