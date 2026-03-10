import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastComponent } from './toast/toast.component';
import { GlobalLoaderComponent } from './global-loader/global-loader.component';
import { CarteComponent } from '../admin/carte/carte.component';
import { StructureCardComponent } from './components/structure-card/structure-card.component';
import { NotificationsCenterComponent } from './notifications-center/notifications-center.component';



@NgModule({
  declarations: [
    ToastComponent,
    GlobalLoaderComponent,
    CarteComponent,
    StructureCardComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    NotificationsCenterComponent
  ],
  exports: [
    ToastComponent,
    GlobalLoaderComponent,
    CarteComponent,
    StructureCardComponent,
    NotificationsCenterComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class SharedModule { }
