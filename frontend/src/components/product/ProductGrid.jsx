import ProductCard from './ProductCard.jsx';
import { ProductGridSkeleton } from '../ui/Skeleton.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import { ShoppingBag } from 'lucide-react';
import { cx } from '../../utils/format.js';
import { useT } from '../../i18n/useT.js';

export default function ProductGrid({
  products = [],
  loading = false,
  skeletonCount = 8,
  emptyTitle,
  emptyDescription,
  emptyAction,
  columns = 'grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4',
  className,
}) {
  const { t } = useT();

  if (loading) {
    return <ProductGridSkeleton count={skeletonCount} />;
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title={emptyTitle || t('shop.emptyTitle')}
        description={emptyDescription || t('shop.emptyDescription')}
        action={emptyAction}
      />
    );
  }

  return (
    <div className={cx('grid', columns, className)}>
      {products.map((product, index) => (
        <ProductCard key={product._id} product={product} priority={index < 4} />
      ))}
    </div>
  );
}
