import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SharedService } from '../../../services/shareService';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionStorageService } from '../../../storage/session-storage.service';
import { SidebarService } from '../../../services/sidebar.service';
import { AuthService } from '../../../helpers/auth/Auth/auth.service';
import { DatePipe } from '@angular/common';
import { config } from '../../../helpers/appconfig';
import * as echarts from 'echarts';
import { EChartsOption } from 'echarts';
import { Table } from 'primeng/table';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-claim-summary-dashboard',
  standalone: false,
  templateUrl: './claim-summary-dashboard.component.html',
  styleUrl: './claim-summary-dashboard.component.scss'
})
export class ClaimSummaryDashboardComponent {
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  @ViewChild('chartContainerPaid') chartContainerPaid!: ElementRef;
  @ViewChild('chartContainer2', { static: false }) chartContainer2!: ElementRef;
  @ViewChild('chartContainer3', { static: false }) chartContainer3!: ElementRef;
  @ViewChild('chartContainer4', { static: false }) chartContainer4!: ElementRef;
  @ViewChild('chartContainer5', { static: false }) chartContainer5!: ElementRef;
  @ViewChild('chartContainer6', { static: false }) chartContainer6!: ElementRef;
  @ViewChild('chartContainerLapsed', { static: false }) chartContainerLapsed!: ElementRef;
  @ViewChild('chartContainerCancel', { static: false }) chartContainerCancel!: ElementRef;
  @ViewChild('dt2') dt2!: Table;
  @ViewChild('tabWrapper', { static: false }) tabWrapper!: ElementRef;
  public RenewalApiUrl: any = config.RenewalApiUrl;
  userDetails: any;
  selectedMonth: any;
  selectedBranch: any;
  selectedSource: any;
  selectedCutomerType: any;
  DueRenewPolicyList: any[] = [];
  totalPolicyCount: any;
  totalPremium: any;
  selectvalue: any = 'policy'
  stateOptions: any[] = [];
  totalSumInsured: any
  sourceOfBusiness: any = 'Broker'
  NewPolicyList: any;
  RenewPolicyList: any;
  BranchList: any[] = [];
  SourceList: any[] = [];
  CustomerTypeList: any[] = [];
  tableData: any[] = [];
  polSumCumulativeList: any[] = [];
  ClaimSumCumulativePaidList: any[] = [];
  getClaimRatioList: any[] = [];
  polSumCancelledList: any[] = [];
  polSumLapsedList: any[] = [];
  polSumRenewalList: any[] = [];
  polSumNewList: any[] = [];
  barchartData: any[] = [];
  show: boolean = true;
  TabIndex: any = 0;
  month: string;
  from_date: any;
  to_date: any;
  renewalOptions = [
    { label: 'Renewal', value: 'RENEWAL' },
    { label: 'Renewal InPerson', value: 'RENEWAL_IN_PERSON' },
    { label: 'Renewal InPortal', value: 'RENEWAL_IN_PORTAL' },
    { label: 'Renewal PostLapse', value: 'RENEWAL_POST_LAPSE' }
  ];
  selectedRenewalType: string = 'RENEWAL';
  AllBranchList: any[];
  constructor(private shared: SharedService, private cdRef: ChangeDetectorRef, private router: Router, private sessionStorageService: SessionStorageService,
    private route: ActivatedRoute, private sidebarService: SidebarService, private authService: AuthService, private datePipe: DatePipe,) {
    let d = JSON.parse(sessionStorage.getItem('Userdetails') as any);
    this.userDetails = d.Result;
    const isoDate = new Date();
    this.selectedMonth = isoDate;
  }
  ngAfterViewInit() {
    // this.barchart();
  }
  ngOnInit() {
    this.stateOptions = [{ label: 'Policy Summary', value: 'policy' }, { label: 'Claim Summary', value: 'claim' }];
    this.getDueRenewPolicyList();
    this.getBranchDropdown();
    this.getSourceDropdown();
    this.getCustomerTypeDropdown();
    // const now = new Date();
    // now.setMonth(now.getMonth() - 1);
    // this.from_date = new Date(now); 

    // const to_now = new Date();
    // this.to_date = new Date(to_now);
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
  getMohtDate() {
    this.tableData = [];
    const dateObj = new Date(this.selectedMonth);

    const formatted = ('0' + (dateObj.getMonth() + 1)).slice(-2) + '/' + dateObj.getFullYear();
    this.month = formatted
    let ReqObj = {
      "CompanyId": this.userDetails.InsuranceId,
      "Branch": this.selectedBranch == 'All' ? this.AllBranchList : this.selectedBranch,
      "Date": formatted,
      "CustomerType": this.selectedCutomerType == 'All' ? null : this.selectedCutomerType,
      "Source": this.selectedSource == 'All' ? null : this.selectedSource,
      "Product": null

    }
    sessionStorage.setItem('ReqObj', JSON.stringify(ReqObj));
    // let urlLink = `${this.RenewalApiUrl}renewalDashBoard/getWeeklyData`;
    let urlLink = `${this.RenewalApiUrl}renewalDashBoard/getWeeklyClaimData`;

    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {

        if (data.Result) {
          const salesMap: any = {};

          data.Result.forEach(entry => {
            const product = entry.Product;
            const branch = entry.Branch;
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
          setTimeout(() => {
            this.barchart();

          }, 200);
        }

      },
      (err: any) => { },
    );
  }
  getMohtDatePaid() {
    this.tableData = [];
    const dateObj = new Date(this.selectedMonth);

    const formatted = ('0' + (dateObj.getMonth() + 1)).slice(-2) + '/' + dateObj.getFullYear();
    this.month = formatted
    let ReqObj = {
      "CompanyId": this.userDetails.InsuranceId,
      "Branch": this.selectedBranch == 'All' ? this.AllBranchList : this.selectedBranch,
      "Date": formatted,
      "CustomerType": this.selectedCutomerType == 'All' ? null : this.selectedCutomerType,
      "Source": this.selectedSource == 'All' ? null : this.selectedSource,
      "Product": null

    }
    sessionStorage.setItem('ReqObj', JSON.stringify(ReqObj));
    // let urlLink = `${this.RenewalApiUrl}renewalDashBoard/getWeeklyData`;
    let urlLink = `${this.RenewalApiUrl}renewalDashBoard/getWeeklyClaimPaidData`;

    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {

        if (data.Result) {
          const salesMap: any = {};

          data.Result.forEach(entry => {
            const product = entry.Product;
            const branch = entry.Branch;
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
          setTimeout(() => {
            this.barchartPaid();

          }, 200);
        }

      },
      (err: any) => { },
    );
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
  //         this.selectedBranch = this.BranchList[0]
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
          console.log(this.BranchList,"this.BranchList");
          
          this.selectedBranch = this.BranchList[0]
          }, 100);
       
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
  getDueRenewPolicyList() {
    this.totalPolicyCount = 0;
    this.totalPremium = 0;
    this.totalSumInsured = 0;
    let ReqObj = {
      // "CompanyId": '100046',
      "CompanyId": this.userDetails.InsuranceId,
    }
    let urlLink = `${this.RenewalApiUrl}renewalDashBoard/getDueRenewPolicyList`;

    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {

        if (data) {
          this.DueRenewPolicyList = data?.Result

          this.totalPolicyCount = this.DueRenewPolicyList?.reduce((sum: any, item: any) => sum + parseInt(item.PolicyCount, 10), 0);
          this.totalPremium = this.DueRenewPolicyList?.reduce((sum: any, item: any) => sum + parseInt(item.PolicyPremium, 10), 0);
          this.totalSumInsured = this.DueRenewPolicyList?.reduce((sum: any, item: any) => sum + parseInt(item.PolicySumInsured, 10), 0);
          setTimeout(() => {
            // this.dueRenewal();
          }, 100);
        }
      },
      (err: any) => { },
    );


  }
  getNewPolicyList() {
    this.totalPolicyCount = 0;
    this.totalPremium = 0;
    this.totalSumInsured = 0;
    let ReqObj = {
      // "CompanyId": '100046',
      "CompanyId": this.userDetails.InsuranceId,
    }
    let urlLink = `${this.RenewalApiUrl}renewalDashBoard/getNewPolicyList`;

    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {

        if (data) {
          this.NewPolicyList = data?.Result

          this.totalPolicyCount = this.NewPolicyList?.reduce((sum: any, item: any) => sum + parseInt(item.PolicyCount, 10), 0);
          this.totalPremium = this.NewPolicyList?.reduce((sum: any, item: any) => sum + parseInt(item.PolicyPremium, 10), 0);
          this.totalSumInsured = this.NewPolicyList?.reduce((sum: any, item: any) => sum + parseInt(item.PolicySumInsured, 10), 0);
          setTimeout(() => {
            this.NewPolicy();
          }, 100);
        }
      },
      (err: any) => { },
    );


  }
  getReNewPolicyList() {

    this.totalPolicyCount = 0;
    this.totalPremium = 0;
    this.totalSumInsured = 0;
    let ReqObj = {
      // "CompanyId": '100046',
      "CompanyId": this.userDetails.InsuranceId,
    }
    let urlLink = `${this.RenewalApiUrl}renewalDashBoard/getRenewPolicyList`;

    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {

        if (data) {
          this.RenewPolicyList = data?.Result

          this.totalPolicyCount = this.RenewPolicyList?.reduce((sum: any, item: any) => sum + parseInt(item.PolicyCount, 10), 0);
          this.totalPremium = this.RenewPolicyList?.reduce((sum: any, item: any) => sum + parseInt(item.PolicyPremium, 10), 0);
          this.totalSumInsured = this.RenewPolicyList?.reduce((sum: any, item: any) => sum + parseInt(item.PolicySumInsured, 10), 0);
          setTimeout(() => {
            // this.dueRenewal();
          }, 100);
        }
      },
      (err: any) => { },
    );


  }
  scrollTabs(direction: 'left' | 'right') {
    const tabNav = this.tabWrapper.nativeElement.querySelector('.p-tabview-nav');
    const scrollAmount = 150;
    tabNav.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  }
  transform(value: number | string): string {
    if (value === null || value === undefined) return '';
    const num = typeof value === 'string' ? Number(value.replace(/,/g, '')) : value;
    return isNaN(num) ? '' : num.toLocaleString('en-IN');
  }

  onTabChange(event: any) {
    this.show = true;
    this.TabIndex = event.index;
    if (event.index == 0) {
      // this.getDueRenewPolicyList();
        this.getMohtDate();
    } else if (event.index == 1) {
  this.getMohtDatePaid();
     
   

    }
    else if (event.index == 2) {
   this.getClaimSumCumulative();
      
    }
    else if (event.index == 3) {
this.getClaimSumCumulativePaid();
    }
    else if (event.index == 4) {
      // this.getMohtDate();
      this.getClaimRatio();
    }
    else if (event.index == 5) {
      // this.getClaimSumCumulative();
    }
  }

  dueRenewal() {

    if (this.DueRenewPolicyList?.length != 0 && this.DueRenewPolicyList != null) {



      const brokerData = this.DueRenewPolicyList.filter(
        (d: { SourceOfBusiness: any }) => d.SourceOfBusiness === this.sourceOfBusiness
      );

      const grouped: {
        [classOfBusiness: string]: {
          count: number;
          premium: number;
          branch: string;
        };
      } = {};

      brokerData.forEach((entry: { Branch: any; PolicyCount: any; PolicyPremium: any; ClassOfBusiness: any }) => {
        const key = entry.ClassOfBusiness;
        if (!grouped[key]) {
          grouped[key] = {
            count: 0,
            premium: 0,
            branch: entry.Branch || ''
          };
        }
        grouped[key].count += parseInt(entry.PolicyCount, 10);
        grouped[key].premium += parseFloat(entry.PolicyPremium);
      });

      // Extract values
      const classOfBusinessList = Object.keys(grouped);
      const policyCounts = classOfBusinessList.map(cob => grouped[cob].count);
      const premiums = classOfBusinessList.map(cob => grouped[cob].premium);
      const branches = classOfBusinessList.map(cob => grouped[cob].branch);

      // Chart setup
      const dom = document.getElementById('chart-container')!;
      const myChart = echarts.init(dom);

      const option: echarts.EChartsOption = {
        tooltip: {
          trigger: 'axis',
          backgroundColor: '#fff',
          borderColor: '#ccc',
          borderWidth: 1,
          padding: 10,
          textStyle: {
            color: '#333',
            fontSize: 11, // Reduced font size
            fontFamily: 'Segoe UI, sans-serif'
          },
          formatter: (params: any) => {
            const index = params[0].dataIndex;
            const cob = classOfBusinessList[index];
            const branch = branches[index];
            const count = policyCounts[index];
            const premium = premiums[index];

            return `
      <div style="line-height: 1.4">
        <strong>Product:</strong> ${cob}<br/>
        <strong>Policy Count:</strong> ${count}<br/>
        <strong>Premium:</strong> ${premium.toLocaleString()}
      </div>
    `;
          }
        },

        legend: {
          top: '2%',
          left: 'center',
          data: ['Policy Count', 'Premium']
        },
        grid: {
          top: '15%',
          bottom: '15%',
          left: '10%',
          right: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: classOfBusinessList,
          axisLabel: {
            rotate: 30
          },
          splitLine: {
            show: false
          }
        },
        yAxis: [
          {
            type: 'value',
            name: 'Policy Count',
            splitLine: {
              show: false
            }
          },
          {
            type: 'value',
            name: 'Premium',
            position: 'right',
            splitLine: {
              show: false
            }
          }
        ],
        series: [
          {
            name: 'Policy Count',
            type: 'bar',
            data: policyCounts,
            yAxisIndex: 0,
            itemStyle: { color: '#3398DB' }
          },
          {
            name: 'Premium',
            type: 'line',
            data: premiums,
            yAxisIndex: 1,
            itemStyle: { color: '#FF9933' }
          }
        ]
      };

      myChart.setOption(option);
    }


  }
  NewPolicy() {

    if (this.NewPolicyList?.length != 0 && this.NewPolicyList != null) {


      const brokerData = this.NewPolicyList.filter(
        (d: { SourceOfBusiness: any }) => d.SourceOfBusiness == this.sourceOfBusiness
      );

      const grouped: {
        [classOfBusiness: string]: {
          count: number;
          premium: number;
          branch: string;
        };
      } = {};

      brokerData.forEach((entry: { Branch: any; PolicyCount: any; PolicyPremium: any; ClassOfBusiness: any }) => {
        const key = entry.ClassOfBusiness;
        if (!grouped[key]) {
          grouped[key] = {
            count: 0,
            premium: 0,
            branch: entry.Branch || ''
          };
        }
        grouped[key].count += parseInt(entry.PolicyCount, 10);
        grouped[key].premium += parseFloat(entry.PolicyPremium);
      });

      // Extract values
      const classOfBusinessList = Object.keys(grouped);
      const policyCounts = classOfBusinessList.map(cob => grouped[cob].count);
      const premiums = classOfBusinessList.map(cob => grouped[cob].premium);
      const branches = classOfBusinessList.map(cob => grouped[cob].branch);

      // Chart setup
      const dom = document.getElementById('chart-container1')!;
      const myChart = echarts.init(dom);

      const option: echarts.EChartsOption = {
        tooltip: {
          trigger: 'axis',
          backgroundColor: '#fff',
          borderColor: '#ccc',
          borderWidth: 1,
          padding: 10,
          textStyle: {
            color: '#333',
            fontSize: 11, // Reduced font size
            fontFamily: 'Segoe UI, sans-serif'
          },
          formatter: (params: any) => {
            const index = params[0].dataIndex;
            const cob = classOfBusinessList[index];
            const branch = branches[index];
            const count = policyCounts[index];
            const premium = premiums[index];

            return `
      <div style="line-height: 1.4">
        <strong>Product:</strong> ${cob}<br/>
        <strong>Branch:</strong> ${branch}<br/>
        <strong>Policy Count:</strong> ${count}<br/>
        <strong>Premium:</strong> ${premium.toLocaleString()}
      </div>
    `;
          }
        },

        legend: {
          top: '2%',
          left: 'center',
          data: ['Policy Count', 'Premium']
        },
        grid: {
          top: '15%',
          bottom: '15%',
          left: '10%',
          right: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: classOfBusinessList,
          axisLabel: {
            rotate: 30
          },
          splitLine: {
            show: false
          }
        },
        yAxis: [
          {
            type: 'value',
            name: 'Policy Count',
            splitLine: {
              show: false
            }
          },
          {
            type: 'value',
            name: 'Premium',
            position: 'right',
            splitLine: {
              show: false
            }
          }
        ],
        series: [
          {
            name: 'Policy Count',
            type: 'bar',
            data: policyCounts,
            yAxisIndex: 0,
            itemStyle: { color: '#3398DB' }
          },
          {
            name: 'Premium',
            type: 'line',
            data: premiums,
            yAxisIndex: 1,
            itemStyle: { color: '#FF9933' }
          }
        ]
      };

      myChart.setOption(option);

    }

  }

  onSourceChange() {
    if (this.TabIndex == 0) {
      this.getDueRenewPolicyList();
    }
    if (this.TabIndex == 1) {
      this.getNewPolicyList();
    }
  }
  onSelectValueChange(event: any) {
    if (this.TabIndex == 0) {
      this.getDueRenewPolicyList();
    }
    if (this.TabIndex == 1) {
      this.getNewPolicyList();
    }
  }
  onGlobalFilter(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.dt2.filterGlobal(input.value, 'contains');
  }

  viewDetails(detatils: any) {
    console.log(detatils);

    sessionStorage.setItem('month', this.month);
    sessionStorage.setItem('selectedData', JSON.stringify(detatils));
    this.router.navigate(['/summary/claim-product-wise-count'])
  }
  viewDetails1(detatils: any) {
    console.log(detatils);

    sessionStorage.setItem('month', this.month);
    sessionStorage.setItem('selectedData', JSON.stringify(detatils));
    this.router.navigate(['/summary/monthly-paid-product-wise-count'])
  }
  getTotal(week: 'week1' | 'week2' | 'week3' | 'week4', type: 'previous' | 'actual', field: 'count' | 'premium' | 'sumInsured' | 'prevSumInsured') {
    return this.tableData.reduce((sum, sale) => {
      const value = sale[week]?.[type]?.[field] ?? 0;
      return sum + value;
    }, 0);
  }

  getTotalCount() {
    return this.tableData.reduce((sum, sale) => sum + (sale.totalCount ?? 0), 0);
  }


  exportPdf() {
    const doc = new jsPDF('l', 'mm', 'a4');
    let logoPath = '';
    switch (this.userDetails.InsuranceId) {
      case '100046': logoPath = 'assets/phoenixAlt.png'; break;
      case '100047': logoPath = 'assets/cropped-botwa.png'; break;
      case '100048': logoPath = 'assets/PhoenixMozambique.png'; break;
      case '100049': logoPath = 'assets/cropped-swaziland.png'; break;
      case '100050': logoPath = 'assets/cropped-NAMIBIA-LOGO-1.png'; break;
      case '100052': logoPath = 'assets/aic_logo.jpg'; break;
      case '100002': logoPath = 'assets/alliance-img-1.png'; break;
      case '100020': logoPath = 'assets/FirstAssurance.png'; break;
      default: logoPath = 'assets/phoneix-logo.png';
    }

    const img = new Image();
    img.src = logoPath;

    img.onload = () => {

      doc.addImage(img, 'PNG', 10, 5, 30, 20);

      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Claim Summary Report', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });

      const now = new Date();
      const dateStr = now.toLocaleString('en-IN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.text(`Downloaded: ${dateStr}`, doc.internal.pageSize.getWidth() - 10, 10, { align: 'right' });

      let head: any
      head = [
        [
          { content: 'Product', rowSpan: 4 },
          { content: 'Branch', rowSpan: 4 },
          // { content: 'Source', rowSpan: 4 },
          { content: 'Customer Type', rowSpan: 4 },
          { content: 'Weeks', colSpan: 16, styles: { halign: 'center' } },
          { content: 'Total Count', rowSpan: 4 }
        ],
        [
          { content: 'Week 1', colSpan: 4 },
          { content: 'Week 2', colSpan: 4 },
          { content: 'Week 3', colSpan: 4 },
          { content: 'Week 4', colSpan: 4 }
        ],
        [
          { content: 'Previous', colSpan: 2 },
          { content: 'Actual', colSpan: 2 },
          { content: 'Previous', colSpan: 2 },
          { content: 'Actual', colSpan: 2 },
          { content: 'Previous', colSpan: 2 },
          { content: 'Actual', colSpan: 2 },
          { content: 'Previous', colSpan: 2 },
          { content: 'Actual', colSpan: 2 }
        ],
        [
          'Count', 'Claim Amount',
          'Count', 'Claim Amount',
          'Count', 'Claim Amount',
          'Count', 'Claim Amount',
          'Count', 'Claim Amount',
          'Count', 'Claim Amount',
          'Count', 'Claim Amount',
          'Count', 'Claim Amount'
        ]
      ];

      const body = this.tableData.map(item => [
        item.product,
        item.branch,
        // item.source,
        item.cusotmerType || '',
        item.week1?.previous?.count ?? '',
        item.week1?.previous?.premium ?? '',
        item.week1?.actual?.count ?? '',
        item.week1?.actual?.premium ?? '',
        item.week2?.previous?.count ?? '',
        item.week2?.previous?.premium ?? '',
        item.week2?.actual?.count ?? '',
        item.week2?.actual?.premium ?? '',
        item.week3?.previous?.count ?? '',
        item.week3?.previous?.premium ?? '',
        item.week3?.actual?.count ?? '',
        item.week3?.actual?.premium ?? '',
        item.week4?.previous?.count ?? '',
        item.week4?.previous?.premium ?? '',
        item.week4?.actual?.count ?? '',
        item.week4?.actual?.premium ?? '',
        item.totalCount
      ]);
  const footer = [
        'Total', '', '', '',
        this.getTotal('week1', 'previous', 'count'),
        this.getTotal('week1', 'previous', 'premium'),
        this.getTotal('week1', 'previous', 'sumInsured'),
        this.getTotal('week1', 'actual', 'count'),
        this.getTotal('week1', 'actual', 'premium'),
        this.getTotal('week1', 'actual', 'sumInsured'),
        this.getTotal('week2', 'previous', 'count'),
        this.getTotal('week2', 'previous', 'premium'),
        this.getTotal('week2', 'previous', 'sumInsured'),
        this.getTotal('week2', 'actual', 'count'),
        this.getTotal('week2', 'actual', 'premium'),
        this.getTotal('week2', 'actual', 'sumInsured'),
        this.getTotal('week3', 'previous', 'count'),
        this.getTotal('week3', 'previous', 'premium'),
        this.getTotal('week3', 'previous', 'sumInsured'),
        this.getTotal('week3', 'actual', 'count'),
        this.getTotal('week3', 'actual', 'premium'),
        this.getTotal('week3', 'actual', 'sumInsured'),
        this.getTotal('week4', 'previous', 'count'),
        this.getTotal('week4', 'previous', 'premium'),
        this.getTotal('week4', 'previous', 'sumInsured'),
        this.getTotal('week4', 'actual', 'count'),
        this.getTotal('week4', 'actual', 'premium'),
        this.getTotal('week4', 'actual', 'sumInsured'),
        this.getTotalCount()
      ];

      autoTable(doc, {
        head: head,
        body: body,
        foot: [footer],
        startY: 30,
        theme: 'grid',
        styles: {
          fontSize: 6,
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          lineWidth: 0.1,
          lineColor: 0,
          halign: 'center',
          valign: 'middle'
        },
        footStyles: {
          fillColor: [41, 128, 185],
          fontStyle: 'bold',
          lineWidth: 0.1,
          lineColor: 0
        },
        margin: { top: 20 },
      });

      doc.save('Claim_Summary_Report.pdf');
    };
  }

  exportExcel() {
    let worksheetData: any = this.tableData.map(item => ({
      'Product': item.product,
      'Branch': item.branch,
      'Source': item.source,
      'Customer Type': item.cusotmerType || '',
      'W1 Prev Count': item.week1?.previous?.count ?? '',
      'W1 Prev Claim Amount': item.week1?.previous?.premium ?? '',
      'W1 Actual Count': item.week1?.actual?.count ?? '',
      'W1 Actual Claim Amount': item.week1?.actual?.premium ?? '',
      'W2 Prev Count': item.week2?.previous?.count ?? '',
      'W2 Prev Claim Amount': item.week2?.previous?.premium ?? '',
      'W2 Actual Count': item.week2?.actual?.count ?? '',
      'W2 Actual Claim Amount': item.week2?.actual?.premium ?? '',
      'W3 Prev Count': item.week3?.previous?.count ?? '',
      'W3 Prev Claim Amount': item.week3?.previous?.premium ?? '',
      'W3 Actual Count': item.week3?.actual?.count ?? '',
      'W3 Actual Claim Amount': item.week3?.actual?.premium ?? '',
      'W4 Prev Count': item.week4?.previous?.count ?? '',
      'W4 Prev Claim Amount': item.week4?.previous?.premium ?? '',
      'W4 Actual Count': item.week4?.actual?.count ?? '',
      'W4 Actual Claim Amount': item.week4?.actual?.premium ?? '',
      'Total Count': item.totalCount
    }));

    // Add footer totals
    worksheetData.push({
      'Product': 'Total',
      'W1 Prev Count': this.getTotal('week1', 'previous', 'count'),
      'W1 Prev Claim Amount': this.getTotal('week1', 'previous', 'premium'),
      'W1 Actual Count': this.getTotal('week1', 'actual', 'count'),
      'W1 Actual Claim Amount': this.getTotal('week1', 'actual', 'premium'),
      'W2 Prev Count': this.getTotal('week2', 'previous', 'count'),
      'W2 Prev Claim Amount': this.getTotal('week2', 'previous', 'premium'),
      'W2 Actual Count': this.getTotal('week2', 'actual', 'count'),
      'W2 Actual Claim Amount': this.getTotal('week2', 'actual', 'premium'),
      'W3 Prev Count': this.getTotal('week3', 'previous', 'count'),
      'W3 Prev Claim Amount': this.getTotal('week3', 'previous', 'premium'),
      'W3 Actual Count': this.getTotal('week3', 'actual', 'count'),
      'W3 Actual Claim Amount': this.getTotal('week3', 'actual', 'premium'),
      'W4 Prev Count': this.getTotal('week4', 'previous', 'count'),
      'W4 Prev Claim Amount': this.getTotal('week4', 'previous', 'premium'),
      'W4 Actual Count': this.getTotal('week4', 'actual', 'count'),
      'W4 Actual Claim Amount': this.getTotal('week4', 'actual', 'premium'),
      'Total Count': this.getTotalCount()
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Policy Summary');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(data, 'Policy_Summary_Report.xlsx');
  }
  barchart() {
    const dom = this.chartContainer?.nativeElement;
    const chart = echarts.init(dom);
    chart.clear();
    const weeks = ['week1', 'week2', 'week3', 'week4'];

    const categories: string[] = [];
    const countSeriesData: number[][] = [];
    const premiumSeriesData: number[][] = [];
    let data = []
    if (this.tableData?.length != 0 && this.tableData != null) {
      if (this.tableData.length < 5) {
        data = [...this.tableData];
        const EMPTY_ROW = {
          product: '',
          source: '',
          week1: { actual: { count: 0, premium: 0 } },
          week2: { actual: { count: 0, premium: 0 } },
          week3: { actual: { count: 0, premium: 0 } },
          week4: { actual: { count: 0, premium: 0 } }
        };

        if (data.length < 5) {
          const rowsToAdd = 7;
          for (let i = 0; i < rowsToAdd; i++) {
            data.push(EMPTY_ROW);
          }
        }
      }
      else {
        data = this.tableData
      }



      data.forEach(item => {
        const label = `${item.product}`;
        categories.push(label);

        const counts: number[] = [];
        const premiums: number[] = [];

        weeks.forEach(week => {
          const actual = item[week]?.actual || { count: 0, premium: 0 };
          counts.push(actual.count);
          premiums.push(actual.premium);
        });

        countSeriesData.push(counts);
        premiumSeriesData.push(premiums);
      });
    }
    else {
      data = []
      chart.clear();
    }
    const series: echarts.SeriesOption[] = [];

    weeks.forEach((week, i) => {

      series.push({
        name: `Week ${i + 1} - Count`,
        type: 'bar',
        stack: 'count',
        barMaxWidth: '25',
        emphasis: { focus: 'series' },
        itemStyle: {
          borderRadius: [0, 0, 0, 0]
        },
        data: countSeriesData.map(row => row[i]),
        label: { show: false }
      });

      series.push({
        name: `Week ${i + 1} - Claim Amount`,
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        showSymbol: false,
        emphasis: {
          focus: 'series',
          scale: true,
          itemStyle: {
            opacity: 1
          },
          label: {
            show: false
          }
        },
        lineStyle: {
          width: 3
        },
        itemStyle: {
          opacity: 1
        },
        data: premiumSeriesData.map(row => row[i])
      });
    });

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'none'
        }
      },
      legend: {
        type: 'scroll',
        icon: 'rect',
        itemWidth: 14,
        itemHeight: 14,
        itemGap: 10,
        textStyle: {
          fontSize: 12,
          color: '#333'
        }
      },

      color: ['#4F81BD', '#9BBB59', '#8064A2', '#F79646', '#2C97DE', '#00B894', '#D63031', '#6C5CE7'],

      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: categories,
          axisLabel: {
            interval: 0,
            rotate: 30
          },
          axisLine: {
            lineStyle: { color: '#888' }
          },
          splitLine: { show: false }
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: 'Count',
          splitLine: { show: false },
          axisLine: {
            lineStyle: { color: '#888' }
          }
        },
        {
          type: 'value',
          name: 'Claim Amount',
          axisLabel: {
            formatter: '{value}'
          },
          splitLine: { show: false },
          axisLine: {
            lineStyle: { color: '#888' }
          }
        }
      ],
      series: series
    };

    chart.setOption(option);
    window.addEventListener('resize', () => chart.resize());
  }
  barchartPaid() {
    const dom = this.chartContainerPaid?.nativeElement;
    const chart = echarts.init(dom);
    chart.clear();
    const weeks = ['week1', 'week2', 'week3', 'week4'];

    const categories: string[] = [];
    const countSeriesData: number[][] = [];
    const premiumSeriesData: number[][] = [];
    let data = []
    if (this.tableData?.length != 0 && this.tableData != null) {
      if (this.tableData.length < 5) {
        data = [...this.tableData];
        const EMPTY_ROW = {
          product: '',
          source: '',
          week1: { actual: { count: 0, premium: 0 } },
          week2: { actual: { count: 0, premium: 0 } },
          week3: { actual: { count: 0, premium: 0 } },
          week4: { actual: { count: 0, premium: 0 } }
        };

        if (data.length < 5) {
          const rowsToAdd = 7;
          for (let i = 0; i < rowsToAdd; i++) {
            data.push(EMPTY_ROW);
          }
        }
      }
      else {
        data = this.tableData
      }



      data.forEach(item => {
        const label = `${item.product}`;
        categories.push(label);

        const counts: number[] = [];
        const premiums: number[] = [];

        weeks.forEach(week => {
          const actual = item[week]?.actual || { count: 0, premium: 0 };
          counts.push(actual.count);
          premiums.push(actual.premium);
        });

        countSeriesData.push(counts);
        premiumSeriesData.push(premiums);
      });
    }
    else {
      data = []
      chart.clear();
    }
    const series: echarts.SeriesOption[] = [];

    weeks.forEach((week, i) => {

      series.push({
        name: `Week ${i + 1} - Count`,
        type: 'bar',
        stack: 'count',
        barMaxWidth: '25',
        emphasis: { focus: 'series' },
        itemStyle: {
          borderRadius: [0, 0, 0, 0]
        },
        data: countSeriesData.map(row => row[i]),
        label: { show: false }
      });

      series.push({
        name: `Week ${i + 1} - Claim Amount`,
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        showSymbol: false,
        emphasis: {
          focus: 'series',
          scale: true,
          itemStyle: {
            opacity: 1
          },
          label: {
            show: false
          }
        },
        lineStyle: {
          width: 3
        },
        itemStyle: {
          opacity: 1
        },
        data: premiumSeriesData.map(row => row[i])
      });
    });

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'none'
        }
      },
      legend: {
        type: 'scroll',
        icon: 'rect',
        itemWidth: 14,
        itemHeight: 14,
        itemGap: 10,
        textStyle: {
          fontSize: 12,
          color: '#333'
        }
      },

      color: ['#4F81BD', '#9BBB59', '#8064A2', '#F79646', '#2C97DE', '#00B894', '#D63031', '#6C5CE7'],

      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: categories,
          axisLabel: {
            interval: 0,
            rotate: 30
          },
          axisLine: {
            lineStyle: { color: '#888' }
          },
          splitLine: { show: false }
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: 'Count',
          splitLine: { show: false },
          axisLine: {
            lineStyle: { color: '#888' }
          }
        },
        {
          type: 'value',
          name: 'Claim Amount',
          axisLabel: {
            formatter: '{value}'
          },
          splitLine: { show: false },
          axisLine: {
            lineStyle: { color: '#888' }
          }
        }
      ],
      series: series
    };

    chart.setOption(option);
    window.addEventListener('resize', () => chart.resize());
  }

  getClaimSumCumulative() {
    this.polSumCumulativeList = [];
    // const dateObj = new Date(this.selectedMonth);

    // const formatted = ('0' + (dateObj.getMonth() + 1)).slice(-2) + '/' + dateObj.getFullYear();
    // this.month = formatted
    let ReqObj = {
      "CompanyId": this.userDetails.InsuranceId,
      "Branch": this.selectedBranch == 'All' ? this.AllBranchList : this.selectedBranch,
      "CustomerType": this.selectedCutomerType == 'All' ? null : this.selectedCutomerType,
      "Source": this.selectedSource == 'All' ? null : this.selectedSource,

    }
    sessionStorage.setItem('ReqObj', JSON.stringify(ReqObj));
    let urlLink = `${this.RenewalApiUrl}renewalDashBoard/getCumulativeClaimList`;

    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {

        if (data.Result) {
          this.polSumCumulativeList = data.Result
          this.barchartData = this.polSumCumulativeList;
          this.cdRef.detectChanges();

          setTimeout(() => {
            this.barchart4();

          }, 200);
        }

      },
      (err: any) => { },
    );
  }
  getClaimSumCumulativePaid() {
    this.ClaimSumCumulativePaidList = [];
    // const dateObj = new Date(this.selectedMonth);

    // const formatted = ('0' + (dateObj.getMonth() + 1)).slice(-2) + '/' + dateObj.getFullYear();
    // this.month = formatted
    let ReqObj = {
      "CompanyId": this.userDetails.InsuranceId,
      "Branch": this.selectedBranch == 'All' ? this.AllBranchList : this.selectedBranch,
      "CustomerType": this.selectedCutomerType == 'All' ? null : this.selectedCutomerType,
      "Source": this.selectedSource == 'All' ? null : this.selectedSource,

    }
    sessionStorage.setItem('ReqObj', JSON.stringify(ReqObj));
    let urlLink = `${this.RenewalApiUrl}renewalDashBoard/getCumulativePaidClaimList`;

    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {

        if (data.Result) {
          this.ClaimSumCumulativePaidList = data.Result
          this.barchartData = this.ClaimSumCumulativePaidList;
          this.cdRef.detectChanges();

          setTimeout(() => {
            this.barchart5();

          }, 200);
        }

      },
      (err: any) => { },
    );
  }
  getClaimRatio() {
    this.getClaimRatioList = [];
    // const dateObj = new Date(this.selectedMonth);

    // const formatted = ('0' + (dateObj.getMonth() + 1)).slice(-2) + '/' + dateObj.getFullYear();
    // this.month = formatted
    let ReqObj = {
      "CompanyId": this.userDetails.InsuranceId,
      "Branch": this.selectedBranch == 'All' ? this.AllBranchList : this.selectedBranch,
      "CustomerType": this.selectedCutomerType == 'All' ? null : this.selectedCutomerType,
      "Source": this.selectedSource == 'All' ? null : this.selectedSource,

    }
    sessionStorage.setItem('ReqObj', JSON.stringify(ReqObj));
    let urlLink = `${this.RenewalApiUrl}renewalDashBoard/getClaimRatioList`;

    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {

        if (data.Result) {
          this.getClaimRatioList = data.Result
          this.barchartData = this.getClaimRatioList;
          this.cdRef.detectChanges();

          setTimeout(() => {
            this.barchart6();

          }, 200);
        }

      },
      (err: any) => { },
    );
  }
  getPolSumCancelled() {
    this.polSumCancelledList = [];
    // const dateObj = new Date(this.selectedMonth);

    // const formatted = ('0' + (dateObj.getMonth() + 1)).slice(-2) + '/' + dateObj.getFullYear();
    // this.month = formatted
    let ReqObj = {
      "CompanyId": this.userDetails.InsuranceId,
      "Branch": this.selectedBranch == 'All' ? this.AllBranchList : this.selectedBranch,
      "CustomerType": this.selectedCutomerType == 'All' ? null : this.selectedCutomerType,
      "Source": this.selectedSource == 'All' ? null : this.selectedSource,
      "StartDate": this.formatDate(this.from_date),
      "EndDate": this.formatDate(this.to_date)

    }
    sessionStorage.setItem('ReqObj', JSON.stringify(ReqObj));
    let urlLink = `${this.RenewalApiUrl}renewalDashBoard/getCancelPolicyList`;

    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {

        if (data.Result) {
          this.polSumCancelledList = data.Result
          if (!this.show) {
            this.barchartData = [];
            this.barchartData = this.polSumCancelledList
            this.cdRef.detectChanges();
            setTimeout(() => {
              this.barchartCancelled();

            }, 200);
          }

        }

      },
      (err: any) => { },
    );
  }
  getPolSumLapsed() {
    this.polSumLapsedList = [];
    // const dateObj = new Date(this.selectedMonth);

    // const formatted = ('0' + (dateObj.getMonth() + 1)).slice(-2) + '/' + dateObj.getFullYear();
    // this.month = formatted
    let ReqObj = {
      "CompanyId": this.userDetails.InsuranceId,
      "Branch": this.selectedBranch == 'All' ? this.AllBranchList : this.selectedBranch,
      "CustomerType": this.selectedCutomerType == 'All' ? null : this.selectedCutomerType,
      "Source": this.selectedSource == 'All' ? null : this.selectedSource,
      "StartDate": this.formatDate(this.from_date),
      "EndDate": this.formatDate(this.to_date)

    }
    sessionStorage.setItem('ReqObj', JSON.stringify(ReqObj));
    let urlLink = `${this.RenewalApiUrl}renewalDashBoard/getLapsedPolicyList`;

    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {

        if (data.Result) {
          this.polSumLapsedList = data.Result
          if (!this.show) {
            this.barchartData = [];
            this.barchartData = this.polSumLapsedList
            this.cdRef.detectChanges();
            setTimeout(() => {
              this.barchartLapsed();

            }, 200);
          }
        }

      },
      (err: any) => { },
    );
  }
  getPolSumNew() {
    this.polSumNewList = [];
    // const dateObj = new Date(this.selectedMonth);

    // const formatted = ('0' + (dateObj.getMonth() + 1)).slice(-2) + '/' + dateObj.getFullYear();
    // this.month = formatted
    let ReqObj = {
      "CompanyId": this.userDetails.InsuranceId,
      "Branch": this.selectedBranch == 'All' ? this.AllBranchList : this.selectedBranch,
      "CustomerType": this.selectedCutomerType == 'All' ? null : this.selectedCutomerType,
      "Source": this.selectedSource == 'All' ? null : this.selectedSource,
      "StartDate": this.formatDate(this.from_date),
      "EndDate": this.formatDate(this.to_date)

    }
    sessionStorage.setItem('ReqObj', JSON.stringify(ReqObj));
    let urlLink = `${this.RenewalApiUrl}renewalDashBoard/getNewPolicyList`;

    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {

        if (data.Result) {
          this.polSumNewList = data.Result
          if (!this.show) {
            this.barchartData = [];
            this.barchartData = this.polSumNewList
            this.cdRef.detectChanges();
            setTimeout(() => {
              this.barchart2();

            }, 200);
          }
        }

      },
      (err: any) => { },
    );
  }
  renewalchange(value) {
    this.show = true;
    this.getPolSumRenewal();
  }
  getPolSumRenewal() {
    this.polSumRenewalList = [];
    // const dateObj = new Date(this.selectedMonth);

    // const formatted = ('0' + (dateObj.getMonth() + 1)).slice(-2) + '/' + dateObj.getFullYear();
    // this.month = formatted
    let ReqObj = {
      "CompanyId": this.userDetails.InsuranceId,
      "Branch": this.selectedBranch == 'All' ? this.AllBranchList : this.selectedBranch,
      "CustomerType": this.selectedCutomerType == 'All' ? null : this.selectedCutomerType,
      "Source": this.selectedSource == 'All' ? null : this.selectedSource,
      "StartDate": this.formatDate(this.from_date),
      "EndDate": this.formatDate(this.to_date)

    }
    sessionStorage.setItem('ReqObj', JSON.stringify(ReqObj));

    let urlLink = '';
    if (this.selectedRenewalType == 'RENEWAL') {
      urlLink = `${this.RenewalApiUrl}renewalDashBoard/getRenewPolicyList`;
    }
    if (this.selectedRenewalType == 'RENEWAL_IN_PERSON') {
      urlLink = `${this.RenewalApiUrl}renewalDashBoard/getRenewPolicyListInPerson`;
    }
    if (this.selectedRenewalType == 'RENEWAL_IN_PORTAL') {
      urlLink = `${this.RenewalApiUrl}renewalDashBoard/getRenewPolicyListInPortal`;
    }
    if (this.selectedRenewalType == 'RENEWAL_POST_LAPSE') {
      urlLink = `${this.RenewalApiUrl}renewalDashBoard/getRenewPolicyListPostLapse`;
    }

    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {

        if (data.Result) {
          this.polSumRenewalList = data.Result
          if (!this.show) {
            this.barchartData = [];
            setTimeout(() => {
              this.barchartData = this.polSumRenewalList;
              this.cdRef.detectChanges();

            }, 100);
            setTimeout(() => {
              this.barchart3();

            }, 200);
          }

        }

      },
      (err: any) => { },
    );
  }

  formatDate(date: any): string | null {
    return this.datePipe.transform(date, 'yyyy-MM-dd');
  }


  barchart2() {
    const dom = this.chartContainer2?.nativeElement;
    echarts.dispose(dom);
    const chart = echarts.init(dom);
    chart.clear();
    let data = [];
    data = this.barchartData || [];
    console.log(data, "datadata");

    const categories: string[] = [];
    const countSeriesData: any[] = [];
    const premiumSeriesData: any[] = [];

    data.forEach(item => {
      const label = `${item.ClassOfBusiness} - ${item.SourceOfBusiness}`;
      categories.push(label);
      countSeriesData.push(Number(item.PolicyCount) || 0);
      premiumSeriesData.push(Number(item.PolicyPremium) || 0);
    });
    console.log(countSeriesData, "premiumSeriesData");
    console.log(premiumSeriesData, "premiumSeriesData");


    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: {
        data: ['Policy Count', 'Premium'],
        top: '0%',
        left: 'center'
      },
      color: ['#4F81BD', '#F79646'],
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: categories,
          axisLabel: {
            interval: 0,
            rotate: 30
          },
          splitLine: { show: false }
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: 'Policy Count',
          splitLine: { show: false }
        },
        {
          type: 'value',
          name: 'Premium',
          axisLabel: {
            formatter: '{value}'
          },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: 'Policy Count',
          type: 'bar',
          barMaxWidth: 30,
          data: countSeriesData
        },
        {
          name: 'Premium',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          data: premiumSeriesData
        }
      ]
    };

    chart.setOption(option);
    window.addEventListener('resize', () => chart.resize());
  }
  barchart3() {
    const dom = this.chartContainer3?.nativeElement;
    echarts.dispose(dom);
    const chart = echarts.init(dom);
    chart.clear();
    let data = [];
    data = this.barchartData || [];
    console.log(data, "datadata");

    const categories: string[] = [];
    const countSeriesData: any[] = [];
    const premiumSeriesData: any[] = [];

    data.forEach(item => {
      const label = `${item.ClassOfBusiness} - ${item.SourceOfBusiness}`;
      categories.push(label);
      countSeriesData.push(Number(item.PolicyCount) || 0);
      premiumSeriesData.push(Number(item.PolicyPremium) || 0);
    });
    console.log(countSeriesData, "premiumSeriesData");
    console.log(premiumSeriesData, "premiumSeriesData");


    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: {
        data: ['Policy Count', 'Premium'],
        top: '0%',
        left: 'center'
      },
      color: ['#4F81BD', '#F79646'],
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: categories,
          axisLabel: {
            interval: 0,
            rotate: 30
          },
          splitLine: { show: false }
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: 'Policy Count',
          splitLine: { show: false }
        },
        {
          type: 'value',
          name: 'Premium',
          axisLabel: {
            formatter: '{value}'
          },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: 'Policy Count',
          type: 'bar',
          barMaxWidth: 30,
          data: countSeriesData
        },
        {
          name: 'Premium',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          data: premiumSeriesData
        }
      ]
    };

    chart.setOption(option);
    window.addEventListener('resize', () => chart.resize());
  }
  barchart4() {
    const dom = this.chartContainer4?.nativeElement;
    echarts.dispose(dom);
    const chart = echarts.init(dom);
    chart.clear();
    let data = [];
    data = this.barchartData || [];
    console.log(data, "datadata");

    const categories: string[] = [];
    const countSeriesData: any[] = [];
    const premiumSeriesData: any[] = [];

    data.forEach(item => {
      // const label = `${item.ClassOfBusiness} - ${item.SourceOfBusiness}`;
      // categories.push(label);
      // countSeriesData.push(Number(item.PolicyCount) || 0);
      // premiumSeriesData.push(Number(item.PolicyPremium) || 0);
       const label = `${item.ClassOfBusiness}`;
      categories.push(label);
      countSeriesData.push(Number(item.ClaimCount) || 0);
      premiumSeriesData.push(Number(item.ClaimAmount) || 0);
    });
    console.log(countSeriesData, "premiumSeriesData");
    console.log(premiumSeriesData, "premiumSeriesData");


    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: {
        data: ['Policy Count', 'Premium'],
        top: '0%',
        left: 'center'
      },
      color: ['#4F81BD', '#F79646'],
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: categories,
          axisLabel: {
            interval: 0,
            rotate: 30
          },
          splitLine: { show: false }
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: 'Policy Count',
          splitLine: { show: false }
        },
        {
          type: 'value',
          name: 'Premium',
          axisLabel: {
            formatter: '{value}'
          },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: 'Policy Count',
          type: 'bar',
          barMaxWidth: 30,
          data: countSeriesData
        },
        {
          name: 'Premium',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          data: premiumSeriesData
        }
      ]
    };

    chart.setOption(option);
    window.addEventListener('resize', () => chart.resize());
  }
  barchart5() {
    const dom = this.chartContainer5?.nativeElement;
    echarts.dispose(dom);
    const chart = echarts.init(dom);
    chart.clear();
    let data = [];
    data = this.barchartData || [];
    console.log(data, "datadata");

    const categories: string[] = [];
    const countSeriesData: any[] = [];
    const premiumSeriesData: any[] = [];

    data.forEach(item => {
      const label = `${item.ClassOfBusiness}`;
      categories.push(label);
      countSeriesData.push(Number(item.ClaimCount) || 0);
      premiumSeriesData.push(Number(item.ClaimAmount) || 0);
    });
    console.log(countSeriesData, "premiumSeriesData");
    console.log(premiumSeriesData, "premiumSeriesData");


    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: {
        data: ['Policy Count', 'Premium'],
        top: '0%',
        left: 'center'
      },
      color: ['#4F81BD', '#F79646'],
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: categories,
          axisLabel: {
            interval: 0,
            rotate: 30
          },
          splitLine: { show: false }
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: 'Policy Count',
          splitLine: { show: false }
        },
        {
          type: 'value',
          name: 'Premium',
          axisLabel: {
            formatter: '{value}'
          },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: 'Policy Count',
          type: 'bar',
          barMaxWidth: 30,
          data: countSeriesData
        },
        {
          name: 'Premium',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          data: premiumSeriesData
        }
      ]
    };

    chart.setOption(option);
    window.addEventListener('resize', () => chart.resize());
  }
  barchart6() {
    const dom = this.chartContainer6?.nativeElement;
    echarts.dispose(dom);
    const chart = echarts.init(dom);
    chart.clear();
    let data = [];
    data = this.barchartData || [];
    console.log(data, "datadata");

    const categories: string[] = [];
    const countSeriesData: any[] = [];
    const premiumSeriesData: any[] = [];

    data.forEach(item => {
      const label = `${item.ClassOfBusiness}`;
      categories.push(label);
      countSeriesData.push(Number(item.ClaimCount) || 0);
      premiumSeriesData.push(Number(item.ClaimAmount) || 0);
    });
    console.log(countSeriesData, "premiumSeriesData");
    console.log(premiumSeriesData, "premiumSeriesData");


    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: {
        data: ['Policy Count', 'Premium'],
        top: '0%',
        left: 'center'
      },
      color: ['#4F81BD', '#F79646'],
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: categories,
          axisLabel: {
            interval: 0,
            rotate: 30
          },
          splitLine: { show: false }
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: 'Policy Count',
          splitLine: { show: false }
        },
        {
          type: 'value',
          name: 'Premium',
          axisLabel: {
            formatter: '{value}'
          },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: 'Policy Count',
          type: 'bar',
          barMaxWidth: 30,
          data: countSeriesData
        },
        {
          name: 'Premium',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          data: premiumSeriesData
        }
      ]
    };

    chart.setOption(option);
    window.addEventListener('resize', () => chart.resize());
  }
  barchartLapsed() {
    const dom = this.chartContainerLapsed?.nativeElement;
    echarts.dispose(dom);
    const chart = echarts.init(dom);
    chart.clear();
    let data = [];
    data = this.barchartData || [];
    console.log(data, "datadata");

    const categories: string[] = [];
    const countSeriesData: any[] = [];
    const premiumSeriesData: any[] = [];

    data.forEach(item => {
      const label = `${item.ClassOfBusiness} - ${item.SourceOfBusiness}`;
      categories.push(label);
      countSeriesData.push(Number(item.PolicyCount) || 0);
      premiumSeriesData.push(Number(item.PolicyPremium) || 0);
    });
    console.log(countSeriesData, "premiumSeriesData");
    console.log(premiumSeriesData, "premiumSeriesData");


    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: {
        data: ['Policy Count', 'Premium'],
        top: '0%',
        left: 'center'
      },
      color: ['#4F81BD', '#F79646'],
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: categories,
          axisLabel: {
            interval: 0,
            rotate: 30
          },
          splitLine: { show: false }
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: 'Policy Count',
          splitLine: { show: false }
        },
        {
          type: 'value',
          name: 'Premium',
          axisLabel: {
            formatter: '{value}'
          },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: 'Policy Count',
          type: 'bar',
          barMaxWidth: 30,
          data: countSeriesData
        },
        {
          name: 'Premium',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          data: premiumSeriesData
        }
      ]
    };

    chart.setOption(option);
    window.addEventListener('resize', () => chart.resize());
  }
  barchartCancelled() {
    const dom = this.chartContainerCancel?.nativeElement;
    echarts.dispose(dom);
    const chart = echarts.init(dom);
    chart.clear();
    let data = [];
    data = this.barchartData || [];
    console.log(data, "datadata");

    const categories: string[] = [];
    const countSeriesData: any[] = [];
    const premiumSeriesData: any[] = [];

    data.forEach(item => {
      const label = `${item.ClassOfBusiness} - ${item.SourceOfBusiness}`;
      categories.push(label);
      countSeriesData.push(Number(item.PolicyCount) || 0);
      premiumSeriesData.push(Number(item.PolicyPremium) || 0);
    });
    console.log(countSeriesData, "premiumSeriesData");
    console.log(premiumSeriesData, "premiumSeriesData");


    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: {
        data: ['Policy Count', 'Premium'],
        top: '0%',
        left: 'center'
      },
      color: ['#4F81BD', '#F79646'],
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: categories,
          axisLabel: {
            interval: 0,
            rotate: 30
          },
          splitLine: { show: false }
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: 'Policy Count',
          splitLine: { show: false }
        },
        {
          type: 'value',
          name: 'Premium',
          axisLabel: {
            formatter: '{value}'
          },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: 'Policy Count',
          type: 'bar',
          barMaxWidth: 30,
          data: countSeriesData
        },
        {
          name: 'Premium',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          data: premiumSeriesData
        }
      ]
    };

    chart.setOption(option);
    window.addEventListener('resize', () => chart.resize());
  }

}
