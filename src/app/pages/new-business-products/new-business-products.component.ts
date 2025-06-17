import { Component, OnInit } from '@angular/core';
import { config } from '../../helpers/appconfig';
import { SharedService } from '../../services/shareService';
import { Router } from '@angular/router';
import { SidebarService } from '../../services/sidebar.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-new-business-products',
  standalone: false,
  templateUrl: './new-business-products.component.html',
  styleUrl: './new-business-products.component.scss'
})
export class NewBusinessProductsComponent {
  totalPolicyCount: number = 0;
  totalPending: number = 0;

  totalLost: number = 0;
  from_date: any
  to_date: any
  DivisionList: any;
  userDetails: any;
  overall_product_list: any[] = [];
  allDivisionList: any[] = [];
  PolSrcName: any[] = [];
  ExpiredCustomers!: any[];
  TopPremiumcustomers: any[] = [];
  responsiveOptions: any[] = [];
  dashborad_selectted_division: any
  public CommonApiUrl: any = config.CommonApiUrl; constructor(private shared: SharedService, private sidebarService: SidebarService, private datePipe: DatePipe, private router: Router,) {

    this.overall_product_list = [];
    let d = JSON.parse(sessionStorage.getItem('Userdetails') as any);
    this.userDetails = d.Result;
    console.log(this.userDetails, "this.userDetails  ");
    if (this.userDetails.UserType == 'Opration-Head' || this.userDetails.UserType == 'Issuer') {
      this.from_date = sessionStorage.getItem('from_date_op') as any;
      this.to_date = sessionStorage.getItem('to_date_op') as any;
      this.DivisionList = JSON.parse(sessionStorage.getItem('DashboardResponseData') as any);
      let division = JSON.parse(sessionStorage.getItem('division') as any);
      console.log(division, "divisiondivisiondivision");
      this.PolSrcName = division.PolSrcName;
      this.dashborad_selectted_division = division.PolSrcCode
      this.getDivisiondata('direct');
    }
    else {
      const now = new Date();
      now.setMonth(now.getMonth() - 1);
      this.from_date = new Date(now);

      const to_now = new Date();
      this.to_date = new Date(to_now);
      this.getDivisiondata('direct');
    }

  }
  ngOnInit(): void {
    // this.getTopPriumCustomerList();
    // this.getExpiredPriumCustomerList();
    this.responsiveOptions = [
      {
        breakpoint: '1024px',
        numVisible: 2,

        numScroll: 2
      },
      {
        breakpoint: '768px',
        numVisible: 1,
        numScroll: 1
      }
    ];


  }
  filterChange(value: any) {
    this.getDivisiondata('change');
    if (this.DivisionList) {
      let baseCovers = this.DivisionList.filter((ele: any) => ele.DivisionCode == value);
      sessionStorage.setItem('SelecttedDivision', baseCovers);
    }

  }

  onDateChange(): void {
    const formattedFromDate: any = this.datePipe.transform(this.from_date, 'yyyy-MM-dd');
    const formattedToDate: any = this.datePipe.transform(this.to_date, 'yyyy-MM-dd');
    sessionStorage.setItem('from_date_op', formattedFromDate);
    sessionStorage.setItem('to_date_op', formattedToDate);
    this.getDivisiondata('direct')

  }
  getDivisiondata(value: any) {

    let division
    let from_date
    let to_date
    this.overall_product_list = [];
    if (value == 'change' || value == 'direct') {
      division = this.dashborad_selectted_division
    }
    else {
      this.dashborad_selectted_division = this.userDetails.BranchCode
      division = this.userDetails.BranchCode
    }


    let ReqObj
    if (this.userDetails.UserType == 'Broker') {
      ReqObj = {
        "CompanyId": this.userDetails.InsuranceId,
        "DivisionCode": division,
        "SourceCode": this.userDetails[0].SourceCode,
        "StartDate": this.from_date,
        "EndDate": this.to_date
      }
    }
    else if (this.userDetails.UserType == 'Issuer') {
      from_date = this.formatDate(this.from_date);
      to_date = this.formatDate(this.to_date);
      ReqObj = {
        "CompanyId": this.userDetails.InsuranceId,
        "DivisionCode": this.userDetails.BranchCode,
        // "DivisionCode": '101',
        // "SourceCode": this.userDetails[0].SourceCode,
        "SourceCode": this.dashborad_selectted_division,
        "StartDate": from_date,
        "EndDate": to_date
      }
    }
    else {

      ReqObj = {
        "CompanyId": this.userDetails.InsuranceId,
        "DivisionCode": division,
        "StartDate": this.from_date,
        "EndDate": this.to_date
      }
    }

    let urlLink = `${this.CommonApiUrl}nbtrack/getproductsbycompanyanddivision`;
    // let urlLink = `${this.CommonApiUrl}nbtrack/getSourcebyCompanyandDivision`;
    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {

        if (data) {
          this.overall_product_list = data

          this.totalPending = data.reduce((sum: number, item: any) => sum + parseInt(item.Pending, 10), 0);
          this.totalLost = data.reduce((sum: number, item: any) => sum + parseInt(item.Lost, 10), 0);
          this.totalPolicyCount = data.reduce((sum: number, item: any) => sum + parseInt(item.ProductCount, 10), 0);
          // this.totalPolicyCount = data.reduce((sum: number, item: any) =>
          //   sum + parseInt(item.Pending, 10) + parseInt(item.Lost, 10), 0);
        }
      },
      (err: any) => { },
    );


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
  getProgress(item: any): number {
    const total = Number(item.ProductCount);
    const pending = Number(item.Pending);
    if (total === 0) return 0;
    return (pending / total) * 100;
  }

  ProductBasedCustomers(data: any) {
    let value = 'Issuer'
    this.router.navigate(['/new-business-branch-dashboard'], { queryParams: { value } })
    sessionStorage.setItem('SelecttedProduct', JSON.stringify(data));
  }

  getbrokersList() {
    let ReqObj
    if (this.userDetails.UserType != 'Broker') {
      ReqObj = {
        "CompanyId": this.userDetails.InsuranceId,
        // "DivisionCode": "101",
        "DivisionCode": this.userDetails.BranchCode,
        // "ProductCode": this.ProductData.ProductCode,
        "StartDate": this.from_date,
        "EndDate": this.to_date
      }
    }
    else {
      ReqObj = {
        "CompanyId": this.userDetails.InsuranceId,
        "DivisionCode": "101",
        // "ProductCode": productCode,
        "SourceCode": this.userDetails[0].SourceCode,
        "StartDate": this.to_date,
        "EndDate": "2025-12-05"
      }
    }

    let urlLink = `${this.CommonApiUrl}nbtrack/getsourcesbyproduct`;
    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {
        if (data) {

          // this.ResponseData = data;

          console.log(data, "dfdsfsdaf");



        }
      },
      (err: any) => { },
    );
  }

  // getDviisonList() {
  //   let ReqObj
  //   if (this.userDetails.UserType != 'Issuer') {
  //     ReqObj = {
  //       "CompanyId":this.userDetails.InsuranceId,
  //       "StartDate": this.from_date,
  //       "EndDate": this.to_date
  //     }
  //   }
  //   else {
  //     let from_date
  //     let to_date
  //     from_date = this.formatDate(this.from_date);
  //     to_date = this.formatDate(this.to_date);
  //     ReqObj = {
  //       "CompanyId":this.userDetails.InsuranceId,
  //       "StartDate": from_date,
  //       "EndDate": to_date
  //     }
  //   }

  //   let urlLink = `${this.CommonApiUrl}nbtrack/getdivisionbycompany`;
  //   this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
  //     (data: any) => {

  //       if (data.divisionDetails) {
  //         this.allDivisionList = data.divisionDetails;
  //         if (this.userDetails.UserType == 'Issuer') {
  //           let d: any
  //           d = this.allDivisionList.filter((ele: any) => ele.DivisionCode == this.userDetails.BranchCode);
  //           this.DivisionName = d[0].DivisionName
  //         }
  //         else {
  //           console.log(this.dashborad_selectted_division, "dashborad_selectted_division");

  //           let d: any
  //           d = this.allDivisionList.filter((ele: any) => ele.DivisionCode == this.dashborad_selectted_division);
  //           this.DivisionName = d[0].DivisionName

  //         }
  //       }
  //     },
  //     (err: any) => { },
  //   );

  // }

  getTopPriumCustomerList() {
    let from_date
    let to_date
    // from_date = this.formatDate(this.from_date);
    // to_date = this.formatDate(this.to_date);
    let ReqObj = {

      // "DivisionCode": this.userDetails.BranchCode,
      "DivisionCode": '101',
      "StartDate": this.from_date,
      "EndDate": this.to_date

    }
    let urlLink = `${this.CommonApiUrl}nbtrack/getTopTenPolicydetails`;
    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {

        this.TopPremiumcustomers = data
      },
      (err: any) => { },
    );
  }

  viewCustomer(sts: any) {

  }

  getExpiredPriumCustomerList() {


    let urlLink = `${this.CommonApiUrl}nbtrack/getExpiryPolicyDetails/101`;
    //  let urlLink = `${this.CommonApiUrl}nbtrack/getExpiryPolicyDetails/${this.DivisionCode}`;
    this.shared.onGetMethodSync(urlLink).subscribe(
      (data: any) => {

        this.ExpiredCustomers = data
      },
      (err: any) => { },
    );
  }

  navigateOprationHeadDasborad() {
    let value = 'back'
    this.router.navigate(['/new-business-dashboard'], { queryParams: { value } })
  }

  formatDate(date: any): string | null {
    return this.datePipe.transform(date, 'yyyy-MM-dd');
  }
}
