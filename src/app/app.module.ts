import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { NavBarComponent } from './pages/nav-bar/nav-bar.component';
import { OprationHeaderDashboardComponent } from './pages/opration-header-dashboard/opration-header-dashboard.component';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { CarouselModule } from 'primeng/carousel';
import { SelectButtonModule } from 'primeng/selectbutton';
import { HTTP_INTERCEPTORS, provideHttpClient } from '@angular/common/http';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { AuthService } from './helpers/auth/Auth/auth.service';
import { HttpInterceptorService } from './HttpInterceptors/http-interceptor.service';
import { MenubarModule } from 'primeng/menubar';
import { CustomerDetailsComponent } from './pages/customer-details/customer-details.component';
import { ProductsComponent } from './pages/products/products.component';
import { BadgeModule } from 'primeng/badge';
import { MenuModule } from 'primeng/menu';
import { SideMenuComponent } from './pages/side-menu/side-menu.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { DatePipe } from '@angular/common';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { BrokerComponent } from './pages/broker/broker.component';
import { ViewRiskDetailsComponent } from './pages/view-risk-details/view-risk-details.component';
import { AccordionModule } from 'primeng/accordion';
import { CardModule } from 'primeng/card';
import { NewBusinessDashboardComponent } from './pages/new-business-dashboard/new-business-dashboard.component';
import { NewBusinessProductsComponent } from './pages/new-business-products/new-business-products.component';
import { NewBusinessCustomerDetailsComponent } from './pages/new-business-customer-details/new-business-customer-details.component';
import { NewBusinessRiskDetailsComponent } from './pages/new-business-risk-details/new-business-risk-details.component';
import { NumberCommaPipe } from './pages/pipes/number-comma.pipe';
import { NewBusinessBrokerComponent } from './pages/new-business-broker/new-business-broker.component';


@NgModule({
  declarations: [
    AppComponent,
    NavBarComponent,
    OprationHeaderDashboardComponent,
    CustomerDetailsComponent,
    ProductsComponent,
    SideMenuComponent,
    PageNotFoundComponent,
    BrokerComponent,
    ViewRiskDetailsComponent,
    NewBusinessDashboardComponent,
    NewBusinessProductsComponent,
    NewBusinessCustomerDetailsComponent,
    NewBusinessRiskDetailsComponent,
    NumberCommaPipe,
    NewBusinessBrokerComponent,

  ],
  imports: [
    BrowserModule,
    CarouselModule,
    BadgeModule,
    CardModule,
    AccordionModule,
    MenubarModule,
    MenuModule,
    DialogModule,
    BrowserAnimationsModule,
    ButtonModule,
    CalendarModule,
    InputIconModule,
    ProgressBarModule,
    OverlayPanelModule,
    SelectButtonModule,
    ToastModule,
    FormsModule,
    InputTextModule,
    DropdownModule,
    TagModule,
    IconFieldModule,
    TableModule,
    AppRoutingModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true,
    },
    DatePipe,
    provideAnimations(), provideHttpClient(), AuthService,
    { provide: LocationStrategy, useClass: HashLocationStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
