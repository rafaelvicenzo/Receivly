import { TestBed } from '@angular/core/testing';

import { CollectionRule } from './collection-rule';

describe('CollectionRule', () => {
  let service: CollectionRule;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CollectionRule);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
