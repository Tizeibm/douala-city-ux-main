import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AvisRoutingModule } from './avis-routing.module';
import { AjouterAvisComponent } from './components/ajouter-avis/ajouter-avis.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AvisListComponent } from './components/avis-list/avis-list.component';
import { ReplyAvisComponent } from './components/reply-avis/reply-avis.component';
import { EditAvisComponent } from './edit-avis/edit-avis.component';


@NgModule({
  declarations: [
    AjouterAvisComponent,
    AvisListComponent,
    ReplyAvisComponent,
    EditAvisComponent
  ],
  imports: [
    CommonModule,
    AvisRoutingModule, 
    FormsModule, 
    RouterModule,
    ReactiveFormsModule
   
  ],
  exports: [
    AjouterAvisComponent,
    EditAvisComponent,
    RouterModule
  ]
})
export class AvisModule { }
