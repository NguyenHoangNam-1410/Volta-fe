import React, { useEffect } from 'react';
import {
    Modal, Box, Typography, IconButton, Divider,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ADMIN_COLOR } from '../admin.constants';
import { VButton } from '../../../../common/components/VButton';
import { VTextField } from '../../../../common/components/VTextField';
import { VToggle } from '../../../../common/components/VToggle';
import type { Product, RequestCreateProductDto } from '../../../../apis/products/product.interface';
import type { Category } from '../../../../apis/categories/category.interface';
import { ProductBadge } from '../../../../apis/products/product.enum';

interface ProductFormModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: RequestCreateProductDto) => Promise<void>;
    product?: Product | null;
    categories: Category[];
    loading?: boolean;
}

const schema = Yup.object({
    name: Yup.string().required('Name is required'),
    slug: Yup.string().required('Slug is required'),
    category_id: Yup.number().min(1, 'Category is required').required('Category is required'),
    description: Yup.string().required('Description is required'),
    price: Yup.number().min(0, 'Price must be ≥ 0').required('Price is required'),
    stock: Yup.number().min(0, 'Stock must be ≥ 0').required('Stock is required'),
    badge: Yup.string().required('Badge is required'),
    is_active: Yup.boolean().required(),
});

const BADGE_OPTIONS = [
    { label: 'None', value: ProductBadge.NONE },
    { label: 'New', value: ProductBadge.NEW },
    { label: 'Hot', value: ProductBadge.HOT },
    { label: 'Sale', value: ProductBadge.SALE },
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
    open, onClose, onSubmit, product, categories, loading,
}) => {
    const isEdit = !!product;

    const formik = useFormik({
        initialValues: {
            name: product?.name ?? '',
            slug: product?.slug ?? '',
            category_id: product?.category_id ?? 0,
            description: product?.description ?? '',
            price: product?.price ?? 0,
            stock: product?.stock ?? 0,
            badge: product?.badge ?? ProductBadge.NONE,
            is_active: product?.is_active ?? true,
            image: undefined as unknown as Blob,
        },
        validationSchema: schema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            await onSubmit(values as RequestCreateProductDto);
        },
    });

    // Auto-generate slug from name
    const { values, setFieldValue } = formik;
    useEffect(() => {
        if (!isEdit) {
            const slug = values.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            setFieldValue('slug', slug);
        }
    }, [values.name, isEdit, setFieldValue]);

    const categoryOptions = categories.map((c) => ({ label: c.name, value: c.id }));

    const darkFieldSx = {
        '& .MuiOutlinedInput-root': {
            color: ADMIN_COLOR.text,
            bgcolor: ADMIN_COLOR.bg,
            '& fieldset': { borderColor: ADMIN_COLOR.border },
            '&:hover fieldset': { borderColor: ADMIN_COLOR.border },
            '&.Mui-focused fieldset': { borderColor: ADMIN_COLOR.accent },
        },
        '& .MuiInputLabel-root': { color: ADMIN_COLOR.dim },
        '& .MuiInputLabel-root.Mui-focused': { color: ADMIN_COLOR.text },
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: { xs: '95vw', sm: 540 },
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    bgcolor: ADMIN_COLOR.surface,
                    border: `1px solid ${ADMIN_COLOR.border}`,
                    borderRadius: '12px',
                    p: 3,
                    outline: 'none',
                }}
            >
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography
                        sx={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: ADMIN_COLOR.text }}
                    >
                        {isEdit ? 'Edit Product' : 'Add Product'}
                    </Typography>
                    <IconButton onClick={onClose} size="small" sx={{ color: ADMIN_COLOR.dim }}>✕</IconButton>
                </Box>
                <Divider sx={{ borderColor: ADMIN_COLOR.border, mb: 2.5 }} />

                <form onSubmit={formik.handleSubmit}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <VTextField
                            fieldType="text"
                            label="Product Name"
                            required
                            value={formik.values.name}
                            onChange={(v) => formik.setFieldValue('name', v)}
                            error={formik.touched.name ? formik.errors.name : undefined}
                            sx={darkFieldSx}
                        />

                        <VTextField
                            fieldType="text"
                            label="Slug"
                            required
                            value={formik.values.slug}
                            onChange={(v) => formik.setFieldValue('slug', v)}
                            error={formik.touched.slug ? formik.errors.slug : undefined}
                            sx={darkFieldSx}
                        />

                        <VTextField
                            fieldType="dropdown"
                            label="Category"
                            required
                            options={categoryOptions}
                            value={formik.values.category_id || null}
                            onChange={(v) => formik.setFieldValue('category_id', v)}
                            error={formik.touched.category_id ? formik.errors.category_id as string : undefined}
                            sx={darkFieldSx}
                        />

                        <VTextField
                            fieldType="text"
                            label="Description"
                            value={formik.values.description}
                            onChange={(v) => formik.setFieldValue('description', v)}
                            error={formik.touched.description ? formik.errors.description : undefined}
                            sx={darkFieldSx}
                        />

                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            <VTextField
                                fieldType="number"
                                label="Price ($)"
                                required
                                value={formik.values.price}
                                onChange={(v) => formik.setFieldValue('price', v)}
                                error={formik.touched.price ? formik.errors.price as string : undefined}
                                sx={darkFieldSx}
                            />
                            <VTextField
                                fieldType="number"
                                label="Stock"
                                required
                                value={formik.values.stock}
                                onChange={(v) => formik.setFieldValue('stock', v)}
                                error={formik.touched.stock ? formik.errors.stock as string : undefined}
                                sx={darkFieldSx}
                            />
                        </Box>

                        <VTextField
                            fieldType="dropdown"
                            label="Badge"
                            options={BADGE_OPTIONS}
                            value={formik.values.badge}
                            onChange={(v) => formik.setFieldValue('badge', v)}
                            sx={darkFieldSx}
                        />

                        <Box sx={{ '& label': { color: ADMIN_COLOR.text } }}>
                            <VToggle
                                label="Active"
                                checked={!!formik.values.is_active}
                                onChange={(v) => formik.setFieldValue('is_active', v)}
                            />
                        </Box>

                        <Divider sx={{ borderColor: ADMIN_COLOR.border }} />

                        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
                            <VButton variant="ghost" onClick={onClose} type="button">
                                Cancel
                            </VButton>
                            <VButton variant="secondary" type="submit" loading={loading}>
                                {isEdit ? 'Save Changes' : 'Add Product'}
                            </VButton>
                        </Box>
                    </Box>
                </form>
            </Box>
        </Modal>
    );
};
