import { pageWindow } from './pagination.component';

const Gap = -1;

describe('pageWindow', () => {
  it('lists every page while they all fit', () => {
    expect(pageWindow(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('always shows at least page one', () => {
    expect(pageWindow(1, 1)).toEqual([1]);
  });

  it('keeps the first, last and current pages once past the limit', () => {
    expect(pageWindow(5, 10)).toEqual([1, Gap, 4, 5, 6, Gap, 10]);
  });

  it('does not open a gap next to consecutive pages', () => {
    expect(pageWindow(1, 10)).toEqual([1, 2, Gap, 10]);
    expect(pageWindow(2, 10)).toEqual([1, 2, 3, Gap, 10]);
    expect(pageWindow(10, 10)).toEqual([1, Gap, 9, 10]);
  });

  it('never repeats a page', () => {
    for (let current = 1; current <= 12; current += 1) {
      const pages = pageWindow(current, 12).filter((page) => page !== Gap);

      expect(new Set(pages).size).toBe(pages.length);
    }
  });

  it('always contains the current page', () => {
    for (let current = 1; current <= 20; current += 1) {
      expect(pageWindow(current, 20)).toContain(current);
    }
  });
});
