import { AfterContentChecked, ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { Observable } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { CustomLoadingService } from './services/custom-loading.service';
import { SidebarService } from './services/sidebar.service';
import { SharedService } from './services/shareService';
import { config } from '../app/helpers/appconfig';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterContentChecked {
  title = 'RenewalUI';
  public loading$!: Observable<any>;
  items: MenuItem[] | undefined;
  public CommonApiUrl: any = config.CommonApiUrl;
  showSidebar = false;
  userDetails: any
  currentUrl: any
  constructor(private router: Router,
    private cdr: ChangeDetectorRef,
    private shared: SharedService,
    //  private sessionStorageService: SessionStorageService,
    public customLoder: CustomLoadingService, private sidebarService: SidebarService,
  ) {

    this.sidebarService.userType$.subscribe(value => {

      let d = JSON.parse(sessionStorage.getItem('Userdetails') as any);
      this.userDetails = d?.Result;
      if (this.userDetails) {
        if (this.userDetails.UserType == 'Issuer') {
          this.showSidebar = false
        }
        else {
          this.showSidebar = false;
        }
      }

    });
  }
  ngOnInit(): void {
    this.loading$ = this.customLoder.loader;
    this.customLoder.loader.subscribe(val => console.log('Loader status:', val));
    this.userTypeCheck();
    this.items = [
      {
        label: 'Dashboard',
        icon: 'pi pi-th-large',
        command: () => this.onDashboardClick()
      },
      {
        label: 'Products',
        icon: 'pi pi-shopping-bag',
        command: () => this.onProductClick()
      }
    ]
  }
  get showNavBar(): boolean {
    return this.currentUrl !== '/home' && this.currentUrl !== '/view-policy-details' && this.currentUrl !=='/risk-details?status=customer';
  }
  onDashboardClick() {
    this.router.navigate(['/dashboard'])
  }
  onProductClick() {
    this.router.navigate(['/products'])
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.currentUrl = this.router.url;
    });
  }

  ngAfterContentChecked() {
    this.loading$ = this.customLoder.loader;
    this.cdr.detectChanges();
  }

  @HostListener('window:keydown')
  @HostListener('window:mousedown')

  @HostListener("window:beforeunload", ["$event"])
  unloadHandler(event: Event) {
    this.processData();
  }

  processData() {
    // sessionStorage.setItem('sessionStorgaeModel', JSON.stringify(this.sessionStorageService.sessionStorgaeModel));
  }

  @HostListener('window:load', ['$event'])
  onPageLoad(event: Event) {
    sessionStorage.removeItem('sessionStorgaeModel');

  }

  userTypeCheck() {
    // this.sidebarService.userType$.subscribe(value => {
    // let d: any = value
    // if (d) {
    //   if (d[0]?.userCode == 'Broker') {
    //     this.router.navigate(['/branch-dashboard'])
    //   }
    //   else if (d[0]?.userCode == 'Issuer') {
    //     this.router.navigate(['/products'])
    //   }
    //   else {
    //     this.router.navigate(['/dashboard'])
    //   }
    // }
    // else {
    //   this.router.navigate(['/dashboard'])
    // }

    // });
  }
  getMenuList() {
    const urlLink = `${this.CommonApiUrl}admin/getmenulist`;
    const ReqObj = {
      LoginId: this.userDetails.LoginId,
      UserType: this.userDetails.UserType,
      SubUserType: this.userDetails.SubUserType,
      InsuranceId: this.userDetails.InsuranceId,
      ProductId: this.userDetails.productId,
    };
    this.shared.onPostMethodBearerSync(urlLink, ReqObj).subscribe(
      (data: any) => {
        console.log(data, "menulist");
        if (data.Result) {
          let filteredList = data.Result.filter((ele: { ProductId: any; }) => ele.ProductId == this.userDetails.productId);
          sessionStorage.setItem('MenuList', JSON.stringify(filteredList))
          // this.onSelectProduct();

        }
      },

      (err: any) => {
        console.log(err);
      },
    );
  }
}
