import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthSocial } from './auth-social';

describe('AuthSocial', () => {
  let component: AuthSocial;
  let fixture: ComponentFixture<AuthSocial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthSocial],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthSocial);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
