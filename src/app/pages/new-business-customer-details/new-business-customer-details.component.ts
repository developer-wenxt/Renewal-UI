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
  selector: 'app-new-business-customer-details',
  standalone: false,
  templateUrl: './new-business-customer-details.component.html',
  styleUrl: './new-business-customer-details.component.scss'
})
export class NewBusinessCustomerDetailsComponent {
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  private chartInstance: echarts.ECharts | null = null;
  public RenewalApiUrl: any = config.RenewalApiUrl;
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
  userType: any;
  divisionName: any;
  divisionCode: any;
  PolSrcCode: any
  checkFlow: any
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
          this.sessionStorageService.set('Userdetails', Userdetails);
          this.onSelectProduct();

        }
      }
      else {
        let d = JSON.parse(sessionStorage.getItem('Userdetails') as any);
        this.userDetails = d.Result;
        if (this.userDetails.UserType == 'Broker') {
          this.getSouceCode();
        }
      }
    })

    // this.userDetails = 
    // this.sidebarService.userType$.subscribe(value => {
    this.ProductData = JSON.parse(sessionStorage.getItem('SelecttedProduct') as any);
    console.log(this.ProductData);

    let d = JSON.parse(sessionStorage.getItem('Userdetails') as any);
    this.userDetails = d.Result;
    if (this.userDetails.UserType == 'Broker') {
      const now = new Date();
      now.setMonth(now.getMonth() - 1);
      this.from_date = new Date(now); // Set as Date object
      // this.from_date = this.formatDate(this.from_date);
      const to_now = new Date();
      this.to_date = new Date(to_now);
      // this.to_date = this.formatDate(this.to_date);
    }

    let division = JSON.parse(sessionStorage.getItem('division') as any);
    this.divisionName = division.PolSrcName
    this.divisionCode = division.PolSrcCode
    console.log(division, "divisiondivisiondivision");
    // });
    // if (this.userDetails.UserType == 'Broker') {
    //   this.getDivisiondata();
    // }
    // this.userDetails = JSON.parse(sessionStorage.getItem('Userdetails') as any);
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


    this.DivisionName = sessionStorage.getItem('SelecttedDivision') as any;
    console.log(this.ProductData, "ProductData");
    // if (this.userDetails[0].userType != 'Broker') {

    // if (this.userDetails[0].userType == 'Issuer') {

    // }
    // if (this.userDetails[0].userType == 'Opration-Head') {
    //   this.from_date = sessionStorage.getItem('from_date_op') as any;
    //   this.to_date = sessionStorage.getItem('to_date_op') as any;
    // }
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
    // this.getDivisiondata(value);
    console.log(value);
    // this.getProdctWiseCustomerData(value)
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
        // "DivisionCode": "100",
        "DivisionCode": this.userDetails.DivisionCode,
        "ProductCode": this.ProductData.ProductCode,
        "StartDate": this.from_date,
        "EndDate": this.to_date
      }
    }
    else {
      // FromDate = this.formatDate(this.from_date);
      // ToDate = this.formatDate(this.to_date);
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

    let urlLink = `${this.RenewalApiUrl}nbtrack/getsourcesbyproduct`;
    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {
        if (data) {

          this.ResponseData = data;

          this.dashborad_selectted_agent = data[0]?.SourceCode
          this.getCustomerData(this.dashborad_selectted_agent);
          // this.totalPolicyCount = data.reduce((sum: any, item: any) => sum + parseInt(item.Pending, 10), 0);
          this.totalPending = data.reduce((sum: any, item: any) => sum + parseInt(item.Pending, 10), 0);
          this.totalLost = data.reduce((sum: any, item: any) => sum + parseInt(item.Lost, 10), 0);
          this.totalPolicyCount = data.reduce((sum: number, item: any) =>
            sum + parseInt(item.Pending, 10) + parseInt(item.Lost, 10), 0);
          this.totalpremium = data.reduce((sum: any, item: any) => sum + parseInt(item.TotalPremium, 10), 0);
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

    let urlLink = `${this.RenewalApiUrl}nbtrack/getpolicydetails`;
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
    let urlLink = `${this.RenewalApiUrl}nbtrack/updaterenewpremiapolicy`;
    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {
        if (data.Message == 'UpdatedSuccessfully') {
          this.visible = false;
          // if (this.userDetails[0].userType != 'Issuer') {
          //   this.getDivisiondata();
          // }
          // else {

          // }
          Swal.fire({
            icon: 'info',
            title: 'Validation',
            html: 'Updated Successfully'
          });
          this.getCustomerData(null);
        }
        else {
          this.visible = false;
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


    let urlLink = `${this.RenewalApiUrl}nbtrack/getproductsbycompanyanddivision`;
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
    let urlLink = `${this.RenewalApiUrl}master/getbyitemvalue`;
    this.shared.onPostMethodSync(urlLink, ReqObj).subscribe(
      (data: any) => {
        // let defaultObj = [{ "Code": null, "CodeDesc": "--Select--" }]
        this.companyList = data.Result;
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
    this.router.navigate(['/new-business-products'])
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
    let urlLink = `${this.RenewalApiUrl}nbtrack/insertRenewVehicleInfo`;
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

    // let urlLink = `${this.RenewalApiUrl}nbtrack/getRenewVehicleInfo?policyNo=${this.PolicyNo}&riskId=${this.RiksId}`;
    let urlLink = `${this.RenewalApiUrl}nbtrack/getRenewVehicleInfo?policyNo=${this.PolicyNo}`;
    //  let urlLink = `${this.RenewalApiUrl}nbtrack/getExpiryPolicyDetails/${this.DivisionCode}`;
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
    if (this.userType == 'Issuer') {
      this.router.navigate([`${this.routerBaseLink}/new-business-dashboard`]);
    }
    else {
      // let value = 'broker'
      // this.router.navigate([`${this.routerBaseLink}/branch-dashboard`], { queryParams: { value } });
      this.router.navigate([`${this.routerBaseLink}/broker`]);
    }
  }
  getSouceCode() {

    let d = JSON.parse(sessionStorage.getItem('Userdetails') as any);
    this.userDetails = d.Result;
    let ReqObj = {
      "LoginId": this.userDetails.LoginId
    }
    let urlLink = `${this.RenewalApiUrl}nbtrack/getSourceFromLogin`;
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

  ViewRisk(customer: any,mode: any) {
    // let toDate: any = this.formatDate(this.to_date);
    // let fromDate: any = this.formatDate(this.from_date);
    // sessionStorage.setItem('from_date_op', fromDate);
    // sessionStorage.setItem('to_date_op', toDate);
    // sessionStorage.setItem('PolicyNumber', JSON.stringify(customer.PolicyNumber))
    // sessionStorage.setItem('CustomerDeatils', JSON.stringify(customer))
    // this.router.navigate(['/new-business-risk-details'])
      let status = 'newbusiness'
      let d = mode
      sessionStorage.setItem('PolicyNumber', JSON.stringify(customer.PolicyNumber))
      sessionStorage.setItem('CustomerDeatils', JSON.stringify(customer))
      this.router.navigate(['/risk-details'], { queryParams: { status, mode: d } })
    
  }
}
