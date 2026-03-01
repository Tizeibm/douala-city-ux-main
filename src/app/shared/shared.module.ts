import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastComponent } from './toast/toast.component';
import { GlobalLoaderComponent } from './global-loader/global-loader.component';
import { CarteComponent } from '../admin/carte/carte.component';
import { StructureCardComponent } from './components/structure-card/structure-card.component';



@NgModule({
  declarations: [
    ToastComponent,
    GlobalLoaderComponent,
    CarteComponent,
    StructureCardComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ToastComponent,
    GlobalLoaderComponent,
    CarteComponent,
    StructureCardComponent
  ]
})
export class SharedModule { }
