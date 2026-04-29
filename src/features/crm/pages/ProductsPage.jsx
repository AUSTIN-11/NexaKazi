import { useEffect, useState } from "react";
import ProductForm from "../components/ProductForm";
import OfflineBadge from "../components/OfflineBadge";
import useOnlineStatus from "../hooks/useOnlineStatus";
import { createProduct, getProducts, syncCrmQueue } from "../services/crmApi";
import { getSyncQueue } from "../services/crmStorage";

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(getSyncQueue().length);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        if (isOnline) {
          const result = await syncCrmQueue();
          if (isMounted) {
            setPendingSyncCount(result.pending);
          }
        }

        const data = await getProducts();
        if (isMounted) {
          setProducts(data);
          setError("");
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [isOnline]);

  const handleCreateProduct = async (form) => {
    setIsSubmitting(true);
    try {
      await createProduct(form);
      setProducts(await getProducts());
      setPendingSyncCount(getSyncQueue().length);
      return true;
    } catch (createError) {
      setError(createError.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSync = async () => {
    const result = await syncCrmQueue();
    setPendingSyncCount(result.pending);
    setProducts(await getProducts());
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">
          Products
        </p>
        <h1 className="text-2xl font-semibold text-white">Stock register</h1>
      </div>

      <OfflineBadge
        isOnline={isOnline}
        pendingSyncCount={pendingSyncCount}
        onSync={handleSync}
      />

      <ProductForm onSubmit={handleCreateProduct} isSubmitting={isSubmitting} />

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      <div className="grid gap-3">
        {products.length ? (
          products.map((product) => (
            <div
              key={product._id}
              className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 px-4 py-4"
            >
              <div>
                <p className="font-medium text-white">{product.name}</p>
                <p className="text-sm text-slate-400">
                  Stock: {Number(product.stock || 0).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-white">
                  KES {Number(product.price || 0).toLocaleString()}
                </p>
                {product.isPendingSync ? (
                  <p className="text-xs uppercase text-amber-300">Pending sync</p>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">
            No products yet.
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductsPage;
