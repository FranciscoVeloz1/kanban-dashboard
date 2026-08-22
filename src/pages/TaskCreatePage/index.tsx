import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TaskFormDialog, type TaskFormValues } from '../../components/forms/TaskFormDialog';
import { useKanbanBoard } from '../../hooks/useKanbanBoard';
import { errorMessage } from '../../utils/error-message';
import styles from './TaskCreatePage.module.css';

export function TaskCreatePage() {
  const navigate = useNavigate();
  const { tags, createTask, taskBusy } = useKanbanBoard();
  const [error, setError] = useState<string | null>(null);

  const goHome = () => {
    navigate('/');
  };

  const handleSubmit = async (values: TaskFormValues) => {
    try {
      await createTask({
        title: values.title,
        description: values.description,
        tagId: values.tagId,
        deadline: values.deadline,
        checklist: values.checklist,
      });
      goHome();
    } catch (cause) {
      setError(errorMessage(cause));
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Add task</h1>
      <TaskFormDialog
        mode="create"
        tags={tags}
        busy={taskBusy}
        error={error}
        onClose={goHome}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
