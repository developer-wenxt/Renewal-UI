import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SharedService } from '../../services/shareService';
import { config } from '../../helpers/appconfig';
import { EChartsOption, BarSeriesOption } from 'echarts';
import * as echarts from 'echarts';
import { Table } from 'primeng/table';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-new-business-broker',
  standalone: false,
  templateUrl: './new-business-broker.component.html',
  styleUrl: './new-business-broker.component.scss'
})
export class NewBusinessBrokerComponent {
  @ViewChild('dt2') dt2!: Table;
  @ViewChild('dt1') dt1!: Table;
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  private chartInstance: echarts.ECharts | null = null;
  private myChart!: echarts.ECharts;
  public CommonApiUrl: any = config.CommonApiUrl;

  userDetails: any;
  PolSrcCode: any;
  ResponseData: any;
  dashborad_selectted_agent: any;
  Add_dialog: boolean = false;
  totalPolicyCount: number = 0;
  totalPending: number = 0;
  visible: boolean = false;
  totalLost: number = 0;
  from_date: any
  to_date: any
  customers_list: any
  ProductData: any
  divisionName: any;
  companyList: any[] = [];
  reason_list: any[] = [];
  Policy_type_list: any[] = [];
  divisionCode: any;
  PolicyNo: any;
  CurrentStatus: any;
  stateOptions: any[] | undefined;
  Typevalue: any = 'Loss'
  loss_type: any;
  reason: any;
  loss_date: any;
  payment_type_list: any[] | undefined;
  conversion: any;
  conversion_date: any;
  remarks: any;
  Make: any;
  model: any;
  body_type: any;
  vehicle_usage: any;
  Policy_type: any;
  sumInsured: any;
  checkFlow: any

  constructor(private shared: SharedService, private datePipe: DatePipe, private router: Router, private route: ActivatedRoute,) {
    this.stateOptions = [{ label: 'Lost', value: 'Loss' }, { label: 'Conversion', value: 'Conversion' }];
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.chartContainer) {
        this.initChart();
      }
    }, 0);
  }
  ngOnInit() {
    let d = JSON.parse(sessionStorage.getItem('Userdetails') as any);
    this.ProductData = JSON.parse(sessionStorage.getItem('SelecttedProduct') as any);
    this.userDetails = d.Result;
    if (this.userDetails.UserType == 'Broker') {
      const now = new Date();
      now.setMonth(now.getMonth() - 1);
      this.from_date = new Date(now);
      const to_now = new Date();
      this.to_date = new Date(to_now);
      this.getSouceCode();
    }


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
      const formattedFromDate = this.formatDate(this.from_date);
      const date1 = new Date(this.to_date);
      const formattedTodate = this.formatDate(this.to_date);
      this.getSouceCode();
    }
    else {
      let fromdate = sessionStorage.getItem('from_date_op') as any;
      let todate = sessionStorage.getItem('to_date_op') as any;
      this.getSouceCode();
      this.from_date = new Date(fromdate);
      this.to_date = new Date(todate);
    }

    this.reason_list = [
      {
        "Code": "1",
        "CodeDesc": "Reason 1",

      },
      {
        "Code": "3",
        "CodeDesc": "Reason 3",

      },
      {
        "Code": "2",
        "CodeDesc": "Reason 2",
      }
    ]
  }
  getSouceCode() {

    let d = JSON.parse(sessionStorage.getItem('Userdetails') as any);
    this.userDetails = d.Result;
    let ReqObj = {
      "LoginId": this.userDetails.LoginId
    }
    let urlLink = `${this.CommonApiUrl}nbtrack/getSourceFromLogin`;
    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {
        if (data) {
          console.log(data, "LoginIdLoginIdLoginId");
          if (data.SourceCode) {
            this.PolSrcCode = data.SourceCode;
            this.getDivisiondata();
          }
        }

      })
  }

  getDivisiondata() {
    let ReqObj
    let FromDate
    let ToDate
    if (this.userDetails.UserType != 'Broker') {
      ReqObj = {
        "CompanyId": this.userDetails.InsuranceId,
        "DivisionCode": this.userDetails.BranchCode,
        "SourceCode": this.userDetails[0].SourceCode,
        "StartDate": this.from_date,
        "EndDate": this.to_date
      }
    }
    else {
      FromDate = this.formatDate(this.from_date);
      ToDate = this.formatDate(this.to_date);
      ReqObj = {
        "CompanyId": this.userDetails.InsuranceId,
        // "DivisionCode": '101',
        "DivisionCode": this.userDetails.BranchCode,
        "SourceCode": this.PolSrcCode,
        "StartDate": FromDate,
        "EndDate": ToDate
      }
    }


    let urlLink = `${this.CommonApiUrl}nbtrack/getproductsbycompanyanddivision`;
    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {

        if (data) {
          this.ResponseData = data;
          console.log(this.ResponseData, "ResponseData");

          this.dashborad_selectted_agent = data[0]?.ProductCode
          this.getCustomerData(this.dashborad_selectted_agent);
          // this.totalPolicyCount = data.reduce((sum: any, item: any) => sum + parseInt(item.Pending, 10), 0);
          this.totalPending = data.reduce((sum: any, item: any) => sum + parseInt(item.Pending, 10), 0);
          this.totalLost = data.reduce((sum: any, item: any) => sum + parseInt(item.Lost, 10), 0);
          this.totalPolicyCount = data.reduce((sum: number, item: any) =>
            sum + parseInt(item.Pending, 10) + parseInt(item.Lost, 10), 0);

          if (this.chartContainer) {
            window.addEventListener('resize', () => this.myChart.resize());
            this.initChart();
          } else {
            setTimeout(() => {
              if (this.chartContainer) {
                window.addEventListener('resize', () => this.myChart.resize());
                this.initChart();
              }
            }, 100); // try after a short delay
          }
        }
      },
      (err: any) => { },
    );
  }

  formatDate(date: any): string | null {
    return this.datePipe.transform(date, 'yyyy-MM-dd');
  }
  initChart(): void {
    const dom = this.chartContainer.nativeElement;
    this.myChart = echarts.init(dom, null, {
      renderer: 'canvas',
      useDirtyRect: false
    });
    let xAxisData: any = ''
    let totalData: any = 0
    let pendingData: any = 0
    let lossData: any = 0
    if (this.ResponseData) {


      if (this.userDetails.UserType != 'Broker') {
        xAxisData = this.ResponseData.map((item: { SourceName: any; SourceCode: any; }) => {
          const name = item.SourceName || `Division ${item.SourceCode}`;
          return name.replace(/\s+/g, '\n');
        });
      }
      else {
        xAxisData = this.ResponseData.map((item: { ProductName: any; ProductCode: any; }) => {
          const name = item.ProductName || `Division ${item.ProductCode}`;
          return name.replace(/\s+/g, '\n');
        });

      }

      pendingData = this.ResponseData.map((item: { Pending: string; }) => parseInt(item.Pending, 10) || 0);
      lossData = this.ResponseData.map((item: { Lost: string; }) => parseInt(item.Lost, 10) || 0);
      totalData = this.ResponseData.map((item: { Pending: string; Lost: string; }) =>
        (parseInt(item.Pending, 10) || 0) + (parseInt(item.Lost, 10) || 0)
      );

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

    const option: echarts.EChartsOption = {
      animation: true,
      animationDuration: 1000,
      animationEasing: 'cubicOut',
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
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
      toolbox: {
        show: true,
        orient: 'vertical',
        left: 'right',
        top: 'center',
        feature: {
          mark: { show: true },
        }
      },
      xAxis: [
        {
          type: 'category',
          show: true,
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
      yAxis: [
        {
          type: 'value'
        }
      ],
      series: [
        {
          name: 'Total',
          type: 'bar',
          barGap: '20%',
          label: labelOption,
          emphasis: { focus: 'series' },
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#3399ff' },
                { offset: 1, color: '#0040ff' }
              ]
            }
          },
          data: totalData
        },
        {
          name: 'Pending',
          type: 'bar',
          label: labelOption,
          emphasis: { focus: 'series' },
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#ff9933' },
                { offset: 1, color: '#cc5200' }
              ]
            }
          },
          data: pendingData
        },
        {
          name: 'Lost',
          type: 'bar',
          label: labelOption,
          emphasis: { focus: 'series' },
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#ff6666' },
                { offset: 1, color: '#cc0000' }
              ]
            }
          },
          data: lossData
        }
      ]
    };

    this.myChart.setOption(option);
  }
  filterChange(value: any) {
    // this.getDivisiondata(value);
    console.log(value);
    // this.getProdctWiseCustomerData(value)
    this.getCustomerData(value);

  }

  getCustomerData(value: any) {
    let ReqObj
    let FromDate
    let ToDate
    this.customers_list = [];
    if (this.userDetails.UserType == 'Broker') {
      FromDate = this.formatDate(this.from_date);
      ToDate = this.formatDate(this.to_date);
      ReqObj = {
        "CompanyId": this.userDetails.InsuranceId,
        "DivisionCode": this.userDetails.BranchCode,
        // "DivisionCode": '101',
        "ProductCode": value,
        "SourceCode": this.PolSrcCode,
        "StartDate": FromDate,
        "EndDate": ToDate
      }
    }
    else if (this.userDetails.UserType == 'Issuer') {
      ReqObj = {
        "CompanyId": this.userDetails.InsuranceId,
        // "DivisionCode": this.userDetails.BranchCode,
        "DivisionCode": '101',
        "ProductCode": this.ProductData.ProductCode,
        "SourceCode": this.ProductData.polSrcCode,
        // "SourceCode": "2000023",
        "StartDate": this.from_date,
        "EndDate": this.to_date
      }
    }
    else {
      let division = JSON.parse(sessionStorage.getItem('division') as any);
      this.divisionName = division.PolSrcName
      this.divisionCode = division.PolSrcCode
      console.log(division, "divisiondivisiondivision");


      ReqObj = {
        "CompanyId": this.userDetails.InsuranceId,
        "DivisionCode": division?.DivisionCode,
        "ProductCode": this.ProductData?.ProductCode,
        "SourceCode": value,
        "StartDate": this.from_date,
        "EndDate": this.to_date
      }
    }

    let urlLink = `${this.CommonApiUrl}nbtrack/getpolicydetails`;
    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {
        if (data) {

          this.customers_list = data

        }
        else {
          this.customers_list = [];
        }
      },
      (err: any) => { },
    );
  }
  viewCustomer(sts: any) {

  }
  onDateChange(): void {
    const date = new Date(this.from_date);
    const formattedFromDate = this.formatDate(this.from_date);
    const date1 = new Date(this.to_date);
    const formattedTodate = this.formatDate(this.to_date);
    // this.getdata(formattedFromDate, formattedTodate)
    this.getDivisiondata();

  }
  onGlobalFilter(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.dt2.filterGlobal(input.value, 'contains');
  }
  onGlobalFilter1(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.dt1.filterGlobal(input.value, 'contains');
  }
  getSeverity(status: string): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' | undefined {
    switch (status) {
      case 'RL':
        return 'secondary';
      case 'RP':
        return 'warning';
      case 'RR':
        return 'danger';
      case 'Motor':
        return 'info';
      case 'RC':
        return 'success';
      case 'Non-Motor':
        return 'contrast';
      default:
        return undefined;
    }
  }
  editClick(data: any) {
    this.getCompanyList();
    this.PolicyNo = null;
    this.CurrentStatus = null;
    this.visible = true;
    this.PolicyNo = data?.PolicyNumber;
    this.CurrentStatus = data?.CurrentStatus;
    this.getPaymentType();
  }

  getPaymentType() {
    // const urlLink = `${this.ApiUrl1}quote/dropdown/paymenttypes`;
    // const reqData = {
    //   "BranchCode": this.userDetails?.BelongingBranch,
    //   "InsuranceId": this.userDetails?.InsuranceId,
    //   "UserType": this.userDetails?.UserType,
    //   "SubUserType": this.userDetails?.SubUserType,
    //   "ProductId": "46",
    //   "CreatedBy": this.userDetails?.LoginId,
    //   "AgencyCode": "12887"
    // }

    // this.newQuotesService.onPostMethodSync(urlLink, reqData).subscribe((data: any) => {
    //   console.log(data);
    //   if (data.Result) {

    //   }
    // })
    this.payment_type_list = [
      {
        "Code": "1",
        "CodeDesc": "Cash",
        "CodeDescLocal": "Cash",
        "Type": null
      },
      {
        "Code": "3",
        "CodeDesc": "Credit",
        "CodeDescLocal": "Credit",
        "Type": null
      },
      {
        "Code": "2",
        "CodeDesc": "Cheque",
        "CodeDescLocal": "Cheque",
        "Type": null
      },
      {
        "Code": "4",
        "CodeDesc": "Online Payment",
        "CodeDescLocal": "Online Payment",
        "Type": null
      },
      {
        "Code": "5",
        "CodeDesc": "Pay BY Mobile Money",
        "CodeDescLocal": "Pay BY Mobile Money",
        "Type": null
      },
      {
        "Code": "6",
        "CodeDesc": "Debit Card",
        "CodeDescLocal": "Debit Card",
        "Type": null
      }
    ]
  }
  addClick(data: any) {
    console.log(data, "dddddd");

    this.PolicyNo = data?.PolicyNumber
    this.Add_dialog = true;
    this.getInsuranceTypeList();
    this.getVehicelInfo();
  }
  getCompanyList() {
    let ReqObj = {
      "InsuranceId": '100020',
      "ItemType": "CO_INSURURANCE"
    }
    let urlLink = `${this.CommonApiUrl}master/getbyitemvalue`;
    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {
        // let defaultObj = [{ "Code": null, "CodeDesc": "--Select--" }]
        this.companyList = data.Result;
      })
  }
  UpdateCustomerStatus() {
    let date: any = null;
    let sts: any = null;
    if (this.Typevalue == 'Loss') {
      date = this.loss_date
      sts = 'RR'
    }
    else {
      date = this.conversion_date
      sts = 'RC'

    }
    if (date) {
      date = this.datePipe.transform(date, 'yyyy-MM-dd');
    }
    let ReqObj = {
      "PolicyNumber": this.PolicyNo,
      "RenewalDate": date,
      "LossReason": this.reason,
      "LossRemarks": this.remarks,
      "Competitor": this.loss_type,
      "CurrentStatus": sts,
      "PaymentType": this.conversion
    }
    let urlLink = `${this.CommonApiUrl}nbtrack/updaterenewpremiapolicy`;
    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {
        if (data.Message == 'UpdatedSuccessfully') {
          this.visible = false;
          if (this.userDetails[0].userType != 'Issuer') {
            this.getDivisiondata();
          }
          else {
            // this.getBrokerwiseData(this.ProductData.ProductCode);
          }
          Swal.fire({
            icon: 'info',
            title: 'Validation',
            html: 'Updated Successfully'
          });
        }
      },
      (err: any) => { },
    );
  }
  getInsuranceTypeList() {
    let ReqObj = null, urlLink = null;
    // ReqObj = {
    //   "InsuranceId":this.userDetails.InsuranceId,
    //   "ProductId": "5",
    //   "BranchCode": "128",
    //   "LoginId": "guest_kenya"
    // }
    // urlLink = `${this.ApiUrl1}master/dropdown/policytype`;
    // this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
    //   (data: any) => {
    //     console.log(data, "asdfsdfhsjfh");

    //   });
    this.Policy_type_list = [
      {
        "Code": "1",
        "CodeDesc": "Comprehensive",
        "IndustryType": null,
        "Status": "Y",
        "CodeDescLocal": null
      },
      {
        "Code": "2",
        "CodeDesc": "Third Party",
        "IndustryType": null,
        "Status": "Y",
        "CodeDescLocal": null
      }
    ]
  }
  saveVehicleInfo() {
    let ReqObj = {
      "PolicyNo": this.PolicyNo,
      "Make": this.Make,
      "Model": this.model,
      "BodyType": this.body_type,
      "VehicleUsage": this.vehicle_usage,
      "PolicyType": this.Policy_type,
      "SumInsured": this.sumInsured,
      "CreatedBy": this.userDetails.UserType,
    }
    let urlLink = `${this.CommonApiUrl}nbtrack/insertRenewProductInfo`;
    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {
        if (data.Message == 'Success') {
          this.Add_dialog = false;
          Swal.fire({
            icon: 'info',
            title: 'Validation',
            html: 'Vehicle Added Successfully'
          });
        }
        // let defaultObj = [{ "Code": null, "CodeDesc": "--Select--" }]
        // this.companyList = data.Result;
      })
  }
  getVehicelInfo() {

    // let urlLink = `${this.CommonApiUrl}renewaltrack/getRenewVehicleInfo?policyNo=${this.PolicyNo}&riskId=${this.RiksId}`;
    let urlLink = `${this.CommonApiUrl}nbtrack/getRenewProductInfo?policyNo=${this.PolicyNo}`;
    //  let urlLink = `${this.CommonApiUrl}renewaltrack/getExpiryPolicyDetails/${this.DivisionCode}`;
    this.shared.onGetMethodSync(urlLink).subscribe(
      (data: any) => {
        console.log(data, "dddddddd");

      },
      (err: any) => { },
    );
  }

  ViewRisk(customer: any) {
    let toDate: any = this.formatDate(this.to_date);
    let fromDate: any = this.formatDate(this.from_date);
    sessionStorage.setItem('from_date_op', fromDate);
    sessionStorage.setItem('to_date_op', toDate);
    sessionStorage.setItem('CustomerDeatils', JSON.stringify(customer))
    sessionStorage.setItem('PolicyNumber', JSON.stringify(customer.PolicyNumber))
    this.router.navigate(['/new-business-risk-details'])
  }
  // getBrokerwiseData(productCode: any) {
  //   let ReqObj
  //   let FromDate
  //   let ToDate
  //   if (this.userDetails.UserType != 'Broker') {
  //     ReqObj = {
  //       "CompanyId": this.userDetails.InsuranceId,
  //       "DivisionCode": "100",
  //       "ProductCode": this.ProductData.ProductCode,
  //       "StartDate": this.from_date,
  //       "EndDate": this.to_date
  //     }
  //   }
  //   else {
  //     // FromDate = this.formatDate(this.from_date);
  //     // ToDate = this.formatDate(this.to_date);
  //     ReqObj = {
  //       // "CompanyId": this.userDetails.InsuranceId,
  //       "CompanyId": '4',
  //       "DivisionCode": "101",
  //       "ProductCode": productCode,
  //       "SourceCode": this.userDetails[0].SourceCode,
  //       "StartDate": this.from_date,
  //       "EndDate": this.to_date
  //     }
  //   }

  //   let urlLink = `${this.CommonApiUrl}renewaltrack/getsourcesbyproduct`;
  //   this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
  //     (data: any) => {
  //       if (data) {

  //         this.ResponseData = data;

  //         this.dashborad_selectted_agent = data[0]?.SourceCode
  //         this.getCustomerData(this.dashborad_selectted_agent);
  //         // this.totalPolicyCount = data.reduce((sum: any, item: any) => sum + parseInt(item.Pending, 10), 0);
  //         this.totalPending = data.reduce((sum: any, item: any) => sum + parseInt(item.Pending, 10), 0);
  //         this.totalLost = data.reduce((sum: any, item: any) => sum + parseInt(item.Lost, 10), 0);
  //         this.totalPolicyCount = data.reduce((sum: number, item: any) =>
  //           sum + parseInt(item.Pending, 10) + parseInt(item.Lost, 10), 0);
  //         this.totalpremium = data.reduce((sum: any, item: any) => sum + parseInt(item.TotalPremium, 10), 0);
  //         if (this.userDetails.UserType == 'Broker') {
  //           window.addEventListener('resize', () => this.myChart?.resize());
  //           setTimeout(() => this.initChart(), 0);
  //         }
  //         // this.donotchart();

  //       }
  //     },
  //     (err: any) => { },
  //   );
  // }
}
