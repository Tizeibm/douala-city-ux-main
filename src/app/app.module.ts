import { ChatService } from './services/chat.service';
import { ChatbotComponent } from './website/components/chatbot/chatbot.component';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './website/components/header/header.component';
import { FooterComponent } from './website/components/footer/footer.component';

import { ContactComponent } from './website/components/contact/contact.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccueilComponent } from './website/pages/accueil/accueil.component';
import { HttpClientModule, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { apiInterceptor } from './api.interceptor';
import { SidebarComponent } from './admin/sidebar/sidebar.component';
import { DashboardHomeComponent } from './admin/dashboard-home/dashboard-home.component';
import { ValidationComponent } from './admin/validation/validation.component';
import { EntreprisesComponent } from './admin/entreprises/entreprises.component';
import { StatistiquesComponent } from './admin/statistiques/statistiques.component';
import { AppliComponent } from './appli/appli.component';
import { AnnoncesComponent } from './annonces/annonces.component';
import { RechercheComponent } from './recherche/recherche.component';
import { LoginLogoutComponent } from './login-logout/login-logout.component';
import { ResultatsComponent } from './resultats/resultats.component';
import { LoginComponent } from './login/login.component';
import { DashboardUserComponent } from './dashboard-user/dashboard-user.component';
import { SidebarUserComponent } from './sidebar-user/sidebar-user.component';
import { AddEntrepriseComponent } from './add-entreprise/add-entreprise.component';
import { CommonModule } from '@angular/common';
import { EntrepriseComponent } from './entreprise/entreprise.component';
import { MapComponent } from './map/map.component';
import { StructureUserComponent } from './structure-user/structure-user.component';
import { ProfileSettingsComponent } from './profile-settings/profile-settings.component';
import { AddAnnonceComponent } from './annonces/components/add-annonce/add-annonce.component';
import { EditAnnonceComponent } from './annonces/components/edit-annonce/edit-annonce.component';

import { UserComponent } from './user/user.component';
import { FiltrerStructuresComponent } from './admin/filtrer-structures/filtrer-structures.component';
import { CarteComponent } from './admin/carte/carte.component';
import { AdminModule } from './admin/admin.module';
import { CartesComponent } from './cartes/cartes.component';
import { UserEditStructureComponent } from './user-edit-structure/user-edit-structure.component';
import { AvisModule } from './avis/avis.module';
import { GlobalLoaderComponent } from './shared/global-loader/global-loader.component';
import { SharedModule } from './shared/shared.module';
import { AnnonceDetailsComponent } from './annonce-details/annonce-details.component';
import { CategoryListingComponent } from './website/pages/category-listing/category-listing.component';
import { VueEnsembleComponent } from './dashboard-user/vue-ensemble/vue-ensemble.component';
import { MesAnnoncesComponent } from './annonces/components/mes-annonces/mes-annonces.component';
import { DashboardClientComponent } from './dashboard-client/dashboard-client.component';
import { SidebarClientComponent } from './dashboard-client/sidebar-client/sidebar-client.component';
import { CookieBannerComponent } from './shared/components/cookie-banner/cookie-banner.component';
import { StructureEditPageComponent } from './dashboard-user/structure-edit-page/structure-edit-page.component';
import { StructureDetailComponent } from './website/pages/structure-detail/structure-detail.component';



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
    StructureDetailComponent



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
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptors([apiInterceptor])),
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class AppModule { }
