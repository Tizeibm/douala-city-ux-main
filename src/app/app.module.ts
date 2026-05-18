import { ChatService } from './core/services/chat.service';
import { ChatbotComponent } from './website/components/chatbot/chatbot.component';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './website/components/header/header.component';
import { FooterComponent } from './website/components/footer/footer.component';

import { ContactComponent } from './website/components/contact/contact.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccueilComponent } from './website/pages/accueil/accueil.component';
import { HttpClientModule, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { apiInterceptor } from './core/api.interceptor';
import { SidebarComponent } from './admin/sidebar/sidebar.component';
import { DashboardHomeComponent } from './admin/dashboard-home/dashboard-home.component';
import { ValidationComponent } from './admin/validation/validation.component';
import { EntreprisesComponent } from './admin/entreprises/entreprises.component';
import { StatistiquesComponent } from './admin/statistiques/statistiques.component';
import { AppliComponent } from './features/appli/appli.component';
import { AnnoncesComponent } from './features/annonces/annonces/annonces.component';
import { RechercheComponent } from './features/entreprises/recherche/recherche.component';
import { LoginLogoutComponent } from './features/auth/login-logout/login-logout.component';
import { ResultatsComponent } from './features/entreprises/resultats/resultats.component';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardUserComponent } from './features/dashboard/dashboard-user/dashboard-user.component';
import { SidebarUserComponent } from './features/dashboard/sidebar-user/sidebar-user.component';
import { AddEntrepriseComponent } from './features/entreprises/add-entreprise/add-entreprise.component';
import { CommonModule } from '@angular/common';
import { EntrepriseComponent } from './features/entreprises/entreprise/entreprise.component';
import { MapComponent } from './shared/components/map/map.component';
import { StructureUserComponent } from './features/entreprises/structure-user/structure-user.component';
import { ProfileSettingsComponent } from './features/user/profile-settings/profile-settings.component';
import { AddAnnonceComponent } from './features/annonces/annonces/components/add-annonce/add-annonce.component';
import { EditAnnonceComponent } from './features/annonces/annonces/components/edit-annonce/edit-annonce.component';

import { UserComponent } from './features/user/user/user.component';
import { FiltrerStructuresComponent } from './admin/filtrer-structures/filtrer-structures.component';
import { CarteComponent } from './admin/carte/carte.component';
import { AdminModule } from './admin/admin.module';
import { CartesComponent } from './features/cartes/cartes.component';
import { UserEditStructureComponent } from './features/entreprises/user-edit-structure/user-edit-structure.component';
import { AvisModule } from './features/avis/avis.module';
import { GlobalLoaderComponent } from './shared/global-loader/global-loader.component';
import { SharedModule } from './shared/shared.module';
import { AnnonceDetailsComponent } from './features/annonces/annonce-details/annonce-details.component';
import { CategoryListingComponent } from './website/pages/category-listing/category-listing.component';
import { VueEnsembleComponent } from './features/dashboard/dashboard-user/vue-ensemble/vue-ensemble.component';
import { MesAnnoncesComponent } from './features/annonces/annonces/components/mes-annonces/mes-annonces.component';
import { DashboardClientComponent } from './features/dashboard/dashboard-client/dashboard-client.component';
import { SidebarClientComponent } from './features/dashboard/dashboard-client/sidebar-client/sidebar-client.component';
import { CookieBannerComponent } from './shared/components/cookie-banner/cookie-banner.component';
import { StructureEditPageComponent } from './features/dashboard/dashboard-user/structure-edit-page/structure-edit-page.component';
import { StructureDetailComponent } from './website/pages/structure-detail/structure-detail.component';
import { NotFoundComponent } from './website/pages/not-found/not-found.component';
import { AboutPageComponent } from './website/pages/a-propos/about.component';
import { ContactPageComponent } from './website/pages/contact/contact.component';
import { PrivacyPageComponent } from './website/pages/confidentialite/privacy.component';
import { LegalPageComponent } from './website/pages/mentions-legales/legal.component';
import { MobileNavbar } from './website/components/mobile-navbar/mobile-navbar';
import { MesFavorisComponent } from './features/dashboard/dashboard-user/mes-favoris/mes-favoris.component';



@NgModule({
  declarations: [
    AppComponent,
    ChatbotComponent,
    HeaderComponent,
    FooterComponent,
    ContactComponent,
    AccueilComponent,
    EntrepriseComponent,
    AppliComponent,
    AnnoncesComponent,
    RechercheComponent,
    LoginLogoutComponent,
    ResultatsComponent,
    LoginComponent,
    DashboardUserComponent,
    SidebarUserComponent,
    AddEntrepriseComponent,
    MapComponent,
    StructureUserComponent,
    UserComponent,
    CartesComponent,
    UserEditStructureComponent,
    ProfileSettingsComponent,
    AddAnnonceComponent,
    AnnonceDetailsComponent,
    CategoryListingComponent,
    VueEnsembleComponent,
    MesAnnoncesComponent,
    DashboardClientComponent,
    SidebarClientComponent,
    CookieBannerComponent,
    EditAnnonceComponent,
    StructureEditPageComponent,
    StructureDetailComponent,
    NotFoundComponent,
    AboutPageComponent,
    ContactPageComponent,
    PrivacyPageComponent,
    LegalPageComponent,
    MobileNavbar,
    MesFavorisComponent



  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    FormsModule,
    AvisModule,
    AdminModule,
    ReactiveFormsModule,
    SharedModule
  ],
  providers: [
    provideHttpClient(withFetch(), withInterceptors([apiInterceptor])),
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
