import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistryPopupComponent } from './registry-popup.component';

describe('RegistryPopupComponent', () => {
  let component: RegistryPopupComponent;
  let fixture: ComponentFixture<RegistryPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistryPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegistryPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
