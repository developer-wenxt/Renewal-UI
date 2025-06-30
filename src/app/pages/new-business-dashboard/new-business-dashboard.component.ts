import { Component, AfterViewInit, ElementRef, ViewChild, OnInit } from '@angular/core';
import * as echarts from 'echarts';
import { Table } from 'primeng/table';
import { EChartsOption, BarSeriesOption } from 'echarts';
import { config } from '../../helpers/appconfig';
import { SharedService } from '../../services/shareService';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { SidebarService } from '../../services/sidebar.service';
import * as CryptoJS from 'crypto-js';
// import * as CryptoJS from 'crypto-js';
import { AuthService } from '../../helpers/auth/Auth/auth.service';
import { SessionStorageService } from '../../storage/session-storage.service';
@Component({
  selector: 'app-new-business-dashboard',
  standalone: false,
  templateUrl: './new-business-dashboard.component.html',
  styleUrl: './new-business-dashboard.component.scss'
})
export class NewBusinessDashboardComponent {
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  @ViewChild('dt2') dt2!: Table;
  @ViewChild('dt1') dt1!: Table;
  public RenewalApiUrl: any = config.RenewalApiUrl;
  loading: boolean = true;
  statuses!: any[];
  customers!: any[];
  product!: any[];
  customers1!: any[];
  ExpiredCustomers!: any[];
  TopPremiumcustomers: any[] = [];
  from_date: any
  to_date: any
  visible: boolean = false;
  loss_type: any
  reason: any
  remarks: any
  tableList: any[] = [];
  ResponseData: any
  conversion: any
  conversion_date: any
  cities: any;
  product_list: any[] = [];
  responsiveOptions: any[] = [];
  dashborad_selectted_branch: any;
  dashborad_selectted_agent: any;
  representatives!: any[];
  stateOptions: any[] = [];
  Typevalue: any = 'Loss'
  loss_date: any
  customers_list: any
  totalPolicyCount: any = 0;
  totalPremium: any = 0;
  totalPending: any = 0;
  totalLost: any = 0;
  totalSuccess: any = 0;
  userDetails: any
  overall_product_list: any[] = [];
  overall_division_list: any[] = [];
  activityValues: number[] = [0, 100];
  private myChart!: echarts.ECharts;
  encryptedValue: any = null
  loginId: any;
  insuranceId: any;
  branchcode: any;
  productId: any;
  checkFlow: any;
  maxDate: Date = new Date();
  public routerBaseLink: any = '';
  userType: any;
  constructor(private shared: SharedService, private router: Router, private sessionStorageService: SessionStorageService,
    private route: ActivatedRoute, private sidebarService: SidebarService, private authService: AuthService, private datePipe: DatePipe,) {
    let d = JSON.parse(sessionStorage.getItem('Userdetails') as any);
    this.userDetails = d.Result;
  }
  ngAfterViewInit(): void {
    // setTimeout(() => this.initChart(), 0);

  }
  ngOnInit(): void {

    this.route.queryParamMap.subscribe((params: any) => {
      this.checkFlow = params.params['value']
    });
    if (this.checkFlow != 'back') {
      const now = new Date();
      now.setMonth(now.getMonth() - 1);
      this.from_date = new Date(now); // Set as Date object

      this.maxDate = new Date();
      const to_now = new Date();
      this.to_date = new Date(to_now);
      const date = new Date(this.from_date);
      const formattedFromDate = this.from_date.toISOString().substring(0, 10);
      const date1 = new Date(this.to_date);
      const formattedTodate = this.to_date.toISOString().substring(0, 10);
      this.getdata(formattedFromDate, formattedTodate)
    }
    else {
      this.from_date = sessionStorage.getItem('from_date_op') as any;
      this.to_date = sessionStorage.getItem('to_date_op') as any;
      this.getdata(this.from_date, this.to_date)
      this.from_date = new Date(this.from_date);
      this.to_date = new Date(this.to_date);
    }


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

    this.stateOptions = [{ label: 'Loss', value: 'Loss' }, { label: 'Conversion', value: 'Conversion' }];
    this.statuses = [
      { label: 'Unqualified', value: 'unqualified' },
      { label: 'Qualified', value: 'qualified' },
      { label: 'New', value: 'new' },
      { label: 'Negotiation', value: 'negotiation' },
      { label: 'Renewal', value: 'renewal' },
      { label: 'Proposal', value: 'proposal' }
    ];


  }


  // initChart(): void {
  //   const dom = this.chartContainer.nativeElement;
  //   this.myChart = echarts.init(dom, null, {
  //     renderer: 'canvas',
  //     useDirtyRect: false
  //   });

  //   let xAxisData: string[] = [];
  //   let policyCountData: number[] = [];
  //   let premiumData: number[] = [];

  //   if (this.ResponseData.length !== 0) {
  //     xAxisData = this.ResponseData.map((item: { DivisionName: any; DivisionCode: any; }) =>
  //       (item.DivisionName || `Division ${item.DivisionCode}`).replace(/\s+/g, '\n')
  //     );
  //     policyCountData = this.ResponseData.map((item: { TotalPolicyCount: string; }) => parseInt(item.TotalPolicyCount, 10));
  //     premiumData = this.ResponseData.map((item: { TotalPremium: string; }) => parseFloat(item.TotalPremium));
  //   }

  //   const isSingleData = this.ResponseData.length === 1;

  //   const option: echarts.EChartsOption = {
  //     animation: true,
  //     animationDuration: 1000,
  //     animationEasing: 'cubicOut',
  //     title: {
  //       text: 'Division-wise Policy Count & Premium',
  //       left: 'center',
  //       textStyle: {
  //         fontSize: 16,
  //         fontWeight: 'bold'
  //       }
  //     },
  //     tooltip: {
  //       trigger: 'axis',
  //       axisPointer: { type: 'shadow' },
  //       backgroundColor: 'rgba(255, 255, 255, 0.95)',
  //       borderWidth: 1,
  //       borderColor: '#ccc',
  //       padding: 12,
  //       textStyle: {
  //         color: '#000',
  //         fontSize: 13,
  //         fontFamily: 'Segoe UI'
  //       },
  //       formatter: (params: any) => {
  //         return params
  //           .map(
  //             (p: any) => `
  //           <div>
  //             <span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${p.color};"></span>
  //             ${p.seriesName}: <b>${p.value}</b>
  //           </div>
  //         `
  //           )
  //           .join('');
  //       },
  //       extraCssText: `
  //       border-radius: 12px;
  //       box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  //       max-width: 250px;
  //       white-space: normal;
  //     `
  //     },
  //     legend: {
  //       top: 30,
  //       data: ['TotalPolicyCount', 'TotalPremium']
  //     },
  //     grid: {
  //       top: 80,
  //       left: '10%',
  //       right: '10%',
  //       bottom: '10%',
  //       containLabel: true
  //     },
  //     xAxis: isSingleData
  //       ? {
  //         type: 'value',
  //         axisLabel: {
  //           fontSize: 12,
  //           color: '#333',
  //           formatter: (val: number): string => {
  //             if (val >= 1_000_000) return `${val / 1_000_000}M`;
  //             if (val >= 1_000) return `${val / 1_000}K`;
  //             return `${val}`;
  //           }
  //         },
  //         axisLine: {
  //           lineStyle: { color: '#aaa' }
  //         }
  //       }
  //       : [
  //         {
  //           type: 'category',
  //           data: xAxisData,
  //           axisLabel: {
  //             rotate: 0,
  //             fontSize: 11,
  //             color: '#333',
  //             formatter: (value: string) => value
  //           },
  //           axisLine: {
  //             lineStyle: { color: '#aaa' }
  //           }
  //         }
  //       ],
  //     yAxis: isSingleData
  //       ? {
  //         type: 'category',
  //         data: ['TotalPolicyCount', 'TotalPremium'],
  //         axisLabel: {
  //           fontSize: 12,
  //           color: '#333'
  //         },
  //         axisLine: {
  //           lineStyle: { color: '#aaa' }
  //         }
  //       }
  //       : [
  //         {
  //           type: 'value',
  //           name: 'Policy Count',
  //           axisLine: { lineStyle: { color: '#3399ff' } },
  //           splitLine: { show: false }
  //         },
  //         {
  //           type: 'value',
  //           name: 'Premium',
  //           axisLabel: {
  //             formatter: (val: number) =>
  //               val >= 1000000 ? `${val / 1000000}M` : `${val / 1000}K`
  //           },
  //           axisLine: { lineStyle: { color: '#66cc00' } },
  //           splitLine: { show: false }
  //         }
  //       ],
  //     series: isSingleData
  //       ? [
  //         {
  //           name: 'TotalPolicyCount',
  //           type: 'bar',
  //           data: [policyCountData[0], 0],
  //           barWidth: 30,
  //           itemStyle: {
  //             color: '#3399ff',
  //             borderRadius: [6, 6, 6, 6]
  //           },
  //           label: {
  //             show: true,
  //             position: 'right',
  //             color: '#000'
  //           }
  //         },
  //         {
  //           name: 'TotalPremium',
  //           type: 'bar',
  //           data: [0, premiumData[0]],
  //           barWidth: 30,
  //           itemStyle: {
  //             color: '#66cc00',
  //             borderRadius: [6, 6, 6, 6]
  //           },
  //           label: {
  //             show: true,
  //             position: 'right',
  //             color: '#000'
  //           }
  //         }
  //       ]
  //       : [
  //         {
  //           name: 'TotalPolicyCount',
  //           type: 'bar',
  //           yAxisIndex: 0,
  //           itemStyle: {
  //             borderRadius: [8, 8, 0, 0],
  //             color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
  //               { offset: 0, color: '#66aaff' },
  //               { offset: 1, color: '#0044cc' }
  //             ])
  //           },
  //           label: {
  //             show: true,
  //             position: 'top',
  //             color: '#000',
  //             fontSize: 10
  //           },
  //           data: policyCountData
  //         },
  //         {
  //           name: 'TotalPremium',
  //           type: 'bar',
  //           yAxisIndex: 1,
  //           itemStyle: {
  //             borderRadius: [8, 8, 0, 0],
  //             color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
  //               { offset: 0, color: '#b3ec57' },
  //               { offset: 1, color: '#669900' }
  //             ])
  //           },
  //           label: {
  //             show: true,
  //             position: 'top',
  //             color: '#000',
  //             fontSize: 10,
  //             formatter: (val: any) =>
  //               ` ${val.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  //           },
  //           data: premiumData
  //         }
  //       ]
  //   };

  //   this.myChart.setOption(option);
  // }

  initChart(): void {
    const dom = this.chartContainer.nativeElement;
    this.myChart = echarts.init(dom, null, {
      renderer: 'canvas',
      useDirtyRect: false
    });

    let xAxisData: string[] = [];
    let policyCountData: number[] = [];
    let premiumData: number[] = [];

    if (this.ResponseData.length !== 0) {
      xAxisData = this.ResponseData.map((item: { DivisionName: any; DivisionCode: any; }) =>
        (item.DivisionName || `Division ${item.DivisionCode}`).replace(/\s+/g, '\n')
      );
      policyCountData = this.ResponseData.map((item: { TotalPolicyCount: string; }) => parseInt(item.TotalPolicyCount, 10));
      premiumData = this.ResponseData.map((item: { TotalPremium: string; }) => parseFloat(item.TotalPremium));
    }

    const option: echarts.EChartsOption = {
      animation: true,
      animationDuration: 1000,
      animationEasing: 'cubicOut',
      title: {
        text: 'Division-wise Policy Count & Premium',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        textStyle: {
          color: '#000',
          fontSize: 13,
          fontFamily: 'Segoe UI'
        },
        formatter: (params: any) => {
          return params
            .map(
              (p: any) => `
          <div>
            <span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${p.color};"></span>
            ${p.seriesName}: <b>${p.value}</b>
          </div>
        `
            )
            .join('');
        },
        extraCssText: `
      border-radius: 12px;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
      max-width: 250px;
      white-space: normal;
    `
      },
      legend: {
        top: 30,
        data: ['TotalPolicyCount', 'TotalPremium']
      },
      grid: {
        top: 80,
        left: '10%',
        right: '10%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: xAxisData,
          axisLabel: {
            rotate: 0,
            fontSize: 11,
            color: '#333',
            formatter: (value: string) => value
          },
          axisLine: {
            lineStyle: { color: '#aaa' }
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: 'Policy Count',
          axisLine: { lineStyle: { color: '#3399ff' } },
          splitLine: { show: false }
        },
        {
          type: 'value',
          name: 'Premium',
          axisLabel: {
            formatter: (val: number) =>
              val >= 1000000 ? `${val / 1000000}M` : `${val / 1000}K`
          },
          axisLine: { lineStyle: { color: '#66cc00' } },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: 'TotalPolicyCount',
          type: 'bar',
          yAxisIndex: 0,
          itemStyle: {
            borderRadius: [8, 8, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#66aaff' },
              { offset: 1, color: '#0044cc' }
            ])
          },
          label: {
            show: true,
            position: 'top',
            color: '#000',
            fontSize: 10
          },
          data: policyCountData
        },
        {
          name: 'TotalPremium',
          type: 'bar',
          yAxisIndex: 1,
          itemStyle: {
            borderRadius: [8, 8, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#b3ec57' },
              { offset: 1, color: '#669900' }
            ])
          },
          label: {
            show: true,
            position: 'top',
            color: '#000',
            fontSize: 10,
            formatter: (val: any) =>
              ` ${val.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
          },
          data: premiumData
        }
      ]
    };

    this.myChart.setOption(option);
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
  onGlobalFilter(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.dt2.filterGlobal(input.value, 'contains');
  }
  onGlobalFilter1(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.dt1.filterGlobal(input.value, 'contains');
  }
  selecttedAgent(Agent: any) {
    this.product_list = [];
    this.product_list = this.customers.filter((option) => option.name == Agent);
    console.log(this.product_list, "product_list");

  }

  editClick(name: any) {
    this.visible = true;

  }
  onDateChange(): void {
    const formattedFromDate = this.datePipe.transform(this.from_date, 'yyyy-MM-dd');
    const formattedToDate = this.datePipe.transform(this.to_date, 'yyyy-MM-dd');
    this.getdata(formattedFromDate, formattedToDate)
  }
  getdata(fromdate: any, todate: any) {
    this.ResponseData = [];
    this.totalPending = 0;
    this.totalLost = 0;
    this.totalPolicyCount = 0;
    sessionStorage.setItem('from_date_op', fromdate);
    sessionStorage.setItem('to_date_op', todate);
    let branchList: any = [];
    this.userDetails.LoginBranchDetails.forEach((e: any) => {
      branchList.push(e.DivisionCode)
    });
    let ReqObj = {
      "CompanyId": this.userDetails.InsuranceId,
      "StartDate": fromdate,
      "EndDate": todate,
      "DivisionCodelist": branchList,
      // "DivisionCodelist": ["101"],

    }
    let urlLink = `${this.RenewalApiUrl}nbtrack/getdivisionbycompany`;
    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {

        if (data.divisionDetails) {

          this.ResponseData = data.divisionDetails;
          window.addEventListener('resize', () => this.myChart.resize());
          setTimeout(() => this.initChart(), 0);
          sessionStorage.setItem('DashboardResponseData', JSON.stringify(this.ResponseData));
          this.totalPending = data.divisionDetails.reduce((sum: any, item: any) => sum + parseInt(item.Pending, 10), 0);
          this.totalLost = data.divisionDetails.reduce((sum: any, item: any) => sum + parseInt(item.Lost, 10), 0);
          this.totalSuccess = data.divisionDetails.reduce((sum: any, item: any) => sum + parseInt(item.Success, 10), 0);
          this.totalPolicyCount = data.divisionDetails.reduce((sum: any, item: any) => sum + parseInt(item.TotalPolicyCount, 10), 0);
          this.totalPremium = data.divisionDetails.reduce((sum: any, item: any) => sum + parseInt(item.TotalPremium, 10), 0);
        }
        else {
          this.ResponseData = [];
          window.addEventListener('resize', () => this.myChart.resize());
          setTimeout(() => this.initChart(), 0);
        }
      },
      (err: any) => { },
    );
  }

  getDivisiondata(value: any, formDate: any, toDate: any) {
    let ReqObj = {
      "CompanyId": this.userDetails.InsuranceId,
      "DivisionCode": value,
      "StartDate": "2025-05-01",
      "EndDate": "2025-12-05"
    }
    let urlLink = `${this.RenewalApiUrl}nbtrack/getproductsbycompanyanddivision`;
    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {

        if (data) {
          this.overall_product_list = data

        }
      },
      (err: any) => { },
    );
  }
  getProdctWiseCustomerData(value: any) {
    let ReqObj = {
      "CompanyId": this.userDetails.InsuranceId,
      "DivisionCode": "100",
      "ProductCode": value,
      "StartDate": "2025-05-01",
      "EndDate": "2025-12-05"
    }
    let urlLink = `${this.RenewalApiUrl}nbtrack/getproductsbycompanyanddivision`;
    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {

        if (data.divisionDetails) {

        }
      },
      (err: any) => { },
    );
  }

  getProgress(item: any): number {
    const total = Number(item.ProductCount);
    const pending = Number(item.Pending);
    if (total === 0) return 0;
    return (pending / total) * 100;
  }

  ProductBasedCustomers(data: any) {
    this.router.navigate(['/new-business-branch-dashboard'])
    sessionStorage.setItem('SelecttedProduct', JSON.stringify(data));
  }

  viewCustomer(status: any) {
    this.visible = true;
  }


  view(data: any) {

    sessionStorage.setItem('division', JSON.stringify(data));
    this.router.navigate(['/new-business-products'])
  }

  getSourcebyCompanyandDivision(value: any) {
    console.log(value, "valuevalue");

    this.visible = true;
    let division
    let from_date
    let to_date
    this.overall_product_list = [];

    let ReqObj
    from_date = this.formatDate(this.from_date);
    to_date = this.formatDate(this.to_date);
    ReqObj = {
      "CompanyId": this.userDetails.InsuranceId,
      "DivisionCode": value.DivisionCode,
      "StartDate": from_date,
      "EndDate": to_date
    }




    let urlLink = `${this.RenewalApiUrl}nbtrack/getSourcebyCompanyandDivision`;
    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {

        if (data) {
          this.tableList = data
        }
      },
      (err: any) => { },
    );


  }
  formatDate(date: any): string | null {
    return this.datePipe.transform(date, 'yyyy-MM-dd');
  }
}
