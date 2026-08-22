import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { TaskFormDialog, type TaskFormValues } from '../../components/forms/TaskFormDialog';
import { useKanbanBoard } from '../../hooks/useKanbanBoard';
import { errorMessage } from '../../utils/error-message';
import styles from './TaskEditPage.module.css';

export function TaskEditPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { tasks, tags, isLoading, saveTask, removeTask, taskBusy } = useKanbanBoard();
  const [error, setError] = useState<string | null>(null);

  const goHome = () => {
    navigate('/');
  };

  if (taskId === undefined) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return <p className={styles.loading}>Loading task…</p>;
  }

  const task = tasks.find((item) => item.id === taskId);
  if (task === undefined) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (values: TaskFormValues) => {
    try {
      await saveTask(taskId, {
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
      <h1 className={styles.title}>Edit task</h1>
      <TaskFormDialog
        mode="edit"
        tags={tags}
        task={task}
        busy={taskBusy}
        error={error}
        onClose={goHome}
        onSubmit={handleSubmit}
        onDelete={async () => {
          try {
            await removeTask(taskId);
            goHome();
          } catch (cause) {
            setError(errorMessage(cause));
          }
        }}
      />
    </div>
  );
}
