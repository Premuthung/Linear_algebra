/** Says which part of the book an explanation is based on. */
export function BookRef({
  section,
  pages,
  href,
}: {
  section: string;
  pages: string;
  /** Link to the matching part of the article further down the page. */
  href?: string;
}) {
  return (
    <p className="text-sm text-muted">
      <span aria-hidden="true">📖 </span>
      Source: Goodfellow, Bengio and Courville, <cite>Deep Learning</cite> (2016), §{section}, pp.{' '}
      {pages}.
      {href && (
        <>
          {' '}
          <a className="text-accent underline" href={href}>
            Read the full explanation ↓
          </a>
        </>
      )}
    </p>
  );
}
