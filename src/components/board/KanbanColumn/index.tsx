import { useState, type DragEvent } from 'react';
import type { KanbanTask, KanbanTaskStatus } from '../../../types/kanban';
import { TaskCard } from '../TaskCard';
import styles from './KanbanColumn.module.css';

type KanbanColumnProps = {
  status: KanbanTaskStatus;
  label: string;
  tasks: KanbanTask[];
  onMove: (taskId: string, status: KanbanTaskStatus) => void;
  onOpenTask: (taskId: string) => void;
};

export function KanbanColumn({ status, label, tasks, onMove, onOpenTask }: KanbanColumnProps) {
  const [isDropTarget, setIsDropTarget] = useState(false);

  const handleDragOver = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setIsDropTarget(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return;
    }

    setIsDropTarget(false);
  };

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDropTarget(false);
    const taskId = event.dataTransfer.getData('text/plain');
    if (taskId.length === 0) {
      return;
    }

    onMove(taskId, status);
  };

  return (
    <section
      className={isDropTarget ? `${styles.column} ${styles.dropTarget}` : styles.column}
      aria-label={label}
      data-kanban-column={status}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <h2 className={styles.heading}>{label}</h2>
      {tasks.length === 0 ? (
        <p className={styles.empty}>No cards yet. Drop a card here.</p>
      ) : (
        <ul className={styles.list}>
          {tasks.map((task) => {
            return (
              <li key={task.id}>
                <TaskCard task={task} onMove={onMove} onOpen={onOpenTask} />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
