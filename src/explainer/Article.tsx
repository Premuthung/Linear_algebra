import type { ReactNode } from 'react';
import { Tex } from '../components/ui';
import { lessonHref } from '../router';
import { BookRef } from './BookRef';
import { EigenFigure, NormFigure, ProductFigure, ShapesFigure, SpanFigure } from './figures';

// The long explanation under the picture. It follows Chapter 2 ("Linear Algebra") of
// Goodfellow, Bengio and Courville, "Deep Learning" (2016), in the same order as the book.
// The wording is our own; each part names the section and pages it is based on.

interface SectionInfo {
  id: string;
  title: string;
  section: string;
  pages: string;
}

export const SECTIONS: SectionInfo[] = [
  {
    id: 'scalars-vectors-matrices',
    title: 'Scalars, vectors, matrices, tensors',
    section: '2.1',
    pages: '31–34',
  },
  { id: 'multiplying', title: 'Multiplying matrices and vectors', section: '2.2', pages: '34–36' },
  {
    id: 'identity-inverse',
    title: 'Identity and inverse matrices',
    section: '2.3',
    pages: '36–37',
  },
  { id: 'span', title: 'Linear dependence and span', section: '2.4', pages: '37–39' },
  { id: 'norms', title: 'Norms: the size of a vector', section: '2.5', pages: '39–40' },
  { id: 'special', title: 'Special matrices and vectors', section: '2.6', pages: '40–42' },
  { id: 'eigen', title: 'Eigendecomposition', section: '2.7', pages: '42–44' },
  {
    id: 'svd',
    title: 'Singular value decomposition and the pseudoinverse',
    section: '2.8–2.9',
    pages: '44–46',
  },
  { id: 'trace-determinant', title: 'Trace and determinant', section: '2.10–2.11', pages: '46–47' },
  { id: 'pca', title: 'Putting it together: PCA', section: '2.12', pages: '48–52' },
];

function Section({ index, children }: { index: number; children: ReactNode }) {
  const info = SECTIONS[index];
  return (
    <section id={info.id} className="scroll-mt-6 border-t border-line pt-8">
      <p className="text-sm font-semibold uppercase tracking-wider text-accent">
        Book §{info.section}
      </p>
      <h3 className="mt-1 text-2xl font-bold [text-wrap:balance]">{info.title}</h3>
      <div className="mt-3 space-y-3 text-[16px] leading-relaxed">{children}</div>
      <div className="mt-4">
        <BookRef section={info.section} pages={info.pages} />
      </div>
    </section>
  );
}

/** A grey box that ties a book idea back to the picture at the top. */
function InTheModel({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-u/40 bg-u/5 px-4 py-3 text-[15px]">
      <strong>In the picture above:</strong> {children}
    </p>
  );
}

function Practice({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p>
      <a
        className="inline-block rounded-lg border border-accent px-3 py-1.5 text-sm font-semibold text-accent no-underline hover:bg-accent hover:text-white"
        href={lessonHref(id)}
      >
        {children} →
      </a>
    </p>
  );
}

export function Article() {
  return (
    <article className="mx-auto max-w-[75ch] space-y-10" aria-labelledby="article-title">
      <header>
        <h2 id="article-title" className="text-3xl font-bold [text-wrap:balance]">
          The linear algebra behind the picture
        </h2>
        <p className="mt-3 text-[16px] leading-relaxed">
          Every step in the picture is linear algebra: words become vectors, vectors are compared
          with dot products, and a matrix transforms them. The book <cite>Deep Learning</cite> by
          Goodfellow, Bengio and Courville opens with a chapter on exactly these tools, because, as
          it says, a good understanding of linear algebra is essential for working with deep
          learning. This article walks through that chapter in order, in plain words, with a small
          picture you can play with for each idea.
        </p>
        <nav aria-label="Contents" className="mt-4 rounded-2xl border border-line bg-panel2 p-4">
          <p className="text-sm font-semibold text-muted">Contents</p>
          <ol className="mt-2 grid gap-x-6 gap-y-1 text-[15px] sm:grid-cols-2">
            {SECTIONS.map((s) => (
              <li key={s.id} className="flex gap-2">
                <span className="w-16 shrink-0 font-mono text-sm text-muted">§{s.section}</span>
                <a className="text-accent underline" href={`#${s.id}`}>
                  {s.title.toLowerCase()}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </header>

      <Section index={0}>
        <p>The chapter starts by naming the four kinds of object that hold numbers.</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            A <strong>scalar</strong> is one single number, written in italics: <Tex>{'s'}</Tex>.
            When the book introduces one, it also says what kind of number it is, for example{' '}
            <Tex>{'s \\in \\mathbb{R}'}</Tex> for a real number.
          </li>
          <li>
            A <strong>vector</strong> is an array of numbers arranged in order, written in bold:{' '}
            <Tex>{'\\boldsymbol{x}'}</Tex>. You find one entry by its position, so{' '}
            <Tex>{'x_1'}</Tex> is the first entry. A vector with <Tex>{'n'}</Tex> real entries lives
            in <Tex>{'\\mathbb{R}^n'}</Tex>. You can think of it as a point in space, where each
            entry is the coordinate along one axis.
          </li>
          <li>
            A <strong>matrix</strong> is a 2-D array of numbers, written in bold capitals:{' '}
            <Tex>{'\\boldsymbol{A}'}</Tex>. Each entry needs two indices: <Tex>{'A_{i,j}'}</Tex> is
            in row <Tex>{'i'}</Tex> and column <Tex>{'j'}</Tex>. A matrix with <Tex>{'m'}</Tex> rows
            and <Tex>{'n'}</Tex> columns is in <Tex>{'\\mathbb{R}^{m \\times n}'}</Tex>. A colon
            picks a whole row or column: <Tex>{'\\boldsymbol{A}_{i,:}'}</Tex> is row{' '}
            <Tex>{'i'}</Tex> and <Tex>{'\\boldsymbol{A}_{:,j}'}</Tex> is column <Tex>{'j'}</Tex>.
          </li>
          <li>
            A <strong>tensor</strong> is an array with more than two axes. An entry needs three or
            more indices, such as <Tex>{'\\mathsf{A}_{i,j,k}'}</Tex>.
          </li>
        </ul>
        <ShapesFigure />
        <p>
          The <strong>transpose</strong> flips a matrix across its main diagonal, the line that runs
          from the top-left corner down to the right. Rows become columns:
        </p>
        <Tex block>{'(\\boldsymbol{A}^\\top)_{i,j} = A_{j,i}'}</Tex>
        <p>
          A vector is a matrix with one column, so its transpose is a matrix with one row. A scalar
          is its own transpose.
        </p>
        <p>
          Two matrices of the same shape are added entry by entry:{' '}
          <Tex>{'C_{i,j} = A_{i,j} + B_{i,j}'}</Tex>. A scalar can be added to, or multiplied with,
          every entry of a matrix. Deep learning also uses a shortcut called{' '}
          <strong>broadcasting</strong>: in{' '}
          <Tex>{'\\boldsymbol{C} = \\boldsymbol{A} + \\boldsymbol{b}'}</Tex>, the vector{' '}
          <Tex>{'\\boldsymbol{b}'}</Tex> is added to every row of the matrix, without first copying
          it into each row.
        </p>
        <InTheModel>
          each word is a vector in <Tex>{'\\mathbb{R}^4'}</Tex>. The word vectors of a sentence,
          stacked as rows, form a matrix with 4 columns. Real models work on a whole batch of
          sentences at once, which makes a tensor.
        </InTheModel>
        <Practice id="01-vectors">Practice in Lesson 01</Practice>
      </Section>

      <Section index={1}>
        <p>
          The <strong>matrix product</strong> is the most important operation in the chapter. The
          product <Tex>{'\\boldsymbol{C} = \\boldsymbol{A}\\boldsymbol{B}'}</Tex> is only defined
          when <Tex>{'\\boldsymbol{A}'}</Tex> has as many columns as <Tex>{'\\boldsymbol{B}'}</Tex>{' '}
          has rows. If <Tex>{'\\boldsymbol{A}'}</Tex> is <Tex>{'m \\times n'}</Tex> and{' '}
          <Tex>{'\\boldsymbol{B}'}</Tex> is <Tex>{'n \\times p'}</Tex>, then{' '}
          <Tex>{'\\boldsymbol{C}'}</Tex> is <Tex>{'m \\times p'}</Tex>, and
        </p>
        <Tex block>{'C_{i,j} = \\sum_k A_{i,k}\\, B_{k,j}'}</Tex>
        <ProductFigure />
        <p>
          This is not the same as multiplying entry by entry. That other operation exists too. It is
          called the element-wise or Hadamard product and is written{' '}
          <Tex>{'\\boldsymbol{A} \\odot \\boldsymbol{B}'}</Tex>.
        </p>
        <p>
          The <strong>dot product</strong> of two vectors of the same size is the matrix product{' '}
          <Tex>{'\\boldsymbol{x}^\\top \\boldsymbol{y}'}</Tex>: multiply the entries in pairs and
          add. So each entry <Tex>{'C_{i,j}'}</Tex> of a matrix product is the dot product of row{' '}
          <Tex>{'i'}</Tex> of <Tex>{'\\boldsymbol{A}'}</Tex> with column <Tex>{'j'}</Tex> of{' '}
          <Tex>{'\\boldsymbol{B}'}</Tex>.
        </p>
        <p>The book lists the rules that make matrix algebra easy to work with:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Distributive:{' '}
            <Tex>
              {
                '\\boldsymbol{A}(\\boldsymbol{B} + \\boldsymbol{C}) = \\boldsymbol{A}\\boldsymbol{B} + \\boldsymbol{A}\\boldsymbol{C}'
              }
            </Tex>
          </li>
          <li>
            Associative:{' '}
            <Tex>
              {
                '\\boldsymbol{A}(\\boldsymbol{B}\\boldsymbol{C}) = (\\boldsymbol{A}\\boldsymbol{B})\\boldsymbol{C}'
              }
            </Tex>
          </li>
          <li>
            <strong>Not</strong> commutative:{' '}
            <Tex>{'\\boldsymbol{A}\\boldsymbol{B} = \\boldsymbol{B}\\boldsymbol{A}'}</Tex> does not
            always hold. The order matters. The dot product of two vectors is the exception:{' '}
            <Tex>
              {'\\boldsymbol{x}^\\top \\boldsymbol{y} = \\boldsymbol{y}^\\top \\boldsymbol{x}'}
            </Tex>
            .
          </li>
          <li>
            The transpose of a product swaps the order:{' '}
            <Tex>
              {
                '(\\boldsymbol{A}\\boldsymbol{B})^\\top = \\boldsymbol{B}^\\top \\boldsymbol{A}^\\top'
              }
            </Tex>
          </li>
        </ul>
        <p>With this notation a whole system of linear equations fits in one line:</p>
        <Tex block>{'\\boldsymbol{A}\\boldsymbol{x} = \\boldsymbol{b}'}</Tex>
        <p>
          Here <Tex>{'\\boldsymbol{A} \\in \\mathbb{R}^{m \\times n}'}</Tex> and{' '}
          <Tex>{'\\boldsymbol{b} \\in \\mathbb{R}^m'}</Tex> are known, and{' '}
          <Tex>{'\\boldsymbol{x} \\in \\mathbb{R}^n'}</Tex> is the unknown. Each row of{' '}
          <Tex>{'\\boldsymbol{A}'}</Tex> with the matching entry of <Tex>{'\\boldsymbol{b}'}</Tex>{' '}
          gives one equation.
        </p>
        <InTheModel>
          step 3 uses dot products to compare words. Step 4 is one matrix times one vector,{' '}
          <Tex>{'\\boldsymbol{h} = \\boldsymbol{W}\\boldsymbol{c}'}</Tex>. Step 5 is another: the
          eight answer vectors, stacked as rows, times <Tex>{'\\boldsymbol{h}'}</Tex>.
        </InTheModel>
        <Practice id="05-matrices-as-transformations">Practice in Lesson 05</Practice>
      </Section>

      <Section index={2}>
        <p>
          The <strong>identity matrix</strong> <Tex>{'\\boldsymbol{I}_n'}</Tex> changes nothing. It
          has ones on the main diagonal and zeros everywhere else, and for every vector
        </p>
        <Tex block>{'\\boldsymbol{I}_n \\boldsymbol{x} = \\boldsymbol{x}'}</Tex>
        <p>
          The <strong>inverse</strong> of <Tex>{'\\boldsymbol{A}'}</Tex>, written{' '}
          <Tex>{'\\boldsymbol{A}^{-1}'}</Tex>, is the matrix that undoes it:
        </p>
        <Tex block>{'\\boldsymbol{A}^{-1}\\boldsymbol{A} = \\boldsymbol{I}_n'}</Tex>
        <p>
          With an inverse you can solve the system in three moves. Multiply both sides of{' '}
          <Tex>{'\\boldsymbol{A}\\boldsymbol{x} = \\boldsymbol{b}'}</Tex> by{' '}
          <Tex>{'\\boldsymbol{A}^{-1}'}</Tex> from the left, and the left side collapses to{' '}
          <Tex>{'\\boldsymbol{x}'}</Tex>:
        </p>
        <Tex block>{'\\boldsymbol{x} = \\boldsymbol{A}^{-1}\\boldsymbol{b}'}</Tex>
        <p>
          The book adds a warning. The inverse is mainly a tool for thinking. Computers store
          numbers with limited precision, so real software usually solves for{' '}
          <Tex>{'\\boldsymbol{x}'}</Tex> with methods that use <Tex>{'\\boldsymbol{b}'}</Tex>{' '}
          directly and give a more accurate answer. And the inverse does not always exist. The next
          section says when it does.
        </p>
      </Section>

      <Section index={3}>
        <p>
          For <Tex>{'\\boldsymbol{A}^{-1}'}</Tex> to exist, the system{' '}
          <Tex>{'\\boldsymbol{A}\\boldsymbol{x} = \\boldsymbol{b}'}</Tex> must have exactly one
          solution for every <Tex>{'\\boldsymbol{b}'}</Tex>. A system can also have no solution, or
          infinitely many. It can never have, say, exactly two: if <Tex>{'\\boldsymbol{x}'}</Tex>{' '}
          and <Tex>{'\\boldsymbol{y}'}</Tex> are both solutions, then every point on the line
          through them, <Tex>{'\\alpha\\boldsymbol{x} + (1 - \\alpha)\\boldsymbol{y}'}</Tex>, is a
          solution too.
        </p>
        <p>
          To count the solutions, the book reads the columns of <Tex>{'\\boldsymbol{A}'}</Tex> as
          directions you can travel in from the origin. The entry <Tex>{'x_i'}</Tex> says how far to
          go along column <Tex>{'i'}</Tex>:
        </p>
        <Tex block>{'\\boldsymbol{A}\\boldsymbol{x} = \\sum_i x_i\\, \\boldsymbol{A}_{:,i}'}</Tex>
        <p>
          Scaling some vectors and adding them is called a <strong>linear combination</strong>. The{' '}
          <strong>span</strong> of a set of vectors is every point you can reach that way. So{' '}
          <Tex>{'\\boldsymbol{A}\\boldsymbol{x} = \\boldsymbol{b}'}</Tex> has a solution exactly
          when <Tex>{'\\boldsymbol{b}'}</Tex> is in the span of the columns of{' '}
          <Tex>{'\\boldsymbol{A}'}</Tex>. That span has a name: the <strong>column space</strong>,
          or range, of <Tex>{'\\boldsymbol{A}'}</Tex>.
        </p>
        <SpanFigure />
        <p>
          To reach every <Tex>{'\\boldsymbol{b}'}</Tex> in <Tex>{'\\mathbb{R}^m'}</Tex>, the column
          space must be all of <Tex>{'\\mathbb{R}^m'}</Tex>. That needs at least <Tex>{'m'}</Tex>{' '}
          columns. But counting columns is not enough, because a column can be redundant. Two
          identical columns reach no more points than one. This redundancy is{' '}
          <strong>linear dependence</strong>. A set of vectors is{' '}
          <strong>linearly independent</strong> when no vector in it is a linear combination of the
          others.
        </p>
        <p>
          Put together: for the inverse to exist, the matrix must be <strong>square</strong> (
          <Tex>{'m = n'}</Tex>) and all its columns must be linearly independent. A square matrix
          with linearly dependent columns is called <strong>singular</strong>.
        </p>
        <InTheModel>
          the mixed vector <Tex>{'\\boldsymbol{c}'}</Tex> in step 3 is a linear combination of the
          word vectors. Whatever the weights are, <Tex>{'\\boldsymbol{c}'}</Tex> stays inside the
          span of the words in the sentence.
        </InTheModel>
        <Practice id="03-span-and-combinations">Practice in Lesson 03</Practice>
      </Section>

      <Section index={4}>
        <p>
          A <strong>norm</strong> measures the size of a vector. The book defines a whole family,
          the <Tex>{'L^p'}</Tex> norms, for any <Tex>{'p \\ge 1'}</Tex>:
        </p>
        <Tex block>{'\\|\\boldsymbol{x}\\|_p = \\Big( \\sum_i |x_i|^p \\Big)^{1/p}'}</Tex>
        <p>
          A norm maps a vector to a number that is never negative. To count as a norm, a function{' '}
          <Tex>{'f'}</Tex> must follow three rules: only the zero vector has size zero; the triangle
          inequality{' '}
          <Tex>
            {'f(\\boldsymbol{x} + \\boldsymbol{y}) \\le f(\\boldsymbol{x}) + f(\\boldsymbol{y})'}
          </Tex>{' '}
          holds; and scaling a vector scales its size,{' '}
          <Tex>{'f(\\alpha \\boldsymbol{x}) = |\\alpha| f(\\boldsymbol{x})'}</Tex>.
        </p>
        <NormFigure />
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>
              <Tex>{'L^2'}</Tex> norm
            </strong>{' '}
            (<Tex>{'p = 2'}</Tex>): the ordinary straight-line distance from the origin, also called
            the Euclidean norm. It is used so often that the 2 is usually left out. Its square is
            even easier to work with, because it is just{' '}
            <Tex>{'\\boldsymbol{x}^\\top \\boldsymbol{x}'}</Tex>. The downside: the squared norm
            grows very slowly near the origin.
          </li>
          <li>
            <strong>
              <Tex>{'L^1'}</Tex> norm
            </strong>
            : <Tex>{'\\|\\boldsymbol{x}\\|_1 = \\sum_i |x_i|'}</Tex>. It grows at the same rate
            everywhere, so it is the choice when the difference between exactly zero and small but
            not zero matters.
          </li>
          <li>
            <strong>
              <Tex>{'L^\\infty'}</Tex> norm
            </strong>
            , or max norm: the largest absolute entry,{' '}
            <Tex>{'\\|\\boldsymbol{x}\\|_\\infty = \\max_i |x_i|'}</Tex>.
          </li>
          <li>
            <strong>Frobenius norm</strong>: the size of a matrix, built like the <Tex>{'L^2'}</Tex>{' '}
            norm of a vector: <Tex>{'\\|\\boldsymbol{A}\\|_F = \\sqrt{\\sum_{i,j} A_{i,j}^2}'}</Tex>
            .
          </li>
        </ul>
        <p>Norms also give the dot product a meaning you can see:</p>
        <Tex block>
          {
            '\\boldsymbol{x}^\\top \\boldsymbol{y} = \\|\\boldsymbol{x}\\|_2\\, \\|\\boldsymbol{y}\\|_2 \\cos\\theta'
          }
        </Tex>
        <p>
          where <Tex>{'\\theta'}</Tex> is the angle between the two vectors. Vectors that point the
          same way give a large positive number. Vectors at a right angle give zero.
        </p>
        <InTheModel>
          this formula is why the dot product in step 3 works as a measure of likeness. The words
          whose vectors point the same way as the last word get the widest ribbons.
        </InTheModel>
      </Section>

      <Section index={5}>
        <p>Some matrices and vectors have a shape that makes them cheap and easy to use.</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            A <strong>diagonal matrix</strong> is zero everywhere except on the main diagonal.{' '}
            <Tex>{'\\operatorname{diag}(\\boldsymbol{v})'}</Tex> is the square diagonal matrix with
            the entries of <Tex>{'\\boldsymbol{v}'}</Tex> on its diagonal. Multiplying by it only
            scales each entry:{' '}
            <Tex>
              {
                '\\operatorname{diag}(\\boldsymbol{v})\\boldsymbol{x} = \\boldsymbol{v} \\odot \\boldsymbol{x}'
              }
            </Tex>
            . Its inverse is just as cheap, <Tex>{'1/v_i'}</Tex> on the diagonal, and exists only
            when no <Tex>{'v_i'}</Tex> is zero.
          </li>
          <li>
            A <strong>symmetric matrix</strong> equals its own transpose:{' '}
            <Tex>{'\\boldsymbol{A} = \\boldsymbol{A}^\\top'}</Tex>. A table of distances between
            points is symmetric, because the distance from <Tex>{'i'}</Tex> to <Tex>{'j'}</Tex> is
            the distance from <Tex>{'j'}</Tex> to <Tex>{'i'}</Tex>.
          </li>
          <li>
            A <strong>unit vector</strong> has length one:{' '}
            <Tex>{'\\|\\boldsymbol{x}\\|_2 = 1'}</Tex>.
          </li>
          <li>
            Two vectors are <strong>orthogonal</strong> when{' '}
            <Tex>{'\\boldsymbol{x}^\\top \\boldsymbol{y} = 0'}</Tex>. If both are non-zero, they are
            at a right angle. If they also have length one, they are <strong>orthonormal</strong>.
          </li>
          <li>
            An <strong>orthogonal matrix</strong> is a square matrix whose rows are orthonormal to
            each other and whose columns are orthonormal to each other:{' '}
            <Tex>
              {
                '\\boldsymbol{A}^\\top \\boldsymbol{A} = \\boldsymbol{A}\\boldsymbol{A}^\\top = \\boldsymbol{I}'
              }
            </Tex>
            . So its inverse costs nothing to find:{' '}
            <Tex>{'\\boldsymbol{A}^{-1} = \\boldsymbol{A}^\\top'}</Tex>. Rotations and mirror flips
            are orthogonal matrices.
          </li>
        </ul>
      </Section>

      <Section index={6}>
        <p>
          The book opens this section with whole numbers. Writing 12 as{' '}
          <Tex>{'2 \\times 2 \\times 3'}</Tex> tells you things that the digits “12” hide, such as
          that 12 is not divisible by 5. Matrices can be broken into parts in the same way, and the
          parts show what the matrix does.
        </p>
        <p>
          An <strong>eigenvector</strong> of a square matrix <Tex>{'\\boldsymbol{A}'}</Tex> is a
          non-zero vector <Tex>{'\\boldsymbol{v}'}</Tex> that the matrix only scales and does not
          turn:
        </p>
        <Tex block>{'\\boldsymbol{A}\\boldsymbol{v} = \\lambda \\boldsymbol{v}'}</Tex>
        <p>
          The scalar <Tex>{'\\lambda'}</Tex> is the <strong>eigenvalue</strong> that belongs to this
          eigenvector. Any scaled copy of <Tex>{'\\boldsymbol{v}'}</Tex> is an eigenvector with the
          same eigenvalue, so we usually pick the copy of length one.
        </p>
        <EigenFigure />
        <p>
          If <Tex>{'\\boldsymbol{A}'}</Tex> has <Tex>{'n'}</Tex> linearly independent eigenvectors,
          put them as columns into a matrix <Tex>{'\\boldsymbol{V}'}</Tex> and the eigenvalues into
          a vector <Tex>{'\\boldsymbol{\\lambda}'}</Tex>. Then the{' '}
          <strong>eigendecomposition</strong> is
        </p>
        <Tex block>
          {
            '\\boldsymbol{A} = \\boldsymbol{V} \\operatorname{diag}(\\boldsymbol{\\lambda})\\, \\boldsymbol{V}^{-1}'
          }
        </Tex>
        <p>
          Not every matrix has one, and some need complex numbers. But every{' '}
          <strong>real symmetric</strong> matrix has one with real numbers only:
        </p>
        <Tex block>
          {'\\boldsymbol{A} = \\boldsymbol{Q} \\boldsymbol{\\Lambda} \\boldsymbol{Q}^\\top'}
        </Tex>
        <p>
          where <Tex>{'\\boldsymbol{Q}'}</Tex> is an orthogonal matrix of eigenvectors and{' '}
          <Tex>{'\\boldsymbol{\\Lambda}'}</Tex> is diagonal. You can read this as: the matrix
          stretches space by <Tex>{'\\lambda_i'}</Tex> in the direction of eigenvector{' '}
          <Tex>{'i'}</Tex>. That is what the picture shows.
        </p>
        <p>The eigenvalues tell you a lot at a glance:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>The matrix is singular exactly when one of its eigenvalues is zero.</li>
          <li>
            All eigenvalues positive: the matrix is <strong>positive definite</strong>. All positive
            or zero: <strong>positive semidefinite</strong>, which guarantees{' '}
            <Tex>{'\\boldsymbol{x}^\\top \\boldsymbol{A} \\boldsymbol{x} \\ge 0'}</Tex> for every{' '}
            <Tex>{'\\boldsymbol{x}'}</Tex>. Negative definite and negative semidefinite are the
            mirror cases.
          </li>
          <li>
            For unit vectors <Tex>{'\\boldsymbol{x}'}</Tex>, the largest value of{' '}
            <Tex>{'\\boldsymbol{x}^\\top \\boldsymbol{A} \\boldsymbol{x}'}</Tex> is the largest
            eigenvalue, and the smallest value is the smallest eigenvalue.
          </li>
        </ul>
      </Section>

      <Section index={7}>
        <p>
          The eigendecomposition only works for some square matrices. The{' '}
          <strong>singular value decomposition</strong> (SVD) works for every real matrix, of any
          shape. It writes <Tex>{'\\boldsymbol{A}'}</Tex> as a product of three matrices:
        </p>
        <Tex block>{'\\boldsymbol{A} = \\boldsymbol{U} \\boldsymbol{D} \\boldsymbol{V}^\\top'}</Tex>
        <p>
          If <Tex>{'\\boldsymbol{A}'}</Tex> is <Tex>{'m \\times n'}</Tex>, then{' '}
          <Tex>{'\\boldsymbol{U}'}</Tex> is <Tex>{'m \\times m'}</Tex>,{' '}
          <Tex>{'\\boldsymbol{D}'}</Tex> is <Tex>{'m \\times n'}</Tex>, and{' '}
          <Tex>{'\\boldsymbol{V}'}</Tex> is <Tex>{'n \\times n'}</Tex>.{' '}
          <Tex>{'\\boldsymbol{U}'}</Tex> and <Tex>{'\\boldsymbol{V}'}</Tex> are orthogonal.{' '}
          <Tex>{'\\boldsymbol{D}'}</Tex> is diagonal, though not always square. In pictures: turn,
          stretch along the axes, turn again.
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            The diagonal entries of <Tex>{'\\boldsymbol{D}'}</Tex> are the{' '}
            <strong>singular values</strong>.
          </li>
          <li>
            The columns of <Tex>{'\\boldsymbol{U}'}</Tex> are the{' '}
            <strong>left-singular vectors</strong>: the eigenvectors of{' '}
            <Tex>{'\\boldsymbol{A}\\boldsymbol{A}^\\top'}</Tex>.
          </li>
          <li>
            The columns of <Tex>{'\\boldsymbol{V}'}</Tex> are the{' '}
            <strong>right-singular vectors</strong>: the eigenvectors of{' '}
            <Tex>{'\\boldsymbol{A}^\\top\\boldsymbol{A}'}</Tex>.
          </li>
          <li>
            The non-zero singular values are the square roots of the eigenvalues of{' '}
            <Tex>{'\\boldsymbol{A}^\\top\\boldsymbol{A}'}</Tex>.
          </li>
        </ul>
        <p>
          The book says the most useful feature of the SVD is that it lets us partly extend
          inversion to matrices that are not square. The result is the{' '}
          <strong>Moore-Penrose pseudoinverse</strong>:
        </p>
        <Tex block>
          {'\\boldsymbol{A}^{+} = \\boldsymbol{V} \\boldsymbol{D}^{+} \\boldsymbol{U}^\\top'}
        </Tex>
        <p>
          To get <Tex>{'\\boldsymbol{D}^{+}'}</Tex>, replace every non-zero entry of{' '}
          <Tex>{'\\boldsymbol{D}'}</Tex> by one over that entry, then take the transpose. The
          pseudoinverse gives a sensible answer even when{' '}
          <Tex>{'\\boldsymbol{A}\\boldsymbol{x} = \\boldsymbol{y}'}</Tex> has no exact solution or
          has many:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            More columns than rows (many solutions):{' '}
            <Tex>{'\\boldsymbol{x} = \\boldsymbol{A}^{+}\\boldsymbol{y}'}</Tex> is the solution with
            the smallest length <Tex>{'\\|\\boldsymbol{x}\\|_2'}</Tex>.
          </li>
          <li>
            More rows than columns (maybe no solution): it gives the <Tex>{'\\boldsymbol{x}'}</Tex>{' '}
            that brings <Tex>{'\\boldsymbol{A}\\boldsymbol{x}'}</Tex> as close to{' '}
            <Tex>{'\\boldsymbol{y}'}</Tex> as possible.
          </li>
        </ul>
      </Section>

      <Section index={8}>
        <p>Two numbers sum up a square matrix.</p>
        <p>
          The <strong>trace</strong> adds up the diagonal:
        </p>
        <Tex block>{'\\operatorname{Tr}(\\boldsymbol{A}) = \\sum_i A_{i,i}'}</Tex>
        <p>
          It makes some formulas shorter. The Frobenius norm becomes{' '}
          <Tex>
            {
              '\\|\\boldsymbol{A}\\|_F = \\sqrt{\\operatorname{Tr}(\\boldsymbol{A}\\boldsymbol{A}^\\top)}'
            }
          </Tex>
          . The trace does not change under the transpose,{' '}
          <Tex>
            {'\\operatorname{Tr}(\\boldsymbol{A}) = \\operatorname{Tr}(\\boldsymbol{A}^\\top)'}
          </Tex>
          , and it lets you move the last factor of a product to the front:
        </p>
        <Tex block>
          {
            '\\operatorname{Tr}(\\boldsymbol{A}\\boldsymbol{B}\\boldsymbol{C}) = \\operatorname{Tr}(\\boldsymbol{C}\\boldsymbol{A}\\boldsymbol{B}) = \\operatorname{Tr}(\\boldsymbol{B}\\boldsymbol{C}\\boldsymbol{A})'
          }
        </Tex>
        <p>
          The <strong>determinant</strong>, <Tex>{'\\det(\\boldsymbol{A})'}</Tex>, is the product of
          all the eigenvalues. Its absolute value says how much the matrix expands or shrinks space:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Determinant 0: space is squashed flat along at least one direction. All volume is lost,
            and the matrix is singular.
          </li>
          <li>Determinant 1: the matrix keeps volume the same.</li>
        </ul>
        <p>
          In the eigenvector picture above, the determinant is the area of the purple shape divided
          by the area of the circle.
        </p>
        <Practice id="05-matrices-as-transformations">See area change in Lesson 05</Practice>
      </Section>

      <Section index={9}>
        <p>
          The chapter ends by using its own tools to derive a real machine learning method:{' '}
          <strong>principal components analysis</strong> (PCA). The goal is lossy compression. Take{' '}
          <Tex>{'m'}</Tex> points in <Tex>{'\\mathbb{R}^n'}</Tex> and store each one with only{' '}
          <Tex>{'l'}</Tex> numbers, <Tex>{'l < n'}</Tex>, losing as little as possible.
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Decoding is chosen to be a matrix product:{' '}
            <Tex>{'g(\\boldsymbol{c}) = \\boldsymbol{D}\\boldsymbol{c}'}</Tex>, where the columns of{' '}
            <Tex>{'\\boldsymbol{D}'}</Tex> are orthonormal.
          </li>
          <li>
            The best code for a point is the one whose decoded version is closest to it in{' '}
            <Tex>{'L^2'}</Tex> norm. Working that out gives a very simple encoder:{' '}
            <Tex>{'\\boldsymbol{c} = \\boldsymbol{D}^\\top \\boldsymbol{x}'}</Tex>.
          </li>
          <li>
            So the full round trip is{' '}
            <Tex>{'r(\\boldsymbol{x}) = \\boldsymbol{D}\\boldsymbol{D}^\\top \\boldsymbol{x}'}</Tex>
            .
          </li>
          <li>
            The best <Tex>{'\\boldsymbol{D}'}</Tex> minimises the Frobenius norm of the error over
            all points. Stack the points as rows of a matrix <Tex>{'\\boldsymbol{X}'}</Tex>. The
            answer is the <Tex>{'l'}</Tex> eigenvectors of{' '}
            <Tex>{'\\boldsymbol{X}^\\top \\boldsymbol{X}'}</Tex> with the largest eigenvalues.
          </li>
        </ul>
        <p>
          In one derivation the book uses norms, the trace, orthogonal matrices, and eigenvectors.
          That is the point of the chapter: these few tools are enough to build and understand real
          learning algorithms.
        </p>
        <InTheModel>
          the toy model uses 4 numbers per word. Real models use thousands. PCA is one way to
          squeeze such vectors down to 2 numbers so that you can draw them on a plane.
        </InTheModel>
      </Section>
    </article>
  );
}
