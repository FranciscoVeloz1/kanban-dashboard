import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { KanbanBoard } from '../../components/board/KanbanBoard';
import { TagFilter } from '../../components/board/TagFilter';
import { useKanbanBoard } from '../../hooks/useKanbanBoard';
import styles from './BoardPage.module.css';

function parseTagIdParam(value: string | null): string | undefined {
  if (value === null) {
    return undefined;
  }

  const parsed = z.string().uuid().safeParse(value);
  if (!parsed.success) {
    return undefined;
  }

  return parsed.data;
}

export function BoardPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tagId = parseTagIdParam(params.get('tagId'));
  const { grouped, tags, isLoading, error, retry, moveTask } = useKanbanBoard(tagId);

  const handleSelect = (nextTagId?: string) => {
    const next = new URLSearchParams(params);
    if (nextTagId === undefined) {
      next.delete('tagId');
    } else {
      next.set('tagId', nextTagId);
    }
    setParams(next, { replace: true });
  };

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <TagFilter tags={tags} selectedTagId={tagId} onSelect={handleSelect} />
        </div>
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
