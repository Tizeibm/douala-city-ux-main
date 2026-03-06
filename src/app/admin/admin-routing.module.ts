import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardHomeComponent } from './dashboard-home/dashboard-home.component';
import { ValidationComponent } from './validation/validation.component';
import { StatistiquesComponent } from './statistiques/statistiques.component';

import { EntreprisesComponent } from './entreprises/entreprises.component';
import { LoginComponent } from './login/login.component';
import { StructureDetailPageComponent } from '../shared/components/structure-detail-page/structure-detail-page.component';
import { authGuard } from '../auth.guard';
import { FiltrerStructuresComponent } from './filtrer-structures/filtrer-structures.component';
const routes: Routes = [

  {
    path: '',
    component: DashboardHomeComponent,
    canActivate: [authGuard],
    data: { expectedRoles: ['ADMIN'] },
    children: [
      {
        path: 'validation', component:
          ValidationComponent,
        title: 'valider/refuser une entreprise'
      },
      {
        path: 'structures',
        component: EntreprisesComponent,
        title: 'Gérer les entreprises'
      },

      {
        path: 'statistiques',
        component: StatistiquesComponent,
        title: 'statistiques de la ville de Douala'
      },

      {
        path: '',
        redirectTo: 'structures',
        pathMatch: 'full'

      },
      {
        path: 'filtres',
        component: FiltrerStructuresComponent,
        title: 'Filtrer les structures'

      },
      {
        path: 'structures/:id',
        component: StructureDetailPageComponent,
        data: { mode: 'admin' },
        title: 'Détails de la structure'


      }

    ]
  },


  {
    path: 'login',
    component: LoginComponent,
    title: 'Admin Connexion - Douala-city'

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
