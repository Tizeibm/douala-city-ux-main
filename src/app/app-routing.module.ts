import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { EntrepriseComponent } from './entreprise/entreprise.component';
import { AccueilComponent } from './website/pages/accueil/accueil.component';
import { AppliComponent } from './appli/appli.component';
import { LoginLogoutComponent } from './login-logout/login-logout.component';
import { AnnoncesComponent } from './annonces/annonces.component';
import { RechercheComponent } from './recherche/recherche.component';
import { ResultatsComponent } from './resultats/resultats.component';
import { LoginComponent } from './login/login.component';
import { DashboardUserComponent } from './dashboard-user/dashboard-user.component';
import { authGuard } from './auth.guard';
import { AddEntrepriseComponent } from './add-entreprise/add-entreprise.component';
import { StructureUserComponent } from './structure-user/structure-user.component';
import { StructureDetailComponent } from './website/pages/structure-detail/structure-detail.component';
import { AjouterAvisComponent } from './avis/components/ajouter-avis/ajouter-avis.component';
import { AvisListComponent } from './avis/components/avis-list/avis-list.component';
import { ReplyAvisComponent } from './avis/components/reply-avis/reply-avis.component';
import { EditAvisComponent } from './avis/edit-avis/edit-avis.component';
import { ProfileSettingsComponent } from './profile-settings/profile-settings.component';
import { AddAnnonceComponent } from './annonces/components/add-annonce/add-annonce.component';
import { AnnonceDetailsComponent } from './annonce-details/annonce-details.component';
import { EditAnnonceComponent } from './annonces/components/edit-annonce/edit-annonce.component';
import { CategoryListingComponent } from './website/pages/category-listing/category-listing.component';
import { VueEnsembleComponent } from './dashboard-user/vue-ensemble/vue-ensemble.component';
import { MesAnnoncesComponent } from './annonces/components/mes-annonces/mes-annonces.component';
import { DashboardClientComponent } from './dashboard-client/dashboard-client.component';
import { StructureEditPageComponent } from './dashboard-user/structure-edit-page/structure-edit-page.component';


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
        component: StructureDetailComponent,
        data: { mode: 'public' },
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
        path: 'inscription',
        component: LoginLogoutComponent,
        title: 'Inscription d\'une entreprise - Douala-city'
      },

      {
        path: 'annonces',
        children: [
          {
            path: '',
            component: AnnoncesComponent,
            title: 'Annonces - Douala-city'
          },
          {
            path: 'creer',
            component: AddAnnonceComponent,
            title: 'Publier une annonce - Douala-city',
            canActivate: [authGuard]
          },
          {
            path: 'edit/:id',
            component: EditAnnonceComponent,
            title: 'Modifier l\'annonce - Douala-city',
            canActivate: [authGuard]
          }
        ]
      },
      {
        path: 'annonce/:id',
        component: AnnonceDetailsComponent,
        title: 'Détails de l\'annonce - Douala-city'
      },
      {
        path: 'recherche',
        component: RechercheComponent,
        title: 'rechercher une entreprise dans la  ville de Douala'
      },
      {
        path: 'categories/:category',
        component: CategoryListingComponent,
        title: 'Douala-city - Catégories'
      },
      // Redirections for old paths
      { path: 'commerces', redirectTo: 'categories/commerces', pathMatch: 'full' },
      { path: 'institutions', redirectTo: 'categories/institutions', pathMatch: 'full' },
      { path: 'ecoles', redirectTo: 'categories/education', pathMatch: 'full' },
      { path: 'hopitaux', redirectTo: 'categories/sante', pathMatch: 'full' },
      { path: 'loisirs', redirectTo: 'categories/loisirs', pathMatch: 'full' },
      { path: 'restauration', redirectTo: 'categories/restauration', pathMatch: 'full' },
      { path: 'services', redirectTo: 'categories/services', pathMatch: 'full' },
      { path: 'transport', redirectTo: 'categories/transport', pathMatch: 'full' },
      { path: 'hebergement', redirectTo: 'categories/hebergement', pathMatch: 'full' },
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
        data: { expectedRoles: ['ENTREPRISE', 'ADMIN'] },
        children: [
          {
            path: '',
            redirectTo: 'vue-ensemble',
            pathMatch: 'full'
          },
          {
            path: 'vue-ensemble',
            component: VueEnsembleComponent,
            title: 'Vue d\'ensemble - Douala-city'
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
            component: StructureDetailComponent,
            data: { mode: 'owner' },
            title: 'détails de votre structure - Douala-city'
          },
          {
            path: 'structures/:id/modifier',
            component: StructureEditPageComponent,
            title: 'Modifier votre structure - Douala-city'
          },

          {
            path: 'profil',
            component: ProfileSettingsComponent,
            title: 'Mon Profil - Douala-city'
          },
          {
            path: 'annonces',
            component: MesAnnoncesComponent,
            title: 'Mes Annonces - Douala-city'
          }

        ]
      },
      {
        path: 'dashboard-client',
        component: DashboardClientComponent,
        title: 'Mon Espace - Douala-city',
        canActivate: [authGuard],
        data: { expectedRoles: ['USER'] },
        children: [
          {
            path: '',
            component: MesAnnoncesComponent
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
