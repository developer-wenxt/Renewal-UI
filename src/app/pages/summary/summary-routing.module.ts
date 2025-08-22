import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SummaryComponent } from './summary.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProductWiseCountComponent } from './product-wise-count/product-wise-count.component';
import { DateWiseCountComponent } from './date-wise-count/date-wise-count.component';
import { SamplePdfComponent } from './sample-pdf/sample-pdf.component';
import { ClaimSummaryDashboardComponent } from './claim-summary-dashboard/claim-summary-dashboard.component';
import { ClaimProductWiseCountComponent } from './claim-product-wise-count/claim-product-wise-count.component';
import { ClaimDateWiseCountComponent } from './claim-date-wise-count/claim-date-wise-count.component';
import { ClaimSummaryMonthlypaidProductWiseCountComponent } from './claim-summary-monthlypaid-product-wise-count/claim-summary-monthlypaid-product-wise-count.component';
import { ClaimSummaryMonthlypaidDateWiseCountComponent } from './claim-summary-monthlypaid-date-wise-count/claim-summary-monthlypaid-date-wise-count.component';

const routes: Routes = [
  { path: '', component: SummaryComponent },
  { path: 'dashboard', component: DashboardComponent },
  // { path: 'dashboard', component: SamplePdfComponent },
  { path: 'product-wise-count', component: ProductWiseCountComponent },
  { path: 'date-wise-count', component: DateWiseCountComponent },
  { path: 'claim-summary-dashboard', component: ClaimSummaryDashboardComponent },
  { path: 'claim-product-wise-count', component: ClaimProductWiseCountComponent },
  { path: 'claim-date-wise-count', component: ClaimDateWiseCountComponent },
  { path: 'monthly-paid-product-wise-count', component: ClaimSummaryMonthlypaidProductWiseCountComponent },
  { path: 'monthly-paid-date-wise-count', component: ClaimSummaryMonthlypaidDateWiseCountComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SummaryRoutingModule { }
