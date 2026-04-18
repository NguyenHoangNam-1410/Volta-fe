import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Container, Typography, CircularProgress } from "@mui/material";
import { useCart } from "../../../../common/contexts/cart.context";
import { VButton } from "../../../../common/components";
import { VBreadcrumb } from "../../../../common/components/VBreadcrumb";

export const CartScreen: React.FC = () => {
  const navigate = useNavigate();
  const { cart, loading, updateQty, removeItem } = useCart();
  const items = Array.isArray(cart?.items) ? cart.items : [];

  const getLineLabel = (item: (typeof items)[number]): string =>
    item.bundle_name ?? item.product_name ?? "Item";

  const getLineUnitPrice = (item: (typeof items)[number]): number =>
    Number(item.bundle_price ?? item.product_price ?? 0);

  const getLineHref = (item: (typeof items)[number]): string | null => {
    if (item.item_type === "bundle") return null;
    if (typeof item.product_id === "number") return `/shop/${item.product_id}`;
    return null;
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress sx={{ color: "#1a1a1a" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#ffffff" }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <VBreadcrumb
          items={[{ label: "Home", path: "/" }, { label: "Cart" }]}
        />

        <Typography
          sx={{
            fontFamily: '"Syne", sans-serif',
            fontSize: 28,
            fontWeight: 800,
            mb: 3,
            color: "#1a1a1a",
          }}
        >
          Your Cart
        </Typography>

        {items.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              borderRadius: "20px",
              border: "1px solid #f0f0f0",
            }}
          >
            <Typography sx={{ color: "#999", mb: 2, fontSize: 15 }}>
              Your cart is empty
            </Typography>
            <VButton variant="secondary" onClick={() => navigate("/shop")}>
              Continue Shopping
            </VButton>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              gap: 4,
              flexDirection: { xs: "column", md: "row" },
            }}
          >
            {/* Items */}
            <Box sx={{ flex: 1 }}>
              {items.map((item, idx) => (
                <Box
                  key={item.id}
                  sx={{
                    display: "flex",
                    gap: 2,
                    py: 2.5,
                    alignItems: "center",
                    borderBottom:
                      idx < items.length - 1 ? "1px solid #f0f0f0" : "none",
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: "12px",
                      bgcolor: "#fafafa",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      border: "1px solid #f0f0f0",
                    }}
                  >
                    {item.image_url ? (
                      <Box
                        component="img"
                        src={item.image_url}
                        alt={getLineLabel(item)}
                        sx={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <Typography sx={{ fontSize: 10, color: "#ccc" }}>
                        {getLineLabel(item)}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    {getLineHref(item) ? (
                      <Typography
                        onClick={() => navigate(getLineHref(item) as string)}
                        sx={{
                          fontWeight: 600,
                          fontSize: 14,
                          cursor: "pointer",
                          color: "#1a1a1a",
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        {getLineLabel(item)}
                      </Typography>
                    ) : (
                      <Typography
                        sx={{ fontWeight: 600, fontSize: 14, color: "#1a1a1a" }}
                      >
                        {getLineLabel(item)}
                      </Typography>
                    )}
                    <Typography sx={{ fontSize: 13, color: "#999" }}>
                      ${getLineUnitPrice(item).toFixed(2)} each
                    </Typography>
                  </Box>

                  {/* Qty stepper */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      border: "1px solid #e8e8e8",
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      onClick={() => {
                        if (item.quantity > 1) {
                          updateQty(
                            item.item_type === "bundle"
                              ? {
                                  item_type: "bundle",
                                  bundle_id: item.bundle_id,
                                  quantity: item.quantity - 1,
                                }
                              : {
                                  item_type: "product",
                                  product_id: item.product_id,
                                  quantity: item.quantity - 1,
                                },
                          );
                        }
                      }}
                      sx={{
                        width: 32,
                        height: 36,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "#555",
                        "&:hover": { bgcolor: "#f8f8f8" },
                      }}
                    >
                      -
                    </Box>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 600,
                        fontSize: 13,
                        borderLeft: "1px solid #e8e8e8",
                        borderRight: "1px solid #e8e8e8",
                      }}
                    >
                      {item.quantity}
                    </Box>
                    <Box
                      onClick={() =>
                        updateQty(
                          item.item_type === "bundle"
                            ? {
                                item_type: "bundle",
                                bundle_id: item.bundle_id,
                                quantity: item.quantity + 1,
                              }
                            : {
                                item_type: "product",
                                product_id: item.product_id,
                                quantity: item.quantity + 1,
                              },
                        )
                      }
                      sx={{
                        width: 32,
                        height: 36,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "#555",
                        "&:hover": { bgcolor: "#f8f8f8" },
                      }}
                    >
                      +
                    </Box>
                  </Box>

                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: 15,
                      minWidth: 80,
                      textAlign: "right",
                      color: "#1a1a1a",
                    }}
                  >
                    ${Number(item.line_total).toFixed(2)}
                  </Typography>

                  <Box
                    onClick={() =>
                      removeItem(item.item_id ?? item.id, item.item_type)
                    }
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "#ccc",
                      fontSize: 16,
                      transition: "all 0.15s",
                      "&:hover": { bgcolor: "#fef2f2", color: "#ef4444" },
                    }}
                  >
                    x
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Summary */}
            <Box
              sx={{
                width: { xs: "100%", md: 340 },
                flexShrink: 0,
                bgcolor: "#fafafa",
                borderRadius: "20px",
                p: 3,
                alignSelf: "flex-start",
                position: { md: "sticky" },
                top: { md: 88 },
              }}
            >
              <Typography
                sx={{ fontWeight: 700, fontSize: 18, mb: 2, color: "#1a1a1a" }}
              >
                Order Summary
              </Typography>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography sx={{ color: "#666", fontSize: 14 }}>
                  Items ({cart.count})
                </Typography>
                <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                  ${Number(cart.subtotal).toFixed(2)}
                </Typography>
              </Box>
              <Box
                sx={{
                  borderTop: "1px solid #e8e8e8",
                  pt: 2,
                  mt: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 3,
                }}
              >
                <Typography
                  sx={{ fontWeight: 700, fontSize: 18, color: "#1a1a1a" }}
                >
                  Total
                </Typography>
                <Typography
                  sx={{ fontWeight: 800, fontSize: 22, color: "#1a1a1a" }}
                >
                  ${Number(cart.subtotal).toFixed(2)}
                </Typography>
              </Box>
              <VButton
                variant="secondary"
                fullWidth
                size="large"
                onClick={() => navigate("/checkout")}
                sx={{ borderRadius: "10px", mb: 1.5 }}
              >
                Proceed to Checkout
              </VButton>
              <VButton
                variant="ghost"
                fullWidth
                onClick={() => navigate("/shop")}
                sx={{
                  borderRadius: "10px",
                  color: "#555",
                  borderColor: "#ddd",
                }}
              >
                Continue Shopping
              </VButton>
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
};
