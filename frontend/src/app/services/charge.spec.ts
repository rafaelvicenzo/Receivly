import { TestBed } from '@angular/core/testing';

import { Charge } from './charge';

describe('Charge', () => {
  let service: Charge;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Charge);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
