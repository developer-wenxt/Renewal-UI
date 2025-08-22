import { AfterViewInit, Component, OnInit } from '@angular/core';
import { SharedService } from '../../../services/shareService';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionStorageService } from '../../../storage/session-storage.service';
import { DatePipe } from '@angular/common';
import { SidebarService } from '../../../services/sidebar.service';
import { AuthService } from '../../../helpers/auth/Auth/auth.service';
import { config } from '../../../helpers/appconfig';

@Component({
  selector: 'app-claim-summary-monthlypaid-date-wise-count',
  standalone: false,
  templateUrl: './claim-summary-monthlypaid-date-wise-count.component.html',
  styleUrl: './claim-summary-monthlypaid-date-wise-count.component.scss'
})
export class ClaimSummaryMonthlypaidDateWiseCountComponent {
  tableData: any[] = [];
  public RenewalApiUrl: any = config.RenewalApiUrl;
  selectedData: any;
  userDetails: any;
  BranchList: any;
  selectedBranch: any;
  CustomerTypeList: any;
  selectedCutomerType: any;
  SourceList: any;
  selectedSource: any;
  month: string;
  selectedMonth: any
  AllBranchList: any[];
  constructor(private shared: SharedService, private router: Router, private sessionStorageService: SessionStorageService,
    private route: ActivatedRoute, private sidebarService: SidebarService, private authService: AuthService, private datePipe: DatePipe,) {
    let d = JSON.parse(sessionStorage.getItem('Userdetails') as any);
    this.userDetails = d.Result;
    this.selectedData = JSON.parse(sessionStorage.getItem('selectedData') as any);
    console.log(this.selectedData, "this.selectedDatathis.selectedData");



    // this.userDetails = d.Result;
    // const isoDate = new Date();
    // this.selectedMonth = isoDate;
  }
  ngAfterViewInit() {
    setTimeout(() => {
      let sdata = JSON.parse(sessionStorage.getItem('ReqObj') as any);
      this.selectedMonth = sdata?.Date
      this.month = sdata?.Date;
      this.selectedBranch = sdata?.Branch
      this.selectedSource = sdata?.Source
      this.selectedCutomerType = sdata?.CustomerType
      this.getMohtDate()
    }, 1000);
  }

  ngOnInit() {
    // this.getDueRenewPolicyList();
    this.getBranchDropdown();
    this.getSourceDropdown();
    this.getCustomerTypeDropdown();
  }

  // getBranchDropdown() {
  //   let ReqObj = {
  //     // "CompanyId": '100046',
  //     "CompanyId": this.userDetails.InsuranceId,
  //   }
  //   let urlLink = `${this.RenewalApiUrl}renewalDashBoard/getBranchDropDown`;

  //   this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
  //     (data: any) => {

  //       if (data) {
  //         this.BranchList = data?.Result[0].DataList
  //         // this.BranchList = ["All", ...this.BranchList];
  //         // this.selectedBranch = 'All'
  //       }
  //     },
  //     (err: any) => { },
  //   );
  // }

  getBranchDropdown() {
    // let ReqObj = {
    //   // "CompanyId": '100046',
    //   "CompanyId": this.userDetails.InsuranceId,
    // }
    // let urlLink = `${this.RenewalApiUrl}renewalDashBoard/getBranchDropDown`;

    // this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
    //   (data: any) => {
    let branchList: any = [];
    this.userDetails.LoginBranchDetails.forEach((e: any) => {
      branchList.push(e.DivisionCode)
    });
    let ReqObj = {
      "CompanyId": this.userDetails.InsuranceId,
      "DivisionCodelist": branchList,
      // "DivisionCodelist":["101"],

    }
    let urlLink = `${this.RenewalApiUrl}renewaltrack/getdivisionbycompany`;
    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {
        if (data) {
          let list = [];
          // this.BranchList = data?.Result[0].DataList
          let loginBrachList = data?.divisionDetails
          loginBrachList.forEach(e => {
            list.push(e.DivisionName)
          });
          setTimeout(() => {
            this.BranchList = list;
            this.AllBranchList = list;
            this.BranchList = ["All", ...this.BranchList];
            console.log(this.BranchList, "this.BranchList");

            this.selectedBranch = this.BranchList[0]
          }, 100);

        }
      },
      (err: any) => { },
    );
  }

  getCustomerTypeDropdown() {
    let ReqObj = {
      // "CompanyId": '100046',
      "CompanyId": this.userDetails.InsuranceId,
    }
    let urlLink = `${this.RenewalApiUrl}renewalDashBoard/getCustomerTypeDropDown`;

    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {

        if (data) {
          this.CustomerTypeList = data?.Result[0].DataList;
          this.CustomerTypeList = ["All", ...this.CustomerTypeList];
          this.selectedCutomerType = 'All'
          // this.getMohtDate();
        }
      },
      (err: any) => { },
    );
  }
  getSourceDropdown() {
    let ReqObj = {
      // "CompanyId": '100046',
      "CompanyId": this.userDetails.InsuranceId,
    }
    let urlLink = `${this.RenewalApiUrl}renewalDashBoard/getSourceDropDown`;

    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {

        if (data) {
          this.SourceList = data?.Result[0].DataList;
          this.SourceList = ["All", ...this.SourceList];
          this.selectedSource = 'All'
          // this.getMohtDate();
        }
      },
      (err: any) => { },
    );
  }

  getMohtDate() {
    this.month = ''
    this.tableData = [];
    let formatted
    if (typeof this.selectedMonth === 'string') {
      formatted = this.selectedMonth
    }
    else {
      const dateObj = new Date(this.selectedMonth);
      formatted = ('0' + (dateObj.getMonth() + 1)).slice(-2) + '/' + dateObj.getFullYear();
    }
    let d = [];
    d.push(this.selectedData?.branch)
    this.month = formatted
    let ReqObj = {
      "CompanyId": this.userDetails.InsuranceId,
      "Branch": d,
      "Date": formatted,
      "CustomerType": this.selectedData?.customerType,
      "Source": this.selectedData?.source,
      "Product": this.selectedData?.product

    }

    let urlLink = `${this.RenewalApiUrl}renewalDashBoard/getDailyByWeeksClaimPaid`;

    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {

        if (data.Result) {
          this.tableData = data.Result
          // const salesMap: any = {};
          // data.Result.forEach(entry => {
          //   const product = entry.Product;
          //   const branch = entry.Branch;
          //   const source = entry.Source;
          //   const cusotmerType = entry.CustomerType;
          //   const week = entry.Week.toLowerCase().replace(" ", "");

          //   if (!salesMap[product]) {
          //     salesMap[product] = {
          //       product: product,
          //       totalCount: 0,
          //       customerType: cusotmerType,
          //       branch: branch,
          //       source: source,
          //       week1: { previous: { count: 0, premium: 0 }, actual: { count: 0, premium: 0 } },
          //       week2: { previous: { count: 0, premium: 0 }, actual: { count: 0, premium: 0 } },
          //       week3: { previous: { count: 0, premium: 0 }, actual: { count: 0, premium: 0 } },
          //       week4: { previous: { count: 0, premium: 0 }, actual: { count: 0, premium: 0 } }
          //     };
          //   }


          //   salesMap[product][week].actual.count += parseInt(entry.PolicyCount || '0', 10);
          //   salesMap[product][week].actual.premium += parseFloat(entry.TotalPolicyPremium || '0');
          //   salesMap[product][week].previous.count += parseInt(entry.PolicyCountPrev || '0', 10);
          //   salesMap[product][week].previous.premium += parseFloat(entry.TotalPolicyPremiumPrev || '0');
          //   salesMap[product].totalCount += parseInt(entry.PolicyCount || '0', 10);
          // });

          // this.tableData = Object.values(salesMap);
          console.log(data.Result, "data.Resultdata.Result");

        }
      },
      (err: any) => { },
    );
  }

  getTotal(week: 'week1' | 'week2' | 'week3' | 'week4', type: 'previous' | 'actual', field: 'count' | 'premium') {
    return this.tableData.reduce((sum, sale) => {
      const value = sale[week]?.[type]?.[field] ?? 0;
      return sum + value;
    }, 0);
  }

  getTotalCount() {
    return this.tableData.reduce((sum, sale) => sum + (sale.totalCount ?? 0), 0);
  }
  navigateProd() {
    this.router.navigate(['/summary/monthly-paid-product-wise-count'])
  }
}
