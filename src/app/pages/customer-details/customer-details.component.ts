import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { EChartsOption, BarSeriesOption } from 'echarts';
import { config } from '../../helpers/appconfig';
import * as echarts from 'echarts';
import { SharedService } from '../../services/shareService';
import Swal from 'sweetalert2';
import { SidebarService } from '../../services/sidebar.service';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../helpers/auth/Auth/auth.service';
import { SessionStorageService } from '../../storage/session-storage.service';
@Component({
  selector: 'app-customer-details',
  standalone: false,
  templateUrl: './customer-details.component.html',
  styleUrl: './customer-details.component.scss'
})
export class CustomerDetailsComponent implements OnInit, OnDestroy {
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  private chartInstance: echarts.ECharts | null = null;
  public RenewalApiUrl: any = config.RenewalApiUrl;
  public CommonApiUrl: any = config.CommonApiUrl;
  @ViewChild('dt2') dt2!: Table;
  @ViewChild('dt1') dt1!: Table;
  totalPolicyCount: number = 0;
  totalPending: number = 0;
  visible: boolean = false;
  totalLost: number = 0;
  from_date: any
  to_date: any
  customers_list: any
  overall_product_list: any[] = [];
  dashborad_selectted_agent: any;
  ResponseData: any[] = [];
  Policy_type_list: any[] = [];
  public routerBaseLink: any = '';
  private myChart!: echarts.ECharts;
  stateOptions: any[] | undefined;
  Typevalue: any = 'Loss'
  cities: any[] | undefined;
  loss_type: any;
  reason: any;
  ProductData: any
  loss_date: any;
  conversion: any;
  conversion_date: any;
  DivisionName: any
  dashborad_selectted_agent_name: any;
  userDetails: any;
  remarks: any;
  companyList: any[] = [];
  reason_list: any[] = [];
  totalpremium: any;
  PolicyNo: any;
  Add_dialog: boolean = false;
  CurrentStatus: any;
  payment_type_list: any[] = [];
  Make: any;
  model: any;
  body_type: any;
  vehicle_usage: any;
  Policy_type: any;
  sumInsured: any;
  encryptedValue: any;
  loginId: any;
  insuranceId: any;
  branchcode: any;
  productId: any;
  brokerList: any[] = [];
  userType: any;
  divisionName: any;
  divisionData: any;
  divisionCode: any;
  PolSrcCode: any
  checkFlow: any
  SubUserType: any;
  constructor(private shared: SharedService,
    private authService: AuthService,
    private sidebarService: SidebarService,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private router: Router,
    private sessionStorageService: SessionStorageService) {
    this.stateOptions = [{ label: 'Lost', value: 'Loss' }, { label: 'Conversion', value: 'Conversion' }];
    this.route.queryParamMap.subscribe((params: any) => {
      this.checkFlow = params.params['value']
      if (this.checkFlow != 'Issuer' && this.checkFlow != 'broker') {
        this.encryptedValue = encodeURIComponent(params.params.e);
        let storageData = CryptoJS.AES.decrypt(decodeURIComponent(this.encryptedValue), 'secret key 123');
        console.log(storageData, "storageDatastorageDatastorageData");

        let decryptedInfo = JSON.parse(storageData.toString(CryptoJS.enc.Utf8));
        console.log("Encrypted Info", decryptedInfo)
        if (decryptedInfo) {
          let Userdetails = decryptedInfo;
          this.loginId = Userdetails.Result.LoginId;
          this.insuranceId = Userdetails.Result.InsuranceId;

          this.branchcode = Userdetails.Result.BranchCode;
          this.productId = Userdetails.Result['ProductId']
          Userdetails['LoginResponse'] = Userdetails.Result;
          Userdetails.LoginResponse['RegionCode'] = this.insuranceId;
          Userdetails.LoginResponse.UserType = Userdetails.LoginResponse?.UserTypeAlt;
          sessionStorage.setItem('Userdetails', JSON.stringify(Userdetails))
          sessionStorage.setItem('UserToken', Userdetails.Result.Token);
          this.authService.login(Userdetails);
          this.authService.UserToken(Userdetails.Result.Token);
          this.userType = Userdetails.Result.UserType;
          this.SubUserType = Userdetails.Result.SubUserType;
          this.sessionStorageService.set('Userdetails', Userdetails);
          // this.getMenuList();
          this.onSelectProduct();


        }
      }
      else {
        let d = JSON.parse(sessionStorage.getItem('Userdetails') as any);
        this.userDetails = d.Result;
        this.brokerList = JSON.parse(sessionStorage.getItem('brokerList') as any);

        if (this.userDetails.UserType == 'Broker') {
          this.getSouceCode();
        }
      }
    })


    this.ProductData = JSON.parse(sessionStorage.getItem('SelecttedProduct') as any);
    console.log(this.ProductData);

    let d = JSON.parse(sessionStorage.getItem('Userdetails') as any);
    this.userDetails = d.Result;
    if (this.userDetails.UserType == 'Broker') {
      const now = new Date();
      now.setMonth(now.getMonth() - 1);
      this.from_date = new Date(now);
      const to_now = new Date();
      this.to_date = new Date(to_now);

    }

    let division = JSON.parse(sessionStorage.getItem('division') as any);
    this.divisionData = division
    console.log(this.divisionData, "divisionData");

    this.divisionName = division?.PolSrcName
    this.divisionCode = division?.PolSrcCode


  }
  onDateChange(): void {
    const date = new Date(this.from_date);
    const formattedFromDate = this.from_date.toISOString().substring(0, 10);
    const date1 = new Date(this.to_date);
    const formattedTodate = this.to_date.toISOString().substring(0, 10);
    // this.getdata(formattedFromDate, formattedTodate)
    this.getDivisiondata();

  }
  onGlobalFilter(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.dt2.filterGlobal(input.value, 'contains');
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.chartContainer) {
        this.initChart();
      }
    }, 0);
  }
  ngOnInit() {

    this.DivisionName = sessionStorage.getItem('SelecttedDivision') as any;
    if (this.userDetails.UserType != 'Broker') {
      this.from_date = sessionStorage.getItem('from_date_op') as any;
      this.to_date = sessionStorage.getItem('to_date_op') as any;
      this.getBrokerwiseData(this.ProductData.ProductCode);
    }
    else {
      window.addEventListener('resize', () => this.myChart.resize());

    }

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

      pendingData = this.ResponseData.map(item => parseInt(item.Pending, 10) || 0);
      lossData = this.ResponseData.map(item => parseInt(item.Lost, 10) || 0);
      totalData = this.ResponseData.map(item =>
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


    this.getCustomerData(value);

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
  selecttedAgent(Agent: any) {


  }

  editClick(data: any) {
    this.getCompanyList();
    this.getReasonList();
    this.PolicyNo = null;
    this.CurrentStatus = null;
    this.visible = true;
    this.PolicyNo = data?.PolicyNumber;
    this.CurrentStatus = data?.CurrentStatus;
    this.getPaymentType();
  }

  donotchart() {
    const chartDom = document.getElementById('chart-container1')!;
    this.chartInstance = echarts.init(chartDom);

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'item'
      },
      // legend: {
      //   top: '5%',
      //   left: 'center'
      // },
      series: [
        {
          // name: 'Access From',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 15,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            // { value: Number(this.totalPending), name: 'Total' },
            { value: Number(this.totalPending), name: 'Pending' },
            { value: Number(this.totalLost), name: 'Lost' },
          ]
        }
      ]
    };

    this.chartInstance.setOption(option);

    window.addEventListener('resize', this.resizeChart);
  }
  resizeChart = () => {
    this.chartInstance?.resize();
  };

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeChart);
    this.chartInstance?.dispose();
  }
  addClick(data: any) {
    console.log(data, "dddddd");

    this.PolicyNo = data?.PolicyNumber
    this.Add_dialog = true;
    this.getInsuranceTypeList();
    // this.getVehicelInfo();
  }
  getBrokerwiseData(productCode: any) {
    let ReqObj
    let FromDate
    let ToDate
    if (this.userDetails.UserType != 'Broker') {
      ReqObj = {
        "CompanyId": this.userDetails.InsuranceId,
        "DivisionCode": this.ProductData.DivisionCode,
        "ProductCode": this.ProductData.ProductCode,
        "StartDate": this.from_date,
        "EndDate": this.to_date
      }
    }
    else {

      ReqObj = {
        "CompanyId": this.userDetails.InsuranceId,
        // "CompanyId": '4',
        "DivisionCode": this.divisionCode,
        "ProductCode": productCode,
        "SourceCode": this.userDetails[0].SourceCode,
        "StartDate": this.from_date,
        "EndDate": this.to_date
      }
    }

    let urlLink = `${this.RenewalApiUrl}renewaltrack/getsourcesbyproduct`;
    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {
        if (data) {

          this.ResponseData = data.Result;

          this.dashborad_selectted_agent = this.ResponseData[0]?.PolSrcCode
          this.dashborad_selectted_agent_name = this.ResponseData[0]?.PolSrcName
          this.getCustomerData(this.dashborad_selectted_agent);
          // this.totalPolicyCount = data.reduce((sum: any, item: any) => sum + parseInt(item.Pending, 10), 0);
          this.totalPending = data?.reduce((sum: any, item: any) => sum + parseInt(item.Pending, 10), 0);
          this.totalLost = data?.reduce((sum: any, item: any) => sum + parseInt(item.Lost, 10), 0);
          this.totalPolicyCount = data?.reduce((sum: number, item: any) =>
            sum + parseInt(item.Pending, 10) + parseInt(item.Lost, 10), 0);
          this.totalpremium = data?.reduce((sum: any, item: any) => sum + parseInt(item.TotalPremium, 10), 0);
          if (this.userDetails.UserType == 'Broker') {
            window.addEventListener('resize', () => this.myChart?.resize());
            setTimeout(() => this.initChart(), 0);
          }
          // this.donotchart();

        }
      },
      (err: any) => { },
    );
  }
  getCustomerData(value: any) {
    let ReqObj
    let FromDate
    let ToDate
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
        "DivisionCode": this.ProductData.DivisionCode,
        // "DivisionCode": '101',
        "ProductCode": this.ProductData.ProductCode,
        "SourceCode": this.divisionCode,
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
      },
      (err: any) => { },
    );
  }
  viewCustomer(sts: any) {

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
            this.getBrokerwiseData(null)
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
        "DivisionCode": '101',
        // "DivisionCode": this.userDetails.BranchCode,
        "SourceCode": this.PolSrcCode,
        "StartDate": FromDate,
        "EndDate": ToDate
      }
    }


    let urlLink = `${this.RenewalApiUrl}renewaltrack/getproductsbycompanyanddivision`;
    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {

        if (data) {
          this.ResponseData = data;
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
  getCompanyList() {
    let ReqObj = {
      "InsuranceId": this.userDetails.InsuranceId,
      "ItemType": "CO_INSURURANCE"
    }
    let urlLink = `${this.CommonApiUrl}master/getbyitemvalue`;
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
  navigateProd() {
    let value = 'back'
    this.router.navigate(['/products-list'], { queryParams: { value } })
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
    let urlLink = `${this.RenewalApiUrl}renewaltrack/insertRenewVehicleInfo`;
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

  getVehicelInfo() {

    // let urlLink = `${this.RenewalApiUrl}renewaltrack/getRenewVehicleInfo?policyNo=${this.PolicyNo}&riskId=${this.RiksId}`;
    let urlLink = `${this.RenewalApiUrl}renewaltrack/getRenewVehicleInfo?policyNo=${this.PolicyNo}`;
    //  let urlLink = `${this.RenewalApiUrl}renewaltrack/getExpiryPolicyDetails/${this.DivisionCode}`;
    this.shared.onGetMethodSync(urlLink).subscribe(
      (data: any) => {
        console.log(data, "dddddddd");

      },
      (err: any) => { },
    );
  }

  formatDate(date: any): string | null {
    return this.datePipe.transform(date, 'yyyy-MM-dd');
  }

  onSelectProduct() {
    // if (this.userType == 'Issuer') {
    //   this.router.navigate([`${this.routerBaseLink}/dashboard`]);
    // }
    // else {

    //   this.router.navigate([`${this.routerBaseLink}/broker`]);
    // }
    if (this.userType == 'Issuer') {
      this.router.navigate([`${this.routerBaseLink}/overview-dashboard`]);
    }
    else {

      this.router.navigate([`${this.routerBaseLink}/broker`]);
    }
  }
  getSouceCode() {

    let d = JSON.parse(sessionStorage.getItem('Userdetails') as any);
    this.userDetails = d.Result;
    let ReqObj = {
      "LoginId": this.userDetails.LoginId
    }
    let urlLink = `${this.RenewalApiUrl}renewaltrack/getSourceFromLogin`;
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

  ViewRisk(customer: any) {
    sessionStorage.setItem('PolicyNumber', JSON.stringify(customer.PolicyNumber))
    sessionStorage.setItem('CustomerDeatils', JSON.stringify(customer))
    this.router.navigate(['/risk-details'])
  }

  getPercentage(value: number): number {
    const total = this.divisionData?.SourceCount;
    return total ? Math.round((+value / total) * 1000) / 10 : 0; // one decimal
  }

  statusUpdateFormReset() {
    this.remarks = null;
    this.conversion_date = null;
    this.conversion = null;
    this.loss_date = null;
    this.reason = null;
    this.loss_type = null;
    this.Typevalue = 'Loss'
  }

  getMenuList() {
    const urlLink = `${this.CommonApiUrl}admin/getmenulist`;
    const ReqObj = {
      LoginId: this.loginId,
      UserType: this.userType,
      SubUserType: this.SubUserType,
      InsuranceId: this.insuranceId,
      ProductId: this.productId,
    };
    this.shared.onPostMethodBearerSync(urlLink, ReqObj).subscribe(
      (data: any) => {
        console.log(data, "menulist");
        if (data.Result) {
          let filteredList = data.Result.filter((ele: { ProductId: any; }) => ele.ProductId == this.productId);
          sessionStorage.setItem('MenuList', JSON.stringify(filteredList))
          this.onSelectProduct();

        }
      },

      (err: any) => {
        console.log(err);
      },
    );
  }
}
