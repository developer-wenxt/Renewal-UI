import { AfterViewInit, Component, OnInit } from '@angular/core';
import { SharedService } from '../../../services/shareService';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionStorageService } from '../../../storage/session-storage.service';
import { DatePipe } from '@angular/common';
import { SidebarService } from '../../../services/sidebar.service';
import { AuthService } from '../../../helpers/auth/Auth/auth.service';
import { config } from '../../../helpers/appconfig';
@Component({
  selector: 'app-product-wise-count',
  standalone: false,
  templateUrl: './product-wise-count.component.html',
  styleUrl: './product-wise-count.component.scss'
})
export class ProductWiseCountComponent implements OnInit, AfterViewInit {
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
      if (sdata?.Branch.length > 1) {
        this.selectedBranch = 'All'

      }
      else{
        this.selectedBranch = sdata?.Branch[0]

      }
      if (sdata?.Source == null) {
        this.selectedSource = 'All'

      }
      else {
        this.selectedSource = sdata?.Source

      }
      if (sdata?.CustomerType == null) {
        this.selectedCutomerType = 'All'

      }
      else {
       this.selectedCutomerType = sdata?.CustomerType

      }
      
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
            list.push({
              CodeDes: e.DivisionName,  // what user sees
              Code: e.DivisionCode   // what you get in selectedBranch
            });
          });

          setTimeout(() => {
            let allbr = []
            this.BranchList = list;
            list.forEach(e => {
              allbr.push(e.Code);
            });

            this.AllBranchList = allbr;

            this.BranchList = [
              { CodeDes: "All", Code: "All" },
              ...this.BranchList
            ];
            this.selectedBranch = 'All';
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
          this.CustomerTypeList = data?.Result;
          this.CustomerTypeList = [
            { CodeDes: "All", Code: "All" },
            ...this.CustomerTypeList
          ];
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
          this.SourceList = data?.Result;
          this.SourceList = [
            { CodeDes: "All", Code: "All" },
            ...this.SourceList
          ];
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

    this.month = formatted
    let d: any[] = [];
    if (this.selectedBranch == 'All' || this.selectedBranch.length != 0) {
      d = this.AllBranchList
    }
    else {
      d.push(this.selectedBranch)
    }
    let ReqObj = {
      "CompanyId": this.userDetails.InsuranceId,
      "Branch": d,
      "Date": formatted,
      "CustomerType": this.selectedCutomerType == 'All' ? null : this.selectedCutomerType,
      "Source": this.selectedSource == 'All' ? null : this.selectedSource,
      "Product": this.selectedData?.productCode

    }

    let urlLink = `${this.RenewalApiUrl}renewalDashBoard/getWeeklyData`;

    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {

        // if (data.Result) {
        //   const salesMap: any = {};
        //   data.Result.forEach(entry => {
        //     const product = entry.Product;
        //     const branch = entry.Branch;
        //     const source = entry.Source;
        //     const cusotmerType = entry.CustomerType;
        //     const week = entry.Week.toLowerCase().replace(" ", "");

        //     if (!salesMap[product]) {
        //       salesMap[product] = {
        //         product: product,
        //         totalCount: 0,
        //         customerType: cusotmerType,
        //         branch: branch,
        //         source: source,
        //         week1: { previous: { count: 0, premium: 0 }, actual: { count: 0, premium: 0 } },
        //         week2: { previous: { count: 0, premium: 0 }, actual: { count: 0, premium: 0 } },
        //         week3: { previous: { count: 0, premium: 0 }, actual: { count: 0, premium: 0 } },
        //         week4: { previous: { count: 0, premium: 0 }, actual: { count: 0, premium: 0 } }
        //       };
        //     }


        //     salesMap[product][week].actual.count += parseInt(entry.PolicyCount || '0', 10);
        //     salesMap[product][week].actual.premium += parseFloat(entry.TotalPolicyPremium || '0');
        //     salesMap[product][week].previous.count += parseInt(entry.PolicyCountPrev || '0', 10);
        //     salesMap[product][week].previous.premium += parseFloat(entry.TotalPolicyPremiumPrev || '0');
        //     salesMap[product].totalCount += parseInt(entry.PolicyCount || '0', 10);
        //   });

        //   this.tableData = Object.values(salesMap);
        //   console.log(this.tableData);

        // }

        if (data.Result) {
          const salesMap: any = {};

          data.Result.forEach(entry => {
            const product = entry.Product;
            const productCode = entry.ProductCode;
            const branch = entry.Branch;
            const branchCode = entry.BranchCode;
            const source = entry.Source;
            const customerType = entry.CustomerType;
            const week = entry.Week.toLowerCase().replace(" ", "");

            // Composite key including Product, Source, Branch, CustomerType
            const key = `${product}_${source}_${branch}_${customerType}`;

            if (!salesMap[key]) {
              salesMap[key] = {
                product: product,
                source: source,
                branch: branch,
                branchCode: branchCode,
                productCode: productCode,
                customerType: customerType,
                totalCount: 0,
                week1: { previous: { count: 0, premium: 0 }, actual: { count: 0, premium: 0 } },
                week2: { previous: { count: 0, premium: 0 }, actual: { count: 0, premium: 0 } },
                week3: { previous: { count: 0, premium: 0 }, actual: { count: 0, premium: 0 } },
                week4: { previous: { count: 0, premium: 0 }, actual: { count: 0, premium: 0 } }
              };
            }

            // Accumulate values
            salesMap[key][week].actual.count += parseInt(entry.PolicyCount || '0', 10);
            salesMap[key][week].actual.premium += parseFloat(entry.TotalPolicyPremium || '0');
            salesMap[key][week].previous.count += parseInt(entry.PolicyCountPrev || '0', 10);
            salesMap[key][week].previous.premium += parseFloat(entry.TotalPolicyPremiumPrev || '0');
            salesMap[key].totalCount += parseInt(entry.PolicyCount || '0', 10);
          });

          this.tableData = Object.values(salesMap);
          console.log(this.tableData);
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
    this.router.navigate(['/summary/dashboard'])
  }

  viewDetails(detatils) {
    console.log(detatils);

    sessionStorage.setItem('month', this.month);
    sessionStorage.setItem('selectedData', JSON.stringify(detatils));
    this.router.navigate(['/summary/date-wise-count'])
  }
}
