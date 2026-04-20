import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useSWR from "swr";
import {
  Autocomplete,
  Box,
  Chip,
  CircularProgress,
  Container,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { COLOR_BRAND } from "../../../common/constants/color.constant";
import { getShops, getFeaturedProducts } from "../../../apis/shops/shop.api";
import { getActiveBundles } from "../../../apis/bundles/bundle.api";
import type { Product } from "../../../apis/products/product.interface";
import { ProductBadge } from "../../../apis/products/product.enum";
import type { Bundle } from "../../../apis/bundles/bundle.interface";
import { VButton } from "../../../common/components";
import { useCart } from "../../../common/contexts/cart.context";

const badgeVisual: Record<string, { text: string; bg: string }> = {
  hot: { text: "#e53935", bg: "#ffeaea" },
  sale: { text: "#e65100", bg: "#fff3e0" },
  new: { text: "#1565c0", bg: "#e3f2fd" },
  none: { text: "#888", bg: "#f5f5f5" },
};

const featuredOrder = [
  ProductBadge.HOT,
  ProductBadge.SALE,
  ProductBadge.NEW,
] as const;

const sectionLabel: Record<string, string> = {
  [ProductBadge.HOT]: "Hot deals",
  [ProductBadge.SALE]: "On sale",
  [ProductBadge.NEW]: "Just arrived",
};

const resolveProductImageUrl = (imageUrl?: string): string => {
    if (!imageUrl) return '';
    if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
    const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
    const origin = apiUrl ? new URL(apiUrl, window.location.origin).origin : window.location.origin;
    return `${origin}/Volta${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
};

const extractArrayData = <T,>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  const nested = (payload as { data?: unknown } | undefined)?.data;
  return Array.isArray(nested) ? (nested as T[]) : [];
};

function HomeProductCard({
  product,
  onNavigate,
  onAddToCart,
}: {
  product: Product;
  onNavigate: () => void;
  onAddToCart: () => void;
}) {
  const style = badgeVisual[product.badge] ?? badgeVisual.none;
  const hasBadge = product.badge !== "none";
  const imageSrc = resolveProductImageUrl(product.image_url);

  return (
    <Box
      sx={{
        bgcolor: "#ffffff",
        borderRadius: "16px",
        border: hasBadge ? `2px solid ${style.text}` : "1px solid #f0f0f0",
        overflow: "hidden",
        position: "relative",
        transition: "transform 0.2s, box-shadow 0.2s, border 0.2s",
        boxShadow: hasBadge ? `0 0 0 1px ${style.bg}` : "none",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: hasBadge
            ? `0 8px 24px rgba(0,0,0,0.12), 0 0 0 1px ${style.bg}`
            : "0 8px 24px rgba(0,0,0,0.06)",
        },
      }}
    >
      {hasBadge && (
        <Chip
          label={product.badge.toUpperCase()}
          size="small"
          sx={{
            bgcolor: style.bg,
            color: style.text,
            fontSize: 10,
            fontWeight: 700,
            height: 24,
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 10,
          }}
        />
      )}
      <Box
        onClick={onNavigate}
        sx={{
          height: 180,
          bgcolor: "#fafafa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          overflow: "hidden",
        }}
      >
        {imageSrc ? (
          <Box
            component="img"
            src={imageSrc}
            alt={product.name}
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <Typography sx={{ color: "#ccc", fontSize: 13 }}>
            {product.name}
          </Typography>
        )}
      </Box>
      <Box sx={{ p: 2 }}>
        <Typography
          onClick={onNavigate}
          sx={{
            fontWeight: 600,
            fontSize: 14,
            color: "#1a1a1a",
            mb: 0.5,
            cursor: "pointer",
            lineHeight: 1.4,
          }}
        >
          {product.name}
        </Typography>
        <Typography sx={{ color: "#999", fontSize: 12, mb: 1 }}>
          {product.stock > 0 ? `In stock` : "Out of stock"}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: 18, color: "#1a1a1a" }}>
            ${Number(product.price).toFixed(2)}
          </Typography>
          <VButton
            variant="secondary"
            size="small"
            onClick={onAddToCart}
            disabled={product.stock <= 0}
            sx={{ borderRadius: "8px", fontSize: 12 }}
          >
            Add
          </VButton>
        </Box>
      </Box>
    </Box>
  );
}

function BundleCard({
  bundle,
  onAddToCart,
}: {
  bundle: Bundle;
  onAddToCart: () => void;
}) {
  const bundlePrice = Math.max(0, Number(bundle.bundle_price ?? 0));
  const totalProductPrice = Math.max(
    0,
    Number(bundle.total_product_price ?? bundlePrice),
  );
  const fallbackOff =
    totalProductPrice > 0
      ? ((totalProductPrice - bundlePrice) / totalProductPrice) * 100
      : 0;
  const normalizedOff = Math.max(
    0,
    Math.round(
      (Number(bundle.off_percentage ?? fallbackOff) + Number.EPSILON) * 100,
    ) / 100,
  );

  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: "18px",
        background:
          "linear-gradient(135deg, #121212 0%, #1f1f1f 55%, #2a2a2a 100%)",
        color: "#fff",
        minHeight: 190,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        border: "1px solid rgba(255,255,255,0.08)",
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&::before": {
          content: '""',
          position: "absolute",
          right: -24,
          top: -24,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(232,255,71,0.35), rgba(232,255,71,0))",
        },
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 14px 30px rgba(0,0,0,0.28)",
        },
      }}
    >
      {normalizedOff > 0 && (
        <Chip
          label={`SAVE ${normalizedOff.toFixed(2)}%`}
          size="medium"
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 1,
            bgcolor: COLOR_BRAND.accent,
            color: "#111",
            fontWeight: 800,
            height: 24,
            fontSize: 11,
          }}
        />
      )}

      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Typography sx={{ fontWeight: 800, mb: 0.5, fontSize: 17 }}>
          {bundle.name}
        </Typography>
        <Typography
          sx={{ color: "rgba(255,255,255,0.6)", fontSize: 13, lineHeight: 1.6 }}
        >
          {bundle.description || "Curated bundle for best value."}
        </Typography>
      </Box>

      <Box sx={{ mt: 2, position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              sx={{
                color: COLOR_BRAND.accent,
                fontWeight: 800,
                fontSize: 24,
                lineHeight: 1.1,
              }}
            >
              ${bundlePrice.toFixed(2)}
            </Typography>
            {totalProductPrice > bundlePrice && (
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.52)",
                  fontSize: 12,
                  textDecoration: "line-through",
                }}
              >
                ${totalProductPrice.toFixed(2)}
              </Typography>
            )}
          </Box>
          <VButton
            variant="secondary"
            size="small"
            onClick={onAddToCart}
            sx={{ borderRadius: "9px", fontSize: 12, minWidth: 78 }}
          >
            Add
          </VButton>
        </Box>
      </Box>
    </Box>
  );
}

export const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchTerm(searchInput.trim());
    }, 500);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const { data: searchedProducts, isLoading: searchLoading } = useSWR<
    Product[]
  >(debouncedSearchTerm ? ["shop-search", debouncedSearchTerm] : null, () =>
    getShops({ search: debouncedSearchTerm, page: 1, limit: 8 }).then(
      (res) => res.data.data,
    ),
  );

  const searchSuggestions = useMemo(() => {
    const names = (searchedProducts ?? []).map((p) => p.name).filter(Boolean);
    return Array.from(new Set(names)).slice(0, 6);
  }, [searchedProducts]);

  const { data: hotProducts, isLoading: hotLoading } = useSWR<Product[]>(
    ["featured", ProductBadge.HOT],
    () =>
      getFeaturedProducts({ badge: ProductBadge.HOT, limit: 4 }).then((res) =>
        extractArrayData<Product>(res.data),
      ),
  );

  const { data: saleProducts, isLoading: saleLoading } = useSWR<Product[]>(
    ["featured", ProductBadge.SALE],
    () =>
      getFeaturedProducts({ badge: ProductBadge.SALE, limit: 4 }).then((res) =>
        extractArrayData<Product>(res.data),
      ),
  );

  const { data: newProducts, isLoading: newLoading } = useSWR<Product[]>(
    ["featured", ProductBadge.NEW],
    () =>
      getFeaturedProducts({ badge: ProductBadge.NEW, limit: 4 }).then((res) =>
        extractArrayData<Product>(res.data),
      ),
  );

  const { data: bundles, isLoading: bundleLoading } = useSWR<Bundle[]>(
    ["bundles-active"],
    () => getActiveBundles().then((res) => extractArrayData<Bundle>(res.data)),
  );

  const { data: availableProducts, isLoading: availableLoading } = useSWR<
    Product[]
  >(["shop-available"], () =>
    getShops({ search: "", page: 1, limit: 24 }).then((res) => res.data.data),
  );

  const randomAvailable = useMemo(() => {
    const source = [...(availableProducts ?? [])];
    for (let i = source.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [source[i], source[j]] = [source[j], source[i]];
    }
    return source.slice(0, 8);
  }, [availableProducts]);

  const featuredMap: Record<string, Product[] | undefined> = {
    [ProductBadge.HOT]: hotProducts,
    [ProductBadge.SALE]: saleProducts,
    [ProductBadge.NEW]: newProducts,
  };

  const featuredLoading: Record<string, boolean> = {
    [ProductBadge.HOT]: hotLoading,
    [ProductBadge.SALE]: saleLoading,
    [ProductBadge.NEW]: newLoading,
  };

  const handleAddToCart = async (product: Product) => {
    await addToCart({ product_id: product.id, quantity: 1 });
  };

  const handleAddBundleToCart = async (bundle: Bundle) => {
    await addToCart({ item_type: "bundle", bundle_id: bundle.id, quantity: 1 });
  };

  return (
    <Box sx={{ bgcolor: "#ffffff" }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Hero */}
        <Box
          sx={{
            mb: 5,
            p: { xs: 3, md: 5 },
            borderRadius: "20px",
            bgcolor: "#1a1a1a",
            color: "#fff",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Syne", sans-serif',
              fontSize: { xs: 28, md: 40 },
              fontWeight: 800,
              mb: 1,
              lineHeight: 1.2,
            }}
          >
            Technology for
            <br />
            <Box component="span" sx={{ color: COLOR_BRAND.accent }}>
              everyone.
            </Box>
          </Typography>
          <Typography
            sx={{ color: "rgba(255,255,255,0.6)", mb: 3, maxWidth: 480 }}
          >
            Discover premium tech products at competitive prices. From gadgets
            to gear, we have it all.
          </Typography>

          <Box sx={{ maxWidth: 480 }}>
            <Autocomplete
              freeSolo
              options={searchSuggestions}
              inputValue={searchInput}
              onInputChange={(_e, value) => setSearchInput(value)}
              onChange={(_e, value) => {
                if (typeof value === "string") setSearchInput(value);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search products..."
                  size="small"
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment
                            position="start"
                            sx={{ color: "#999" }}
                          >
                            <SearchIcon sx={{ fontSize: 18 }} />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    },
                  }}
                  sx={{
                    flex: 1,
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "rgba(255,255,255,0.1)",
                      color: "#fff",
                      borderRadius: "10px",
                      "& fieldset": {
                        borderColor: "rgba(255,255,255,0.15)",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(255,255,255,0.3)",
                      },
                    },
                    "& input::placeholder": {
                      color: "rgba(255,255,255,0.4)",
                    },
                  }}
                />
              )}
              sx={{
                "& .MuiAutocomplete-paper": {
                  borderRadius: "10px",
                },
              }}
            />
          </Box>

          {debouncedSearchTerm && (
            <Box sx={{ mt: 2 }}>
              {searchLoading ? (
                <CircularProgress
                  size={18}
                  sx={{ color: COLOR_BRAND.accent }}
                />
              ) : (
                <Typography
                  sx={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}
                >
                  {(searchedProducts ?? []).length} results found
                </Typography>
              )}
            </Box>
          )}
        </Box>

        {/* Search results */}
        {debouncedSearchTerm &&
          !searchLoading &&
          (searchedProducts ?? []).length > 0 && (
            <Box sx={{ mb: 5 }}>
              <Typography
                sx={{ fontSize: 20, fontWeight: 700, mb: 2, color: "#1a1a1a" }}
              >
                Search Results
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    lg: "repeat(4, 1fr)",
                  },
                  gap: 2,
                }}
              >
                {(searchedProducts ?? []).map((product) => (
                  <HomeProductCard
                    key={`search-${product.id}`}
                    product={product}
                    onNavigate={() => navigate(`/shop/${product.id}`)}
                    onAddToCart={() => handleAddToCart(product)}
                  />
                ))}
              </Box>
            </Box>
          )}

        {/* Featured sections */}
        {featuredOrder.map((badge) => (
          <Box key={badge} sx={{ mb: 5 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Typography
                sx={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a" }}
              >
                {sectionLabel[badge]}
              </Typography>
              <Box
                onClick={() => navigate("/shop")}
                sx={{
                  fontSize: 13,
                  color: "#999",
                  cursor: "pointer",
                  "&:hover": { color: "#555" },
                }}
              >
                View all
              </Box>
            </Box>

            {featuredLoading[badge] ? (
              <CircularProgress size={20} sx={{ color: "#1a1a1a" }} />
            ) : (featuredMap[badge] ?? []).length > 0 ? (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    lg: "repeat(4, 1fr)",
                  },
                  gap: 2,
                }}
              >
                {(featuredMap[badge] ?? []).map((product) => (
                  <HomeProductCard
                    key={`${badge}-${product.id}`}
                    product={product}
                    onNavigate={() => navigate(`/shop/${product.id}`)}
                    onAddToCart={() => handleAddToCart(product)}
                  />
                ))}
              </Box>
            ) : (
              <Typography sx={{ color: "#ccc", fontSize: 13 }}>
                No products yet
              </Typography>
            )}
          </Box>
        ))}

        {/* Bundles */}
        <Box sx={{ mb: 5 }}>
          <Typography
            sx={{ fontSize: 20, fontWeight: 700, mb: 2, color: "#1a1a1a" }}
          >
            Bundles
          </Typography>
          {bundleLoading ? (
            <CircularProgress size={20} sx={{ color: "#1a1a1a" }} />
          ) : (bundles ?? []).length > 0 ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, 1fr)",
                  xl: "repeat(3, 1fr)",
                },
                gap: 2,
              }}
            >
              {(bundles ?? []).map((bundle) => (
                <BundleCard
                  key={`bundle-${bundle.id}`}
                  bundle={bundle}
                  onAddToCart={() => handleAddBundleToCart(bundle)}
                />
              ))}
            </Box>
          ) : (
            <Typography sx={{ color: "#ccc", fontSize: 13 }}>
              No bundles available
            </Typography>
          )}
        </Box>

        {/* Available products */}
        <Box>
          <Typography
            sx={{ fontSize: 20, fontWeight: 700, mb: 2, color: "#1a1a1a" }}
          >
            Explore more
          </Typography>
          {availableLoading ? (
            <CircularProgress size={20} sx={{ color: "#1a1a1a" }} />
          ) : randomAvailable.length > 0 ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  lg: "repeat(4, 1fr)",
                },
                gap: 2,
              }}
            >
              {randomAvailable.map((product) => (
                <HomeProductCard
                  key={`available-${product.id}`}
                  product={product}
                  onNavigate={() => navigate(`/shop/${product.id}`)}
                  onAddToCart={() => handleAddToCart(product)}
                />
              ))}
            </Box>
          ) : (
            <Typography sx={{ color: "#ccc", fontSize: 13 }}>
              No products available
            </Typography>
          )}
        </Box>
      </Container>
    </Box>
  );
};
