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
  items: MenuItem[] = [];
  activeItem: string = '';
  userOptions: any[] = [];
  loginId: any
  user_list: any[] = []; userDetails: any;
  SelectedUserType: any = 'Broker';
  public CommonApiUrl: any = config.CommonApiUrl;
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
      this.userDetails = d.Result;
      this.loginId = this.userDetails.LoginId;
    }, 200);

  }
  ngOnInit(): void {
    this.userOptions = [
      { label: 'Logout', value: 'logout', icon: 'pi pi-power-off', command: () => { this.setLogout(); } },
    ]
    this.activeItem = 'Renewal Business';
    // this.user_list = [
    //   { userType: 'Broker', userCode: 'Broker', DivisionCode: '100', SourceCode: 'DB1000629', },
    //   { userType: 'Issuer', userCode: 'Issuer', DivisionCode: '100', SourceCode: 'DB1000830' },
    //   { userType: 'Opration-Head', userCode: 'OprationHead' },
    // ]
    this.items = [
      {
        label: 'New Business',
        icon: 'pi pi-th-large',
        command: () => {
          this.setActiveItem('New Business');
          this.NewBussiness();
        }
      },
      {
        label: 'Renewal Business',
        icon: 'pi pi-pencil',
        command: () => {
          this.setActiveItem('Renewal Business');
          this.onDashboardClick();
        }
      },
      {
        label: 'Claim',
        icon: 'pi pi-bolt',
        command: () => {
          this.setActiveItem('Claim');
          this.onClaimClick();
        }
      },
      {
        label: 'Budget',
        icon: 'pi pi-palette',
        command: () => {
          this.setActiveItem('Budget');
          this.onBudgetClick();
        }
      }
    ];
    // this.onDashboardClick();
    this.onUserChange(this.SelectedUserType)
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
    const urlLink = `${this.CommonApiUrl}authentication/logout`;
    this.shared.onPostMethodSync(urlLink, Req).subscribe(
      (data: any) => {
        console.log(data);
        sessionStorage.clear();
        localStorage.clear();
        this.authService.logout();
        location.href = `http://193.203.162.152:8085/Eway/#/auth/login`;
      },
      (err: any) => {
        console.log(err);
        sessionStorage.clear();
        localStorage.clear();
        this.authService.logout();
        location.href = `http://193.203.162.152:8085/Eway/#/auth/login`;
      },
    );
  }
}


