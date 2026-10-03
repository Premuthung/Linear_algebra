import { Article } from '../explainer/Article';
import { Explainer } from '../explainer/Explainer';
import { LESSONS, lessonLabel } from '../lessons/meta';
import { lessonHref } from '../router';
import { useProgress } from '../store/progress';

const REPO_URL = 'https://github.com/Premuthung/Linear_algebra';
const LINKEDIN_URL = 'https://www.linkedin.com/in/prem-uthung';

const navLink =
  'rounded-full px-3 py-1 text-sm text-muted no-underline hover:bg-panel2 hover:text-ink';

/** The home page: the interactive picture, the book-based article, then the lessons. */
export function Home() {
  const passed = useProgress((s) => s.passed);
  const stars = LESSONS.filter((l) => passed[l.id]).length;

  return (
    <>
      <header className="hero-wash border-b border-line">
        <div className="mx-auto max-w-[1240px] px-4 pb-8 pt-4">
          <nav aria-label="On this page" className="flex flex-wrap items-center justify-end gap-1">
            <a className={navLink} href="#explainer">
              Explainer
            </a>
            <a className={navLink} href="#article-title">
              The maths
            </a>
            <a className={navLink} href="#lessons">
              Lessons
            </a>
            <a
              className="ml-1 flex items-center gap-1.5 rounded-full border border-line bg-panel px-3 py-1 text-sm font-semibold text-ink no-underline hover:border-accent"
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
            >
              <svg
                viewBox="0 0 16 16"
                width="16"
                height="16"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.4 7.4 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
              </svg>
              GitHub
            </a>
            <a
              className="ml-1 flex items-center gap-1.5 rounded-full border border-line bg-panel px-3 py-1 text-sm font-semibold text-ink no-underline hover:border-accent"
              href={LINKEDIN_URL}
              target="_blank"
              rel="noreferrer"
            >
              <svg
                viewBox="0 0 16 16"
                width="16"
                height="16"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z" />
              </svg>
              LinkedIn
            </a>
          </nav>
          <h1 className="mt-8 text-4xl font-extrabold tracking-tight [text-wrap:balance] sm:text-5xl">
            <span className="gradient-text">Linear algebra for AI</span>
          </h1>
          <p className="mt-3 max-w-[60ch] text-lg text-muted">
            Watch one sentence turn into numbers and flow through a small language model. Every step
            is a vector, a dot product, or a matrix. Click any step to see the arithmetic, then read
            how it works and try it yourself.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-[1240px] space-y-16 px-4 pb-20 pt-6">
        <div id="explainer" className="scroll-mt-4">
          <Explainer />
        </div>

        <Article />

        <section
          id="lessons"
          className="mx-auto max-w-[75ch] scroll-mt-6"
          aria-labelledby="lessons-title"
        >
          <h2 id="lessons-title" className="text-3xl font-bold">
            Learn it by doing
          </h2>
          <p className="mt-2 text-muted">
            Type numbers, drag arrows, and watch what happens. Each lesson ends with a short quiz.
          </p>
          <p className="mt-2 text-sm text-muted" data-testid="star-count">
            ⭐ {stars} of {LESSONS.length} quizzes passed
          </p>

          <ol className="mt-5 space-y-2">
            {LESSONS.map((lesson) => {
              const inner = (
                <>
                  <span className="w-8 shrink-0 font-mono text-muted">
                    {lessonLabel(lesson.number)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{lesson.title}</span>
                    <span className="block text-sm text-muted">{lesson.goal}</span>
                  </span>
                  <span className="shrink-0 text-sm">
                    {passed[lesson.id] ? (
                      <span title="Quiz passed">⭐</span>
                    ) : lesson.ready ? (
                      <span className="font-semibold text-accent">Start →</span>
                    ) : (
                      <span className="text-muted">Coming soon</span>
                    )}
                  </span>
                </>
              );
              const box = 'flex items-center gap-3 rounded-xl border border-line p-3';
              return (
                <li key={lesson.id}>
                  {lesson.ready ? (
                    <a
                      href={lessonHref(lesson.id)}
                      className={`${box} bg-panel text-ink no-underline shadow-sm hover:border-accent`}
                    >
                      {inner}
                    </a>
                  ) : (
                    <div className={`${box} bg-panel2 opacity-70`}>{inner}</div>
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        <footer className="mx-auto max-w-[75ch] space-y-2 border-t border-line pt-6 text-sm text-muted">
          <p>
            The explanations follow Chapter 2 of Ian Goodfellow, Yoshua Bengio and Aaron Courville,{' '}
            <cite>Deep Learning</cite>, MIT Press, 2016 (
            <a
              className="underline"
              href="https://www.deeplearningbook.org/"
              target="_blank"
              rel="noreferrer"
            >
              deeplearningbook.org
            </a>
            ). The wording and the pictures here are original.
          </p>
          <p>The model here is a toy with hand-picked numbers, not a trained model.</p>
          <p>
            <a className="underline" href="#/playground">
              Component playground
            </a>{' '}
            (for testing the building blocks)
          </p>
        </footer>
      </main>
    </>
  );
}
