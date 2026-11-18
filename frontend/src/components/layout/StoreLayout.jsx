import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import AnimatedOutlet from './AnimatedOutlet.jsx';

export default function StoreLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="main-content" className="flex-1">
        <AnimatedOutlet />
      </main>
      <Footer />
    </div>
  );
}
