import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabourerRequests } from './labourer-requests';

describe('LabourerRequests', () => {
  let component: LabourerRequests;
  let fixture: ComponentFixture<LabourerRequests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabourerRequests]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabourerRequests);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
