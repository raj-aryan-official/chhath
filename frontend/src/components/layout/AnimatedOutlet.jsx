import { Suspense } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import PageTransition from './PageTransition.jsx';
import SunLoader from '../brand/SunLoader.jsx';

export default function AnimatedOutlet() {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <PageTransition key={location.pathname}>
      <Suspense fallback={<SunLoader />}>{outlet}</Suspense>
    </PageTransition>
  );
}
