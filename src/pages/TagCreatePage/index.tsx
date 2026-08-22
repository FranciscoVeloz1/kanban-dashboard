import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TagFormDialog } from '../../components/forms/TagFormDialog';
import { useKanbanBoard } from '../../hooks/useKanbanBoard';
import { errorMessage } from '../../utils/error-message';
import styles from './TagCreatePage.module.css';

export function TagCreatePage() {
  const navigate = useNavigate();
  const { createTag, tagBusy } = useKanbanBoard();
  const [error, setError] = useState<string | null>(null);

  const goHome = () => {
    navigate('/');
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Add tag</h1>
      <TagFormDialog
        busy={tagBusy}
        error={error}
        onClose={goHome}
        onSubmit={async ({ name }) => {
          try {
            await createTag(name);
            goHome();
          } catch (cause) {
            setError(errorMessage(cause));
          }
        }}
      />
    </div>
  );
}
