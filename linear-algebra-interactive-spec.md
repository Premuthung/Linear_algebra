# Interactive Linear Algebra for AI/ML: Build Spec

> **For Claude Code:** Read this whole file first. Build in the phases listed in Section 11, in order. After each phase: run the tests, run the app, and fix problems before moving on. Ask the owner before changing the scope.

---

## 1. Goal

Build a web app that teaches linear algebra by **doing, not reading**. The learner types numbers, drags arrows on an x–y plane, and watches what happens to the coordinates. The same ideas are then shown inside an AI model: **a prompt becomes numbers, math happens on those numbers, and the output comes back as a word.**

By the end, the learner should be able to answer:
1. What is a vector, and what do "add", "scale", "flip", "span" do to coordinates?
2. What does a matrix do to the whole plane?
3. Which exact part of an AI/LLM is linear algebra, and what does each part do?

### Audience
Beginners, including people who are not strong in advanced math or English. Write all content in **simple, short English**. Explain every term the first time it appears. Avoid long paragraphs.

### Principles
- **Predict, then reveal.** Ask "what will happen?" before showing the result.
- **Everything is linked.** Typing a number, dragging an arrow, and reading the matrix must all update each other live.
- **Small steps.** One idea per screen. Add the next idea only after the learner has played with the current one.
- **Always connect to AI.** Every lesson ends with a "Where is this in AI?" panel.
- **Honest about scale.** Our demos use 2 or 4 numbers. Real models use thousands. Say this clearly wherever it applies.

---

## 2. Tech stack

| Need | Choice |
|---|---|
| App | Vite + React + TypeScript |
| Styling | Tailwind CSS |
| Drawing the plane | SVG for the coordinate plane (crisp, easy to make draggable); Canvas only if performance needs it (the "F" shape, many points) |
| Animation | `requestAnimationFrame` with a small tween helper, or Framer Motion for UI only |
| State | Zustand (one store per lesson plus a global progress store) |
| Math formulas | KaTeX |
| Matrix math | Own small `core/` library for 2×2, 3×3, and general matrices, so lessons can show every step. Use `ml-matrix` only to cross-check eigen/SVD in tests and for larger matrices |
| Tests | Vitest (math core) and Playwright (one smoke test per lesson) |
| Storage | `localStorage` for progress and settings. No backend |
| Optional (stretch) | `transformers.js` to peek at a real small model in the browser (see Section 9.4) |

Use plain TypeScript, no `any`. Keep every lesson as a self-contained folder.

---

## 3. Project structure

```
/src
  /core                  # pure math, no React, fully tested
    vec.ts               # add, sub, scale, dot, norm, normalize, project, angle
    mat.ts               # mul, apply, det, inverse, transpose, rank, solve
    eigen.ts             # 2x2 closed form + generic via ml-matrix
    svd.ts               # 2x2 (via AᵀA) + generic via ml-matrix
    softmax.ts
    presets.ts           # named matrices: rotate(θ), flipX, flipY, swapXY, shear(k), scale(sx,sy), project
  /components
    CoordinatePlane/     # axes, grid, draggable vectors, snapping, zoom/pan
    VectorInput/         # number fields synced with the plane
    MatrixEditor/        # editable 2x2/3x3 with column highlighting
    TransformPlayer/     # play/pause/scrub the animation I → A
    NumberFlow/          # animates numbers changing (x,y → x',y')
    PredictReveal/       # "what will happen?" widget
    Quiz/                # multiple choice + numeric answer + hint + explain
    AiPanel/             # "Where is this in AI?" card
    Glossary/            # hover tooltips on terms
  /lessons
    01-vectors/
    02-add-scale-flip/
    03-span-and-combinations/
    04-basis-and-coordinates/
    05-matrices-as-transformations/
    06-matrix-multiplication/
    07-determinant/
    08-inverse-rank-solving/
    09-dot-product-and-similarity/
    10-eigenvectors/
    11-svd-and-compression/
    12-high-dimensions-and-embeddings/
    13-inside-an-llm/        # capstone
  /data
    toy-llm/                 # exported weights + vocab (JSON)
  /store
  App.tsx
/scripts
  train_toy_lm.py            # offline training of the toy model (see 9.2)
```

---

## 4. Shared components (build these first)

### 4.1 `CoordinatePlane`
- Draws x-axis, y-axis, grid lines, tick labels, origin. Fixed default view of about −6 to 6; scroll to zoom, drag background to pan.
- Renders **vectors as arrows from the origin** with a label showing coordinates, e.g. `v = [3, 2]`.
- Vectors are **draggable**. Optional snap to integer grid (toggle).
- Supports optional layers, each toggled by props:
  - tip-to-tail ghost arrows (for addition)
  - span trail (line or shaded plane)
  - transformed grid (grid lines bent by a matrix)
  - unit square and unit-vector arrows î = [1,0], ĵ = [0,1]
  - a test shape (letter "F", because it shows flips and rotations clearly) and a cloud of points
  - eigenvector lines
- Accessible: every vector has keyboard control (arrow keys nudge by 0.1, shift+arrow by 1) and an `aria-label` with its coordinates.

### 4.2 Two-way linking (most important rule)
Number fields, sliders, the matrix editor, and the dragging on the plane all write to **one source of truth** in the store. Changing any one updates all the others instantly. Never let them drift apart.

### 4.3 `MatrixEditor`
- Shows `[[a, b], [c, d]]`. The **first column** is colored like î and the **second column** like ĵ, matching the arrows on the plane. This colour link is how the learner sees "columns = where î and ĵ land".
- Editing a cell animates the plane to the new transform.
- Preset buttons: Identity, Flip over x-axis, Flip over y-axis, Swap x and y (flip over y = x), Rotate θ (slider), Scale, Shear, Squash onto x-axis, Random.

### 4.4 `TransformPlayer`
Plays the interpolation from identity to matrix **A** (use `lerp(I, A, t)`, which is fine for teaching). Controls: play, pause, scrub slider, speed, reset. Shows the numbers changing live next to the picture.

### 4.5 `PredictReveal`
Shows a question and an input, for example: "Where will [2, 1] land after this flip?" The learner clicks a point on the plane or types numbers. Then it reveals the answer, animates it, and says whether they were right and why.

### 4.6 `AiPanel`
A collapsible card at the end of each lesson: **"Where is this in AI?"** with 2–4 short bullets and (when possible) a tiny link into the capstone lesson. Content is in Section 8.

---

## 5. Math core: required functions and tests

Implement in `/src/core` with Vitest tests for each:

- Vectors: `add, sub, scale, dot, norm, normalize, angleBetween, projectOnto, isParallel`
- Matrices: `mul(A,B)`, `apply(A,v)`, `det`, `inverse` (return `null` when det = 0), `transpose`, `rank`, `solve(A,b)`
- 2×2 eigen: `λ = (tr ± √(tr² − 4·det)) / 2`. If the discriminant is negative, return "no real eigenvectors" (this is what a pure rotation shows)
- 2×2 SVD via eigen of `AᵀA`; return `U, Σ, V`
- `softmax(xs)` must be numerically stable (subtract the max first)
- `presets`: `rotate(θ) = [[cosθ, −sinθ],[sinθ, cosθ]]`, `flipX = [[1,0],[0,−1]]`, `flipY = [[−1,0],[0,1]]`, `swapXY = [[0,1],[1,0]]`, `shear(k) = [[1,k],[0,1]]`, `scale(sx,sy) = diag(sx,sy)`, `projectX = [[1,0],[0,0]]`

Key facts the tests must lock in:
- `A · [x, y] = [a·x + b·y, c·x + d·y]` for `A = [[a,b],[c,d]]`
- Columns of A are the images of î and ĵ
- `det(A) = a·d − b·c`; area of the unit square after A is `|det(A)|`; a negative det means the plane was flipped (orientation reversed)
- `AB ≠ BA` in general (include a test with rotate then flip)

---

## 6. Lessons: interaction specs

Each lesson has: **Goal**, **Play** (what the learner can do), **Challenges** (with hints), **Quiz** (3–5 questions), and **AI panel**. All lessons also include a "Try to break it" nudge, for example "What if you set both vectors to point the same way?"

### 01 Vectors
- **Play:** Type `x` and `y` in two number fields. An arrow appears from the origin. Dragging the tip updates the numbers. A toggle shows three views of the same vector: **arrow**, **list `[x, y]`**, **walk instructions** ("3 right, 2 up"). Show length (magnitude) and angle live.
- **Challenges:** "Make an arrow that goes 4 left and 3 up." "Make two different-looking arrows with the same length."
- **AI panel:** A word, an image, or a user is stored in AI as a list of numbers (a vector). Same idea, just longer.

### 02 Add, scale, flip
- **Play:** Two vectors **u** and **v**. Show `u + v` with the tip-to-tail ghost arrow, animated step by step, with the component-by-component sum shown beside it. A slider for scalar `k` scales **v** from −3 to 3: values above 1 stretch, between 0 and 1 shrink, **negative values flip the arrow through the origin**. Show `k·[x,y] = [kx, ky]` live.
- **Challenges:** "Get from **u** to the target using only `+` and scaling." "What `k` sends [2,1] to [−4,−2]?"
- **AI panel:** Adding vectors is how a model blends meanings, and scaling is how it decides "how much" of something to use. Famous example: the vector for `king − man + woman` lands near `queen` (shown properly in Lesson 12).

### 03 Span and linear combinations
- **Play:** Two sliders `a` and `b`. The point `a·u + b·v` is drawn, and **leaves a trail** as the sliders move. Cases to show clearly:
  - one nonzero vector: span is a **line**
  - two vectors in different directions: span is the **whole plane** (shade it)
  - two vectors on the same line (dependent): span collapses back to a **line**
  - both zero vectors: span is just the **origin**
- A "linearly independent?" indicator turns on/off live as vectors are dragged.
- **Challenges:** "Reach [5, −2] using `a·u + b·v`; find `a` and `b`." "Can you reach it if v = 2u? Why not?"
- **AI panel:** A model can only produce outputs that lie in the span of what its weights can build. Fewer independent directions means less it can express. This leads to rank (Lesson 08) and LoRA (Lesson 11).

### 04 Basis and coordinates
- **Play:** Default basis is î = [1,0], ĵ = [0,1]. The learner **drags the basis vectors** and the grid redraws in the new basis. A point keeps its position in space while its coordinates change; show both coordinate lists side by side.
- **Key message:** coordinates are just instructions "take this many of basis vector 1 and this many of basis vector 2". Different basis, different numbers, same point.
- **Challenges:** "Find a basis where the point P has coordinates [1,1]."
- **AI panel:** Embedding dimensions are a basis the model learned. They are not hand-labeled "x = royalty", and in practice directions are mixed.

### 05 Matrices as transformations (core lesson)
- **Play:** Edit a 2×2 matrix (or use presets). The whole plane, the grid, the unit square, and the "F" shape animate. Highlight: **column 1 = where î lands, column 2 = where ĵ lands.** A "type a point, see where it goes" panel shows `[x,y] → [x',y']` with the arithmetic written out.
- **Flipping demo:** Presets for flip over x-axis, y-axis, and y = x. Show how only a **sign** or **swap** changes in the coordinates (`[x,y] → [x,−y]`, `[−x,y]`, `[y,x]`).
- **Rotation demo:** θ slider. Show length stays the same.
- **Squash demo:** `[[1,0],[0,0]]` flattens the plane to a line (information lost).
- **Challenges:** "Write the matrix that flips the F upside down." "Make a matrix that turns [1,0] into [0,2] and [0,1] into [−1,0]."
- **AI panel:** **A neural-network layer is exactly this**: input vector → multiply by a weight matrix → output vector. "Training" means finding good numbers for the matrix.

### 06 Matrix multiplication = doing one after another
- **Play:** Two matrices **A** and **B**. Show the plane being transformed by B first, then A, then the single matrix **AB** doing both at once; the two animations must end identically. A swap button shows that **BA gives a different result** (rotate-then-flip vs flip-then-rotate on the F).
- **Challenges:** "Find two matrices that commute." "Make a rotation that undoes another."
- **AI panel:** Deep networks stack many layers (matrix after matrix). Real GPUs are built to do huge matrix multiplications fast. That is why AI chips exist.

### 07 Determinant
- **Play:** Unit square after the transform becomes a parallelogram. Show its area live and `det = ad − bc` with the numbers substituted. Color the shape differently when `det < 0` (**flipped**). When `det = 0`, show a clear "collapsed to a line" message.
- **Challenges:** "Make a matrix that doubles area." "Make one that flips and keeps area."
- **AI panel:** Zero determinant means information is destroyed and cannot be recovered. Models try to avoid squashing away useful information.

### 08 Inverse, rank, solving equations
- **Play:** Show `A x = b` as "which input lands on b?". Display the inverse transform animation (undo). If `det = 0`, show "no inverse" and explain **rank** (how many dimensions survive: 2, 1, or 0). Show column space (what outputs are reachable) as the shaded span of the columns.
- **Challenges:** "Solve `2x + y = 5, x − y = 1` visually, as two lines crossing, and as `Ax = b`."
- **AI panel:** Solving for the best weights is what training is doing, using calculus rather than a direct inverse, because real matrices are huge. Low rank is the key to **LoRA**, a cheap way to fine-tune big models.

### 09 Dot product and similarity
- **Play:** Two draggable vectors. Show `u·v`, the angle, and `cos θ` live. Show the **projection** of one onto the other as a shadow. Color zones: similar (cos near 1), unrelated (near 0), opposite (near −1).
- **Challenges:** "Make the dot product zero without using the zero vector."
- **AI panel:** **This is how a model measures meaning-similarity** and how search/RAG finds related text. Inside attention, a dot product decides how much one word "looks at" another.

### 10 Eigenvectors and eigenvalues
- **Play:** With a matrix applied, a rotating "probe" vector sweeps around. Highlight the directions where the arrow **stays on its own line** (only gets stretched/flipped). Show `A v = λ v` with live numbers. A rotation matrix correctly shows "no real eigenvectors".
- **Challenges:** "Make a matrix whose eigenvalue is 3 along the x-axis."
- **AI panel:** Eigen-directions show the "main directions" of a transformation. Related ideas (PCA, stability of training, how signals grow or shrink through layers).

### 11 SVD and compression
- **Play:** Show a transformed unit circle becoming an ellipse; its axes are the singular directions and the lengths are singular values. Show `A = U Σ Vᵀ` as **rotate → stretch → rotate**. Then a **compression demo**: a small grayscale image as a matrix; a slider keeps the top `k` singular values and shows the picture and the storage saved.
- **AI panel:** **PCA** and **LoRA** and **model compression** all rely on this: keep only the few important directions.

### 12 High dimensions and embeddings
- **Play:** Use a hand-made table of ~30 words with 4–8 dimensions. Let the learner (a) pick two words and see their cosine similarity, (b) do word arithmetic `king − man + woman` and see the nearest words ranked, (c) view a 2D projection (PCA from Lesson 11) where similar words cluster.
- **Be honest:** show a banner, "Real models use 768 to 12,000+ numbers per word. The ideas are the same; our picture just uses fewer."
- **AI panel:** Link to the capstone.

### 13 Inside an LLM (capstone, see Section 9)

---

## 7. Cross-lesson features
- **Progress map:** a simple path of 13 nodes, locked/unlocked, with a star when the quiz is passed. Saved in `localStorage`.
- **Glossary:** hover tooltips for vector, scalar, span, basis, matrix, transform, determinant, eigenvector, embedding, weight, etc.
- **Formulas:** always shown **next to** the picture with live numbers filled in (KaTeX).
- **"Show me the numbers" toggle:** every visual can reveal the arithmetic behind it.
- **Reset and "surprise me"** buttons on every lesson.
- **Hint ladder** for challenges: hint 1 (nudge), hint 2 (bigger clue), reveal answer.
- **Responsive:** works on phone (stack the plane above controls) and desktop (side by side). Touch drag must work.
- **Accessibility:** keyboard control, visible focus, enough color contrast, never rely on color alone (add shapes/labels), respect `prefers-reduced-motion` (skip animations, show final state).

---

## 8. "Why this matters for AI/ML": master mapping

Use this table for the `AiPanel` content and as a final summary page ("Cheat sheet").

| Linear algebra idea | Where it appears in AI/ML |
|---|---|
| Vector | A word/token, image patch, user, or song stored as a list of numbers (embedding); also the gradient |
| Scalar × vector | Weighting how much of something to use |
| Vector addition | Mixing meanings; residual connections add a layer's output back to its input |
| Matrix × vector | One layer of a neural network: `output = W·input + b` |
| Matrix × matrix | Stacking layers; processing many words at once (batches) |
| Dot product | Similarity search, RAG retrieval, attention scores |
| Cosine similarity | "How close in meaning are these two embeddings?" |
| Basis / dimensions | The learned "axes" of an embedding space |
| Span / rank | What a layer can express; **low-rank = LoRA** fine-tuning |
| Determinant / invertibility | Whether information is kept or destroyed by a layer |
| Eigenvectors | Main directions of a transform; PCA; training stability |
| SVD | Compression, PCA, low-rank approximations, analyzing weights |
| Softmax of dot products | Turning scores into probabilities (attention and next-word choice) |
| Tensors (higher-dimensional arrays) | Batches of sequences of vectors: shape `[batch, tokens, dims]` |

**One-sentence summary to show on the final page:**
> An AI model turns your words into numbers, multiplies them by learned matrices again and again, and turns the final numbers back into a word. Almost all of that is linear algebra.

---

## 9. Capstone: "Inside an LLM" (Lesson 13)

This is the lesson that answers: *"I give a prompt, it becomes numbers, math happens with coordinates, and then the output comes. Which part is which?"*

### 9.1 The pipeline (one screen per step, with a horizontal stepper at the top)

The learner types a short prompt (with suggestions like `the king rules the`). They then step through:

1. **Text → tokens.** Split into pieces (words/word-parts). Show each piece as a chip.
2. **Tokens → IDs.** Each token gets a number from a vocabulary table.
3. **IDs → vectors (embedding lookup).** Each ID picks a **row** from the embedding matrix `E`. Show the row as numbers *and* as a point/arrow on the x–y plane. *Linear algebra: vectors.*
4. **Add position.** A position vector is added so word order matters. *Linear algebra: vector addition.*
5. **Attention.** Each word makes three vectors using matrices: **Query**, **Key**, **Value** (`Q = xW_Q`, `K = xW_K`, `V = xW_V`). Show:
   - dot products `Q·K` between words as a small heat-map (who looks at whom)
   - divide by `√d` and **softmax** into percentages
   - new vector = weighted sum of the Value vectors
   *Linear algebra: matrix multiply, dot product, weighted sums.* Show the formula `softmax(QKᵀ/√d)·V` and fill in the live numbers.
6. **Feed-forward layer.** Vector × matrix, add bias, apply a simple non-linear function (ReLU), × another matrix. Show the vector moving on the plane. *Linear algebra: matrix × vector (plus one non-linear step; mention that without it, stacked matrices would collapse into one matrix, which links back to Lesson 06).*
7. **Repeat** N layers (toy model: 2–4). Show the vector's path as dots joined by arrows.
8. **Final vector → word scores.** Multiply by the **unembedding matrix** `U` (one row per vocabulary word). Each score is a **dot product** between the final vector and that word's vector. Show this in 2D: *every word is a direction; the final vector points toward the word it predicts.*
9. **Scores → probabilities.** Softmax. Show a bar chart of the top candidates, and a **temperature** slider (flatter vs sharper).
10. **Pick a word, append it, repeat.** Loop until the learner stops. This is "generation".

### 9.2 The toy model (build this, do not skip)

- A **tiny language model** with a vocabulary of about 30 words and **`d_model = 2`** so *every vector can be drawn on the same x–y plane used in Lessons 01–11*. Also offer a `d_model = 4` or `8` variant displayed as bars plus a PCA 2D projection (stretch goal).
- Train it offline with `scripts/train_toy_lm.py` (PyTorch or plain numpy) on a tiny hand-written corpus of ~100 simple sentences, for example about royalty, animals, and food. Export `vocab.json`, `E`, `W_Q`, `W_K`, `W_V`, MLP weights, and `U` to `/src/data/toy-llm/`.
- If training at `d_model = 2` does not give sensible predictions, fall back to **hand-designed weights** so the demo still behaves sensibly for the example prompts. The goal is teaching clarity, not accuracy.
- Run inference **in the browser using the `/core` math library** (not a black box), so every intermediate number can be shown.
- Include 4–5 **guided prompts** with known good behavior.

### 9.3 Interactions that make it "feel" like understanding
- **Drag the final vector.** The learner drags the model's final vector around the plane and watches the next-word probabilities change live. Moving toward "queen" raises "queen".
- **Edit a weight.** Let the learner change one number in a small matrix (e.g. `W_Q`) and see the attention pattern and output change. Tagline: *"This is what training does, automatically, billions of times."*
- **Predict first.** Before each step: "Which word do you think gets the highest score?"
- **Show the shapes.** At each step show tensor shapes (e.g. `[3 tokens × 2]`) and why matrix shapes must match for multiplication.
- **"What is learned vs what is fixed?"** Color-code *learned matrices* (E, W_Q, W_K, W_V, MLP, U) versus *plain math* (dot product, softmax, addition). A short note: training = adjusting the learned numbers to make the right next word more likely.

### 9.4 Stretch: peek at a real model
Optional (only after everything else works). Use `transformers.js` to load a small open model in the browser and show, for the learner's own prompt: real tokens, real token IDs, the embedding **dimension** (e.g. 768), one real attention heat-map, and top-10 next-token probabilities. Add the banner: *"This is the same pipeline you just built, at real size."* Must load lazily and show a download-size warning first.

### 9.5 Honest limits panel (required)
A short, clearly visible note: *Real LLMs have billions of learned numbers, use many attention "heads" in parallel, many layers, and normalization steps we skipped. The linear-algebra core is the same.*

---

## 10. Quality bar and non-functional requirements

- Interactions run at ~60 fps for 2D scenes; no jank when dragging.
- All lesson math is computed by `/core`, never hard-coded results.
- Unit tests: 100% of `/core` functions, including edge cases (zero vector, det = 0, parallel vectors, negative scalars, rotation by 0 and 2π).
- Playwright smoke test per lesson: page loads, a drag changes the number fields, a quiz can be completed.
- Lint, format, and strict TypeScript must pass in CI (`npm run check`).
- No external network calls except the optional model download in 9.4.
- Clear README with `npm install`, `npm run dev`, `npm test`.

---

## 11. Build plan for Claude Code (do in this order)

**Phase 0: Setup.** Vite + React + TS + Tailwind + Vitest + KaTeX. Folder structure from Section 3. Global layout, progress store, routing between lessons.

**Phase 1: Math core.** Implement and fully test everything in Section 5 before any UI.

**Phase 2: Shared UI.** `CoordinatePlane`, `VectorInput`, two-way linking, `MatrixEditor`, `TransformPlayer`, `PredictReveal`, `Quiz`, `AiPanel`, `Glossary`. Create a `/playground` page to test them.

**Phase 3: Lessons 01–05.** (vectors → matrices as transformations). Stop and review with the owner. These five lessons are the heart of the "type a value, see coordinates, span, and flipping" experience.

**Phase 4: Lessons 06–10.**

**Phase 5: Lessons 11–12.**

**Phase 6: Capstone, Lesson 13.** Toy model training script, export, in-browser inference, the 10-step stepper, and the interactions in 9.3.

**Phase 7: Polish.** Progress map, cheat sheet page (Section 8), accessibility pass, mobile pass, performance pass, README. Optional stretch 9.4.

### Definition of done
- A beginner can finish Lessons 01–05 in one sitting without outside help.
- In Lesson 05, typing any 2×2 matrix animates the plane correctly, and the flip, rotate, shear, and squash presets all behave as described.
- In Lesson 13, a learner can type a prompt and follow every number from text to next word, and can drag the final vector or edit one weight to see the output change.
- All tests pass and the app runs with `npm run dev`.

---

## 12. Content style guide
- Short sentences. One idea per paragraph. Prefer pictures and live numbers over text.
- Introduce each term with a plain-words meaning first, the math name second.
- Use consistent colors: î = one color, ĵ = another, input vectors = neutral, output/transformed = accent. Keep them the same in every lesson.
- Use friendly, encouraging feedback on wrong answers ("Close! Check the sign of y.").
- Never say "obviously" or "simply".
