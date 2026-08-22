import { useRef, type DragEvent, type PointerEvent } from 'react';
import type { KanbanTask, KanbanTaskStatus } from '../../../types/kanban';
import { calendarToday, isOverdue } from '../../../utils/deadline';
import { tagBadgeColor } from '../../../utils/tag-color';
import styles from './TaskCard.module.css';

const DRAG_THRESHOLD_PX = 8;

type TaskCardProps = {
  task: KanbanTask;
  onMove: (taskId: string, status: KanbanTaskStatus) => void;
  onOpen?: (taskId: string) => void;
  today?: string;
};

function isColumnStatus(value: string | null): value is KanbanTaskStatus {
  return value === 'PENDING' || value === 'IN_PROGRESS' || value === 'FINISHED';
}

function columnAtPoint(x: number, y: number): HTMLElement | null {
  const node = document.elementFromPoint(x, y);
  if (node === null) {
    return null;
  }

  return node.closest('[data-kanban-column]');
}

function clearDropHighlights(): void {
  document.querySelectorAll('[data-drop-active]').forEach((element) => {
    element.removeAttribute('data-drop-active');
  });
}

export function TaskCard({ task, onMove, onOpen, today }: TaskCardProps) {
  const day = today ?? calendarToday();
  const overdue = task.status !== 'FINISHED' && isOverdue(task.deadline, day);
  const checklistTotal = task.checklist.length;
  const checklistDone = task.checklist.filter((item) => item.done).length;
  const pointerDrag = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    active: boolean;
  } | null>(null);
  const didDrag = useRef(false);

  const handleDragStart = (event: DragEvent<HTMLElement>) => {
    event.dataTransfer.setData('text/plain', task.id);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'mouse') {
      return;
    }

    pointerDrag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      active: false,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const drag = pointerDrag.current;
    if (drag === null || event.pointerId !== drag.pointerId) {
      return;
    }

    const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
    if (!drag.active && distance < DRAG_THRESHOLD_PX) {
      return;
    }

    if (!drag.active) {
      drag.active = true;
      if (typeof event.currentTarget.setPointerCapture === 'function') {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
    }

    didDrag.current = true;
    event.preventDefault();

    clearDropHighlights();
    const column = columnAtPoint(event.clientX, event.clientY);
    if (column !== null) {
      column.setAttribute('data-drop-active', 'true');
    }
  };

  const endPointerDrag = (event: PointerEvent<HTMLElement>) => {
    const drag = pointerDrag.current;
    pointerDrag.current = null;
    clearDropHighlights();

    if (drag === null || event.pointerId !== drag.pointerId || !drag.active) {
      return;
    }

    const column = columnAtPoint(event.clientX, event.clientY);
    const nextStatus = column?.getAttribute('data-kanban-column') ?? null;
    if (!isColumnStatus(nextStatus) || nextStatus === task.status) {
      return;
    }

    onMove(task.id, nextStatus);
  };

  const handleOpen = () => {
    if (didDrag.current) {
      didDrag.current = false;
      return;
    }

    onOpen?.(task.id);
  };

  const description =
    task.description === null || task.description.length === 0
      ? null
      : task.description.length <= 120
        ? task.description
        : `${task.description.slice(0, 120)}…`;

  return (
    <article
      className={styles.card}
      draggable
      role="group"
      aria-label={task.title}
      onDragStart={handleDragStart}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endPointerDrag}
      onPointerCancel={endPointerDrag}
    >
      <button type="button" className={styles.title} onClick={handleOpen}>
        {task.title}
      </button>

      {description === null ? null : (
        <p className={styles.body} title={task.description ?? undefined}>
          {description}
        </p>
      )}

      {task.tag === null ? null : (
        <span className={styles.tag} style={tagBadgeColor(task.tag.id)}>
          {task.tag.name}
        </span>
      )}

      {task.deadline === null ? null : (
        <p className={overdue ? styles.deadlineOverdue : styles.deadline}>
          {task.deadline}
        </p>
      )}

      {checklistTotal < 1 ? null : (
        <p className={styles.checklist}>
          {checklistDone}/{checklistTotal}
        </p>
      )}
    </article>
  );
}
