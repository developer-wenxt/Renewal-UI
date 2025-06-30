import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { config } from '../../helpers/appconfig';
import { Router } from '@angular/router';
import { SharedService } from '../../services/shareService';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-renewal-approval',
  standalone: false,
  templateUrl: './renewal-approval.component.html',
  styleUrl: './renewal-approval.component.scss'
})
export class RenewalApprovalComponent implements OnInit {
  public RenewalApiUrl: any = config.RenewalApiUrl;
  @ViewChild('dt1') dt1!: Table;
  status: any
  userDetails: any
  customers_list: any[] = [];
  broker_list: any[] = [];
  from_date: any
  to_date: any
  constructor(
    private datePipe: DatePipe,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private shared: SharedService
  ) {
    let d = JSON.parse(sessionStorage.getItem('Userdetails') as any);
    this.userDetails = d.Result;
  }
  ngOnInit() {
    const now = new Date();
    now.setMonth(now.getMonth() - 1);
    this.from_date = new Date(now); // Set as Date object

    const to_now = new Date();
    this.to_date = new Date(to_now);
    this.activatedRoute.queryParams.subscribe(params => {
      this.status = params['status'];
      this.getCustomerData();
    });

  }
  onDateChange(): void {
    // const formattedFromDate = this.datePipe.transform(this.from_date, 'yyyy-MM-dd');
    // const formattedFromDate = this.from_date
    // const formattedToDate = this.datePipe.transform(this.to_date, 'yyyy-MM-dd');
    // const formattedToDate = this.to_date
    // this.getdata(formattedFromDate, formattedToDate)
    this.getCustomerData();
  }
  // getCustomerData() {
  //   let FromDate = this.datePipe.transform(this.from_date, 'yyyy-MM-dd');
  //   let ToDate = this.datePipe.transform(this.to_date, 'yyyy-MM-dd');
  //   let sts
  //   if (this.status == 'pending') {
  //     sts = 'P'
  //   }
  //   if (this.status == 'rejected') {
  //     sts = 'R'
  //   }
  //   if (this.status == 'completed') {
  //     sts = 'A'
  //   }
  //   let ReqObj
  //   ReqObj = {
  //     "CompanyId": this.userDetails.InsuranceId,
  //     "DivisionCode": this.userDetails?.DivisionCode,
  //     "SourceCode": this.userDetails.UserType == 'Broker' ? this.userDetails.SourceCode : null,
  //     "Status": sts,
  //     "StartDate": FromDate,
  //     "EndDate": ToDate
  //   }

  //   let urlLink = `${this.RenewalApiUrl}renewaltrack/getStatusBasedPolicy`;
  //   this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
  //     (data: any) => {
  //       if (data) {

  //         this.broker_list = data.Result

  //       }
  //     },
  //     (err: any) => { },
  //   );
  // }

  onTabChange(event: any) {
    const selectedIndex = event.index;
    const selectedTabLabel = event.originalEvent.target.innerText;

    console.log('Tab Changed:', selectedIndex, selectedTabLabel);

    if (selectedIndex === 0) {
      if (this.status == 'pending') {
        let FromDate = this.datePipe.transform(this.from_date, 'yyyy-MM-dd');
        let ToDate = this.datePipe.transform(this.to_date, 'yyyy-MM-dd');

        let ReqObj
        ReqObj = {
          "CompanyId": this.userDetails.InsuranceId,
          "DivisionCode": this.userDetails?.DivisionCode,
          "SourceCode": this.userDetails.UserType == 'Broker' ? this.userDetails.SourceCode : null,
          "StartDate": FromDate,
          "EndDate": ToDate
        }

        let urlLink = `${this.RenewalApiUrl}renewaltrack/getBrokerPendingPolicy`;
        this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
          (data: any) => {
            if (data) {

              this.broker_list = data.Result

            }
          },
          (err: any) => { },
        );
      }
      if (this.status == 'rejected') {
        let FromDate = this.datePipe.transform(this.from_date, 'yyyy-MM-dd');
        let ToDate = this.datePipe.transform(this.to_date, 'yyyy-MM-dd');

        let ReqObj
        ReqObj = {
          "CompanyId": this.userDetails.InsuranceId,
          "DivisionCode": this.userDetails?.DivisionCode,
          "SourceCode": this.userDetails.UserType == 'Broker' ? this.userDetails.SourceCode : null,
          "StartDate": FromDate,
          "EndDate": ToDate
        }

        let urlLink = `${this.RenewalApiUrl}renewaltrack/getBrokerRejectedPolicy`;
        this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
          (data: any) => {
            if (data) {

              this.broker_list = data.Result

            }
          },
          (err: any) => { },
        );
      }
      if (this.status == 'completed') {
        let FromDate = this.datePipe.transform(this.from_date, 'yyyy-MM-dd');
        let ToDate = this.datePipe.transform(this.to_date, 'yyyy-MM-dd');

        let ReqObj
        ReqObj = {
          "CompanyId": this.userDetails.InsuranceId,
          "DivisionCode": this.userDetails?.DivisionCode,
          "SourceCode": this.userDetails.UserType == 'Broker' ? this.userDetails.SourceCode : null,
          "StartDate": FromDate,
          "EndDate": ToDate
        }

        let urlLink = `${this.RenewalApiUrl}renewaltrack/getBrokerApproverPolicy`;
        this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
          (data: any) => {
            if (data) {

              this.broker_list = data.Result

            }
          },
          (err: any) => { },
        );
      }

    }
    else if (selectedIndex === 1) {
      if (this.status == 'pending') {
        let FromDate = this.datePipe.transform(this.from_date, 'yyyy-MM-dd');
        let ToDate = this.datePipe.transform(this.to_date, 'yyyy-MM-dd');

        let ReqObj
        ReqObj = {
          "CompanyId": this.userDetails.InsuranceId,
          "DivisionCode": this.userDetails?.DivisionCode,
          "SourceCode": this.userDetails.UserType == 'Broker' ? this.userDetails.SourceCode : null,
          "StartDate": FromDate,
          "EndDate": ToDate
        }

        let urlLink = `${this.RenewalApiUrl}renewaltrack/getUserPendingPolicy`;
        this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
          (data: any) => {
            if (data) {

              this.customers_list = data.Result

            }
          },
          (err: any) => { },
        );
      }
      if (this.status == 'rejected') {
        let FromDate = this.datePipe.transform(this.from_date, 'yyyy-MM-dd');
        let ToDate = this.datePipe.transform(this.to_date, 'yyyy-MM-dd');

        let ReqObj
        ReqObj = {
          "CompanyId": this.userDetails.InsuranceId,
          "DivisionCode": this.userDetails?.DivisionCode,
          "SourceCode": this.userDetails.UserType == 'Broker' ? this.userDetails.SourceCode : null,
          "StartDate": FromDate,
          "EndDate": ToDate
        }

        let urlLink = `${this.RenewalApiUrl}renewaltrack/getUserRejectedPolicy`;
        this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
          (data: any) => {
            if (data) {

              this.customers_list = data.Result

            }
          },
          (err: any) => { },
        );
      }
      if (this.status == 'completed') {
        let FromDate = this.datePipe.transform(this.from_date, 'yyyy-MM-dd');
        let ToDate = this.datePipe.transform(this.to_date, 'yyyy-MM-dd');

        let ReqObj
        ReqObj = {
          "CompanyId": this.userDetails.InsuranceId,
          "DivisionCode": this.userDetails?.DivisionCode,
          "SourceCode": this.userDetails.UserType == 'Broker' ? this.userDetails.SourceCode : null,
          "StartDate": FromDate,
          "EndDate": ToDate
        }

        let urlLink = `${this.RenewalApiUrl}renewaltrack/getUserApproverPolicy`;
        this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
          (data: any) => {
            if (data) {

              this.customers_list = data.Result

            }
          },
          (err: any) => { },
        );
      }

    }

  }
  getCustomerData() {
    if (this.status == 'pending') {
      let FromDate = this.datePipe.transform(this.from_date, 'yyyy-MM-dd');
      let ToDate = this.datePipe.transform(this.to_date, 'yyyy-MM-dd');

      let ReqObj
      ReqObj = {
        "CompanyId": this.userDetails.InsuranceId,
        "DivisionCode": this.userDetails?.DivisionCode,
        "SourceCode": this.userDetails.UserType == 'Broker' ? this.userDetails.SourceCode : null,
        "StartDate": FromDate,
        "EndDate": ToDate
      }

      let urlLink = `${this.RenewalApiUrl}renewaltrack/getBrokerPendingPolicy`;
      this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
        (data: any) => {
          if (data) {

            this.broker_list = data.Result

          }
        },
        (err: any) => { },
      );
    }
    if (this.status == 'rejected') {
      let FromDate = this.datePipe.transform(this.from_date, 'yyyy-MM-dd');
      let ToDate = this.datePipe.transform(this.to_date, 'yyyy-MM-dd');

      let ReqObj
      ReqObj = {
        "CompanyId": this.userDetails.InsuranceId,
        "DivisionCode": this.userDetails?.DivisionCode,
        "SourceCode": this.userDetails.UserType == 'Broker' ? this.userDetails.SourceCode : null,
        "StartDate": FromDate,
        "EndDate": ToDate
      }

      let urlLink = `${this.RenewalApiUrl}renewaltrack/getBrokerRejectedPolicy`;
      this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
        (data: any) => {
          if (data) {

            this.broker_list = data.Result

          }
        },
        (err: any) => { },
      );
    }
    if (this.status == 'completed') {
      let FromDate = this.datePipe.transform(this.from_date, 'yyyy-MM-dd');
      let ToDate = this.datePipe.transform(this.to_date, 'yyyy-MM-dd');

      let ReqObj
      ReqObj = {
        "CompanyId": this.userDetails.InsuranceId,
        "DivisionCode": this.userDetails?.DivisionCode,
        "SourceCode": this.userDetails.UserType == 'Broker' ? this.userDetails.SourceCode : null,
        "StartDate": FromDate,
        "EndDate": ToDate
      }

      let urlLink = `${this.RenewalApiUrl}renewaltrack/getBrokerApproverPolicy`;
      this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
        (data: any) => {
          if (data) {

            this.broker_list = data.Result

          }
        },
        (err: any) => { },
      );
    }

  }
  getSeverity(status: string): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' | undefined {
    switch (status) {
      case 'Renewal':
        return 'secondary';
      case 'Pending':
        return 'warning';
      case 'Loss':
        return 'danger';
      case 'Motor':
        return 'info';
      case 'Health':
        return 'success';
      case 'Non-Motor':
        return 'contrast';
      default:
        return undefined;
    }
  }

  ViewRisk(customer: any) {
    sessionStorage.setItem('PolicyNumber', JSON.stringify(customer.PolicyNumber))
    sessionStorage.setItem('CustomerDeatils', JSON.stringify(customer))
    this.router.navigate(['/risk-details'], { queryParams: { status: this.status } })
  }
    onGlobalFilter1(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.dt1.filterGlobal(input.value, 'contains');
  }
}
