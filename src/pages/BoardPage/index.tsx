import { Link, useNavigate } from 'react-router-dom';
import { KanbanBoard } from '../../components/board/KanbanBoard';
import { useKanbanBoard } from '../../hooks/useKanbanBoard';
import styles from './BoardPage.module.css';

export function BoardPage() {
  const navigate = useNavigate();
  const { grouped, isLoading, error, retry, moveTask } = useKanbanBoard();

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <Link to="/tags/new" className={styles.action}>
          Add tag
        </Link>
        <Link to="/tasks/new" className={styles.actionPrimary}>
          Add task
        </Link>
      </div>

      <KanbanBoard
        grouped={grouped}
        isLoading={isLoading}
        error={error}
        onRetry={retry}
        onMove={(taskId, status) => {
          void moveTask(taskId, status);
        }}
        onOpenTask={(taskId) => {
          navigate(`/tasks/${taskId}`);
        }}
      />
    </div>
  );
}
