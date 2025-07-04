import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewBusinessProductsGridComponent } from './new-business-products-grid.component';

describe('NewBusinessProductsGridComponent', () => {
  let component: NewBusinessProductsGridComponent;
  let fixture: ComponentFixture<NewBusinessProductsGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewBusinessProductsGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewBusinessProductsGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
