import type { KanbanTag } from '../../../types/kanban';
import { tagBadgeColor } from '../../../utils/tag-color';
import styles from './TagFilter.module.css';

type TagFilterProps = {
  tags: KanbanTag[];
  selectedTagId?: string;
  onSelect: (tagId?: string) => void;
};

export function TagFilter({ tags, selectedTagId, onSelect }: TagFilterProps) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className={styles.group} role="radiogroup" aria-label="Filter by tag">
      <button
        type="button"
        role="radio"
        className={styles.chip}
        aria-checked={selectedTagId === undefined}
        onClick={() => {
          onSelect(undefined);
        }}
      >
        All
      </button>
      {tags.map((tag) => {
        const selected = selectedTagId === tag.id;
        const color = tagBadgeColor(tag.id);

        return (
          <button
            key={tag.id}
            type="button"
            role="radio"
            className={styles.chip}
            aria-checked={selected}
            style={
              selected
                ? { backgroundColor: color.background, color: color.color }
                : undefined
            }
            onClick={() => {
              onSelect(tag.id);
            }}
          >
            {tag.name}
          </button>
        );
      })}
    </div>
  );
}
