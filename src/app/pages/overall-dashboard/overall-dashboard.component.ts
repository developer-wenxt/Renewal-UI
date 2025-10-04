import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, HostListener, ChangeDetectorRef } from '@angular/core';
import * as echarts from 'echarts';
import { SharedService } from '../../services/shareService';
import { ActivatedRoute, Router } from '@angular/router';
import { SidebarService } from '../../services/sidebar.service';
import { AuthService } from '../../helpers/auth/Auth/auth.service';
import { SessionStorageService } from '../../storage/session-storage.service';
import { DatePipe } from '@angular/common';
import { config } from '../../helpers/appconfig';

@Component({
  selector: 'app-overall-dashboard',
  standalone: false,
  templateUrl: './overall-dashboard.component.html',
  styleUrl: './overall-dashboard.component.scss'
})
export class OverallDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  selectedTimeframe: string = 'yearly';
  chartInstance: any;
  userDetails: any;
  fromDate: any
  claimsDetails: any
  NewAndRenewPolicyPrecent: any
  getRenewPolicyDBCountMonthlyDashboardData: any
  RetentionRatePrecent:any
  getNewPolicyDBCountDailyDashboardData: any
  public RenewalApiUrl: any = config.RenewalApiUrl;
  @ViewChild('chartContainer1', { static: true }) chartContainer1!: ElementRef<HTMLDivElement>;
  private chartInstance1!: echarts.ECharts;
  cards = [
    { title: 'New Business', value: '2.4M', change: 15.2, period: 'vs last month', icon: 'pi-briefcase', Count: '200' },
    { title: 'Renewals', value: '18.7M', change: -3.4, period: 'vs last month', icon: 'pi-sync', Count: '200' },
    { title: 'Claims Paid', value: '5.2M', change: 8.1, period: 'vs last month', icon: 'pi-money-bill', Count: '200' },
    { title: 'Total Portfolio', value: '45.8M', change: 6.7, period: 'vs last quarter', icon: 'pi-wallet', Count: '200' },
    { title: 'Retention Rate', value: '87.3%', change: 2.1, period: 'vs last quarter', icon: 'pi-wave-pulse', Count: '200' },
    { title: 'Active Policies', value: '12,847', change: 9.4, period: 'active policies', icon: 'pi-users', Count: '200' }
  ];
  dashboardData: any = {
    yearly: [
      { year: 2021, Renewal: 100, Lapsed: 30, Pending: 50, RenewalPremium: 400000, LapsedPremium: 90000, PendingPremium: 120000 },
      { year: 2022, Renewal: 120, Lapsed: 40, Pending: 60, RenewalPremium: 500000, LapsedPremium: 100000, PendingPremium: 200000 },
      { year: 2023, Renewal: 150, Lapsed: 50, Pending: 70, RenewalPremium: 600000, LapsedPremium: 120000, PendingPremium: 250000 },
    ],
    monthly: [
      { month: 'Jan', Renewal: 10, Lapsed: 3, Pending: 5, RenewalPremium: 40000, LapsedPremium: 12000, PendingPremium: 15000 },
      { month: 'Feb', Renewal: 15, Lapsed: 5, Pending: 8, RenewalPremium: 60000, LapsedPremium: 20000, PendingPremium: 25000 },
      { month: 'Mar', Renewal: 20, Lapsed: 7, Pending: 10, RenewalPremium: 80000, LapsedPremium: 30000, PendingPremium: 35000 },
      // ...
    ],
    weekly: [
      { week: 'W1', Renewal: 5, Lapsed: 1, Pending: 2, RenewalPremium: 20000, LapsedPremium: 5000, PendingPremium: 8000 },
      { week: 'W2', Renewal: 6, Lapsed: 2, Pending: 3, RenewalPremium: 25000, LapsedPremium: 7000, PendingPremium: 12000 },
      // ...
    ],
    daily: [
      { day: 1, Renewal: 1, Lapsed: 0, Pending: 1, RenewalPremium: 4000, LapsedPremium: 0, PendingPremium: 2000 },
      { day: 2, Renewal: 2, Lapsed: 0, Pending: 0, RenewalPremium: 8000, LapsedPremium: 0, PendingPremium: 0 },
      // ...
    ]
  };
  newBussinessDetails: any;
  renewalDetails: any;
  getNewPolicyDBCountMonthlyDashboardData: any;

  constructor(private shared: SharedService, private cdRef: ChangeDetectorRef, private router: Router, private sessionStorageService: SessionStorageService,
    private route: ActivatedRoute, private sidebarService: SidebarService, private authService: AuthService, private datePipe: DatePipe,) {
    let d = JSON.parse(sessionStorage.getItem('Userdetails') as any);
    this.userDetails = d.Result;


  }
  ngOnInit(): void {
    this.GetNewBussinessCount();
    this.GetgetRenewCount();
    this.getNewAndRenewPolicy();
    this.getNewPolicyDBCountDaily();
    this.getMonthlyPolicyDBCountDaily();
    this.getRenewPolicyMonthlyPolicyDBCount();
    this.getRetentionRateCount();
    this.getClaimCount();
  }

  ngAfterViewInit(): void {
    this.initChart();
    // this.premiumdashboard();
  }

  initChart() {
    const dom = this.chartContainer.nativeElement;
    this.chartInstance = echarts.init(dom);
    this.updateChart();
    window.addEventListener('resize', () => this.chartInstance.resize());
  }

  // updateChart() {
  //   const data = this.getRenewPolicyDBCountMonthlyDashboardData;

  //   const branches: string[] = Array.from(new Set(data.map(d => d.BranchName)));

  //   const policyTypes: ('NEW' | 'RENEWED' | 'LAPSED')[] = ['NEW', 'RENEWED', 'LAPSED'];

  //   const series: echarts.SeriesOption[] = policyTypes.map(type => {
  //     return {
  //       name: type,
  //       type: 'bar',
  //       barBorderRadius: 6,
  //       data: branches.map(branch => {
  //         const item = data.find(d => d.BranchName === branch && d.PolicyType === type);
  //         return item ? Number(item.PolicyCount) : 0;
  //       }),
  //       itemStyle: {
  //         color: type === 'NEW' ? '#4CAF50' : type === 'RENEWED' ? '#2196F3' : '#F44336'
  //       }
  //     } as echarts.SeriesOption;
  //   });

  //   const option: echarts.EChartsOption = {
  //     title: { text: 'Policy Dashboard', left: 'center' },
  //     tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  //     legend: { data: policyTypes, top: 40 },
  //     grid: { top: 80, left: 50, right: 30, bottom: 80 },
  //     xAxis: {
  //       type: 'category',
  //       data: branches as string[],
  //       axisLabel: {
  //         rotate: 0,
  //         formatter: (value: string) => {
  //           const maxLength = 10;
  //           const rows = Math.ceil(value.length / maxLength);
  //           if (rows > 1) {
  //             let result = '';
  //             for (let i = 0; i < rows; i++) {
  //               result += value.substring(i * maxLength, (i + 1) * maxLength) + '\n';
  //             }
  //             return result;
  //           }
  //           return value;
  //         }
  //       },
  //       splitLine: { show: false }
  //     },
  //     yAxis: { type: 'value', name: 'Policy Count', splitLine: { show: false } },
  //     series: series
  //   };

  //   this.chartInstance.setOption(option);
  // }

  updateChart() {
    const data = this.getRenewPolicyDBCountMonthlyDashboardData;

    const branches: string[] = Array.from(new Set(data?.map(d => d?.BranchName)));

    const policyTypes: ('NEW' | 'RENEWED' | 'LAPSED')[] = ['NEW', 'RENEWED', 'LAPSED'];

    const series: echarts.SeriesOption[] = policyTypes.map(type => {
      return {
        name: type,
        type: 'bar',
        data: branches.map(branch => {
          const item = data.find(d => d.BranchName === branch && d.PolicyType === type);
          return item ? Number(item.PolicyCount) : 0;
        }),
        itemStyle: {
          color: type === 'NEW' ? '#4CAF50' : type === 'RENEWED' ? '#2196F3' : '#F44336',
          barBorderRadius: [6, 6, 0, 0] 
        }
      } as echarts.SeriesOption;
    });

    const option: echarts.EChartsOption = {
      title: { text: 'Policy Dashboard', left: 'center' },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { data: policyTypes, top: 40 },
      grid: { top: 80, left: 50, right: 30, bottom: 80 },
      xAxis: {
        type: 'category',
        data: branches as string[],
        axisLabel: {
          rotate: 0,
          formatter: (value: string) => {
            const maxLength = 10;
            const rows = Math.ceil(value.length / maxLength);
            if (rows > 1) {
              let result = '';
              for (let i = 0; i < rows; i++) {
                result += value.substring(i * maxLength, (i + 1) * maxLength) + '\n';
              }
              return result;
            }
            return value;
          }
        },
        splitLine: { show: false }
      },
      yAxis: { type: 'value', name: 'Policy Count', splitLine: { show: false } },
      series: series
    };

    this.chartInstance.setOption(option);
  }

  changeTimeframe(tf: string) {
    this.selectedTimeframe = tf;
    this.updateChart();
  }



  // premiumdashboard() {
  //   this.chartInstance1 = echarts.init(this.chartContainer1.nativeElement, undefined, {
  //     renderer: 'canvas',
  //     useDirtyRect: false
  //   });

  //   const apiData = [
  //     {
  //       "PolicyCount": "191",
  //       "PolicySumInsured": 3743856717.61,
  //       "PolicyPremium": 13526590.75,
  //       "Branch": "1",
  //       "BranchName": "HEAD OFFICE BRANCH"
  //     },
  //     {
  //       "PolicyCount": "53",
  //       "PolicySumInsured": 99867458,
  //       "PolicyPremium": 1096914.31,
  //       "Branch": "9",
  //       "BranchName": "DEISSE BRANCH"
  //     },
  //     {
  //       "PolicyCount": "51",
  //       "PolicySumInsured": 210560000,
  //       "PolicyPremium": 2434043.07,
  //       "Branch": "8",
  //       "BranchName": "T/HAIMANOT BRANCH"
  //     }
  //   ];

  //   const categories = apiData.map(d => d.BranchName);
  //   const policyCounts = apiData.map(d => Number(d.PolicyCount));
  //   const policyPremiums = apiData.map(d => Number(d.PolicyPremium));

  //   const option: echarts.EChartsOption = {
  //     title: {
  //       text: `New Business Dashboard`,
  //       left: 'center',
  //       top: 10
  //     },
  //     tooltip: {
  //       trigger: 'axis',
  //       axisPointer: { type: 'cross' },
  //       formatter: (params: any) => {
  //         let tooltipHtml = `<b>${params[0].axisValue}</b><br/>`;
  //         params.forEach((p: any) => {
  //           tooltipHtml += `<span style="color:${p.color}">●</span> ${p.seriesName}: ${p.value}<br/>`;
  //         });
  //         return tooltipHtml;
  //       }
  //     },
  //     legend: {
  //       top: 40,
  //       left: 'center',
  //       data: ['Policy Count', 'Policy Premium']
  //     },
  //     grid: { top: 110, left: 50, right: 30, bottom: 50 },
  //     xAxis: {
  //       type: 'category',
  //       data: categories,
  //       axisLabel: { rotate: 25 }
  //     },
  //     yAxis: [
  //       {
  //         type: 'value',
  //         name: 'Policy Count'
  //       },
  //       {
  //         type: 'value',
  //         name: 'Policy Premium',
  //         position: 'right',
  //         axisLabel: {
  //           formatter: (val: number) => {
  //             if (val >= 1000000) {
  //               return (val / 1000000).toFixed(1) + 'M';
  //             }
  //             if (val >= 1000) {
  //               return (val / 1000).toFixed(1) + 'K';
  //             }
  //             return val.toString();
  //           }
  //         }
  //       }
  //     ],
  //     series: [
  //       {
  //         name: 'Policy Count',
  //         type: 'line',
  //         smooth: true,
  //         yAxisIndex: 0,
  //         symbol: 'circle',
  //         symbolSize: 8,
  //         itemStyle: { color: '#0770FF' },
  //         areaStyle: {
  //           color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
  //             { offset: 0, color: 'rgba(58,77,233,0.8)' },
  //             { offset: 1, color: 'rgba(58,77,233,0.3)' }
  //           ])
  //         },
  //         data: policyCounts
  //       },
  //       {
  //         name: 'Policy Premium',
  //         type: 'line',
  //         smooth: true,
  //         yAxisIndex: 1,
  //         symbol: 'circle',
  //         symbolSize: 8,
  //         itemStyle: { color: '#F2597F' },
  //         areaStyle: {
  //           color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
  //             { offset: 0, color: 'rgba(213,72,120,0.8)' },
  //             { offset: 1, color: 'rgba(213,72,120,0.3)' }
  //           ])
  //         },
  //         data: policyPremiums
  //       }
  //     ]
  //   };

  //   this.chartInstance1.setOption(option);
  // }
  premiumdashboard() {
    this.chartInstance1 = echarts.init(this.chartContainer1.nativeElement, undefined, {
      renderer: 'canvas',
      useDirtyRect: false
    });

    const apiData = this.getNewPolicyDBCountMonthlyDashboardData;

    const categories = apiData.map(d => d.BranchName);
    const policyCounts = apiData.map(d => Number(d.PolicyCount));
    const policyPremiums = apiData.map(d => Number(d.PolicyPremium));

    const option: echarts.EChartsOption = {
      title: {
        text: `New Business Dashboard`,
        left: 'center',
        top: 10
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        formatter: (params: any) => {
          let tooltipHtml = `<b>${params[0].axisValue}</b><br/>`;
          params.forEach((p: any) => {
            tooltipHtml += `<span style="color:${p.color}">●</span> ${p.seriesName}: ${p.value}<br/>`;
          });
          return tooltipHtml;
        }
      },
      legend: {
        top: 40,
        left: 'center',
        data: ['Policy Count', 'Policy Premium']
      },
      grid: { top: 110, left: 50, right: 50, bottom: 80 },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: {
          rotate: 0,
          formatter: (value: string) => {

            const maxLength = 10;
            const rows = Math.ceil(value.length / maxLength);
            if (rows > 1) {
              let result = '';
              for (let i = 0; i < rows; i++) {
                result += value.substring(i * maxLength, (i + 1) * maxLength) + '\n';
              }
              return result;
            }
            return value;
          }
        },
        splitLine: { show: false }
      },
      yAxis: [
        {
          type: 'value',
          name: 'Policy Count',
          splitLine: { show: false }
        },
        {
          type: 'value',
          name: 'Policy Premium',
          position: 'right',
          splitLine: { show: false },
          axisLabel: {
            formatter: (val: number) => {
              if (val >= 1000000) {
                return (val / 1000000).toFixed(1) + 'M';
              }
              if (val >= 1000) {
                return (val / 1000).toFixed(1) + 'K';
              }
              return val.toString();
            }
          }
        }
      ],
      series: [
        {
          name: 'Policy Count',
          type: 'line',
          smooth: true,
          yAxisIndex: 0,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: { color: '#0770FF' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(58,77,233,0.8)' },
              { offset: 1, color: 'rgba(58,77,233,0.3)' }
            ])
          },
          data: policyCounts
        },
        {
          name: 'Policy Premium',
          type: 'line',
          smooth: true,
          yAxisIndex: 1,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: { color: '#F2597F' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(213,72,120,0.8)' },
              { offset: 1, color: 'rgba(213,72,120,0.3)' }
            ])
          },
          data: policyPremiums
        }
      ]
    };

    this.chartInstance1.setOption(option);
  }


  @HostListener('window:resize')
  onResize() {
    this.chartInstance1?.resize();
  }

  GetNewBussinessCount() {
    this.newBussinessDetails = []
    let branchList: any = [];
    this.userDetails.LoginBranchDetails.forEach((e: any) => {
      branchList.push(e.DivisionCode)
    });

    let ReqObj = {
      "CompanyId": this.userDetails.InsuranceId,
      "Branch": branchList,
    }
    let urlLink = `${this.RenewalApiUrl}renewalDBSummary/getNewPolicyPrecent`;

    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {
        if (data) {
          this.newBussinessDetails = data?.SingleResult
        }
      },
      (err: any) => { },
    );
  }
  GetgetRenewCount() {
    this.renewalDetails = []
    let branchList: any = [];
    this.userDetails.LoginBranchDetails.forEach((e: any) => {
      branchList.push(e.DivisionCode)
    });

    let ReqObj = {
      "CompanyId": this.userDetails.InsuranceId,
      "Branch": branchList,
    }
    let urlLink = `${this.RenewalApiUrl}renewalDBSummary/getRenewPolicyPrecent`;

    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {
        if (data) {
          this.renewalDetails = data?.SingleResult
        }
      },
      (err: any) => { },
    );
  }
  getNewAndRenewPolicy() {
    this.NewAndRenewPolicyPrecent = []
    let branchList: any = [];
    this.userDetails.LoginBranchDetails.forEach((e: any) => {
      branchList.push(e.DivisionCode)
    });

    let ReqObj = {
      "CompanyId": this.userDetails.InsuranceId,
      "Branch": branchList,
      // "Date": "11/2025"
    }
    let urlLink = `${this.RenewalApiUrl}renewalDBSummary/getNewAndRenewPolicyPrecent`;

    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {
        if (data) {
          this.NewAndRenewPolicyPrecent = data?.SingleResult
        }
      },
      (err: any) => { },
    );
  }
  getNewPolicyDBCountDaily() {
    this.NewAndRenewPolicyPrecent = []
    let branchList: any = [];
    this.userDetails.LoginBranchDetails.forEach((e: any) => {
      branchList.push(e.DivisionCode)
    });

    let ReqObj = {
      "CompanyId": this.userDetails.InsuranceId,
      "Branch": branchList,
      // "Date": "11/2025"
    }
    let urlLink = `${this.RenewalApiUrl}renewalDBSummary/getNewPolicyDBCountDaily`;

    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {
        if (data) {
          this.getNewPolicyDBCountDailyDashboardData = data?.SingleResult
        }
      },
      (err: any) => { },
    );
  }
  getMonthlyPolicyDBCountDaily() {
    this.NewAndRenewPolicyPrecent = []
    let branchList: any = [];
    this.userDetails.LoginBranchDetails.forEach((e: any) => {
      branchList.push(e.DivisionCode)
    });

    let ReqObj = {
      "CompanyId": this.userDetails.InsuranceId,
      "Branch": branchList,
      // "Date": "11/2025"
    }
    let urlLink = `${this.RenewalApiUrl}renewalDBSummary/getNewPolicyDBCountMonthly`;

    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {
        if (data) {
          this.getNewPolicyDBCountMonthlyDashboardData = data?.SingleResult
          this.premiumdashboard();
        }
      },
      (err: any) => { },
    );
  }
  getRenewPolicyMonthlyPolicyDBCount() {
    this.NewAndRenewPolicyPrecent = []
    let branchList: any = [];
    this.userDetails.LoginBranchDetails.forEach((e: any) => {
      branchList.push(e.DivisionCode)
    });

    let ReqObj = {
      "CompanyId": this.userDetails.InsuranceId,
      "Branch": branchList,
      // "Date": "11/2025"
    }
    let urlLink = `${this.RenewalApiUrl}renewalDBSummary/getRenewPolicyDBCountMonthly`;

    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {
        if (data) {
          this.getRenewPolicyDBCountMonthlyDashboardData = data?.SingleResult
          this.initChart();
        }
      },
      (err: any) => { },
    );
  }
  getRetentionRateCount() {
    this.RetentionRatePrecent = []
    let branchList: any = [];
    this.userDetails.LoginBranchDetails.forEach((e: any) => {
      branchList.push(e.DivisionCode)
    });

    let ReqObj = {
      "CompanyId": this.userDetails.InsuranceId,
      "Branch": branchList,
      // "Date": "11/2025"
    }
    let urlLink = `${this.RenewalApiUrl}renewalDBSummary/getRetentionRate`;

    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {
        if (data) {
          this.RetentionRatePrecent = data?.SingleResult
          // this.initChart();
        }
      },
      (err: any) => { },
    );
  }
  getClaimCount() {
    this.claimsDetails = []
    let branchList: any = [];
    this.userDetails.LoginBranchDetails.forEach((e: any) => {
      branchList.push(e.DivisionCode)
    });

    let ReqObj = {
      "CompanyId": this.userDetails.InsuranceId,
      "Branch": branchList,
      // "Date": "11/2025"
    }
    let urlLink = `${this.RenewalApiUrl}renewalDBSummary/getTotalClaimPaid`;

    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {
        if (data) {
          this.claimsDetails = data?.SingleResult
          // this.initChart();
        }
      },
      (err: any) => { },
    );
  }
}

