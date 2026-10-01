import styles from "./section.module.css";

/**
 * A numbered section: a small label on the left and a large two-tone statement
 * on the right. `anchor` is the id the top bar's menu links to.
 */
export function Section({
  number,
  label,
  title,
  accent,
  id,
  anchor,
  aside,
  children,
}: {
  number: string;
  label: string;
  title: string;
  /** The second half of the statement, set in the brand green. */
  accent: string;
  id: string;
  anchor?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.section} aria-labelledby={id} id={anchor}>
      <header className={styles.header}>
        <p className={styles.label}>
          <span className={styles.number}>{number}</span>
          {label}
        </p>
        <h2 id={id} className={styles.title}>
          {title} <em>{accent}</em>
        </h2>
        {aside && <div className={styles.aside}>{aside}</div>}
      </header>
      {children}
    </section>
  );
}
