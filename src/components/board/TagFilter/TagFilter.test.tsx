import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { KanbanTag } from '../../../types/kanban';
import { TagFilter } from './index';

const tags: KanbanTag[] = [
  { id: 'tag-1', name: 'Work' },
  { id: 'tag-2', name: 'Home' },
];

describe('TagFilter', () => {
  it('returns nothing when there are no tags', () => {
    const { container } = render(
      <TagFilter tags={[]} selectedTagId={undefined} onSelect={vi.fn()} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('selects Work then All', () => {
    const onSelect = vi.fn();
    render(<TagFilter tags={tags} selectedTagId={undefined} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('radio', { name: 'Work' }));
    expect(onSelect).toHaveBeenCalledWith('tag-1');

    fireEvent.click(screen.getByRole('radio', { name: 'All' }));
    expect(onSelect).toHaveBeenCalledWith(undefined);
  });
});
