import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import Seo from '../components/seo/Seo.jsx';
import Button from '../components/ui/Button.jsx';
import DiyaDivider from '../components/brand/DiyaDivider.jsx';
import { KharnaMark } from '../components/brand/KharnaLogo.jsx';

export default function NotFound() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 sun-rays opacity-60" aria-hidden="true" />
      <div className="container-page relative flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
        <Seo
          title="Page not found"
          description="This page could not be found. Return to the KHARNA store for Chhath Puja sarees."
          noIndex
        />

        <KharnaMark className="h-20 w-20 animate-float-y" />
        <p className="mt-6 font-display text-6xl text-sun-500">404</p>
        <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
          This diya is not on our shelf.
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-bamboo-700">
          The page may have moved, or the link may have a small mistake. The sarees, however, are
          right where you left them.
        </p>

        <DiyaDivider className="mx-auto mt-6" />

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button to="/shop">
            <Search className="h-4 w-4" aria-hidden="true" />
            Browse sarees
          </Button>
          <Button to="/" variant="secondary">
            Back home
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-bamboo-700">
          <Link to="/faq" className="hover:text-sindoor-700">
            FAQ
          </Link>
          <Link to="/shipping-returns" className="hover:text-sindoor-700">
            Shipping &amp; returns
          </Link>
          <Link to="/contact" className="hover:text-sindoor-700">
            Contact us
          </Link>
          <Link to="/account/orders" className="hover:text-sindoor-700">
            Track an order
          </Link>
        </div>
      </div>
    </div>
  );
}
