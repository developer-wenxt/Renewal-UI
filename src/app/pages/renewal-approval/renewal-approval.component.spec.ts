import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RenewalApprovalComponent } from './renewal-approval.component';

describe('RenewalApprovalComponent', () => {
  let component: RenewalApprovalComponent;
  let fixture: ComponentFixture<RenewalApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RenewalApprovalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RenewalApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
