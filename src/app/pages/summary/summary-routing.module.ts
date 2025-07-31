import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SummaryComponent } from './summary.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProductWiseCountComponent } from './product-wise-count/product-wise-count.component';
import { DateWiseCountComponent } from './date-wise-count/date-wise-count.component';
import { SamplePdfComponent } from './sample-pdf/sample-pdf.component';

const routes: Routes = [
  { path: '', component: SummaryComponent },
  { path: 'dashboard', component: DashboardComponent },
  // { path: 'dashboard', component: SamplePdfComponent },
  { path: 'product-wise-count', component: ProductWiseCountComponent },
  { path: 'date-wise-count', component: DateWiseCountComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SummaryRoutingModule { }
