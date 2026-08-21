import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { KanbanTask } from '../../../types/kanban';
import { TaskCard } from './index';

const pending: KanbanTask = {
  id: 'task-1',
  title: 'Write tests',
  description: 'Kanban catalog',
  status: 'PENDING',
  deadline: '2026-01-01',
  tag: { id: 'tag-1', name: 'ops' },
  checklist: [
    { id: 'c1', text: 'one', done: true },
    { id: 'c2', text: 'two', done: false },
  ],
  createdAt: '2026-08-20T12:00:00.000Z',
  updatedAt: '2026-08-20T12:00:00.000Z',
};

describe('TaskCard', () => {
  afterEach(() => {
    cleanup();
    Reflect.deleteProperty(document, 'elementFromPoint');
  });

  it('shows title, tag, overdue deadline, and checklist progress without move buttons', () => {
    render(<TaskCard task={pending} onMove={vi.fn()} today="2026-08-20" />);

    expect(screen.getByRole('button', { name: 'Write tests' })).toBeInTheDocument();
    expect(screen.getByText('Kanban catalog')).toBeInTheDocument();
    expect(screen.getByText('ops')).toBeInTheDocument();
    expect(screen.getByText('2026-01-01')).toBeInTheDocument();
    expect(screen.getByText('1/2')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /move to/i })).not.toBeInTheDocument();
  });

  it('moves via touch pointer drop onto another column', () => {
    const onMove = vi.fn();
    const finished = document.createElement('section');
    finished.setAttribute('data-kanban-column', 'FINISHED');
    document.body.appendChild(finished);
    Object.defineProperty(document, 'elementFromPoint', {
      configurable: true,
      value: () => finished,
    });

    render(<TaskCard task={pending} onMove={onMove} today="2026-08-20" />);
    const card = screen.getByRole('group', { name: 'Write tests' });

    fireEvent.pointerDown(card, {
      pointerId: 1,
      pointerType: 'touch',
      clientX: 10,
      clientY: 10,
    });
    fireEvent.pointerMove(card, {
      pointerId: 1,
      pointerType: 'touch',
      clientX: 10,
      clientY: 40,
    });
    fireEvent.pointerUp(card, {
      pointerId: 1,
      pointerType: 'touch',
      clientX: 200,
      clientY: 40,
    });

    expect(onMove).toHaveBeenCalledWith(pending.id, 'FINISHED');
    finished.remove();
  });

  it('limits the description body to 120 characters', () => {
    const full = 'This description is definitely longer than thirty-five characters.'.repeat(3);
    render(
      <TaskCard
        task={{
          ...pending,
          description: full,
        }}
        onMove={vi.fn()}
        today="2026-08-20"
      />,
    );

    expect(screen.getByText(`${full.slice(0, 120)}…`)).toBeInTheDocument();
    expect(screen.queryByText(full)).not.toBeInTheDocument();
  });
});
