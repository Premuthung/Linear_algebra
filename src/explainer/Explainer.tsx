import { useMemo, useState, type ReactNode } from 'react';
import { Button, Tex } from '../components/ui';
import { fmt, paren, texMat, texVec } from '../format';
import { BookRef } from './BookRef';
import { Flow, STAGES, type StageId } from './Flow';
import {
  ATTENTION_SCALE,
  CANDIDATES,
  EXAMPLES,
  FEATURES,
  LOGIT_SCALE,
  W,
  run as runModel,
  type ModelRun,
} from './model';

/** a·b written out with the live numbers: 0.1·1 + 0.1·0.1 + … */
function dotTex(a: readonly number[], b: readonly number[]): string {
  return a.map((x, d) => `${paren(x)}\\cdot${paren(b[d])}`).join(' + ');
}

function Detail({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section
      className="rounded-2xl border border-line bg-panel p-5 shadow-sm"
      data-testid="stage-detail"
      aria-live="polite"
    >
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="mt-2 max-w-[75ch] space-y-3 text-[15px]">{children}</div>
    </section>
  );
}

function StageDetail({
  stage,
  run,
  token,
  candidate,
  temperature,
}: {
  stage: StageId;
  run: ModelRun;
  token: number;
  candidate: number;
  temperature: number;
}) {
  const [row, setRow] = useState(1);
  const word = run.tokens[token];
  const x = run.vectors[token];
  const last = run.tokens.length - 1;
  const query = run.vectors[last];
  const answer = CANDIDATES[candidate];

  if (stage === 'tokens') {
    return (
      <Detail title="Step 1. The sentence is cut into words">
        <p>
          A model cannot read letters. It can only add and multiply numbers. So the first job is to
          cut the sentence into pieces: here, {run.tokens.length} words. Point at a word in the
          picture to follow its path.
        </p>
        <p className="text-muted">
          This is a toy model with hand-picked numbers, so that you can check every step yourself. A
          real model learns its numbers from text, and it cuts text into smaller pieces called
          tokens.
        </p>
      </Detail>
    );
  }

  if (stage === 'embedding') {
    return (
      <Detail title="Step 2. Each word becomes a vector">
        <p>
          The word <strong>{word}</strong> is swapped for a list of {FEATURES.length} numbers. Each
          number says how much the word has of one feature: {FEATURES.join(', ')}.
        </p>
        <Tex block>
          {`\\boldsymbol{x}_{\\text{${word}}} = ${texVec(x)} \\in \\mathbb{R}^{${FEATURES.length}}`}
        </Tex>
        <p>
          The book calls this a <strong>vector</strong>: an array of numbers arranged in order,
          where each number is a coordinate along a different axis. So every word is a point in a
          space with {FEATURES.length} axes. Words with a similar meaning sit close together.
        </p>
        <p>
          Stack all the word vectors as rows and you get a <strong>matrix</strong>: a 2-D array with{' '}
          {run.tokens.length} rows and {FEATURES.length} columns.
        </p>
        <BookRef section="2.1" pages="31–34" href="#scalars-vectors-matrices" />
      </Detail>
    );
  }

  if (stage === 'attention') {
    return (
      <Detail title="Step 3. The dot product finds the words that matter">
        <p>
          The last word, <strong>{run.tokens[last]}</strong>, asks: which earlier words are like me?
          It takes the <strong>dot product</strong> of its own vector <Tex>{'\\boldsymbol{q}'}</Tex>{' '}
          with the vector of <strong>{word}</strong>: multiply the numbers in pairs, then add.
        </p>
        <Tex block>
          {`\\boldsymbol{q}^\\top \\boldsymbol{x}_{\\text{${word}}} = ${dotTex(query, x)} = ${fmt(run.scores[token])}`}
        </Tex>
        <p>
          A larger dot product means the two vectors point the same way. The scores are turned into
          shares that add up to 1 (softmax, with the scores first multiplied by {ATTENTION_SCALE}).{' '}
          <strong>{word}</strong> gets <strong>{fmt(run.attention[token] * 100, 0)}%</strong>.
        </p>
        <p>
          Then the word vectors are mixed, each one scaled by its share. This is a{' '}
          <strong>linear combination</strong>:
        </p>
        <Tex block>
          {`\\boldsymbol{c} = \\sum_i a_i\\,\\boldsymbol{x}_i = ${run.attention
            .map((a, i) => `${fmt(a)}\\,\\boldsymbol{x}_{\\text{${run.tokens[i]}}}`)
            .join(' + ')} = ${texVec(run.context)}`}
        </Tex>
        <BookRef section="2.2, 2.4 and 2.5" pages="34–40" href="#multiplying" />
      </Detail>
    );
  }

  if (stage === 'matrix') {
    return (
      <Detail title="Step 4. A matrix transforms the vector">
        <p>
          The mixed vector <Tex>{'\\boldsymbol{c}'}</Tex> says what the sentence is about. The
          weight matrix <Tex>{'\\boldsymbol{W}'}</Tex> turns that into what should come next.
        </p>
        <Tex block>
          {`\\boldsymbol{h} = \\boldsymbol{W}\\boldsymbol{c} = ${texMat(W)}${texVec(run.context)} = ${texVec(run.hidden)}`}
        </Tex>
        <p>
          Each number of the result is one row of the matrix dotted with the vector. Pick a row:
        </p>
        <div className="flex flex-wrap gap-2">
          {FEATURES.map((name, r) => (
            <Button key={name} tone={r === row ? 'primary' : 'plain'} onClick={() => setRow(r)}>
              Row {r + 1} ({name})
            </Button>
          ))}
        </div>
        <Tex block>
          {`h_{${row + 1}} = \\sum_j W_{${row + 1},j}\\,c_j = ${dotTex(W[row], run.context)} = ${fmt(run.hidden[row])}`}
        </Tex>
        <p>
          Look at row 2. It has a 1 in the <em>living</em> column, so a sentence about a living
          thing pushes the answer towards a <em>place</em>. That is how this matrix knows a cat sits
          on something.
        </p>
        <BookRef section="2.2" pages="34–36" href="#multiplying" />
      </Detail>
    );
  }

  return (
    <Detail title="Step 5. Scores become chances">
      <p>
        Every answer word has its own vector. The score of <strong>{answer.word}</strong> is the dot
        product of that vector with <Tex>{'\\boldsymbol{h}'}</Tex>:
      </p>
      <Tex block>
        {`z_{\\text{${answer.word}}} = ${dotTex(answer.v, run.hidden)} = ${fmt(run.logits[candidate])}`}
      </Tex>
      <p>
        Doing this for all {CANDIDATES.length} words at once is one matrix times one vector. Softmax
        then turns the scores into chances that add up to 1. The scores are first multiplied by{' '}
        {LOGIT_SCALE} and divided by the temperature <Tex>{'T'}</Tex>:
      </p>
      <Tex block>
        {`p_{\\text{${answer.word}}} = \\frac{e^{${LOGIT_SCALE} z_{\\text{${answer.word}}} / T}}{\\sum_k e^{${LOGIT_SCALE} z_k / T}} = ${fmt(run.probs[candidate] * 100, 1)}\\% \\quad (T = ${fmt(temperature, 1)})`}
      </Tex>
      <p>
        Move the temperature slider. A low temperature makes the model sure of one word. A high
        temperature spreads the chances out, so the text gets more surprising.
      </p>
      <BookRef section="2.2" pages="34–36" href="#multiplying" />
    </Detail>
  );
}

/** The interactive picture at the top of the home page, with its controls and the step text. */
export function Explainer() {
  const [text, setText] = useState<string>(EXAMPLES[0]);
  const [temperature, setTemperature] = useState(1);
  const [stage, setStage] = useState<StageId>('embedding');
  const [token, setToken] = useState(1);
  const [pickedCandidate, setPickedCandidate] = useState<number | null>(null);
  // Changing this number draws the picture again from the start.
  const [replay, setReplay] = useState(0);

  const run = useMemo(() => runModel(text, temperature), [text, temperature]);
  const candidate = pickedCandidate ?? run.best;
  const safeToken = Math.min(token, run.tokens.length - 1);

  const choose = (example: string): void => {
    setText(example);
    setToken(1);
    setPickedCandidate(null);
    setReplay(replay + 1);
  };

  const stageIndex = STAGES.findIndex((s) => s.id === stage);

  return (
    <section aria-label="Interactive explainer" className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-line bg-panel p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-muted">Sentence</span>
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              aria-pressed={example === text}
              onClick={() => choose(example)}
              className={`rounded-full border px-3 py-1 text-sm ${
                example === text
                  ? 'border-accent bg-accent font-semibold text-white'
                  : 'border-line bg-panel2 text-ink hover:border-muted'
              }`}
            >
              {example} …
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm" htmlFor="temperature">
          <span className="font-semibold text-muted">Temperature</span>
          <input
            id="temperature"
            type="range"
            min={0.3}
            max={2.5}
            step={0.1}
            value={temperature}
            data-testid="temperature"
            onChange={(e) => setTemperature(Number(e.target.value))}
          />
          <span className="w-8 font-mono tabular-nums">{fmt(temperature, 1)}</span>
        </label>
        <Button className="ml-auto" onClick={() => setReplay(replay + 1)}>
          ↻ Replay
        </Button>
      </div>

      <div className="rounded-2xl border border-line bg-panel p-3 shadow-sm">
        <Flow
          key={replay}
          run={run}
          stage={stage}
          onStage={setStage}
          token={safeToken}
          onToken={setToken}
          candidate={candidate}
          onCandidate={setPickedCandidate}
        />
        <p className="mt-1 px-1 text-sm text-muted" data-testid="prediction">
          The model reads “{text}” and its best guess for the next word is{' '}
          <strong className="text-ink">{CANDIDATES[run.best].word}</strong> (
          {fmt(run.probs[run.best] * 100, 0)}%). Click a step name, a word, or an answer.
        </p>
      </div>

      <StageDetail
        stage={stage}
        run={run}
        token={safeToken}
        candidate={candidate}
        temperature={temperature}
      />

      <div className="flex justify-between">
        <Button
          disabled={stageIndex === 0}
          onClick={() => setStage(STAGES[Math.max(0, stageIndex - 1)].id)}
        >
          ← Previous step
        </Button>
        <Button
          tone="primary"
          disabled={stageIndex === STAGES.length - 1}
          onClick={() => setStage(STAGES[Math.min(STAGES.length - 1, stageIndex + 1)].id)}
        >
          Next step →
        </Button>
      </div>
    </section>
  );
}
