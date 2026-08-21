import { Outlet } from 'react-router-dom';
import { useSession } from '../../../auth/useSession';
import styles from './AppShell.module.css';

export function AppShell() {
  const { identifier, signOut } = useSession();

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <p className={styles.brand}>Kanban</p>
        <div className={styles.actions}>
          {identifier === null ? null : (
            <span className={styles.identity}>{identifier}</span>
          )}
          <button type="button" className={styles.logout} onClick={signOut}>
            Log out
          </button>
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
