import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useSWR from "swr";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
} from "@mui/material";
import { useCart } from "../../../../common/contexts/cart.context";
import {
  checkoutCart,
  applyDiscount,
  placeOrder,
} from "../../../../apis/carts/cart.api";
import type { CheckOutCartResponse } from "../../../../apis/carts/cart.interface";
import type { Address } from "../../../../apis/profiles/profile.interface";
import { VButton } from "../../../../common/components";
import { VBreadcrumb } from "../../../../common/components/VBreadcrumb";
import { useSnackbar } from "../../../../common/contexts/snackbar.context";

const GUEST_ADDRESSES_KEY = "guest_checkout_addresses";

const loadGuestAddresses = (): Address[] => {
  const raw = localStorage.getItem(GUEST_ADDRESSES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Address[];
    return Array.isArray(parsed)
      ? parsed.filter((a) => typeof a?.id === "number" && a.id > 0)
      : [];
  } catch {
    localStorage.removeItem(GUEST_ADDRESSES_KEY);
    return [];
  }
};

const saveGuestAddresses = (addresses: Address[]): void => {
  localStorage.setItem(GUEST_ADDRESSES_KEY, JSON.stringify(addresses));
};

export const CheckoutScreen: React.FC = () => {
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const { showSnackbar } = useSnackbar();
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [discountCode, setDiscountCode] = useState("");
  const [discountResult, setDiscountResult] = useState<{
    discount_amount: number;
    total: number;
  } | null>(null);
  const [deliveryTier, setDeliveryTier] = useState<"standard" | "express">(
    "standard",
  );
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "credit_card">(
    "cod",
  );
  const [placing, setPlacing] = useState(false);
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [guestAddresses, setGuestAddresses] = useState<Address[]>(() =>
    loadGuestAddresses(),
  );
  const [guestAddressForm, setGuestAddressForm] = useState({
    label: "",
    street: "",
    city: "",
    country: "",
  });

  const { data: checkoutData, isLoading } = useSWR<CheckOutCartResponse>(
    "checkout-data",
    async () => {
      const res = await checkoutCart();
      const payload = (
        res as { data?: { data?: CheckOutCartResponse } | CheckOutCartResponse }
      )?.data;
      const normalized =
        payload && typeof payload === "object" && "data" in payload
          ? (payload.data as CheckOutCartResponse | undefined)
          : (payload as CheckOutCartResponse | undefined);

      return {
        items: Array.isArray(normalized?.items) ? normalized.items : [],
        subtotal: Number(normalized?.subtotal ?? 0),
        count: Number(normalized?.count ?? 0),
        address: Array.isArray(normalized?.address) ? normalized.address : [],
      };
    },
    {
      onSuccess: (data) => {
        const validAddresses = (data.address ?? []).filter(
          (a) => typeof a?.id === "number" && a.id > 0,
        );
        if (validAddresses.length > 0 && selectedAddress === null) {
          const defaultAddr = validAddresses.find((a) => a.is_default);
          setSelectedAddress(defaultAddr?.id ?? validAddresses[0].id);
        }
      },
    },
  );

  const checkoutItems = Array.isArray(checkoutData?.items)
    ? checkoutData.items
    : [];
  const checkoutAddresses = (
    Array.isArray(checkoutData?.address) ? checkoutData.address : []
  ).filter((a) => typeof a?.id === "number" && a.id > 0);
  const addressOptions =
    checkoutAddresses.length > 0 ? checkoutAddresses : guestAddresses;

  useEffect(() => {
    if (selectedAddress !== null) return;
    if (addressOptions.length === 0) return;
    const defaultAddr = addressOptions.find((a) => a.is_default);
    setSelectedAddress(defaultAddr?.id ?? addressOptions[0].id);
  }, [addressOptions, selectedAddress]);

  const handleSaveGuestAddress = () => {
    const street = guestAddressForm.street.trim();
    const city = guestAddressForm.city.trim();
    const country = guestAddressForm.country.trim() || "Vietnam";
    const label = guestAddressForm.label.trim();

    if (!street || !city) {
      showSnackbar("Please enter street and city", "warning");
      return;
    }

    const nextAddress: Address = {
      id: Date.now(),
      user_id: 0,
      label: label || "Guest Address",
      street,
      city,
      country,
      is_default: guestAddresses.length === 0,
    };

    const next =
      guestAddresses.length === 0
        ? [nextAddress]
        : [...guestAddresses, nextAddress];

    setGuestAddresses(next);
    saveGuestAddresses(next);
    setSelectedAddress(nextAddress.id);
    setGuestAddressForm({ label: "", street: "", city: "", country: country });
    showSnackbar("Address saved locally", "success");
  };

  type DiscountResult = { discount_amount: number; total: number };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim() || !checkoutData) return;
    setApplyingDiscount(true);
    try {
      const res = await applyDiscount({
        discount_code: discountCode,
        subtotal: checkoutData.subtotal,
      });

      const raw = (res as { data?: { data?: DiscountResult } | DiscountResult })
        ?.data;

      let normalized: DiscountResult | undefined;
      if (raw && typeof raw === "object") {
        if ("discount_amount" in raw && "total" in raw) {
          normalized = raw;
        } else if ("data" in raw) {
          normalized = raw.data;
        }
      }

      if (normalized) {
        setDiscountResult(normalized);
      }

      showSnackbar("Discount applied", "success");
    } catch {
      showSnackbar("Invalid discount code", "error");
    } finally {
      setApplyingDiscount(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress || selectedAddress <= 0) {
      showSnackbar("Please select a delivery address", "warning");
      return;
    }

    const usingServerAddress = checkoutAddresses.some(
      (addr) => addr.id === selectedAddress,
    );

    setPlacing(true);
    try {
      if (usingServerAddress) {
        const res = await placeOrder({
          address_id: selectedAddress,
          discount_code: discountCode || undefined,
          payment_method: paymentMethod,
          delivery_tier: deliveryTier,
        });
        const payload = (res as { data?: { data?: number } | number })?.data;
        const orderId =
          payload && typeof payload === "object" && "data" in payload
            ? payload.data
            : payload;
        await refreshCart();
        navigate("/order-success", { state: { orderId } });
        return;
      }

      const selectedGuestAddress = guestAddresses.find(
        (addr) => addr.id === selectedAddress,
      );
      if (!selectedGuestAddress) {
        showSnackbar("Please select a valid local address", "warning");
        return;
      }

      localStorage.setItem(
        "guest_checkout_last_address",
        JSON.stringify(selectedGuestAddress),
      );
      const guestOrderId = Date.now();
      navigate("/order-success", { state: { orderId: guestOrderId } });
      showSnackbar("Guest order placed", "success");
    } catch {
      showSnackbar("Failed to place order", "error");
    } finally {
      setPlacing(false);
    }
  };

  if (isLoading) {
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

  if (!checkoutData || checkoutItems.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
        <Typography sx={{ color: "#999", mb: 2 }}>
          Your cart is empty
        </Typography>
        <VButton variant="secondary" onClick={() => navigate("/shop")}>
          Go to Shop
        </VButton>
      </Container>
    );
  }

  const shippingFee = deliveryTier === "express" ? 15 : 0;
  const baseTotal = discountResult?.total ?? checkoutData.subtotal;
  const finalTotal = baseTotal + shippingFee;

  return (
    <Box sx={{ bgcolor: "#ffffff" }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <VBreadcrumb
          items={[
            { label: "Home", path: "/" },
            { label: "Cart", path: "/cart" },
            { label: "Checkout" },
          ]}
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
          Checkout
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 4,
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          {/* Left — address + discount */}
          <Box sx={{ flex: 1 }}>
            {/* Address */}
            <Box sx={{ mb: 3 }}>
              <Typography
                sx={{ fontWeight: 700, fontSize: 16, mb: 2, color: "#1a1a1a" }}
              >
                Delivery Address
              </Typography>
              {addressOptions.length === 0 ? (
                <Box
                  sx={{
                    border: "1px solid #f0f0f0",
                    borderRadius: "12px",
                    p: 2,
                  }}
                >
                  <Typography sx={{ color: "#777", fontSize: 13, mb: 1.5 }}>
                    No account address found. Add a delivery address for guest
                    checkout.
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}
                  >
                    <TextField
                      placeholder="Label (Home, Office...)"
                      size="small"
                      value={guestAddressForm.label}
                      onChange={(e) =>
                        setGuestAddressForm((prev) => ({
                          ...prev,
                          label: e.target.value,
                        }))
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": { borderRadius: "10px" },
                      }}
                    />
                    <TextField
                      placeholder="Street"
                      size="small"
                      value={guestAddressForm.street}
                      onChange={(e) =>
                        setGuestAddressForm((prev) => ({
                          ...prev,
                          street: e.target.value,
                        }))
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": { borderRadius: "10px" },
                      }}
                    />
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <TextField
                        placeholder="City"
                        size="small"
                        value={guestAddressForm.city}
                        onChange={(e) =>
                          setGuestAddressForm((prev) => ({
                            ...prev,
                            city: e.target.value,
                          }))
                        }
                        sx={{
                          flex: 1,
                          "& .MuiOutlinedInput-root": { borderRadius: "10px" },
                        }}
                      />
                      <TextField
                        placeholder="Country"
                        size="small"
                        value={guestAddressForm.country}
                        onChange={(e) =>
                          setGuestAddressForm((prev) => ({
                            ...prev,
                            country: e.target.value,
                          }))
                        }
                        sx={{
                          flex: 1,
                          "& .MuiOutlinedInput-root": { borderRadius: "10px" },
                        }}
                      />
                    </Box>
                    <VButton
                      variant="primary"
                      onClick={handleSaveGuestAddress}
                      sx={{ borderRadius: "10px", alignSelf: "flex-start" }}
                    >
                      Save Address
                    </VButton>
                  </Box>
                </Box>
              ) : (
                <RadioGroup
                  value={selectedAddress ?? ""}
                  onChange={(e) => setSelectedAddress(Number(e.target.value))}
                >
                  {addressOptions.map((addr, idx) => (
                    <FormControlLabel
                      key={addr.id ?? `addr-${idx}`}
                      value={addr.id}
                      control={
                        <Radio
                          sx={{
                            color: "#ccc",
                            "&.Mui-checked": { color: "#1a1a1a" },
                          }}
                        />
                      }
                      label={
                        <Box>
                          <Typography
                            sx={{
                              fontSize: 14,
                              fontWeight: 600,
                              color: "#1a1a1a",
                            }}
                          >
                            {addr.label || "Address"}
                            {addr.is_default ? " (Default)" : ""}
                          </Typography>
                          <Typography sx={{ fontSize: 13, color: "#888" }}>
                            {addr.street}, {addr.city}, {addr.country}
                          </Typography>
                        </Box>
                      }
                      sx={{
                        mb: 1,
                        px: 2,
                        py: 1.5,
                        borderRadius: "12px",
                        border:
                          selectedAddress === addr.id
                            ? "2px solid #1a1a1a"
                            : "1px solid #f0f0f0",
                        bgcolor:
                          selectedAddress === addr.id
                            ? "#fafafa"
                            : "transparent",
                        mx: 0,
                        width: "100%",
                        transition: "all 0.15s",
                      }}
                    />
                  ))}
                </RadioGroup>
              )}
              {checkoutAddresses.length === 0 && addressOptions.length > 0 && (
                <Box sx={{ mt: 1.5 }}>
                  <VButton
                    variant="ghost"
                    size="small"
                    onClick={() =>
                      setGuestAddressForm((prev) => ({
                        ...prev,
                        country: prev.country || "Vietnam",
                      }))
                    }
                    sx={{
                      borderRadius: "8px",
                      color: "#555",
                      borderColor: "#ddd",
                    }}
                  >
                    Add Another Local Address Below
                  </VButton>
                  <Box
                    sx={{
                      mt: 1.25,
                      display: "flex",
                      flexDirection: "column",
                      gap: 1.25,
                    }}
                  >
                    <TextField
                      placeholder="Label (Home, Office...)"
                      size="small"
                      value={guestAddressForm.label}
                      onChange={(e) =>
                        setGuestAddressForm((prev) => ({
                          ...prev,
                          label: e.target.value,
                        }))
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": { borderRadius: "10px" },
                      }}
                    />
                    <TextField
                      placeholder="Street"
                      size="small"
                      value={guestAddressForm.street}
                      onChange={(e) =>
                        setGuestAddressForm((prev) => ({
                          ...prev,
                          street: e.target.value,
                        }))
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": { borderRadius: "10px" },
                      }}
                    />
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <TextField
                        placeholder="City"
                        size="small"
                        value={guestAddressForm.city}
                        onChange={(e) =>
                          setGuestAddressForm((prev) => ({
                            ...prev,
                            city: e.target.value,
                          }))
                        }
                        sx={{
                          flex: 1,
                          "& .MuiOutlinedInput-root": { borderRadius: "10px" },
                        }}
                      />
                      <TextField
                        placeholder="Country"
                        size="small"
                        value={guestAddressForm.country}
                        onChange={(e) =>
                          setGuestAddressForm((prev) => ({
                            ...prev,
                            country: e.target.value,
                          }))
                        }
                        sx={{
                          flex: 1,
                          "& .MuiOutlinedInput-root": { borderRadius: "10px" },
                        }}
                      />
                    </Box>
                    <VButton
                      variant="primary"
                      onClick={handleSaveGuestAddress}
                      sx={{ borderRadius: "10px", alignSelf: "flex-start" }}
                    >
                      Save Address
                    </VButton>
                  </Box>
                </Box>
              )}
            </Box>

            {/* Delivery Options */}
            <Box sx={{ borderTop: "1px solid #f0f0f0", pt: 3, mb: 3 }}>
              <Typography
                sx={{ fontWeight: 700, fontSize: 16, mb: 2, color: "#1a1a1a" }}
              >
                Delivery Options
              </Typography>
              <RadioGroup
                value={deliveryTier}
                onChange={(e) =>
                  setDeliveryTier(e.target.value as "standard" | "express")
                }
              >
                {[
                  {
                    value: "standard",
                    label: "Standard Delivery",
                    sub: "5–7 business days",
                    fee: "Free",
                  },
                  {
                    value: "express",
                    label: "Express Delivery",
                    sub: "1–2 business days",
                    fee: "+$15.00",
                  },
                ].map((opt) => (
                  <FormControlLabel
                    key={opt.value}
                    value={opt.value}
                    control={
                      <Radio
                        sx={{
                          color: "#ccc",
                          "&.Mui-checked": { color: "#1a1a1a" },
                        }}
                      />
                    }
                    label={
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          width: "100%",
                          alignItems: "center",
                        }}
                      >
                        <Box>
                          <Typography
                            sx={{
                              fontSize: 14,
                              fontWeight: 600,
                              color: "#1a1a1a",
                            }}
                          >
                            {opt.label}
                          </Typography>
                          <Typography sx={{ fontSize: 12, color: "#888" }}>
                            {opt.sub}
                          </Typography>
                        </Box>
                        <Typography
                          sx={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#1a1a1a",
                          }}
                        >
                          {opt.fee}
                        </Typography>
                      </Box>
                    }
                    sx={{
                      mb: 1,
                      px: 2,
                      py: 1.5,
                      borderRadius: "12px",
                      mx: 0,
                      width: "100%",
                      border:
                        deliveryTier === opt.value
                          ? "2px solid #1a1a1a"
                          : "1px solid #f0f0f0",
                      bgcolor:
                        deliveryTier === opt.value ? "#fafafa" : "transparent",
                      transition: "all 0.15s",
                    }}
                  />
                ))}
              </RadioGroup>
            </Box>

            {/* Payment Method */}
            <Box sx={{ borderTop: "1px solid #f0f0f0", pt: 3 }}>
              <Typography
                sx={{ fontWeight: 700, fontSize: 16, mb: 2, color: "#1a1a1a" }}
              >
                Payment Method
              </Typography>
              <RadioGroup
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(e.target.value as "cod" | "credit_card")
                }
              >
                {[
                  {
                    value: "cod",
                    label: "Cash on Delivery",
                    sub: "Pay when your order arrives",
                  },
                  {
                    value: "credit_card",
                    label: "Credit Card",
                    sub: "Simulated — no real charge",
                  },
                ].map((opt) => (
                  <FormControlLabel
                    key={opt.value}
                    value={opt.value}
                    control={
                      <Radio
                        sx={{
                          color: "#ccc",
                          "&.Mui-checked": { color: "#1a1a1a" },
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography
                          sx={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#1a1a1a",
                          }}
                        >
                          {opt.label}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: "#888" }}>
                          {opt.sub}
                        </Typography>
                      </Box>
                    }
                    sx={{
                      mb: 1,
                      px: 2,
                      py: 1.5,
                      borderRadius: "12px",
                      mx: 0,
                      width: "100%",
                      border:
                        paymentMethod === opt.value
                          ? "2px solid #1a1a1a"
                          : "1px solid #f0f0f0",
                      bgcolor:
                        paymentMethod === opt.value ? "#fafafa" : "transparent",
                      transition: "all 0.15s",
                    }}
                  />
                ))}
              </RadioGroup>

              {/* Credit card mock form */}
              {paymentMethod === "credit_card" && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2.5,
                    border: "1px solid #f0f0f0",
                    borderRadius: "12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                  }}
                >
                  <TextField
                    placeholder="Card number"
                    size="small"
                    disabled
                    value="**** **** **** 4242"
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: "10px" },
                    }}
                  />
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                      placeholder="MM/YY"
                      size="small"
                      disabled
                      value="12/28"
                      sx={{
                        flex: 1,
                        "& .MuiOutlinedInput-root": { borderRadius: "10px" },
                      }}
                    />
                    <TextField
                      placeholder="CVV"
                      size="small"
                      disabled
                      value="***"
                      sx={{
                        flex: 1,
                        "& .MuiOutlinedInput-root": { borderRadius: "10px" },
                      }}
                    />
                  </Box>
                  <Typography
                    sx={{ fontSize: 11, color: "#aaa", textAlign: "center" }}
                  >
                    This is a simulated payment — no real transaction will
                    occur.
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Discount */}
            <Box sx={{ borderTop: "1px solid #f0f0f0", pt: 3 }}>
              <Typography
                sx={{ fontWeight: 700, fontSize: 16, mb: 2, color: "#1a1a1a" }}
              >
                Discount Code
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  placeholder="Enter code"
                  size="small"
                  sx={{
                    flex: 1,
                    "& .MuiOutlinedInput-root": { borderRadius: "10px" },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#e8e8e8",
                    },
                  }}
                />
                <VButton
                  variant="primary"
                  onClick={handleApplyDiscount}
                  loading={applyingDiscount}
                  sx={{ borderRadius: "10px" }}
                >
                  Apply
                </VButton>
              </Box>
              {discountResult && (
                <Typography
                  sx={{
                    mt: 1.5,
                    fontSize: 13,
                    color: "#2e7d32",
                    fontWeight: 600,
                  }}
                >
                  Discount: -$
                  {Number(discountResult.discount_amount).toFixed(2)}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Right — order summary */}
          <Box
            sx={{
              width: { xs: "100%", md: 380 },
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
              sx={{ fontWeight: 700, fontSize: 16, mb: 2, color: "#1a1a1a" }}
            >
              Order Summary
            </Typography>

            {checkoutItems.map((item, idx) => (
              <Box
                key={item.id ?? `${item.product_id}-${idx}`}
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography sx={{ fontSize: 13, color: "#555", flex: 1 }}>
                  {item.bundle_name ?? item.product_name ?? "Item"} x
                  {item.quantity}
                </Typography>
                <Typography
                  sx={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}
                >
                  ${Number(item.line_total).toFixed(2)}
                </Typography>
              </Box>
            ))}

            <Box sx={{ borderTop: "1px solid #e8e8e8", mt: 2, pt: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography sx={{ color: "#666", fontSize: 14 }}>
                  Subtotal
                </Typography>
                <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                  ${Number(checkoutData.subtotal).toFixed(2)}
                </Typography>
              </Box>
              {discountResult && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Typography sx={{ color: "#2e7d32", fontSize: 14 }}>
                    Discount
                  </Typography>
                  <Typography
                    sx={{ color: "#2e7d32", fontWeight: 600, fontSize: 14 }}
                  >
                    -${Number(discountResult.discount_amount).toFixed(2)}
                  </Typography>
                </Box>
              )}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography sx={{ color: "#666", fontSize: 14 }}>
                  Shipping
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: 14,
                    color: shippingFee === 0 ? "#2e7d32" : "#1a1a1a",
                  }}
                >
                  {shippingFee === 0 ? "Free" : `+$${shippingFee.toFixed(2)}`}
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                borderTop: "1px solid #e8e8e8",
                mt: 2,
                pt: 2,
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
                ${Number(finalTotal).toFixed(2)}
              </Typography>
            </Box>

            <VButton
              variant="secondary"
              fullWidth
              size="large"
              onClick={handlePlaceOrder}
              loading={placing}
              disabled={!selectedAddress}
              sx={{ borderRadius: "10px" }}
            >
              Place Order
            </VButton>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
