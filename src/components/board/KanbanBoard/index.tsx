import type { KanbanTaskStatus } from '../../../types/kanban';
import type { GroupedTasks } from '../../../utils/group-tasks';
import { BOARD_COLUMNS } from '../columns';
import { KanbanColumn } from '../KanbanColumn';
import styles from './KanbanBoard.module.css';

type KanbanBoardProps = {
  grouped: GroupedTasks;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  onMove: (taskId: string, status: KanbanTaskStatus) => void;
  onOpenTask: (taskId: string) => void;
};

export function KanbanBoard({
  grouped,
  isLoading,
  error,
  onRetry,
  onMove,
  onOpenTask,
}: KanbanBoardProps) {
  if (isLoading) {
    return (
      <div className={styles.board} aria-busy="true">
        {BOARD_COLUMNS.map((column) => {
          return (
            <section
              key={column.status}
              className={styles.skeleton}
              aria-label={column.label}
            >
              <h2 className={styles.heading}>{column.label}</h2>
              <p className={styles.empty}>Loading cards…</p>
            </section>
          );
        })}
      </div>
    );
  }

  if (error !== null) {
    return (
      <div className={styles.error} role="alert">
        <p>Could not load the board.</p>
        <button type="button" className={styles.retry} onClick={onRetry}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.board}>
      {BOARD_COLUMNS.map((column) => {
        return (
          <KanbanColumn
            key={column.status}
            status={column.status}
            label={column.label}
            tasks={grouped[column.status]}
            onMove={onMove}
            onOpenTask={onOpenTask}
          />
        );
      })}
    </div>
  );
}
