import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClaimRoutingModule } from './claim-routing.module';
import { ClaimComponent } from './claim.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AccordionModule } from 'primeng/accordion';
import { BadgeModule } from 'primeng/badge';
import { CardModule } from 'primeng/card';
import { CarouselModule } from 'primeng/carousel';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TabViewModule } from 'primeng/tabview';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { DropdownModule } from 'primeng/dropdown';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ProgressBarModule } from 'primeng/progressbar';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { AppComponent } from '../../app.component';


@NgModule({
  bootstrap: [AppComponent],
   schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  declarations: [
    ClaimComponent,
    DashboardComponent
  ],
  imports: [
    CommonModule,
    ClaimRoutingModule,
    CarouselModule,
    BadgeModule,
    CardModule,
    ConfirmDialogModule,
    RadioButtonModule,
    AccordionModule,
    MenubarModule,
    MenuModule,
    DialogModule,
    ConfirmDialogModule,
    TabViewModule,
    ButtonModule,
    CheckboxModule,
    TooltipModule,
    CalendarModule,
    InputIconModule,
    ProgressBarModule,
    OverlayPanelModule,
    ConfirmPopupModule,
    SelectButtonModule,
    ToastModule,
    FormsModule,
    InputTextModule,
    DropdownModule,
    TagModule,
    IconFieldModule,
    TableModule,
  ]
})
export class ClaimModule { }
