import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SharedService } from '../../services/shareService';
import { config } from '../../helpers/appconfig';
import { EChartsOption, BarSeriesOption } from 'echarts';
import * as echarts from 'echarts';
import { Table } from 'primeng/table';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
@Component({
  selector: 'app-broker',
  standalone: false,
  templateUrl: './broker.component.html',
  styleUrl: './broker.component.scss'
})
export class BrokerComponent implements OnInit, AfterViewInit {
  @ViewChild('dt2') dt2!: Table;
  @ViewChild('dt1') dt1!: Table;
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  private chartInstance: echarts.ECharts | null = null;
  private myChart!: echarts.ECharts;
  public RenewalApiUrl: any = config.RenewalApiUrl;
  public CommonApiUrl: any = config.CommonApiUrl;
  userDetails: any;
  PolSrcCode: any;
  ResponseData: any;
  dashborad_selectted_agent: any;
  Add_dialog: boolean = false;
  totalPolicyCount: number = 0;
  totalPending: number = 0;
  totalSuccess: number = 0;
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
  ProductId: any;

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
    // if (this.userDetails.UserType == 'Broker') {
    //   const now = new Date();
    //   now.setMonth(now.getMonth() - 1);
    //   this.from_date = new Date(now);
    //   const to_now = new Date();
    //   this.to_date = new Date(to_now);
    //   // this.getSouceCode();
    //   this.getDivisiondata();
    // }


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
      // this.getSouceCode();
      this.getDivisiondata();
    }
    else {
      let fromdate = sessionStorage.getItem('from_date_op') as any;
      let todate = sessionStorage.getItem('to_date_op') as any;
      // this.getSouceCode();

      this.from_date = new Date(fromdate);
      this.to_date = new Date(todate);
      this.getDivisiondata();
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
  // getSouceCode() {

  //   let d = JSON.parse(sessionStorage.getItem('Userdetails') as any);
  //   this.userDetails = d.Result;
  //   let ReqObj = {
  //     "LoginId": this.userDetails.LoginId
  //   }
  //   let urlLink = `${this.RenewalApiUrl}renewaltrack/getSourceFromLogin`;
  //   this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
  //     (data: any) => {
  //       if (data) {
  //         console.log(data, "LoginIdLoginIdLoginId");
  //         if (data.SourceCode) {
  //           this.PolSrcCode = data.SourceCode;
  //           this.getDivisiondata();
  //         }
  //       }

  //     })
  // }

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
        "DivisionCode": this.userDetails.DivisionCode,
        "SourceCode": this.userDetails.SourceCode,
        "StartDate": FromDate,
        "EndDate": ToDate
      }
    }


    let urlLink = `${this.RenewalApiUrl}renewaltrack/getproductsbycompanyanddivision`;
    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {

        if (data) {
          this.ResponseData = data?.Result;
          console.log(this.ResponseData, "ResponseData");

          this.dashborad_selectted_agent = data?.Result[0].ProductCode
          if (this.dashborad_selectted_agent) {
            this.getCustomerData(this.dashborad_selectted_agent);

          }
          // this.totalPolicyCount = data.reduce((sum: any, item: any) => sum + parseInt(item.Pending, 10), 0);
          this.totalPending = data?.Result.reduce((sum: any, item: any) => sum + parseInt(item.Pending, 10), 0);
          this.totalSuccess = data?.Result.reduce((sum: any, item: any) => sum + parseInt(item.Success, 10), 0);
          this.totalLost = data?.Result.reduce((sum: any, item: any) => sum + parseInt(item.Lost, 10), 0);
          // this.totalPolicyCount = data.reduce((sum: number, item: any) =>
          //   sum + parseInt(item.Pending, 10) + parseInt(item.Lost, 10), 0);
          this.totalPolicyCount = data?.Result.reduce((sum: any, item: any) => sum + parseInt(item.ProductCount, 10), 0);

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
    let completedData: any = 0
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
      totalData = this.ResponseData.map((item: { ProductCount: string; }) => parseInt(item.ProductCount, 10) || 0);
      completedData = this.ResponseData.map((item: { Success: string; }) => parseInt(item.Success, 10) || 0);
      // totalData = this.ResponseData.map((item: { Pending: string; Lost: string; }) =>
      //   (parseInt(item.Pending, 10) || 0) + (parseInt(item.Lost, 10) || 0)
      // );

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
        data: ['Completed','Pending', 'Lost', 'Total']
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
            borderRadius: [6, 6, 0, 0],
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
          name: 'Completed',
          type: 'bar',
          barGap: '20%',
          label: labelOption,
          emphasis: { focus: 'series' },
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#0bb767' },
                { offset: 1, color: '#0bb767' }
              ]
            }
          },
          data: completedData
        },
        {
          name: 'Pending',
          type: 'bar',
          label: labelOption,
          emphasis: { focus: 'series' },
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
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
            borderRadius: [6, 6, 0, 0],
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
        "DivisionCode": this.userDetails.DivisionCode,
        // "DivisionCode": '101',
        "ProductCode": value,
        "SourceCode": this.userDetails.SourceCode,
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

    let urlLink = `${this.RenewalApiUrl}renewaltrack/getpolicydetails`;
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
    this.ProductId = null;
    this.getCompanyList();
    this.PolicyNo = null;
    this.CurrentStatus = null;
    this.visible = true;
    this.PolicyNo = data?.PolicyNumber;
    this.ProductId = data?.ProductCode;
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
    // this.getVehicelInfo();
  }
  getCompanyList() {
    let ReqObj = {
      "InsuranceId": this.userDetails.InsuranceId,
      "ItemType": "CO_INSURURANCE"
    }
    let urlLink = `${this.RenewalApiUrl}master/getbyitemvalue`;
    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {
        // let defaultObj = [{ "Code": null, "CodeDesc": "--Select--" }]
        this.companyList = data.Result;
      })
  }
  getReasonList() {
    let ReqObj = {
      "InsuranceId": this.userDetails.InsuranceId,
      "ItemType": "LAST_REASONS"
    }
    let urlLink = `${this.CommonApiUrl}master/getbyitemvalue`;
    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {
        this.reason_list = data.Result;
      })
  }

  UpdateCustomerStatus() {
    let validatain: boolean = false
    let date: any = null;
    let sts: any = null;
    if (this.Typevalue == 'Loss') {
      date = this.loss_date
      sts = 'RR'
      if (this.loss_type != null && this.loss_type != ''
        && this.reason != null && this.reason != ''
        && this.loss_date != null && this.loss_date != '') {
        validatain = true;
      }
      else {
        validatain = false;
      }
    }
    else {
      date = this.conversion_date
      sts = 'RC'
      if (this.conversion != null && this.conversion != ''
        && this.conversion_date != null && this.conversion_date != '') {
        validatain = true;
      }
      else {
        validatain = false;
      }
    }
    if (date) {
      date = this.datePipe.transform(date, 'yyyy-MM-dd');
    }
    if (validatain == true) {
      let ReqObj = {
        "PolicyNumber": this.PolicyNo,
        "RenewalDate": date,
        "LossReason": this.reason,
        "LossRemarks": this.remarks,
        "Competitor": this.loss_type,
        "CurrentStatus": sts,
        "PaymentType": this.conversion
      }
      let urlLink = `${this.RenewalApiUrl}renewaltrack/updaterenewpremiapolicy`;
      this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
        (data: any) => {
          if (data.Message == 'UpdatedSuccessfully') {
            this.visible = false;
            this.statusUpdateFormReset();
            Swal.fire({
              icon: 'info',
              title: 'Validation',
              html: 'Updated Successfully'
            });
            this.getCustomerData(null)
          }
          else {
            this.visible = false;
            this.statusUpdateFormReset();
            Swal.fire({
              icon: 'error',
              title: 'Validation',
              html: data.Message
            });
          }
        },
        (err: any) => { },
      );
    }
    else {
      Swal.fire({
        icon: 'error',
        title: 'Validation',
        html: 'Invalid Form',
        customClass: {
          popup: 'my-zindex-alert'
        }
      });
    }

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
    let urlLink = `${this.RenewalApiUrl}renewaltrack/insertRenewProductInfo`;
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
        else {
          Swal.fire({
            icon: 'info',
            title: 'Validation',
            html: data.Message
          });
        }
        // let defaultObj = [{ "Code": null, "CodeDesc": "--Select--" }]
        // this.companyList = data.Result;
      })
  }
  getVehicelInfo() {

    // let urlLink = `${this.RenewalApiUrl}renewaltrack/getRenewVehicleInfo?policyNo=${this.PolicyNo}&riskId=${this.RiksId}`;
    let urlLink = `${this.RenewalApiUrl}renewaltrack/getRenewProductInfo?policyNo=${this.PolicyNo}`;
    //  let urlLink = `${this.RenewalApiUrl}renewaltrack/getExpiryPolicyDetails/${this.DivisionCode}`;
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
    this.router.navigate(['/risk-details'])
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

  //   let urlLink = `${this.RenewalApiUrl}renewaltrack/getsourcesbyproduct`;
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

  statusUpdateFormReset() {
    this.remarks = null;
    this.conversion_date = null;
    this.conversion = null;
    this.loss_date = null;
    this.reason = null;
    this.loss_type = null;
    this.Typevalue = 'Loss'
  }

   exportExcel() {
      const worksheet = XLSX.utils.json_to_sheet(this.ResponseData);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, 'product_report');
    }
  
    exportPdf() {
      const doc = new jsPDF('landscape'); // use 'portrait' if you prefer
  
      // Define table headers (same order as your p-table)
      const headers = [['Product Code', 'Product Name', 'Premium', 'Success', 'Pending', 'Lost', 'Total']];
  
      // Prepare data rows from tableList
      const data = this.ResponseData.map((row: { ProductCode: any; ProductName: any; TotalPremium: any; Success: any; Pending: any; Lost: any; ProductCount: any; }) => [
        row.ProductCode,
        row.ProductName,
        row.TotalPremium,
        row.Success,
        row.Pending,
        row.Lost,
        row.ProductCount
      ]);
  
      // Generate the table
      autoTable(doc, {
        head: headers,
        body: data,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [40, 40, 40] },
        margin: { top: 20 }
      });
  
      // Save PDF
      doc.save(`product-report-${new Date().getTime()}.pdf`);
    }
  
  
    saveAsExcelFile(buffer: any, fileName: string): void {
      const data: Blob = new Blob([buffer], {
        type:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
      });
      saveAs(data, fileName + '_export_' + new Date().getTime() + '.xlsx');
    }
}
