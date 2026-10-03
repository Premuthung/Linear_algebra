import { LESSON_COMPONENTS } from './lessons';
import { Home } from './pages/Home';
import { Playground } from './pages/Playground';
import { useRoute } from './router';

export default function App() {
  const [page, id, step] = useRoute();

  if (page === 'playground') return <Playground />;
  if (page === 'lesson' && id && LESSON_COMPONENTS[id]) {
    const Lesson = LESSON_COMPONENTS[id];
    // The key gives each lesson a fresh mount when you move between lessons.
    return <Lesson key={id} step={Number(step) || 0} />;
  }
  return <Home />;
}
