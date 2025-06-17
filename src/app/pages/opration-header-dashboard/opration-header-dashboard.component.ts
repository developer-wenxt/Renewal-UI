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
  selector: 'app-opration-header-dashboard',
  standalone: false,
  templateUrl: './opration-header-dashboard.component.html',
  styleUrl: './opration-header-dashboard.component.scss'
})
export class OprationHeaderDashboardComponent implements AfterViewInit, OnInit {
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  @ViewChild('dt2') dt2!: Table;
  @ViewChild('dt1') dt1!: Table;
  @ViewChild('dt4') dt4!: Table;

  public CommonApiUrl: any = config.CommonApiUrl;

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
  totalPending: any = 0;
  totalLost: any = 0;
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
  checkFlow: any
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


  initChart(): void {
    const dom = this.chartContainer.nativeElement;
    this.myChart = echarts.init(dom, null, {
      renderer: 'canvas',
      useDirtyRect: false
    });

    let xAxisData: any = '';
    let totalData: any = 0;
    let pendingData: any = 0;
    let lossData: any = 0;

    if (this.ResponseData.length != 0) {

      xAxisData = this.ResponseData.map((item: { DivisionName: any; DivisionCode: any; }) => {
        const name = item.DivisionName || `Division ${item.DivisionCode}`;
        return name.replace(/\s+/g, '\n');
      });
      totalData = this.ResponseData.map((item: { TotalPolicyCount: any; }) =>
        parseInt(item.TotalPolicyCount, 10)
      );
      pendingData = this.ResponseData.map((item: { Pending: any; }) =>
        parseInt(item.Pending, 10)
      );
      lossData = this.ResponseData.map((item: { Lost: any; }) =>
        parseInt(item.Lost, 10)
      );
    }
    else {
      xAxisData = '';
      totalData = 0;
      pendingData = 0;
      lossData = 0;
    }

    const labelOption: NonNullable<BarSeriesOption['label']> = {
      show: false,
      position: 'insideBottom',
      distance: 15,
      align: 'left',
      verticalAlign: 'middle',
      rotate: 90,
      formatter: '{c}  {name|{a}}',
      fontSize: 16,
      rich: {
        name: {}
      }
    };

    //   const option: echarts.EChartsOption = {
    //     animation: true,
    //     animationDuration: 1000,
    //     animationEasing: 'cubicOut',
    //     tooltip: {
    //       trigger: 'axis',
    //       axisPointer: {
    //         type: 'shadow'
    //       },
    //       backgroundColor: 'transparent', // Make default background transparent
    //       borderWidth: 0, // Remove border
    //       padding: 10,
    //       textStyle: {
    //         color: '#000',
    //         fontSize: 12,
    //         fontFamily: 'Arial'
    //       },
    //       extraCssText: `
    //   background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(200,200,255,0.9));
    //   border-radius: 10px;
    //   box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    //   border: 1px solid rgba(255,255,255,0.4);
    // `
    //     },
    //     legend: {
    //       data: ['Pending', 'Lost', 'Total']
    //     },
    //     toolbox: {
    //       show: true,
    //       orient: 'vertical',
    //       left: 'right',
    //       top: 'center',
    //       feature: {
    //         mark: { show: true },
    //       }
    //     },
    //     xAxis: [
    //       {
    //         type: 'category',
    //         axisTick: { show: false },
    //         axisLabel: {
    //           rotate: 0,
    //           fontSize: 10,
    //           fontFamily: 'Arial',
    //           color: '#333',
    //           lineHeight: 14,
    //           formatter: (value: string) => value
    //         },
    //         data: xAxisData
    //       }
    //     ],
    //     yAxis: [
    //       {
    //         type: 'value'
    //       }
    //     ],
    //     // series: [
    //     //   {
    //     //     name: 'Total',
    //     //     type: 'bar',
    //     //     barGap: '20%',
    //     //     label: labelOption,
    //     //     emphasis: { focus: 'series' },
    //     //     itemStyle: {
    //     //       color: {
    //     //         type: 'linear',
    //     //         x: 0,
    //     //         y: 0,
    //     //         x2: 0,
    //     //         y2: 1,
    //     //         colorStops: [
    //     //           { offset: 0, color: '#3399ff' },
    //     //           { offset: 1, color: '#0040ff' }
    //     //         ]
    //     //       }
    //     //     },
    //     //     data: totalData
    //     //   },
    //     //   {
    //     //     name: 'Pending',
    //     //     type: 'bar',
    //     //     label: labelOption,
    //     //     emphasis: { focus: 'series' },
    //     //     itemStyle: {
    //     //       color: {
    //     //         type: 'linear',
    //     //         x: 0,
    //     //         y: 0,
    //     //         x2: 0,
    //     //         y2: 1,
    //     //         colorStops: [
    //     //           { offset: 0, color: '#ff9933' },
    //     //           { offset: 1, color: '#cc5200' }
    //     //         ]
    //     //       }
    //     //     },
    //     //     data: pendingData
    //     //   },
    //     //   {
    //     //     name: 'Lost',
    //     //     type: 'bar',
    //     //     label: labelOption,
    //     //     emphasis: { focus: 'series' },
    //     //     itemStyle: {
    //     //       color: {
    //     //         type: 'linear',
    //     //         x: 0,
    //     //         y: 0,
    //     //         x2: 0,
    //     //         y2: 1,
    //     //         colorStops: [
    //     //           { offset: 0, color: '#ff6666' },
    //     //           { offset: 1, color: '#cc0000' }
    //     //         ]
    //     //       }
    //     //     },
    //     //     data: lossData
    //     //   }
    //     // ]
    //     series: [
    //       {
    //         name: 'Total',
    //         type: 'line',
    //         data: totalData,
    //         smooth: true,
    //         lineStyle: {
    //           color: ' #0000e6'
    //         },
    //         itemStyle: {
    //           color: ' #0000e6'
    //         }
    //       },
    //       {
    //         name: 'Pending',
    //         type: 'line',
    //         data: pendingData,
    //         smooth: true,
    //         lineStyle: {
    //           color: ' #ffaa00'
    //         },
    //         itemStyle: {
    //           color: ' #ffaa00'
    //         }
    //       },
    //       {
    //         name: 'Lost',
    //         type: 'line',
    //         data: lossData,
    //         smooth: true,
    //         lineStyle: {
    //           color: ' #e60000'
    //         },
    //         itemStyle: {
    //           color: ' #e60000'
    //         }
    //       }
    //     ]
    //   };

    const isSingleData = this.ResponseData.length === 1;

    const option: echarts.EChartsOption = {
      animation: true,
      animationDuration: 1000,
      animationEasing: 'cubicOut',
      tooltip: {
        trigger: isSingleData ? 'item' : 'axis',
        axisPointer: isSingleData ? undefined : { type: 'shadow' },
        backgroundColor: 'transparent',
        borderWidth: 0,
        padding: 10,
        textStyle: {
          color: '#000',
          fontSize: 12,
          fontFamily: 'Arial'
        },
        extraCssText: `
      background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(200,200,255,0.9));
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255,255,255,0.4);
    `
      },
      legend: {
        data: ['Pending', 'Lost', 'Total']
      },
      xAxis: isSingleData ? undefined : [
        {
          type: 'category',
          axisTick: { show: false },
          axisLabel: {
            rotate: 0,
            fontSize: 10,
            fontFamily: 'Arial',
            color: '#333',
            lineHeight: 14,
            formatter: (value: string) => value
          },
          data: xAxisData
        }
      ],
      yAxis: isSingleData ? undefined : [{ type: 'value' }],
      series: isSingleData
        ? [
          {
            name: xAxisData[0],
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: true,
              position: 'outside'
            },
            labelLine: {
              show: true
            },
            data: [
              { value: pendingData[0], name: 'Pending', itemStyle: { color: '#ffaa00' } },
              { value: lossData[0], name: 'Lost', itemStyle: { color: '#e60000' } },
              // {
              //   value: totalData[0] - (pendingData[0] + lossData[0]),
              //   name: 'Total',
              //   itemStyle: { color: '#0000e6' }
              // }
            ]
          }
        ]
        : [
          {
            name: 'Total',
            type: 'line',
            data: totalData,
            smooth: true,
            lineStyle: { color: '#0000e6' },
            itemStyle: { color: '#0000e6' }
          },
          {
            name: 'Pending',
            type: 'line',
            data: pendingData,
            smooth: true,
            lineStyle: { color: '#ffaa00' },
            itemStyle: { color: '#ffaa00' }
          },
          {
            name: 'Lost',
            type: 'line',
            data: lossData,
            smooth: true,
            lineStyle: { color: '#e60000' },
            itemStyle: { color: '#e60000' }
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
  onGlobalFilterBroker(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.dt4.filterGlobal(input.value, 'contains');
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
      branchList.push(e.BranchCode)
    });
    let ReqObj = {
      "CompanyId": this.userDetails.InsuranceId,
      "StartDate": fromdate,
      "EndDate": todate,
      "DivisionCodelist":branchList,
      // "DivisionCodelist":["101"],

    }
    let urlLink = `${this.CommonApiUrl}renewaltrack/getdivisionbycompany`;
    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {

        if (data.divisionDetails) {

          this.ResponseData = data.divisionDetails;
          window.addEventListener('resize', () => this.myChart.resize());
          setTimeout(() => this.initChart(), 0);
          sessionStorage.setItem('DashboardResponseData', JSON.stringify(this.ResponseData));
          // this.totalPolicyCount = data.divisionDetails.reduce((sum: any, item: any) => sum + parseInt(item.TotalPolicyCount, 10), 0);
          this.totalPending = data.divisionDetails.reduce((sum: any, item: any) => sum + parseInt(item.Pending, 10), 0);
          this.totalLost = data.divisionDetails.reduce((sum: any, item: any) => sum + parseInt(item.Lost, 10), 0);
          this.totalPolicyCount = data.divisionDetails.reduce((sum: any, item: any) => sum + parseInt(item.TotalPolicyCount, 10), 0);
          // this.totalPolicyCount = data.divisionDetails.reduce((sum: number, item: any) =>
          //   sum + parseInt(item.Pending, 10) + parseInt(item.Lost, 10), 0);

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
    let urlLink = `${this.CommonApiUrl}renewaltrack/getproductsbycompanyanddivision`;
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
    let urlLink = `${this.CommonApiUrl}renewaltrack/getproductsbycompanyanddivision`;
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
    this.router.navigate(['/branch-dashboard'])
    sessionStorage.setItem('SelecttedProduct', JSON.stringify(data));
  }

  viewCustomer(status: any) {
    this.visible = true;
  }

  getTopPriumCustomerList() {
    let ReqObj = {

      "DivisionCode": "100",
      "StartDate": "2025-01-01",
      "EndDate": "2025-05-21"

    }
    let urlLink = `${this.CommonApiUrl}renewaltrack/getTopTenPolicydetails`;
    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {

        this.TopPremiumcustomers = data
      },
      (err: any) => { },
    );
  }
  getExpiredPriumCustomerList() {
    // let ReqObj = {

    //   "DivisionCode": "101",
    //   "StartDate": "2025-01-01",
    //   "EndDate": "2025-05-21"

    // }



    let urlLink = `${this.CommonApiUrl}renewaltrack/getExpiryPolicyDetails/100`;
    //  let urlLink = `${this.CommonApiUrl}renewaltrack/getExpiryPolicyDetails/${this.DivisionCode}`;
    this.shared.onGetMethodSync(urlLink).subscribe(
      (data: any) => {

        this.ExpiredCustomers = data
      },
      (err: any) => { },
    );
  }
  view(data: any) {

    sessionStorage.setItem('division', JSON.stringify(data));
    this.router.navigate(['/products'])
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
      // "DivisionCode": this.userDetails.BranchCode,
      "DivisionCode": value.DivisionCode,
      // "SourceCode": this.userDetails[0].SourceCode,
      "StartDate": from_date,
      "EndDate": to_date
    }




    let urlLink = `${this.CommonApiUrl}renewaltrack/getSourcebyCompanyandDivision`;
    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {

        if (data) {
          this.tableList = data

          // this.totalPending = data.reduce((sum: number, item: any) => sum + parseInt(item.Pending, 10), 0);
          // this.totalLost = data.reduce((sum: number, item: any) => sum + parseInt(item.Lost, 10), 0);
          // this.totalPolicyCount = data.reduce((sum: number, item: any) =>
          //   sum + parseInt(item.Pending, 10) + parseInt(item.Lost, 10), 0);
        }
      },
      (err: any) => { },
    );


  }
  formatDate(date: any): string | null {
    return this.datePipe.transform(date, 'yyyy-MM-dd');
  }

}
