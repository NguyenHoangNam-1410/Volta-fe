import React, { useRef, useState } from 'react';
import {
    Modal, Box, Typography, IconButton, Divider, CircularProgress,
} from '@mui/material';
import useSWR from 'swr';
import { ADMIN_COLOR } from '../admin.constants';
import { VButton } from '../../../../common/components/VButton';
import type { Product, ProductImage } from '../../../../apis/products/product.interface';
import {
    getAllProductImage,
    uploadProductImage,
    deleteProductImage,
    setProductImagePrimary,
} from '../../../../apis/products/product.api';
import { useSnackbar } from '../../../../common/contexts/snackbar.context';

interface ManageProductImagesModalProps {
    open: boolean;
    onClose: () => void;
    product: Product | null;
}

export const ManageProductImagesModal: React.FC<ManageProductImagesModalProps> = ({
    open, onClose, product,
}) => {
    const { showSnackbar } = useSnackbar();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const { data: imagesResp, mutate, isLoading } = useSWR<ProductImage[]>(
        product && open ? ['product-images', product.id] : null,
        () => getAllProductImage(String(product!.id)).then((res) => {
            const payload = res.data;
            // Handle nested data structure
            if (payload && typeof payload === 'object' && 'data' in payload) {
                return (payload as any).data ?? [];
            }
            return Array.isArray(payload) ? payload : [];
        }),
    );

    const images = Array.isArray(imagesResp) ? imagesResp : [];

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !product) return;

        const files = Array.from(e.target.files);
        setUploading(true);
        try {
            await uploadProductImage(String(product.id), files);
            showSnackbar('Image(s) uploaded successfully', 'success');
            mutate();
        } catch (error) {
            showSnackbar('Failed to upload images', 'error');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDelete = async (imageId: number) => {
        if (!product || !window.confirm('Are you sure you want to delete this image?')) return;
        setActionLoading(`delete-${imageId}`);
        try {
            await deleteProductImage(String(product.id), String(imageId));
            showSnackbar('Image deleted', 'success');
            mutate();
        } catch {
            showSnackbar('Failed to delete image', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleSetPrimary = async (imageId: number) => {
        if (!product) return;
        setActionLoading(`primary-${imageId}`);
        try {
            await setProductImagePrimary(String(product.id), String(imageId));
            showSnackbar('Primary image updated', 'success');
            mutate();
        } catch {
            showSnackbar('Failed to set primary image', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    if (!product) return null;

    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: { xs: '95vw', sm: 700 },
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: ADMIN_COLOR.surface,
                    border: `1px solid ${ADMIN_COLOR.border}`,
                    borderRadius: '12px',
                    p: 3,
                    outline: 'none',
                }}
            >
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                        <Typography sx={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: ADMIN_COLOR.text }}>
                            Manage Images
                        </Typography>
                        <Typography sx={{ fontSize: 13, color: ADMIN_COLOR.dim }}>
                            {product.name}
                        </Typography>
                    </Box>
                    <IconButton onClick={onClose} size="small" sx={{ color: ADMIN_COLOR.dim }}>✕</IconButton>
                </Box>
                <Divider sx={{ borderColor: ADMIN_COLOR.border, mb: 3 }} />

                {/* Upload Action */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 3 }}>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                    <VButton
                        variant="secondary"
                        loading={uploading}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        + Upload Images
                    </VButton>
                </Box>

                {/* Grid */}
                <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 200 }}>
                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                            <CircularProgress sx={{ color: ADMIN_COLOR.accent }} />
                        </Box>
                    ) : images.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <Typography sx={{ color: ADMIN_COLOR.dim }}>No images uploaded for this product.</Typography>
                        </Box>
                    ) : (
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                                gap: 2,
                            }}
                        >
                            {images.map((img) => (
                                <Box
                                    key={img.id}
                                    sx={{
                                        border: `1px solid ${img.is_primary ? ADMIN_COLOR.accent : ADMIN_COLOR.border}`,
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        position: 'relative',
                                        bgcolor: ADMIN_COLOR.bg,
                                    }}
                                >
                                    {img.is_primary && (
                                        <Box
                                            sx={{
                                                position: 'absolute', top: 6, left: 6,
                                                bgcolor: ADMIN_COLOR.accent, color: ADMIN_COLOR.accentDark,
                                                fontSize: 10, fontWeight: 800,
                                                px: 1, py: 0.25, borderRadius: '4px',
                                            }}
                                        >
                                            PRIMARY
                                        </Box>
                                    )}

                                    <Box
                                        component="img"
                                        src={img.url}
                                        alt="Product"
                                        sx={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }}
                                    />

                                    <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 0.5, bgcolor: ADMIN_COLOR.s2 }}>
                                        <VButton
                                            variant={img.is_primary ? 'ghost' : 'secondary'}
                                            size="small"
                                            fullWidth
                                            disabled={img.is_primary}
                                            loading={actionLoading === `primary-${img.id}`}
                                            onClick={() => handleSetPrimary(img.id)}
                                            sx={{ fontSize: 11, padding: '4px' }}
                                        >
                                            {img.is_primary ? 'Primary' : 'Set Primary'}
                                        </VButton>
                                        <VButton
                                            variant="danger"
                                            size="small"
                                            fullWidth
                                            loading={actionLoading === `delete-${img.id}`}
                                            onClick={() => handleDelete(img.id)}
                                            sx={{ fontSize: 11, padding: '4px' }}
                                        >
                                            Delete
                                        </VButton>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>
            </Box>
        </Modal>
    );
};
