import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { KanbanTask } from '../../../types/kanban';
import { TaskFormDialog } from './index';

const existing: KanbanTask = {
  id: 'task-1',
  title: 'Write specs',
  description: 'Kanban catalog',
  status: 'PENDING',
  deadline: '2026-08-25',
  tag: { id: 'tag-1', name: 'Work' },
  checklist: [{ id: 'c1', text: 'Draft README', done: false }],
  createdAt: '2026-08-20T12:00:00.000Z',
  updatedAt: '2026-08-20T12:00:00.000Z',
};

describe('TaskFormDialog', () => {
  it('does not submit create when title is empty', () => {
    const onSubmit = vi.fn();

    render(<TaskFormDialog mode="create" tags={[]} onClose={vi.fn()} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/^description$/i), {
      target: { value: 'Kanban catalog' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/title is required/i);
  });

  it('lists owner tags in the select', () => {
    render(
      <TaskFormDialog
        mode="create"
        tags={[{ id: 'tag-1', name: 'Work' }]}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole('option', { name: 'Work' })).toBeInTheDocument();
  });

  it('submits edit values on save', () => {
    const onSubmit = vi.fn();

    render(
      <TaskFormDialog
        mode="edit"
        task={existing}
        tags={[{ id: 'tag-1', name: 'Work' }]}
        onClose={vi.fn()}
        onSubmit={onSubmit}
        onDelete={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText(/^title$/i), {
      target: { value: 'Write specs v2' },
    });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Write specs v2',
      description: 'Kanban catalog',
      tagId: 'tag-1',
      deadline: '2026-08-25',
      checklist: [{ id: 'c1', text: 'Draft README', done: true }],
    });
  });

  it('clears create fields after cancel and after a new mount', () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn();
    const { unmount } = render(
      <TaskFormDialog mode="create" tags={[]} onClose={onClose} onSubmit={onSubmit} />,
    );

    fireEvent.change(screen.getByLabelText(/^title$/i), { target: { value: 'Leftover' } });
    fireEvent.change(screen.getByLabelText(/^description$/i), { target: { value: 'Stale copy' } });
    fireEvent.click(screen.getByRole('button', { name: /add item/i }));
    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }));
    expect(onClose).toHaveBeenCalled();

    unmount();
    render(<TaskFormDialog mode="create" tags={[]} onClose={onClose} onSubmit={onSubmit} />);

    expect(screen.getByLabelText(/^title$/i)).toHaveValue('');
    expect(screen.getByLabelText(/^description$/i)).toHaveValue('');
    expect(screen.queryByLabelText(/item 1/i)).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/^title$/i), { target: { value: 'Write specs' } });
    fireEvent.change(screen.getByLabelText(/^description$/i), {
      target: { value: 'Kanban catalog' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));
    expect(onSubmit).toHaveBeenCalled();
  });

  it('deletes only after confirm', () => {
    const onDelete = vi.fn();

    render(
      <TaskFormDialog
        mode="edit"
        task={existing}
        tags={[]}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        onDelete={onDelete}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /^delete$/i }));
    expect(onDelete).not.toHaveBeenCalled();

    fireEvent.click(
      within(screen.getByRole('region', { name: /confirm/i })).getByRole('button', { name: 'Cancel' }),
    );
    expect(onDelete).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /^delete$/i }));
    fireEvent.click(
      within(screen.getByRole('region', { name: /confirm/i })).getByRole('button', {
        name: /^delete$/i,
      }),
    );
    expect(onDelete).toHaveBeenCalledOnce();
  });
});
