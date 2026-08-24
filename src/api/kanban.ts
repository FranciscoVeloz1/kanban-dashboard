import { request } from './http';
import type { KanbanTag, KanbanTask, KanbanTaskStatus } from '../types/kanban';

export type ListTasksResponse = {
  tasks: KanbanTask[];
};

export type ListTagsResponse = {
  tags: KanbanTag[];
};

export type CreateTagBody = {
  name: string;
};

export type CreateTaskBody = {
  title: string;
  description: string;
  tagId?: string | null;
  deadline?: string | null;
  checklist?: Array<{ id?: string; text: string; done?: boolean }>;
};

export type PatchTaskBody = {
  status?: KanbanTaskStatus;
  title?: string;
  description?: string;
  tagId?: string | null;
  deadline?: string | null;
  checklist?: Array<{ id: string; text: string; done: boolean }>;
};

export type TagResponse = {
  tag: KanbanTag;
};

export type TaskResponse = {
  task: KanbanTask;
};

export function listTasks(tagId?: string): Promise<ListTasksResponse> {
  const suffix = tagId === undefined ? '' : `?tagId=${encodeURIComponent(tagId)}`;
  return request<ListTasksResponse>(`/api/v1/kanban/tasks${suffix}`);
}

export function listTags(): Promise<ListTagsResponse> {
  return request<ListTagsResponse>('/api/v1/kanban/tags');
}

export function createTag(body: CreateTagBody): Promise<TagResponse> {
  return request<TagResponse>('/api/v1/kanban/tags', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function createTask(body: CreateTaskBody): Promise<TaskResponse> {
  return request<TaskResponse>('/api/v1/kanban/tasks', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function patchTask(taskId: string, body: PatchTaskBody): Promise<TaskResponse> {
  return request<TaskResponse>(`/api/v1/kanban/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteTask(taskId: string): Promise<void> {
  return request<void>(`/api/v1/kanban/tasks/${taskId}`, {
    method: 'DELETE',
  });
}
