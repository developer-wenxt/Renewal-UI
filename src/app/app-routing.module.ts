import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OprationHeaderDashboardComponent } from './pages/opration-header-dashboard/opration-header-dashboard.component';
import { CustomerDetailsComponent } from './pages/customer-details/customer-details.component';
import { ProductsComponent } from './pages/products/products.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { NavBarComponent } from './pages/nav-bar/nav-bar.component';
import { BrokerComponent } from './pages/broker/broker.component';
import { ViewRiskDetailsComponent } from './pages/view-risk-details/view-risk-details.component';
import { NewBusinessDashboardComponent } from './pages/new-business-dashboard/new-business-dashboard.component';
import { NewBusinessProductsComponent } from './pages/new-business-products/new-business-products.component';
import { NewBusinessCustomerDetailsComponent } from './pages/new-business-customer-details/new-business-customer-details.component';
import { NewBusinessBrokerComponent } from './pages/new-business-broker/new-business-broker.component';
import { NewBusinessRiskDetailsComponent } from './pages/new-business-risk-details/new-business-risk-details.component';
import { RenewalApprovalComponent } from './pages/renewal-approval/renewal-approval.component';
import { HomeComponent } from './pages/home/home.component';
import { CustomerViewPolicyDetailsComponent } from './pages/customer-view-policy-details/customer-view-policy-details.component';
import { SmsCountDetailsComponent } from './pages/sms-count-details/sms-count-details.component';
import { ProductGridComponent } from './pages/product-grid/product-grid.component';
import { NewBusinessProductsGridComponent } from './pages/new-business-products-grid/new-business-products-grid.component';

const routes: Routes = [
  // { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '', component: PageNotFoundComponent },
  { path: 'dashboard', component: OprationHeaderDashboardComponent },
  { path: 'branch-dashboard', component: CustomerDetailsComponent },
  { path: 'broker', component: BrokerComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'risk-details', component: ViewRiskDetailsComponent },
  { path: 'new-business-dashboard', component: NewBusinessDashboardComponent },
  { path: 'new-business-products', component: NewBusinessProductsComponent },
  { path: 'new-business-branch-dashboard', component: NewBusinessCustomerDetailsComponent },
  { path: 'new-business-broker', component: NewBusinessBrokerComponent },
  { path: 'new-business-risk-details', component: NewBusinessRiskDetailsComponent },
  { path: 'renewal/renewal-approval', component: RenewalApprovalComponent },
  { path: 'view-policy-details', component: CustomerViewPolicyDetailsComponent },
  { path: 'home', component: HomeComponent },
  { path: 'transaction-sms-list', component: SmsCountDetailsComponent },
  { path: 'products-list', component: ProductGridComponent },
  { path: 'new-business-products-list', component: NewBusinessProductsGridComponent },
  { path: '**', component: PageNotFoundComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
