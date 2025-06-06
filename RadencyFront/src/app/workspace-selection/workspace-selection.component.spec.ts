import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceSelectionComponent } from './workspace-selection.component';

describe('WorkspaceSelectionComponent', () => {
  let component: WorkspaceSelectionComponent;
  let fixture: ComponentFixture<WorkspaceSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkspaceSelectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WorkspaceSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
