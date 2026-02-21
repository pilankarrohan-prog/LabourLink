import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabourerDashboard } from './labourer-dashboard';

describe('LabourerDashboard', () => {
  let component: LabourerDashboard;
  let fixture: ComponentFixture<LabourerDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabourerDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabourerDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
