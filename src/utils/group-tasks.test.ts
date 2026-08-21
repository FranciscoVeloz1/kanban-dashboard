import { describe, expect, it } from 'vitest';
import type { KanbanTask } from '../types/kanban';
import { groupTasks } from './group-tasks';

function task(overrides: Partial<KanbanTask> & Pick<KanbanTask, 'id' | 'status' | 'createdAt'>): KanbanTask {
  return {
    title: overrides.title ?? overrides.id,
    description: null,
    deadline: null,
    tag: null,
    checklist: [],
    updatedAt: overrides.createdAt,
    ...overrides,
  };
}

describe('groupTasks', () => {
  it('returns three empty arrays for an empty list', () => {
    expect(groupTasks([])).toEqual({
      PENDING: [],
      IN_PROGRESS: [],
      FINISHED: [],
    });
  });

  it('groups by status and sorts each column by createdAt descending', () => {
    const older = task({
      id: 'older',
      status: 'PENDING',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    const newer = task({
      id: 'newer',
      status: 'PENDING',
      createdAt: '2026-06-01T00:00:00.000Z',
    });
    const doing = task({
      id: 'doing',
      status: 'IN_PROGRESS',
      createdAt: '2026-03-01T00:00:00.000Z',
    });
    const done = task({
      id: 'done',
      status: 'FINISHED',
      createdAt: '2026-04-01T00:00:00.000Z',
    });

    expect(groupTasks([older, doing, newer, done])).toEqual({
      PENDING: [newer, older],
      IN_PROGRESS: [doing],
      FINISHED: [done],
    });
  });
});
