import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SamplePdfComponent } from './sample-pdf.component';

describe('SamplePdfComponent', () => {
  let component: SamplePdfComponent;
  let fixture: ComponentFixture<SamplePdfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SamplePdfComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SamplePdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
