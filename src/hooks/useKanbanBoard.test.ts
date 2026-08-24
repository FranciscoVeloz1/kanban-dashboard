import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { KanbanTask } from '../types/kanban';

vi.mock('../api/kanban', () => {
  return {
    listTasks: vi.fn(),
    listTags: vi.fn(),
    patchTask: vi.fn(),
    createTag: vi.fn(),
    createTask: vi.fn(),
    deleteTask: vi.fn(),
  };
});

import { listTags, listTasks, patchTask } from '../api/kanban';
import { useKanbanBoard } from './useKanbanBoard';

const pending: KanbanTask = {
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

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client }, children);
  };
}

describe('useKanbanBoard', () => {
  beforeEach(() => {
    vi.mocked(listTasks).mockReset();
    vi.mocked(listTags).mockReset();
    vi.mocked(patchTask).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('starts tasks and tags queries without waiting on each other', async () => {
    let resolveTasks: ((value: { tasks: KanbanTask[] }) => void) | undefined;
    let resolveTags: ((value: { tags: [] }) => void) | undefined;

    vi.mocked(listTasks).mockImplementation(() => {
      return new Promise((resolve) => {
        resolveTasks = resolve;
      });
    });
    vi.mocked(listTags).mockImplementation(() => {
      return new Promise((resolve) => {
        resolveTags = resolve;
      });
    });

    renderHook(() => useKanbanBoard(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(listTasks).toHaveBeenCalledOnce();
      expect(listTags).toHaveBeenCalledOnce();
    });
    expect(resolveTasks).toBeTypeOf('function');
    expect(resolveTags).toBeTypeOf('function');
  });

  it('patches FINISHED when moving a pending task', async () => {
    vi.mocked(listTasks).mockResolvedValue({ tasks: [pending] });
    vi.mocked(listTags).mockResolvedValue({ tags: [] });
    vi.mocked(patchTask).mockResolvedValue({
      task: { ...pending, status: 'FINISHED' },
    });

    const { result } = renderHook(() => useKanbanBoard(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.moveTask(pending.id, 'FINISHED');
    });

    expect(patchTask).toHaveBeenCalledWith(pending.id, { status: 'FINISHED' });
    await waitFor(() => {
      expect(result.current.grouped.FINISHED[0]?.id).toBe(pending.id);
    });
  });

  it('reverts the card when the status patch fails', async () => {
    vi.mocked(listTasks).mockResolvedValue({ tasks: [pending] });
    vi.mocked(listTags).mockResolvedValue({ tags: [] });
    vi.mocked(patchTask).mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() => useKanbanBoard(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.moveTask(pending.id, 'FINISHED');
    });

    await waitFor(() => {
      expect(result.current.grouped.PENDING[0]?.id).toBe(pending.id);
      expect(result.current.grouped.FINISHED).toEqual([]);
    });
  });

  it('passes tagId into listTasks', async () => {
    vi.mocked(listTasks).mockResolvedValue({ tasks: [] });
    vi.mocked(listTags).mockResolvedValue({ tags: [] });

    renderHook(() => useKanbanBoard('tag-1'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(listTasks).toHaveBeenCalledWith('tag-1');
    });
  });
});
