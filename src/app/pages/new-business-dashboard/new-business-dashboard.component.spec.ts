import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewBusinessDashboardComponent } from './new-business-dashboard.component';

describe('NewBusinessDashboardComponent', () => {
  let component: NewBusinessDashboardComponent;
  let fixture: ComponentFixture<NewBusinessDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewBusinessDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewBusinessDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
