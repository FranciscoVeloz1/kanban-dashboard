export type KanbanTaskStatus = 'PENDING' | 'IN_PROGRESS' | 'FINISHED';

export type KanbanTag = {
  id: string;
  name: string;
};

export type KanbanChecklistItem = {
  id: string;
  text: string;
  done: boolean;
};

export type KanbanTask = {
  id: string;
  title: string;
  description: string | null;
  status: KanbanTaskStatus;
  deadline: string | null;
  tag: KanbanTag | null;
  checklist: KanbanChecklistItem[];
  createdAt: string;
  updatedAt: string;
};
