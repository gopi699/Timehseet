import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReimburseApprovalComponent } from './reimburseapproval.component';

describe('ReimburseLeaveApprovalComponent', () => {
  let component: ReimburseApprovalComponent;
  let fixture: ComponentFixture<ReimburseApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReimburseApprovalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReimburseApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
