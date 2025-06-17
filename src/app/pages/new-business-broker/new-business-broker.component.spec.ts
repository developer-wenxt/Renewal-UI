import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewBusinessBrokerComponent } from './new-business-broker.component';

describe('NewBusinessBrokerComponent', () => {
  let component: NewBusinessBrokerComponent;
  let fixture: ComponentFixture<NewBusinessBrokerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewBusinessBrokerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewBusinessBrokerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
