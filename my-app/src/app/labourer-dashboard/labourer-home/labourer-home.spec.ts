import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabourerHome } from './labourer-home';

describe('LabourerHome', () => {
  let component: LabourerHome;
  let fixture: ComponentFixture<LabourerHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabourerHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabourerHome);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
