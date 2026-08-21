import type { KanbanTask, KanbanTaskStatus } from '../types/kanban';

export type GroupedTasks = Record<KanbanTaskStatus, KanbanTask[]>;

function newestFirst(left: KanbanTask, right: KanbanTask): number {
  if (left.createdAt === right.createdAt) {
    return 0;
  }

  return left.createdAt > right.createdAt ? -1 : 1;
}

export function groupTasks(tasks: KanbanTask[]): GroupedTasks {
  const grouped: GroupedTasks = {
    PENDING: [],
    IN_PROGRESS: [],
    FINISHED: [],
  };

  for (const item of tasks) {
    grouped[item.status].push(item);
  }

  grouped.PENDING = grouped.PENDING.toSorted(newestFirst);
  grouped.IN_PROGRESS = grouped.IN_PROGRESS.toSorted(newestFirst);
  grouped.FINISHED = grouped.FINISHED.toSorted(newestFirst);

  return grouped;
}
