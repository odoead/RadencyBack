import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoworkingDetailPageComponent } from './coworking-detail-page.component';

describe('CoworkingDetailPageComponent', () => {
  let component: CoworkingDetailPageComponent;
  let fixture: ComponentFixture<CoworkingDetailPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoworkingDetailPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoworkingDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
