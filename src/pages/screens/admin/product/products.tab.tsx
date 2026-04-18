import React, { useState } from 'react';
import useSWR from 'swr';
import { Box, Typography, Chip } from '@mui/material';
import { ADMIN_COLOR } from '../admin.constants';
import { VTable } from '../../../../common/components/VTable';
import type { VTableColumn } from '../../../../common/components/VTable';
import { VButton } from '../../../../common/components/VButton';
import { ProductFormModal } from './product-form.modal';
import { ManageProductImagesModal } from './manage-product-images.modal';
import { useSnackbar } from '../../../../common/contexts/snackbar.context';
import {
    getAllProduct, createProduct, updateProduct, deleteProduct,
} from '../../../../apis/products/product.api';
import { getAllCategories } from '../../../../apis/categories/category.api';
import type { Product, RequestCreateProductDto } from '../../../../apis/products/product.interface';
import type { Category } from '../../../../apis/categories/category.interface';
import type { PaginatedResponse } from '../../../../common/interfaces/base-requestdto.interface';
import { ProductBadge } from '../../../../apis/products/product.enum';

interface ProductsTabProps {
    search: string;
}

const BADGE_COLORS: Record<string, { bg: string; text: string }> = {
    [ProductBadge.HOT]: { bg: 'rgba(255,77,77,0.15)', text: '#ff4d4d' },
    [ProductBadge.NEW]: { bg: 'rgba(77,166,255,0.15)', text: '#4da6ff' },
    [ProductBadge.SALE]: { bg: 'rgba(255,170,77,0.15)', text: '#ffaa4d' },
    [ProductBadge.NONE]: { bg: 'rgba(136,136,136,0.1)', text: '#888' },
};

const PAGE_SIZE = 10;

export const ProductsTab: React.FC<ProductsTabProps> = ({ search }) => {
    const { showSnackbar } = useSnackbar();
    const [page, setPage] = useState(1);
    const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Product | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [imageTarget, setImageTarget] = useState<Product | null>(null);

    const swrKey = ['products', page, PAGE_SIZE, search, categoryFilter];

    const { data: productsResp, mutate } = useSWR<PaginatedResponse<Product>>(
        swrKey,
        () => getAllProduct({ page, limit: PAGE_SIZE, search }).then((r) => r.data),
    );

    const { data: categoriesResp } = useSWR<Category[]>(
        'categories',
        () => getAllCategories().then((r) => (r.data as unknown as { data: Category[] }).data ?? r.data),
    );

    const products = productsResp?.data ?? [];
    const total = productsResp?.meta?.total ?? productsResp?.pagination?.total ?? 0;
    const categories: Category[] = categoriesResp ?? [];

    const handleAdd = () => {
        setEditTarget(null);
        setModalOpen(true);
    };

    const handleManageImages = (product: Product) => {
        setImageTarget(product);
        setImageModalOpen(true);
    };

    const handleEdit = (product: Product) => {
        setEditTarget(product);
        setModalOpen(true);
    };

    const handleDelete = async (product: Product) => {
        if (!window.confirm(`Delete "${product.name}"?`)) return;
        try {
            await deleteProduct(String(product.id));
            showSnackbar('Product deleted', 'success');
            mutate();
        } catch {
            showSnackbar('Failed to delete product', 'error');
        }
    };

    const handleSubmit = async (values: RequestCreateProductDto) => {
        setSubmitting(true);
        try {
            if (editTarget) {
                await updateProduct(String(editTarget.id), values);
                showSnackbar('Product updated', 'success');
            } else {
                await createProduct(values);
                showSnackbar('Product created', 'success');
            }
            mutate();
            setModalOpen(false);
        } catch {
            showSnackbar('Failed to save product', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const columns: VTableColumn<Product>[] = [
        {
            key: 'name', label: 'Product',
            render: (r) => (
                <Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, color: ADMIN_COLOR.text }}>{r.name}</Typography>
                    <Typography sx={{ fontSize: 11, color: ADMIN_COLOR.dim, fontFamily: 'monospace' }}>{r.slug}</Typography>
                </Box>
            ),
        },
        {
            key: 'category_id', label: 'Category',
            render: (r) => {
                const cat = categories.find((c) => c.id === r.category_id);
                return <Typography sx={{ fontSize: 13, color: ADMIN_COLOR.dim }}>{cat?.name ?? `#${r.category_id}`}</Typography>;
            },
        },
        {
            key: 'price', label: 'Price', width: 100,
            render: (r) => (
                <Typography sx={{ fontFamily: 'monospace', fontSize: 13, color: ADMIN_COLOR.text }}>
                    ${Number(r.price).toFixed(2)}
                </Typography>
            ),
        },
        {
            key: 'stock', label: 'Stock', width: 80,
            render: (r) => (
                <Typography sx={{ fontSize: 13, color: r.stock < 10 ? ADMIN_COLOR.red : ADMIN_COLOR.green, fontWeight: 600 }}>
                    {r.stock}
                </Typography>
            ),
        },
        {
            key: 'badge', label: 'Badge', width: 80,
            render: (r) => {
                if (!r.badge || r.badge === ProductBadge.NONE) return <Typography sx={{ fontSize: 12, color: ADMIN_COLOR.dim }}>—</Typography>;
                const c = BADGE_COLORS[r.badge] ?? BADGE_COLORS[ProductBadge.NONE];
                return (
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', bgcolor: c.bg, color: c.text, fontSize: 11, fontWeight: 600, px: 1.25, py: 0.375, borderRadius: '50px' }}>
                        {r.badge.toUpperCase()}
                    </Box>
                );
            },
        },
        {
            key: 'is_active', label: 'Status', width: 80,
            render: (r) => (
                <Box sx={{ display: 'inline-flex', alignItems: 'center', bgcolor: r.is_active ? 'rgba(77,255,145,0.12)' : 'rgba(255,77,77,0.12)', color: r.is_active ? ADMIN_COLOR.green : ADMIN_COLOR.red, fontSize: 11, fontWeight: 600, px: 1.25, py: 0.375, borderRadius: '50px' }}>
                    {r.is_active ? 'Active' : 'Inactive'}
                </Box>
            ),
        },
        {
            key: 'actions', label: 'Actions', width: 150,
            render: (r) => (
                <Box sx={{ display: 'flex', gap: 0.75 }}>
                    <VButton variant="ghost" size="small" onClick={() => handleManageImages(r)}>Images</VButton>
                    <VButton variant="ghost" size="small" onClick={() => handleEdit(r)}>Edit</VButton>
                    <VButton variant="danger" size="small" onClick={() => handleDelete(r)}>Del</VButton>
                </Box>
            ),
        },
    ];

    const totalPages = Math.ceil(total / PAGE_SIZE);

    return (
        <Box sx={{ p: 3.5 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography sx={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: ADMIN_COLOR.text, letterSpacing: -0.5 }}>
                    Products
                </Typography>
                <VButton variant="secondary" onClick={handleAdd}>+ Add Product</VButton>
            </Box>

            {/* Category filter chips */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2.5, flexWrap: 'wrap' }}>
                <Chip
                    label={`All (${total})`}
                    onClick={() => { setCategoryFilter(null); setPage(1); }}
                    sx={{
                        bgcolor: categoryFilter === null ? ADMIN_COLOR.accent : ADMIN_COLOR.s2,
                        color: categoryFilter === null ? ADMIN_COLOR.accentDark : ADMIN_COLOR.dim,
                        border: `1px solid ${categoryFilter === null ? ADMIN_COLOR.accent : ADMIN_COLOR.border}`,
                        fontSize: 12, fontWeight: 500, cursor: 'pointer',
                        '&:hover': { bgcolor: categoryFilter === null ? ADMIN_COLOR.accent : ADMIN_COLOR.muted },
                    }}
                />
                {categories.map((cat) => (
                    <Chip
                        key={cat.id}
                        label={cat.name}
                        onClick={() => { setCategoryFilter(cat.id); setPage(1); }}
                        sx={{
                            bgcolor: categoryFilter === cat.id ? ADMIN_COLOR.accent : ADMIN_COLOR.s2,
                            color: categoryFilter === cat.id ? ADMIN_COLOR.accentDark : ADMIN_COLOR.dim,
                            border: `1px solid ${categoryFilter === cat.id ? ADMIN_COLOR.accent : ADMIN_COLOR.border}`,
                            fontSize: 12, fontWeight: 500, cursor: 'pointer',
                            '&:hover': { bgcolor: categoryFilter === cat.id ? ADMIN_COLOR.accent : ADMIN_COLOR.muted },
                        }}
                    />
                ))}
            </Box>

            {/* Table */}
            <VTable<Product> columns={columns} data={products} />

            {/* Pagination */}
            {totalPages > 1 && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                    <VButton variant="ghost" size="small" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                        ← Prev
                    </VButton>
                    <Typography sx={{ fontSize: 12, color: ADMIN_COLOR.dim }}>
                        {page} / {totalPages}
                    </Typography>
                    <VButton variant="ghost" size="small" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                        Next →
                    </VButton>
                </Box>
            )}

            <ProductFormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmit}
                product={editTarget}
                categories={categories}
                loading={submitting}
            />

            <ManageProductImagesModal
                open={imageModalOpen}
                onClose={() => setImageModalOpen(false)}
                product={imageTarget}
            />
        </Box>
    );
};
