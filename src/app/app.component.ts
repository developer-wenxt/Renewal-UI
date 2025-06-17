import { AfterContentChecked, ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { Observable } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { CustomLoadingService } from './services/custom-loading.service';
import { SidebarService } from './services/sidebar.service';
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
  showSidebar = true;
  userDetails: any
  constructor(private router: Router,
    private cdr: ChangeDetectorRef,
    //  private sessionStorageService: SessionStorageService,
    public customLoder: CustomLoadingService, private sidebarService: SidebarService,
  ) {

    this.sidebarService.userType$.subscribe(value => {

      this.userDetails = value
      if (this.userDetails) {
        if (this.userDetails[0]?.userType != 'Opration-Head') {
          this.showSidebar = false
        }
        else {
          this.showSidebar = true;
        }
      }

    });
  }
  ngOnInit(): void {
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
      },
      // {
      //   label: 'Product',
      //   icon: 'pi-shopping-cart',
      //   items: [
      //     {
      //       label: 'Components',
      //       icon: 'pi pi-bolt'
      //     },
      //     {
      //       label: 'Blocks',
      //       icon: 'pi pi-server'
      //     },
      //     {
      //       label: 'UI Kit',
      //       icon: 'pi pi-pencil'
      //     },
      //     {
      //       label: 'Templates',
      //       icon: 'pi pi-palette',
      //       items: [
      //         {
      //           label: 'Apollo',
      //           icon: 'pi pi-palette'
      //         },
      //         {
      //           label: 'Ultima',
      //           icon: 'pi pi-palette'
      //         }
      //       ]
      //     }
      //   ]
      // },
      // {
      //   label: 'Contact',
      //   icon: 'pi pi-envelope'
      // }
    ]
  }
  onDashboardClick() {
    this.router.navigate(['/dashboard'])
  }
  onProductClick() {
    this.router.navigate(['/products'])
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
}
