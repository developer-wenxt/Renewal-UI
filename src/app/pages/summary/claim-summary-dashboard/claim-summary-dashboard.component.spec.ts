import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimSummaryDashboardComponent } from './claim-summary-dashboard.component';

describe('ClaimSummaryDashboardComponent', () => {
  let component: ClaimSummaryDashboardComponent;
  let fixture: ComponentFixture<ClaimSummaryDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClaimSummaryDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimSummaryDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
