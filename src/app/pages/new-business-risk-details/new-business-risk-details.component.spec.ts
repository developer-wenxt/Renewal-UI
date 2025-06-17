import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewBusinessRiskDetailsComponent } from './new-business-risk-details.component';

describe('NewBusinessRiskDetailsComponent', () => {
  let component: NewBusinessRiskDetailsComponent;
  let fixture: ComponentFixture<NewBusinessRiskDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewBusinessRiskDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewBusinessRiskDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
