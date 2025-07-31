import { AfterViewInit, Component, OnInit } from '@angular/core';
import { SharedService } from '../../../services/shareService';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionStorageService } from '../../../storage/session-storage.service';
import { SidebarService } from '../../../services/sidebar.service';
import { AuthService } from '../../../helpers/auth/Auth/auth.service';
import { DatePipe } from '@angular/common';
import { config } from '../../../helpers/appconfig';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, AfterViewInit {
  public RenewalApiUrl: any = config.RenewalApiUrl;
  userDetails: any;
  ClaimList: any[] = [];

  constructor(private shared: SharedService, private router: Router, private sessionStorageService: SessionStorageService,
    private route: ActivatedRoute, private sidebarService: SidebarService, private authService: AuthService, private datePipe: DatePipe,) {
    let d = JSON.parse(sessionStorage.getItem('Userdetails') as any);
    this.userDetails = d.Result;

  }
  ngAfterViewInit() {

  }
  ngOnInit() {
    this.getClaimList();
  }
  getClaimList() {

    let ReqObj

    ReqObj = {
      "CompanyId": '100046',
      // "CompanyId": this.userDetails.InsuranceId,
    }

    let urlLink = `${this.RenewalApiUrl}renewalDashBoard/getClaimList`;

    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {

        if (data) {
          this.ClaimList = data?.Result
        }
      },
      (err: any) => { },
    );


  }
}
