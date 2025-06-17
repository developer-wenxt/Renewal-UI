import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OprationHeaderDashboardComponent } from './opration-header-dashboard.component';

describe('OprationHeaderDashboardComponent', () => {
  let component: OprationHeaderDashboardComponent;
  let fixture: ComponentFixture<OprationHeaderDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OprationHeaderDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OprationHeaderDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
