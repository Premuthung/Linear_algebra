import type { ComponentType } from 'react';
import VectorsLesson from './01-vectors/Lesson';
import AddScaleLesson from './02-add-scale-flip/Lesson';
import SpanLesson from './03-span-and-combinations/Lesson';
import BasisLesson from './04-basis-and-coordinates/Lesson';
import MatrixLesson from './05-matrices-as-transformations/Lesson';

/** Lesson id → the component that renders it. Lessons that are not built yet are missing here. */
export const LESSON_COMPONENTS: Record<string, ComponentType<{ step: number }>> = {
  '01-vectors': VectorsLesson,
  '02-add-scale-flip': AddScaleLesson,
  '03-span-and-combinations': SpanLesson,
  '04-basis-and-coordinates': BasisLesson,
  '05-matrices-as-transformations': MatrixLesson,
};
