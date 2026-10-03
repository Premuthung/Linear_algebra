import { expect, test, type Page } from '@playwright/test';

// One smoke test per lesson: the page loads, a drag changes the number fields,
// and the quiz can be completed.

/** A choice index, a number, or the two numbers of a vector. */
type Answer = number | string | [string, string];

async function open(page: Page, lesson: string, step: number): Promise<void> {
  await page.goto(`/#/lesson/${lesson}/${step}`);
}

/** Drag an arrow tip by a number of screen pixels. */
async function dragHandle(page: Page, id: string, dx: number, dy: number): Promise<void> {
  const box = await page.getByTestId(`handle-${id}`).boundingBox();
  if (!box) throw new Error(`No handle for ${id}`);
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx / 2, y + dy / 2, { steps: 4 });
  await page.mouse.move(x + dx, y + dy, { steps: 4 });
  await page.mouse.up();
}

async function passQuiz(page: Page, answers: Answer[]): Promise<void> {
  for (const [i, answer] of answers.entries()) {
    const question = page.getByTestId(`question-${i}`);
    if (typeof answer === 'number') {
      await question.getByRole('radio').nth(answer).check();
    } else if (typeof answer === 'string') {
      await question.getByRole('spinbutton').fill(answer);
    } else {
      await question.getByRole('spinbutton').nth(0).fill(answer[0]);
      await question.getByRole('spinbutton').nth(1).fill(answer[1]);
    }
    await question.getByRole('button', { name: 'Check' }).click();
    await expect(question.getByText('Correct!')).toBeVisible();
  }
  await expect(page.getByTestId('quiz-result')).toContainText('Quiz passed');
  await expect(page.getByTestId('ai-panel')).toBeVisible();
}

test('home lists the lessons and shows stars', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Linear algebra for AI' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Vectors/ })).toBeVisible();
  await expect(page.getByTestId('star-count')).toContainText('0 of 13');
});

test('01 vectors', async ({ page }) => {
  await open(page, '01-vectors', 0);
  await expect(page.getByRole('heading', { name: /Vectors/ })).toBeVisible();
  await expect(page.getByTestId('v-x')).toHaveValue('3');

  // Dragging the arrow changes the number fields.
  await dragHandle(page, 'v', -120, -80);
  await expect(page.getByTestId('v-x')).not.toHaveValue('3');
  await expect(page.getByTestId('v-y')).not.toHaveValue('2');

  // Typing a number moves the arrow.
  await page.getByTestId('v-x').fill('-4');
  await page.getByTestId('v-y').fill('3');
  await page.getByRole('button', { name: 'Walking steps' }).click();
  await expect(page.getByTestId('view-readout')).toHaveText('4 left, then 3 up');
  await expect(page.getByTestId('handle-v')).toHaveAttribute('aria-valuetext', 'x -4, y 3');

  // The keyboard moves the arrow too.
  await page.getByTestId('handle-v').focus();
  await page.keyboard.press('Shift+ArrowRight');
  await expect(page.getByTestId('v-x')).toHaveValue('-3');

  // The challenge checks itself (v was left at [-4, 3] before the nudge).
  await open(page, '01-vectors', 2);
  await page.getByTestId('v-x').fill('-4');
  await expect(page.getByText('Solved. Well done!').first()).toBeVisible();

  await open(page, '01-vectors', 3);
  await passQuiz(page, [0, ['6', '-2'], '5', 1]);
});

test('02 add, scale, flip', async ({ page }) => {
  await open(page, '02-add-scale-flip', 0);
  await expect(page.getByTestId('sum-readout')).toContainText('[4, 3]');
  await dragHandle(page, 'u', -86, 0);
  await expect(page.getByTestId('u-x')).toHaveValue('1');
  await expect(page.getByTestId('sum-readout')).toContainText('[2, 3]');

  // A negative scalar flips the arrow.
  await open(page, '02-add-scale-flip', 1);
  await page.getByRole('button', { name: 'k = -1', exact: true }).click();
  await expect(page.getByTestId('scale-words')).toContainText('flips');

  await open(page, '02-add-scale-flip', 4);
  await page.getByTestId('k2').fill('-2');
  await expect(page.getByText('Solved. Well done!')).toBeVisible();

  await open(page, '02-add-scale-flip', 5);
  await passQuiz(page, [['3', '2'], ['-6', '2'], 0, 1, '3']);
});

test('03 span and combinations', async ({ page }) => {
  await open(page, '03-span-and-combinations', 1);
  await expect(page.getByTestId('independent')).toContainText('yes');

  await page.getByRole('button', { name: 'Same line' }).click();
  await expect(page.getByTestId('independent')).toContainText('no');
  await expect(page.getByTestId('span-text')).toContainText('only a line');

  // Dragging v off the line makes the pair independent again.
  await dragHandle(page, 'v', 0, -130);
  await expect(page.getByTestId('independent')).toContainText('yes');
  await expect(page.getByTestId('v-y')).not.toHaveValue('-2');

  await open(page, '03-span-and-combinations', 3);
  await passQuiz(page, [1, 0, ['2', '3'], 1]);
});

test('04 basis and coordinates', async ({ page }) => {
  await open(page, '04-basis-and-coordinates', 0);
  await expect(page.getByTestId('basis-coords')).toHaveText('[3, 2]');

  // A new basis gives new numbers for the same point.
  await page.getByRole('button', { name: 'Longer sticks' }).click();
  await expect(page.getByTestId('basis-coords')).toHaveText('[1.5, 1]');
  await expect(page.getByTestId('standard-coords')).toHaveText('[3, 2]');

  await dragHandle(page, 'b1', 43, 0);
  await expect(page.getByTestId('b₁-x')).toHaveValue('3');
  await expect(page.getByTestId('basis-coords')).toHaveText('[1, 1]');

  await open(page, '04-basis-and-coordinates', 3);
  await passQuiz(page, [1, ['1', '3'], 1, ['2', '2']]);
});

test('05 matrices as transformations', async ({ page }) => {
  await open(page, '05-matrices-as-transformations', 0);
  await expect(page.getByTestId('m-b')).toHaveValue('1');

  // Presets write to the matrix editor.
  await page.getByRole('button', { name: 'Flip over x-axis' }).click();
  await expect(page.getByTestId('m-d')).toHaveValue('-1');
  await expect(page.getByTestId('columns-readout')).toContainText('[0, -1]');

  // Dragging î changes column 1.
  await dragHandle(page, 'i-hat', 43, -43);
  await expect(page.getByTestId('m-a')).toHaveValue('2');
  await expect(page.getByTestId('m-c')).toHaveValue('1');

  // Typing a matrix moves a point.
  await open(page, '05-matrices-as-transformations', 1);
  await page.getByTestId('m-a').fill('0');
  await page.getByTestId('m-b').fill('-1');
  await page.getByTestId('m-c').fill('1');
  await page.getByTestId('m-d').fill('0');
  await expect(page.getByTestId('point-readout')).toHaveText('[2, 1] → [-1, 2]');

  await open(page, '05-matrices-as-transformations', 2);
  await page.getByRole('button', { name: 'Flip over the y-axis' }).click();
  await expect(page.getByTestId('rule')).toHaveText('[x, y] → [−x, y]');
  await expect(page.getByTestId('demo-readout')).toHaveText('[2, 1] → [-2, 1]');
  await page.getByRole('button', { name: 'Squash onto the x-axis' }).click();
  await expect(page.getByTestId('demo-readout')).toHaveText('[2, 1] → [2, 0]');

  await open(page, '05-matrices-as-transformations', 5);
  await passQuiz(page, [['2', '3'], 0, 0, ['0', '3'], 1]);
});

test('playground shows the shared components', async ({ page }) => {
  await page.goto('/#/playground');
  await expect(page.getByRole('heading', { name: 'Component playground' })).toBeVisible();
  await dragHandle(page, 'v', 43, 0);
  await expect(page.getByTestId('v-x')).toHaveValue('3');
});

test('home explainer follows a sentence through the model', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('flow')).toBeVisible();
  await expect(page.getByTestId('prediction')).toContainText('mat');

  // Each step name opens the text for that step.
  await page.getByTestId('stage-matrix').click();
  await expect(page.getByTestId('stage-detail')).toContainText('A matrix transforms the vector');

  // A new sentence gives a new prediction.
  await page.getByRole('button', { name: /data is the new/ }).click();
  await expect(page.getByTestId('prediction')).toContainText('oil');

  // The article figure reacts to linearly dependent columns.
  await expect(page.getByTestId('span-status')).toContainText('linearly independent');
});
