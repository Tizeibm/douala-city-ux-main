import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterBusinessComponent } from './website/registration/register-business/register-business.component';
import { AppComponent } from './app.component';
import { MainComponent } from './website/components/main/main.component';
import { CategoriesComponent } from './website/components/categories/categories.component';
import { ServicePageComponent } from './website/pages/service-page/service-page.component';
import { CategoriepageComponent } from './website/pages/categoriepage/categoriepage.component';
import { ContactpageComponent } from './website/pages/contactpage/contactpage.component';
import { EntrepriseComponent } from './entreprise/entreprise.component';
import { AccueilComponent } from './website/pages/accueil/accueil.component';
import { AppliComponent } from './appli/appli.component';
import { CommercesComponent } from './commerces/commerces.component';
import { InstitutionsComponent } from './institutions/institutions.component';
import { EcolesComponent } from './ecoles/ecoles.component';
import { HopitauxComponent } from './hopitaux/hopitaux.component';
import { LoginLogoutComponent } from './login-logout/login-logout.component';
import { AnnoncesComponent } from './annonces/annonces.component';
import { RechercheComponent } from './recherche/recherche.component';
import { ResultatsComponent } from './resultats/resultats.component';
import { LoginComponent } from './login/login.component';
import { DashboardUserComponent } from './dashboard-user/dashboard-user.component';
import { authGuard } from './auth.guard';
import { AddEntrepriseComponent } from './add-entreprise/add-entreprise.component';
import { StructureUserComponent } from './structure-user/structure-user.component';
import { StructureDetailsComponent } from './admin/structure-details/structure-details.component';
import { UserStructureDetComponent } from './user-structure-det/user-structure-det.component';
import { StructDetailsComponent } from './struct-details/struct-details.component';
import { HebergementComponent } from './hebergement/hebergement.component';
import { RestaurationComponent } from './restauration/restauration.component';
import { ServicesComponent } from './services/services.component';
import { LoisirsComponent } from './loisirs/loisirs.component';
import { TransportComponent } from './transport/transport.component';
import { AjouterAvisComponent } from './avis/components/ajouter-avis/ajouter-avis.component';
import { AvisListComponent } from './avis/components/avis-list/avis-list.component';
import { ReplyAvisComponent } from './avis/components/reply-avis/reply-avis.component';
import { EditAvisComponent } from './avis/edit-avis/edit-avis.component';
import { ProfileSettingsComponent } from './profile-settings/profile-settings.component';
import { StatsComponent } from './stats/stats.component';
import { AddAnnonceComponent } from './annonces/components/add-annonce/add-annonce.component';
import { AnnonceDetailsComponent } from './annonce-details/annonce-details.component';

const routes: Routes = [

  {
    path: 'admin',
    loadChildren: () =>
      import('./admin/admin.module').then(m => m.AdminModule),
  },
  {
    path: '',
    component: AppliComponent,
    children: [


      {
        path: '',
        redirectTo: 'accueil',
        pathMatch: 'full'
      },
      {
        path: 'structdet/:id',
        component: StructDetailsComponent,
        children: [
          {
            path: 'ajouterAvis',
            component: AjouterAvisComponent
          },
          {
            path: 'avisList',
            component: AvisListComponent,
            children: [
              {
                path: 'reply',
                component: ReplyAvisComponent
              },
              {
                path: 'edit',
                component: EditAvisComponent
              }
            ]
          }

        ]

      },

      {
        path: 'accueil',
        component: AccueilComponent,
        title: 'Accueil - Douala-city'
      },


      {
        path: 'commerces',
        component: CommercesComponent,
        title: 'commerces de la ville de Douala'
      },

      {
        path: 'institutions',
        component: InstitutionsComponent,
        title: 'trouver un service public dans la ville de Douala'
      },
      {
        path: 'institution',
        redirectTo: 'institutions',
        pathMatch: 'full'
      },
      {
        path: 'ecoles',
        component: EcolesComponent,
        title: 'trouver une ecole dans la ville de Douala'
      },
      {
        path: 'ecole',
        redirectTo: 'ecoles',
        pathMatch: 'full'
      },
      {
        path: 'hopitaux',
        component: HopitauxComponent,
        title: 'trouver un centre de santé dans la ville de Douala'
      },
      {
        path: 'sante',
        redirectTo: 'hopitaux',
        pathMatch: 'full'
      },
      {
        path: 'inscription',
        component: LoginLogoutComponent,
        title: 'Inscription d\'une entreprise - Douala-city'
      },

      {
        path: 'annonces',
        component: AnnoncesComponent,
        title: 'Annonces - Douala-city'
      },
      {
        path: 'annonce/:id',
        component: AnnonceDetailsComponent,
        title: 'Détails de l\'annonce - Douala-city'
      },
      {
        path: 'annonces/creer',
        component: AddAnnonceComponent,
        title: 'Créer une annonce - Douala-city',
        canActivate: [authGuard]
      },


      {
        path: 'loisirs',
        component: LoisirsComponent,
        title: 'trouver un lieu de loisir dans la ville de Douala'

      },
      {
        path: 'restauration',
        component: RestaurationComponent,
        title: 'se restaurer dans la ville de Douala'
      },


      {
        path: 'services',
        component: ServicesComponent,
        title: 'trouver des services dans la ville de Douala'
      },

      {
        path: 'transport',
        component: TransportComponent,
        title: 'trouver des services de transport dans la ville de Douala'
      },

      {
        path: 'hebergement',
        component: HebergementComponent,
        title: 'trouver des services d\'hébergement dans la ville de Douala'
      },
      {
        path: 'recherche',
        component: RechercheComponent,
        title: 'rechercher une entreprise dans la  ville de Douala'
      },
      {
        path: 'resultats',
        component: ResultatsComponent,
        title: 'Résultats de recherche - Douala-city'
      },

      {
        path: 'login',
        component: LoginComponent,
        title: 'Connexion - Douala-city'
      },




      {
        path: 'dashboard-user',
        component: DashboardUserComponent,
        title: 'manager vos entreprises - Douala-city',
        canActivate: [authGuard],
        data: { expectedRoles: ['SOLO', 'INSTITUTION', 'COMMERCANT', 'ADMIN'] },
        children: [
          {
            path: '',
            redirectTo: 'structures',
            pathMatch: 'full'
          },
          {
            path: 'structures',
            component: EntrepriseComponent,
            title: 'Vos structures - Douala-city'
          },
          {
            path: 'structures/ajout',
            component: AddEntrepriseComponent,
            title: 'ajouter une entreprise - Douala-city'
          },
          {
            path: 'structures/valides',
            component: StructureUserComponent,
            title: 'vos structures validées - Douala-city'

          },
          {
            path: 'structures/:id',
            component: UserStructureDetComponent,
            title: 'détails de votre structure - Douala-city'
          },
          {
            path: 'profil',
            component: ProfileSettingsComponent,
            title: 'Mon Profil - Douala-city'
          }

        ]
      }





    ]
  }


];





@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
