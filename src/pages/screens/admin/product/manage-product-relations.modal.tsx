import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Divider,
  CircularProgress,
} from "@mui/material";
import useSWR from "swr";
import { ADMIN_COLOR } from "../admin.constants";
import { VButton } from "../../../../common/components/VButton";
import { VTextField } from "../../../../common/components/VTextField";
import { VTable, type VTableColumn } from "../../../../common/components/VTable";
import type {
  Product,
} from "../../../../apis/products/product.interface";
import {
  getProductRelations,
  createProductRelation,
  deleteProductRelation,
  getAllProduct,
} from "../../../../apis/products/product.api";
import { ProductRelationType } from "../../../../apis/products/product.enum";
import { useSnackbar } from "../../../../common/contexts/snackbar.context";

interface ManageProductRelationsModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
}

export const ManageProductRelationsModal: React.FC<
  ManageProductRelationsModalProps
> = ({ open, onClose, product }) => {
  const { showSnackbar } = useSnackbar();
  const [adding, setAdding] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Form state
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [relationType, setRelationType] = useState<ProductRelationType>(ProductRelationType.UPSELL);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Fetch relations
  const {
    data: relationsResp,
    mutate: mutateRelations,
    isLoading: loadingRelations,
  } = useSWR(
    product && open ? ["product-relations", product.id, relationType] : null,
    () =>
      getProductRelations(String(product!.id), relationType).then((res) => {
        const payload = res.data;
        if (payload && typeof payload === "object" && "data" in payload) {
          return (payload as any).data ?? [];
        }
        return Array.isArray(payload) ? payload : [];
      }),
  );

  const relations = Array.isArray(relationsResp) ? relationsResp : [];

  // Fetch products for dropdown
  const { data: allProductsResp, isLoading: loadingProducts } = useSWR(
    open ? ["all-products-for-relations"] : null,
    () => getAllProduct({ limit: 1000 }).then((res) => res.data),
  );

  const allProducts: Product[] = allProductsResp?.data ?? [];

  useEffect(() => {
    if (!open) {
      setSelectedProductId(null);
      setRelationType(ProductRelationType.UPSELL);
      setDiscountAmount(0);
    }
  }, [open]);

  const handleAddRelation = async () => {
    if (!product || !selectedProductId) return;
    setAdding(true);
    try {
      await createProductRelation(String(product.id), {
        related_id: selectedProductId,
        type: relationType,
        discount_amount: discountAmount,
      });
      showSnackbar("Relation added successfully", "success");
      setSelectedProductId(null);
      setDiscountAmount(0);
      mutateRelations();
    } catch (error) {
      showSnackbar("Failed to add relation", "error");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteRelation = async (relatedId: number) => {
    if (!product || !window.confirm("Are you sure you want to remove this relation?")) return;
    setActionLoading(`delete-${relatedId}`);
    try {
      await deleteProductRelation(String(product.id), String(relatedId));
      showSnackbar("Relation removed", "success");
      mutateRelations();
    } catch {
      showSnackbar("Failed to remove relation", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const columns: VTableColumn<Product>[] = [
    {
      key: "id",
      label: "ID",
      width: 60,
      render: (r) => (
        <Typography sx={{ fontSize: 13, color: ADMIN_COLOR.dim }}>
          #{r.id}
        </Typography>
      ),
    },
    {
      key: "name",
      label: "Product",
      render: (r) => (
        <Typography sx={{ fontSize: 13, fontWeight: 500, color: ADMIN_COLOR.text }}>
          {r.name}
        </Typography>
      ),
    },
    {
      key: "price",
      label: "Price",
      render: (r) => (
        <Typography sx={{ fontSize: 13, color: ADMIN_COLOR.text, fontFamily: "monospace" }}>
          ${Number(r.price).toFixed(2)}
        </Typography>
      ),
    },
    {
      key: "actions",
      label: "Action",
      width: 80,
      align: "right",
      render: (r) => (
        <VButton
          variant="danger"
          size="small"
          loading={actionLoading === `delete-${r.id}`}
          onClick={() => handleDeleteRelation(r.id)}
        >
          Remove
        </VButton>
      ),
    },
  ];

  if (!product) return null;

  const productOptions = allProducts
    .filter((p) => p.id !== product.id)
    .map((p) => ({
      label: `${p.name} ($${Number(p.price).toFixed(2)})`,
      value: p.id,
    }));

  const darkFieldSx = {
    "& .MuiOutlinedInput-root": {
      color: ADMIN_COLOR.text,
      bgcolor: ADMIN_COLOR.bg,
      "& fieldset": { borderColor: ADMIN_COLOR.border },
      "&:hover fieldset": { borderColor: ADMIN_COLOR.border },
      "&.Mui-focused fieldset": { borderColor: ADMIN_COLOR.accent },
    },
    "& .MuiInputLabel-root": { color: ADMIN_COLOR.dim },
    "& .MuiInputLabel-root.Mui-focused": { color: ADMIN_COLOR.text },
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "95vw", sm: 700 },
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          bgcolor: ADMIN_COLOR.surface,
          border: `1px solid ${ADMIN_COLOR.border}`,
          borderRadius: "12px",
          p: 3,
          outline: "none",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 18,
                fontWeight: 800,
                color: ADMIN_COLOR.text,
              }}
            >
              Manage Relations
            </Typography>
            <Typography sx={{ fontSize: 13, color: ADMIN_COLOR.dim }}>
              {product.name}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ color: ADMIN_COLOR.dim }}
          >
            ✕
          </IconButton>
        </Box>
        <Divider sx={{ borderColor: ADMIN_COLOR.border, mb: 3 }} />

        {/* Add Relation Form */}
        <Box
          sx={{
            bgcolor: ADMIN_COLOR.s2,
            p: 2,
            borderRadius: "8px",
            mb: 3,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: ADMIN_COLOR.text }}>
            Add New Relation
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 2 }}>
            <VTextField
              fieldType="dropdown"
              label="Select Product"
              options={productOptions}
              value={selectedProductId || null}
              onChange={(v) => setSelectedProductId(v as number)}
              sx={darkFieldSx}
            />
            <VTextField
              fieldType="dropdown"
              label="Type"
              options={[
                { label: "Upsell", value: ProductRelationType.UPSELL },
                { label: "Cross-sell", value: ProductRelationType.CROSSSELL },
              ]}
              value={relationType}
              onChange={(v) => setRelationType(v as ProductRelationType)}
              sx={darkFieldSx}
            />
            <VTextField
              fieldType="number"
              label="Discount ($)"
              value={discountAmount}
              onChange={(v) => setDiscountAmount(v as number)}
              sx={darkFieldSx}
            />
          </Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <VButton
              variant="secondary"
              disabled={!selectedProductId}
              loading={adding}
              onClick={handleAddRelation}
            >
              + Add Relation
            </VButton>
          </Box>
        </Box>

        {/* List Relations */}
        <Box sx={{ flex: 1, overflowY: "auto", minHeight: 200 }}>
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            {["upsell", "crosssell"].map((type) => (
              <Box
                key={type}
                onClick={() => setRelationType(type as ProductRelationType)}
                sx={{
                  px: 2,
                  py: 0.75,
                  borderRadius: "50px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  bgcolor: relationType === type ? ADMIN_COLOR.accent : "transparent",
                  color: relationType === type ? ADMIN_COLOR.accentDark : ADMIN_COLOR.dim,
                  border: `1px solid ${relationType === type ? ADMIN_COLOR.accent : ADMIN_COLOR.border}`,
                }}
              >
                {type === "upsell" ? "Upsells" : "Cross-sells"}
              </Box>
            ))}
          </Box>
          
          {loadingRelations || loadingProducts ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress sx={{ color: ADMIN_COLOR.accent }} />
            </Box>
          ) : relations.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography sx={{ color: ADMIN_COLOR.dim }}>
                No {relationType} products found.
              </Typography>
            </Box>
          ) : (
            <VTable columns={columns} data={relations} sx={{ border: "none" }} />
          )}
        </Box>
      </Box>
    </Modal>
  );
};
