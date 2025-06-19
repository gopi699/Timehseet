import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddformcreateComponent } from './addformcreate.component';

describe('AddformcreateComponent', () => {
  let component: AddformcreateComponent;
  let fixture: ComponentFixture<AddformcreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddformcreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddformcreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});