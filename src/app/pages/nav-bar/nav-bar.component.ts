import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
// import { config } from '../../../helpers/appconfig';
// import { SharedService } from '../../../services/shareService';
// import { AuthService } from '../../../helpers/auth/Auth/auth.service';
// import Swal from 'sweetalert2';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { SideMenuComponent } from '../side-menu/side-menu.component';
import { SidebarService } from '../../services/sidebar.service';
import { SharedService } from '../../services/shareService';
import { AuthService } from '../../helpers/auth/Auth/auth.service';
import { config } from '../../helpers/appconfig';

@Component({
  selector: 'app-nav-bar',
  standalone: false,
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css'
})
export class NavBarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
  @ViewChild(SideMenuComponent) sidemenu!: SideMenuComponent;
  public CommonApiUrl: any = config.CommonApiUrl;
  items: MenuItem[] = [];
  activeItem: string = '';
  userOptions: any[] = [];
  loginId: any;
  InsuranceId: any
  currentUrl: any
  user_list: any[] = []; userDetails: any;
  SelectedUserType: any = 'Broker';
  public RenewalApiUrl: any = config.RenewalApiUrl;
  constructor(private router: Router, private sidebarService: SidebarService, private authService: AuthService, private shared: SharedService, private route: ActivatedRoute) {
    // this.sidebarService.userType$.subscribe(value => {

    //   this.userDetails = value
    // if(this.userDetails){
    //   getBrokerwiseData
    // }
    // if(this.userDetails[0]?.userCode =='Broker'){

    // }
    // });


    setTimeout(() => {
      let d = JSON.parse(sessionStorage.getItem('Userdetails') as any);
      this.userDetails = d?.Result;
      this.InsuranceId = this.userDetails?.InsuranceId,
        this.loginId = this.userDetails?.LoginId;
      const urlLink = `${this.CommonApiUrl}admin/getmenulist`;
      const ReqObj = {
        LoginId: this.userDetails?.LoginId,
        UserType: this.userDetails?.UserType,
        SubUserType: this.userDetails?.SubUserType,
        InsuranceId: this.userDetails?.InsuranceId,
        ProductId: this.userDetails?.ProductId,
      };
      console.log(ReqObj, "ReqObjReqObj");
      if (this.userDetails?.SubUserType != 'b2c') {
        this.shared.onPostMethodBearerSync(urlLink, ReqObj).subscribe(
          (data: any) => {
            if (data.Result) {
              let filteredList = data.Result.filter((ele: { ProductId: any; }) => ele.ProductId == this.userDetails.ProductId);
              sessionStorage.setItem('MenuList', JSON.stringify(filteredList))
              // this.onSelectProduct();
              this.items = this.buildMenuItems(filteredList);
              this.activeItem = 'Renewal DashBoard';

            }
          },

          (err: any) => {
            console.log(err);
          },
        );
      }

    }, 200);

  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.currentUrl = this.router.url;
    });
  }
  ngOnInit(): void {
    this.userOptions = [
      { label: 'Logout', value: 'logout', icon: 'pi pi-power-off', command: () => { this.setLogout(); } },
    ]
    // this.activeItem = 'Renewal Business';
    // this.items = [
    //   {
    //     label: 'New Business',
    //     icon: 'pi pi-th-large',
    //     command: () => {
    //       this.setActiveItem('New Business');
    //       this.NewBussiness();
    //     }
    //   },
    //   {
    //     label: 'Renewal Business',
    //     icon: 'pi pi-pencil',
    //     command: () => {
    //       this.setActiveItem('Renewal Business');
    //       this.onDashboardClick();
    //     }
    //   },
    //   {
    //     label: 'Claim',
    //     icon: 'pi pi-bolt',
    //     command: () => {
    //       this.setActiveItem('Claim');
    //       this.onClaimClick();
    //     }
    //   },
    //   {
    //     label: 'Budget',
    //     icon: 'pi pi-palette',
    //     command: () => {
    //       this.setActiveItem('Budget');
    //       this.onBudgetClick();
    //     }
    //   }
    // ];
    // this.onDashboardClick();
    // let d = JSON.parse(sessionStorage.getItem('MenuList') as any);
    // console.log(d,"items");


    // this.items = this.buildMenuItems(d);
    // this.activeItem = 'Renewal DashBoard';
    this.onUserChange(this.SelectedUserType)
  }

  buildMenuItems(menu: any[]): MenuItem[] {
    return menu.map((item) => {
      const menuItem: MenuItem = {
        label: item.title,
        icon: item.icon,
        command: () => this.handleMenuClick(item.title)
      };

      if (item.children && item.children.length > 0) {
        menuItem.items = item.children.map((child: any) => ({
          label: child.title,
          icon: child.icon,
          command: () => this.handleMenuClick(child.title)
        }));
      }

      return menuItem;
    });
  }

  handleMenuClick(label: string): void {
    this.setActiveItem(label);

    switch (label) {
      case 'Renewal DashBoard':
        this.onDashboardClick();
        break;
      case 'Renewal Approval Pending':
      case 'Renewal Approval Completed':
      case 'Renewal Approval Rejected':
        this.router.navigate(['renewal/renewal-approval'], { queryParams: { status: label.split(' ').pop()?.toLowerCase() } });
        break;
      case 'Transaction SMS List':
        this.router.navigate(['/transaction-sms-list']);
        break;
      case 'New Business':
        this.NewBussiness();
        break;
      case 'Claim':
        this.onClaimClick();
        break;
      case 'Budjet':
        this.onBudgetClick();
        break;
      default:
        break;
    }
  }

  onDashboardClick() {
    const sidebarItems: MenuItem[] = [
      {
        label: 'Dashboard',
        icon: 'pi pi-chart-bar',
        command: () => {
          this.onDashboardClick();
          this.setActiveItem('Dashboard');
          this.sidebarService.selectItem('Dashboard');
        }
      },
      // {
      //   label: 'Products',
      //   icon: 'pi pi-shopping-bag',
      //   command: () => {
      //     this.onProductClick();
      //     this.sidebarService.selectItem('Products');
      //     this.setActiveItem('Products');
      //   }
      // }
    ];

    this.sidebarService.updateItems(sidebarItems);
    let d = JSON.parse(sessionStorage.getItem('Userdetails') as any);
    this.userDetails = d.Result;
    if (this.userDetails.UserType == 'Broker') {
      this.router.navigate(['/broker']);
    }
    else {
      this.router.navigate(['/dashboard']);
    }
  }
  onProductClick() {
    const sidebarItems: MenuItem[] = [
      {
        label: 'Dashboard',
        icon: 'pi pi-chart-bar',
        command: () => {
          this.onDashboardClick();
          this.sidebarService.selectItem('Dashboard');
          this.setActiveItem('Dashboard');
        }
      },
      {
        label: 'Products',
        icon: 'pi pi-shopping-bag',
        command: () => {
          this.onProductClick();
          this.sidebarService.selectItem('Products');
          this.setActiveItem('Products');
        }
      }
    ];

    this.sidebarService.updateItems(sidebarItems);
    this.router.navigate(['/products'])
  }
  NewBussiness() {
    const sidebarItems: MenuItem[] = [
      {
        label: 'Dashboard',
        icon: 'pi pi-chart-bar',
        command: () => {
          this.onDashboardClick();
          this.setActiveItem('Dashboard');
        }
      },
      {
        label: 'Products',
        icon: 'pi pi-shopping-bag',
        command: () => {
          this.onProductClick();
          this.setActiveItem('Products');
        }
      }
    ];
    this.sidebarService.updateItems(sidebarItems);
    let d = JSON.parse(sessionStorage.getItem('Userdetails') as any);
    this.userDetails = d.Result;
    if (this.userDetails.UserType == 'Broker') {
      this.router.navigate(['/new-business-broker']);
    }
    else {
      this.router.navigate(['/new-business-dashboard']);
    }
    // this.router.navigate(['/new-business-dashboard']);

  }
  onClaimClick() {
    const sidebarItems: MenuItem[] = [
      {
        label: 'Dashboard',
        icon: 'pi pi-chart-bar',
        command: () => {
          this.onDashboardClick();
          this.setActiveItem('Dashboard');
        }
      },
      {
        label: 'Products',
        icon: 'pi pi-shopping-bag',
        command: () => {
          this.onProductClick();
          this.setActiveItem('Products');
        }
      }
    ];
    this.sidebarService.updateItems(sidebarItems);
    this.router.navigate(['/new-bussiness'])


  }
  onBudgetClick() {
    const sidebarItems: MenuItem[] = [
      {
        label: 'Dashboard',
        icon: 'pi pi-chart-bar',
        command: () => {
          this.onDashboardClick();
          this.setActiveItem('Dashboard');

        }
      },
      {
        label: 'Products',
        icon: 'pi pi-shopping-bag',
        command: () => {
          this.onProductClick();
          this.setActiveItem('Products');
        }
      }
    ];

    this.sidebarService.updateItems(sidebarItems);
    this.router.navigate(['/new-bussiness'])


  }
  setActiveItem(label: string) {
    this.activeItem = label;

  }

  onUserChange(event: any) {
    let selectedValue
    if (event.value) {
      selectedValue = event.value;

    }
    else {
      selectedValue = event;
    }
    let e: any = this.user_list.filter(e => e.userCode == selectedValue)
    // sessionStorage.setItem('Userdetails', JSON.stringify(e),);
    this.sidebarService.setUserType(e);
    // this.sidemenu.selectedLabel = null;
    // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
    //   this.router.navigate([this.router.url]);
    // });

  }



  setLogout() {
    const Req = {
      LoginId: this.loginId,
      Token: sessionStorage.getItem("UserToken"),
    };
    const urlLink = `${this.RenewalApiUrl}authentication/logout`;
    this.shared.onPostMethodSync(urlLink, Req).subscribe(
      (data: any) => {
        console.log(data);
        sessionStorage.clear();
        localStorage.clear();
        this.authService.logout();
        location.href = `http://193.203.162.152:8085/Eway/#/auth/login`;
        // location.href = `http://147.93.108.104:8085/Eway/#/auth/login`;
        // location.href = `http://192.168.1.42:4600/#/auth/login`;
      },
      (err: any) => {
        console.log(err);
        sessionStorage.clear();
        localStorage.clear();
        this.authService.logout();
        location.href = `http://193.203.162.152:8085/Eway/#/auth/login`;
        // location.href = `http://147.93.108.104:8085/Eway/#/auth/login`;
        // location.href = `http://192.168.1.42:4600/#/auth/login`;
      },
    );
  }

  navigateHome() {
    // location.href = `http://192.168.1.42:4600/#/auth/login/product`;
    location.href = `http://193.203.162.152:8085/Eway/#/auth/login/product`;
    // location.href = `http://147.93.108.104:8085/Eway/#/auth/login/product`;
  }
}


