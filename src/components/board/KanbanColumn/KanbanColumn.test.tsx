import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { KanbanTask } from '../../../types/kanban';
import { KanbanColumn } from './index';

const task: KanbanTask = {
  id: 'task-1',
  title: 'Write tests',
  description: null,
  status: 'PENDING',
  deadline: null,
  tag: null,
  checklist: [],
  createdAt: '2026-08-20T12:00:00.000Z',
  updatedAt: '2026-08-20T12:00:00.000Z',
};

describe('KanbanColumn', () => {
  it('calls onMove with FINISHED when a card is dropped on the column', () => {
    const onMove = vi.fn();

    render(
      <KanbanColumn
        status="FINISHED"
        label="Finished"
        tasks={[]}
        onMove={onMove}
        onOpenTask={vi.fn()}
      />,
    );

    const column = screen.getByRole('region', { name: 'Finished' });
    fireEvent.drop(column, {
      dataTransfer: {
        getData: () => task.id,
      },
    });

    expect(onMove).toHaveBeenCalledWith(task.id, 'FINISHED');
  });
});
