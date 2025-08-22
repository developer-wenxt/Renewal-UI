import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimSummaryMonthlypaidDateWiseCountComponent } from './claim-summary-monthlypaid-date-wise-count.component';

describe('ClaimSummaryMonthlypaidDateWiseCountComponent', () => {
  let component: ClaimSummaryMonthlypaidDateWiseCountComponent;
  let fixture: ComponentFixture<ClaimSummaryMonthlypaidDateWiseCountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClaimSummaryMonthlypaidDateWiseCountComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimSummaryMonthlypaidDateWiseCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
