import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRiskDetailsComponent } from './view-risk-details.component';

describe('ViewRiskDetailsComponent', () => {
  let component: ViewRiskDetailsComponent;
  let fixture: ComponentFixture<ViewRiskDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewRiskDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewRiskDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
