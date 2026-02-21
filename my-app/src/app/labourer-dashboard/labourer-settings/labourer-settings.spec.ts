import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabourerSettings } from './labourer-settings';

describe('LabourerSettings', () => {
  let component: LabourerSettings;
  let fixture: ComponentFixture<LabourerSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabourerSettings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabourerSettings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
