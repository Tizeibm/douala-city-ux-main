import { ChatService } from './services/chat.service';
import { ChatbotComponent } from './website/components/chatbot/chatbot.component';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './website/components/header/header.component';
import { FooterComponent } from './website/components/footer/footer.component';

import { CategoriesComponent } from './website/components/categories/categories.component';
import { ContactComponent } from './website/components/contact/contact.component';
import { RegisterBusinessComponent } from './website/registration/register-business/register-business.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MainComponent } from './website/components/main/main.component';
import { ServicePageComponent } from './website/pages/service-page/service-page.component';
import { CategoriepageComponent } from './website/pages/categoriepage/categoriepage.component';
import { ContactpageComponent } from './website/pages/contactpage/contactpage.component';
import { AccueilComponent } from './website/pages/accueil/accueil.component';
import { BodyComponent } from './website/components/body/body.component';
import { HttpClientModule, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { apiInterceptor } from './api.interceptor';
import { SidebarComponent } from './admin/sidebar/sidebar.component';
import { DashboardHomeComponent } from './admin/dashboard-home/dashboard-home.component';
import { ValidationComponent } from './admin/validation/validation.component';
import { EntreprisesComponent } from './admin/entreprises/entreprises.component';
import { StatistiquesComponent } from './admin/statistiques/statistiques.component';
import { AppliComponent } from './appli/appli.component';
import { CommercesComponent } from './commerces/commerces.component';
import { InstitutionsComponent } from './institutions/institutions.component';
import { EcolesComponent } from './ecoles/ecoles.component';
import { HopitauxComponent } from './hopitaux/hopitaux.component';
import { AnnoncesComponent } from './annonces/annonces.component';
import { RechercheComponent } from './recherche/recherche.component';
import { LoginLogoutComponent } from './login-logout/login-logout.component';
import { ResultatsComponent } from './resultats/resultats.component';
import { LoginComponent } from './login/login.component';
import { DashboardUserComponent } from './dashboard-user/dashboard-user.component';
import { SidebarUserComponent } from './sidebar-user/sidebar-user.component';
import { AddEntrepriseComponent } from './add-entreprise/add-entreprise.component';
import { StatsComponent } from './stats/stats.component';
import { CommonModule } from '@angular/common';
import { EntrepriseComponent } from './entreprise/entreprise.component';
import { MapComponent } from './map/map.component';
import { StructureUserComponent } from './structure-user/structure-user.component';
import { ProfileSettingsComponent } from './profile-settings/profile-settings.component';
import { AddAnnonceComponent } from './annonces/components/add-annonce/add-annonce.component';

import { UserComponent } from './user/user.component';
import { FiltrerStructuresComponent } from './admin/filtrer-structures/filtrer-structures.component';
import { CarteComponent } from './admin/carte/carte.component';
import { AdminModule } from './admin/admin.module';
import { UserStructureDetComponent } from './user-structure-det/user-structure-det.component';
import { CartesComponent } from './cartes/cartes.component';
import { UserEditStructureComponent } from './user-edit-structure/user-edit-structure.component';
import { StructDetailsComponent } from './struct-details/struct-details.component';
import { LoisirsComponent } from './loisirs/loisirs.component';
import { RestaurationComponent } from './restauration/restauration.component';
import { HebergementComponent } from './hebergement/hebergement.component';
import { TransportComponent } from './transport/transport.component';
import { ServicesComponent } from './services/services.component';
import { AvisModule } from './avis/avis.module';
import { GlobalLoaderComponent } from './shared/global-loader/global-loader.component';
import { SharedModule } from './shared/shared.module';
import { AnnonceDetailsComponent } from './annonce-details/annonce-details.component';


@NgModule({
  declarations: [
    AppComponent,
    ChatbotComponent,
    HeaderComponent,
    FooterComponent,
    ServicesComponent,
    CategoriesComponent,
    ContactComponent,
    RegisterBusinessComponent,
    MainComponent,
    ServicePageComponent,
    CategoriepageComponent,
    ContactpageComponent,
    AccueilComponent,
    BodyComponent,
    EntrepriseComponent,
    AppliComponent,
    CommercesComponent,
    InstitutionsComponent,
    EcolesComponent,
    HopitauxComponent,
    AnnoncesComponent,
    RechercheComponent,
    LoginLogoutComponent,
    ResultatsComponent,
    LoginComponent,
    DashboardUserComponent,
    SidebarUserComponent,
    AddEntrepriseComponent,
    StatsComponent,
    MapComponent,
    StructureUserComponent,
    UserComponent,
    UserStructureDetComponent,
    CartesComponent,
    UserEditStructureComponent,
    StructDetailsComponent,
    LoisirsComponent,
    RestaurationComponent,
    HebergementComponent,
    TransportComponent,
    ProfileSettingsComponent,
    AddAnnonceComponent,
    AnnonceDetailsComponent



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
