import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SummaryRoutingModule } from './summary-routing.module';
import { SummaryComponent } from './summary.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { CarouselModule } from 'primeng/carousel';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { DialogModule } from 'primeng/dialog';
import { InputIconModule } from 'primeng/inputicon';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ProgressBarModule } from 'primeng/progressbar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ProductWiseCountComponent } from './product-wise-count/product-wise-count.component';
import { DateWiseCountComponent } from './date-wise-count/date-wise-count.component';
import { SamplePdfComponent } from './sample-pdf/sample-pdf.component';
import { ClaimSummaryDashboardComponent } from './claim-summary-dashboard/claim-summary-dashboard.component';
import { ClaimProductWiseCountComponent } from './claim-product-wise-count/claim-product-wise-count.component';
import { ClaimDateWiseCountComponent } from './claim-date-wise-count/claim-date-wise-count.component';
import { ClaimSummaryMonthlypaidProductWiseCountComponent } from './claim-summary-monthlypaid-product-wise-count/claim-summary-monthlypaid-product-wise-count.component';
import { ClaimSummaryMonthlypaidDateWiseCountComponent } from './claim-summary-monthlypaid-date-wise-count/claim-summary-monthlypaid-date-wise-count.component';
// import { NumberCommaPipe } from '../pipes/number-comma.pipe';



@NgModule({
  declarations: [
    SummaryComponent,
    // NumberCommaPipe,
    DashboardComponent,
    ProductWiseCountComponent,
    DateWiseCountComponent,
    SamplePdfComponent,
    ClaimSummaryDashboardComponent,
    ClaimProductWiseCountComponent,
    ClaimDateWiseCountComponent,
    ClaimSummaryMonthlypaidProductWiseCountComponent,
    ClaimSummaryMonthlypaidDateWiseCountComponent
  ],
  imports: [
    CommonModule,
    SummaryRoutingModule,
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
export class SummaryModule { }
