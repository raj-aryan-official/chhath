import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Heart } from 'lucide-react';
import Seo from '../components/seo/Seo.jsx';
import ProductGrid from '../components/product/ProductGrid.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Button from '../components/ui/Button.jsx';
import { fetchWishlist } from '../store/slices/wishlistSlice.js';

export default function Wishlist() {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.wishlist.products);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    dispatch(fetchWishlist())
      .unwrap()
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [dispatch]);

  return (
    <>
      <Seo title="Wishlist" noIndex path="/wishlist" />
      <div className="container-page py-10">
        <p className="eyebrow">Your account</p>
        <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">Wishlist</h1>
        <p className="mt-1 text-sm text-bamboo-700">
          Sarees you have saved for later. They stay here until you remove them.
        </p>

        <div className="mt-8">
          {!loading && products.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="Nothing saved yet"
              description="Tap the heart on any saree to keep it here while you decide."
              action={<Button to="/shop">Browse the collection</Button>}
            />
          ) : (
            <ProductGrid
              products={products}
              loading={loading}
              skeletonCount={4}
              emptyTitle="Nothing saved yet"
            />
          )}
        </div>
      </div>
    </>
  );
}
