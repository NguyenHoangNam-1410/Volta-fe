import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useSWR from "swr";
import {
  Box,
  Container,
  Typography,
  Select,
  MenuItem,
  Pagination,
  Slider,
  CircularProgress,
  Chip,
} from "@mui/material";
import { getShops, getShopCategories } from "../../../../apis/shops/shop.api";
import type { Product } from "../../../../apis/products/product.interface";
import type { Category } from "../../../../apis/categories/category.interface";
import { VButton } from "../../../../common/components";
import { VBreadcrumb } from "../../../../common/components/VBreadcrumb";
import { useCart } from "../../../../common/contexts/cart.context";

const badgeVisual: Record<string, { text: string; bg: string }> = {
  hot: { text: "#e53935", bg: "#ffeaea" },
  sale: { text: "#e65100", bg: "#fff3e0" },
  new: { text: "#1565c0", bg: "#e3f2fd" },
  none: { text: "#888", bg: "#f5f5f5" },
};

const resolveProductImageUrl = (imageUrl?: string): string => {
  if (!imageUrl) return "";
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
  const origin = apiUrl
    ? new URL(apiUrl, window.location.origin).origin
    : window.location.origin;
  return `${origin}${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`;
};

export const ShopScreen: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState<number[]>([0, 10000]);
  const limit = 12;

  const { data: categories } = useSWR<Category[]>("shop-categories", () =>
    getShopCategories().then(
      (r) => (r as unknown as { data: { data: Category[] } }).data.data,
    ),
  );

  const { data: shopRes, isLoading } = useSWR(
    ["shop-products", page, categoryId, sortBy],
    () =>
      getShops({
        search: "",
        page,
        limit,
        category_id: categoryId || undefined,
      }).then((r) => r.data),
  );

  const products: Product[] = shopRes?.data ?? [];
  const total = shopRes?.pagination?.total ?? 0;
  const totalPages = Math.ceil(total / limit) || 1;

  useEffect(() => {
    setPage(1);
  }, [categoryId, sortBy]);

  const filteredProducts = products.filter(
    (p) => p.price >= priceRange[0] && p.price <= priceRange[1],
  );

  const sorted = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price_asc") return a.price - b.price;
    if (sortBy === "price_desc") return b.price - a.price;
    if (sortBy === "name") return a.name.localeCompare(b.name);
    return 0;
  });

  const handleAddToCart = async (product: Product) => {
    await addToCart({ product_id: product.id, quantity: 1 });
  };

  return (
    <Box sx={{ bgcolor: "#ffffff" }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <VBreadcrumb
          items={[{ label: "Home", path: "/" }, { label: "Shop" }]}
        />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontFamily: '"Syne", sans-serif',
                fontSize: 28,
                fontWeight: 800,
                color: "#1a1a1a",
              }}
            >
              Shop
            </Typography>
            <Typography sx={{ color: "#999", fontSize: 14 }}>
              Browse our tech collection
            </Typography>
          </Box>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            size="small"
            sx={{
              minWidth: 180,
              borderRadius: "10px",
              fontSize: 13,
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e8e8e8" },
            }}
          >
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="price_asc">Price: Low to High</MenuItem>
            <MenuItem value="price_desc">Price: High to Low</MenuItem>
            <MenuItem value="name">Name A-Z</MenuItem>
          </Select>
        </Box>

        <Box sx={{ display: "flex", gap: 4 }}>
          {/* Sidebar filters */}
          <Box
            sx={{
              width: 220,
              flexShrink: 0,
              display: { xs: "none", md: "block" },
            }}
          >
            <Box sx={{ mb: 3 }}>
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  mb: 1.5,
                  color: "#999",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Category
              </Typography>
              <Box
                onClick={() => setCategoryId("")}
                sx={{
                  py: 0.75,
                  px: 1.5,
                  borderRadius: "8px",
                  cursor: "pointer",
                  bgcolor: categoryId === "" ? "#1a1a1a" : "transparent",
                  color: categoryId === "" ? "#fff" : "#555",
                  fontWeight: categoryId === "" ? 600 : 400,
                  fontSize: 13,
                  mb: 0.5,
                  transition: "all 0.15s",
                  "&:hover": {
                    bgcolor: categoryId === "" ? "#1a1a1a" : "#f5f5f5",
                  },
                }}
              >
                All
              </Box>
              {(Array.isArray(categories) ? categories : []).map((cat) => (
                <Box
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  sx={{
                    py: 0.75,
                    px: 1.5,
                    borderRadius: "8px",
                    cursor: "pointer",
                    bgcolor: categoryId === cat.id ? "#1a1a1a" : "transparent",
                    color: categoryId === cat.id ? "#fff" : "#555",
                    fontWeight: categoryId === cat.id ? 600 : 400,
                    fontSize: 13,
                    mb: 0.5,
                    transition: "all 0.15s",
                    "&:hover": {
                      bgcolor: categoryId === cat.id ? "#1a1a1a" : "#f5f5f5",
                    },
                  }}
                >
                  {cat.name}
                </Box>
              ))}
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  mb: 1.5,
                  color: "#999",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Price Range
              </Typography>
              <Slider
                value={priceRange}
                onChange={(_e, v) => setPriceRange(v as number[])}
                valueLabelDisplay="auto"
                min={0}
                max={10000}
                sx={{
                  color: "#1a1a1a",
                  "& .MuiSlider-thumb": {
                    bgcolor: "#fff",
                    border: "2px solid #1a1a1a",
                    width: 16,
                    height: 16,
                  },
                  "& .MuiSlider-track": { bgcolor: "#1a1a1a" },
                  "& .MuiSlider-rail": { bgcolor: "#e0e0e0" },
                }}
              />
              <Typography sx={{ fontSize: 12, color: "#999" }}>
                ${priceRange[0]} - ${priceRange[1]}
              </Typography>
            </Box>
          </Box>

          {/* Products grid */}
          <Box sx={{ flex: 1 }}>
            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress sx={{ color: "#1a1a1a" }} />
              </Box>
            ) : (
              <>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, 1fr)",
                      lg: "repeat(3, 1fr)",
                      xl: "repeat(4, 1fr)",
                    },
                    gap: 2,
                  }}
                >
                  {sorted.map((product) => {
                    const style =
                      badgeVisual[product.badge] ?? badgeVisual.none;
                    const hasBadge = product.badge !== "none";
                    const imageSrc = resolveProductImageUrl(product.image_url);
                    return (
                      <Box
                        key={product.id}
                        sx={{
                          bgcolor: "#ffffff",
                          borderRadius: "16px",
                          border: hasBadge
                            ? `2px solid ${style.text}`
                            : "1px solid #f0f0f0",
                          overflow: "hidden",
                          position: "relative",
                          transition:
                            "transform 0.2s, box-shadow 0.2s, border 0.2s",
                          boxShadow: hasBadge
                            ? `0 0 0 1px ${style.bg}`
                            : "none",
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
                          onClick={() => navigate(`/shop/${product.id}`)}
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
                              sx={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
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
                            onClick={() => navigate(`/shop/${product.id}`)}
                            sx={{
                              fontWeight: 600,
                              fontSize: 14,
                              color: "#1a1a1a",
                              mb: 0.5,
                              cursor: "pointer",
                            }}
                          >
                            {product.name}
                          </Typography>
                          <Typography
                            sx={{ color: "#999", fontSize: 12, mb: 1.5 }}
                          >
                            {product.stock > 0
                              ? `In stock (${product.stock})`
                              : "Out of stock"}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography
                              sx={{
                                fontWeight: 700,
                                fontSize: 18,
                                color: "#1a1a1a",
                              }}
                            >
                              ${Number(product.price).toFixed(2)}
                            </Typography>
                            <VButton
                              variant="secondary"
                              size="small"
                              onClick={() => handleAddToCart(product)}
                              disabled={product.stock <= 0}
                              sx={{ borderRadius: "8px", fontSize: 12 }}
                            >
                              Add
                            </VButton>
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>

                {sorted.length === 0 && (
                  <Box sx={{ textAlign: "center", py: 8 }}>
                    <Typography sx={{ color: "#999" }}>
                      No products found
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_e, v) => setPage(v)}
                    sx={{
                      "& .Mui-selected": {
                        bgcolor: "#1a1a1a !important",
                        color: "#fff",
                        fontWeight: 700,
                      },
                    }}
                  />
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
