import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabourerReviews } from './labourer-reviews';

describe('LabourerReviews', () => {
  let component: LabourerReviews;
  let fixture: ComponentFixture<LabourerReviews>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabourerReviews]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabourerReviews);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
