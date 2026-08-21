import type { KanbanTaskStatus } from '../../types/kanban';

export const BOARD_COLUMNS = [
  { status: 'PENDING', label: 'Pending' },
  { status: 'IN_PROGRESS', label: 'In progress' },
  { status: 'FINISHED', label: 'Finished' },
] as const satisfies ReadonlyArray<{ status: KanbanTaskStatus; label: string }>;
