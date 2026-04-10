import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { EntrepriseComponent } from './features/entreprises/entreprise/entreprise.component';
import { AccueilComponent } from './website/pages/accueil/accueil.component';
import { AppliComponent } from './features/appli/appli.component';
import { LoginLogoutComponent } from './features/auth/login-logout/login-logout.component';
import { AnnoncesComponent } from './features/annonces/annonces/annonces.component';
import { RechercheComponent } from './features/entreprises/recherche/recherche.component';
import { ResultatsComponent } from './features/entreprises/resultats/resultats.component';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardUserComponent } from './features/dashboard/dashboard-user/dashboard-user.component';
import { authGuard } from './core/auth.guard';
import { AddEntrepriseComponent } from './features/entreprises/add-entreprise/add-entreprise.component';
import { StructureUserComponent } from './features/entreprises/structure-user/structure-user.component';
import { StructureDetailComponent } from './website/pages/structure-detail/structure-detail.component';
import { AjouterAvisComponent } from './features/avis/components/ajouter-avis/ajouter-avis.component';
import { AvisListComponent } from './features/avis/components/avis-list/avis-list.component';
import { ReplyAvisComponent } from './features/avis/components/reply-avis/reply-avis.component';
import { EditAvisComponent } from './features/avis/edit-avis/edit-avis.component';
import { ProfileSettingsComponent } from './features/user/profile-settings/profile-settings.component';
import { AddAnnonceComponent } from './features/annonces/annonces/components/add-annonce/add-annonce.component';
import { AnnonceDetailsComponent } from './features/annonces/annonce-details/annonce-details.component';
import { EditAnnonceComponent } from './features/annonces/annonces/components/edit-annonce/edit-annonce.component';
import { CategoryListingComponent } from './website/pages/category-listing/category-listing.component';
import { VueEnsembleComponent } from './features/dashboard/dashboard-user/vue-ensemble/vue-ensemble.component';
import { MesAnnoncesComponent } from './features/annonces/annonces/components/mes-annonces/mes-annonces.component';
import { DashboardClientComponent } from './features/dashboard/dashboard-client/dashboard-client.component';
import { StructureEditPageComponent } from './features/dashboard/dashboard-user/structure-edit-page/structure-edit-page.component';
import { NotFoundComponent } from './website/pages/not-found/not-found.component';
import { AboutPageComponent } from './website/pages/a-propos/about.component';
import { ContactPageComponent } from './website/pages/contact/contact.component';
import { PrivacyPageComponent } from './website/pages/confidentialite/privacy.component';
import { LegalPageComponent } from './website/pages/mentions-legales/legal.component';


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
        path: 'a-propos',
        component: AboutPageComponent,
        title: 'À propos - Douala-city'
      },
      {
        path: 'contact',
        component: ContactPageComponent,
        title: 'Contact - Douala-city'
      },
      {
        path: 'confidentialite',
        component: PrivacyPageComponent,
        title: 'Confidentialité - Douala-city'
      },
      {
        path: 'mentions-legales',
        component: LegalPageComponent,
        title: 'Mentions Légales - Douala-city'
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
      },
      {
        path: '**',
        component: NotFoundComponent,
        title: '404 - Page non trouvée - Douala-city'
      }
    ]
  }


];





@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
