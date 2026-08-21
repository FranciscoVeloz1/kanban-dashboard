import { describe, expect, it } from 'vitest';
import { tagBadgeColor } from './tag-color';

describe('tagBadgeColor', () => {
  it('returns the same pair for the same seed', () => {
    expect(tagBadgeColor('tag-1')).toEqual(tagBadgeColor('tag-1'));
  });

  it('picks a palette color rather than an empty style', () => {
    const { background, color } = tagBadgeColor('ops');
    expect(background).toMatch(/^#/);
    expect(color).toMatch(/^#/);
  });
});
