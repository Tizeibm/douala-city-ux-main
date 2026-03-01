import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';
import { DashboardHomeComponent } from './dashboard-home/dashboard-home.component';
import { ValidationComponent } from './validation/validation.component';
import { EntreprisesComponent } from './entreprises/entreprises.component';
import { StatistiquesComponent } from './statistiques/statistiques.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './login/login.component';
import { ContentComponent } from './content/content.component';
import { StructureDetailsComponent } from './structure-details/structure-details.component';
import { SharedModule } from '../shared/shared.module';


import { EditStructureComponent } from './edit-structure/edit-structure.component';
import { CarteComponent } from './carte/carte.component';
import { FiltrerStructuresComponent } from './filtrer-structures/filtrer-structures.component';


@NgModule({
  declarations: [
    SidebarComponent,
    HeaderComponent,
    DashboardHomeComponent,
    ValidationComponent,
    EntreprisesComponent,
    StatistiquesComponent,
    LoginComponent,
    ContentComponent,
    StructureDetailsComponent,
    EditStructureComponent,
    FiltrerStructuresComponent


  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    SharedModule

  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class AdminModule { }
