import { TestBed } from '@angular/core/testing';

import { Storge } from './storge';

describe('Storge', () => {
  let service: Storge;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Storge);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
