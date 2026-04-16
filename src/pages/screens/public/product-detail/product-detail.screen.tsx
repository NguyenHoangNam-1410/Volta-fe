import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import {
    Box,
    Container,
    Typography,
    Chip,
    CircularProgress,
} from '@mui/material';
import { getShopProductById } from '../../../../apis/shops/shop.api';
import { getProductRelations } from '../../../../apis/products/product.api';
import type { ProductDetail } from '../../../../apis/shops/shop.interface';
import type { Product } from '../../../../apis/products/product.interface';
import { ProductRelationType } from '../../../../apis/products/product.enum';
import { VButton } from '../../../../common/components';
import { VBreadcrumb } from '../../../../common/components/VBreadcrumb';
import { useCart } from '../../../../common/contexts/cart.context';

const badgeVisual: Record<string, { text: string; bg: string }> = {
    hot: { text: '#e53935', bg: '#ffeaea' },
    sale: { text: '#e65100', bg: '#fff3e0' },
    new: { text: '#1565c0', bg: '#e3f2fd' },
    none: { text: '#888', bg: '#f5f5f5' },
};

export const ProductDetailScreen: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [qty, setQty] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);

    const { data: detail, isLoading } = useSWR<ProductDetail | null>(
        id ? ['product-detail', id] : null,
        () => getShopProductById(id!).then((r) => (r as { data?: { data?: ProductDetail } | ProductDetail })?.data && 'data' in ((r as { data?: unknown }).data as object)
            ? ((r as { data?: { data?: ProductDetail } }).data?.data ?? null)
            : ((r as { data?: ProductDetail }).data ?? null)),
    );

    const relationProductId = detail?.product?.id;

    const { data: relatedProducts } = useSWR<Product[]>(
        relationProductId ? ['product-relations', relationProductId] : null,
        () => getProductRelations(String(relationProductId), ProductRelationType.CROSSSELL).then((r) => (r as { data?: { data?: Product[] } | Product[] })?.data && 'data' in ((r as { data?: unknown }).data as object)
            ? ((r as { data?: { data?: Product[] } }).data?.data ?? [])
            : ((r as { data?: Product[] }).data ?? [])),
    );

    const handleAddToCart = async () => {
        if (!detail?.product) return;
        await addToCart({ product_id: detail.product.id, quantity: qty });
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress sx={{ color: '#1a1a1a' }} />
            </Box>
        );
    }

    if (!detail?.product) {
        return (
            <Container maxWidth="xl" sx={{ py: 8 }}>
                <Typography sx={{ textAlign: 'center', color: '#999' }}>Product not found</Typography>
            </Container>
        );
    }

    const { product, images } = detail;
    const style = badgeVisual[product.badge] ?? badgeVisual.none;

    return (
        <Box sx={{ bgcolor: '#ffffff' }}>
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <VBreadcrumb
                    items={[
                        { label: 'Home', path: '/' },
                        { label: 'Shop', path: '/shop' },
                        { label: product.name },
                    ]}
                />

                <Box sx={{ display: 'flex', gap: 6, flexDirection: { xs: 'column', md: 'row' } }}>
                    {/* Image gallery */}
                    <Box sx={{ flex: 1, maxWidth: 560 }}>
                        <Box
                            sx={{
                                bgcolor: '#fafafa',
                                borderRadius: '20px',
                                border: '1px solid #f0f0f0',
                                height: 420,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 2,
                                overflow: 'hidden',
                            }}
                        >
                            {images.length > 0 ? (
                                <Box
                                    component="img"
                                    src={images[selectedImage]?.url}
                                    alt={product.name}
                                    sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                />
                            ) : (
                                <Typography sx={{ color: '#ccc' }}>{product.name}</Typography>
                            )}
                        </Box>
                        {images.length > 1 && (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                {images.map((img, idx) => (
                                    <Box
                                        key={img.id}
                                        onClick={() => setSelectedImage(idx)}
                                        sx={{
                                            width: 64,
                                            height: 64,
                                            borderRadius: '10px',
                                            border: selectedImage === idx ? '2px solid #1a1a1a' : '1px solid #f0f0f0',
                                            bgcolor: '#fafafa',
                                            cursor: 'pointer',
                                            overflow: 'hidden',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'border-color 0.15s',
                                        }}
                                    >
                                        <Box
                                            component="img"
                                            src={img.url}
                                            alt=""
                                            sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }}
                                        />
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>

                    {/* Info */}
                    <Box sx={{ flex: 1 }}>
                        {product.badge && product.badge !== 'none' && (
                            <Chip
                                label={product.badge.toUpperCase()}
                                size="small"
                                sx={{
                                    bgcolor: style.bg,
                                    color: style.text,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    mb: 2,
                                }}
                            />
                        )}
                        <Typography
                            sx={{
                                fontFamily: '"Syne", sans-serif',
                                fontSize: 28,
                                fontWeight: 800,
                                color: '#1a1a1a',
                                mb: 1,
                                lineHeight: 1.3,
                            }}
                        >
                            {product.name}
                        </Typography>

                        <Typography sx={{ fontSize: 32, fontWeight: 800, color: '#1a1a1a', mb: 2 }}>
                            ${Number(product.price).toFixed(2)}
                        </Typography>

                        <Box sx={{ borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0', py: 2, mb: 3 }}>
                            <Typography sx={{ color: '#555', lineHeight: 1.8, fontSize: 14 }}>
                                {product.description || 'No description available.'}
                            </Typography>
                        </Box>

                        <Typography
                            sx={{
                                fontSize: 13,
                                color: product.stock > 0 ? '#2e7d32' : '#d32f2f',
                                mb: 3,
                                fontWeight: 600,
                            }}
                        >
                            {product.stock > 0 ? `In stock (${product.stock} available)` : 'Out of stock'}
                        </Typography>

                        {/* Qty + Add to cart */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    border: '1px solid #e8e8e8',
                                    borderRadius: '10px',
                                    overflow: 'hidden',
                                }}
                            >
                                <Box
                                    onClick={() => setQty(Math.max(1, qty - 1))}
                                    sx={{
                                        width: 40, height: 44,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', userSelect: 'none', fontSize: 18, color: '#555',
                                        '&:hover': { bgcolor: '#f8f8f8' },
                                    }}
                                >
                                    -
                                </Box>
                                <Box
                                    sx={{
                                        width: 48, height: 44,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 600,
                                        borderLeft: '1px solid #e8e8e8',
                                        borderRight: '1px solid #e8e8e8',
                                    }}
                                >
                                    {qty}
                                </Box>
                                <Box
                                    onClick={() => setQty(Math.min(product.stock, qty + 1))}
                                    sx={{
                                        width: 40, height: 44,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', userSelect: 'none', fontSize: 18, color: '#555',
                                        '&:hover': { bgcolor: '#f8f8f8' },
                                    }}
                                >
                                    +
                                </Box>
                            </Box>
                            <VButton
                                variant="secondary"
                                size="large"
                                onClick={handleAddToCart}
                                disabled={product.stock <= 0}
                                sx={{ flex: 1, borderRadius: '10px' }}
                            >
                                Add to Cart
                            </VButton>
                        </Box>

                        <VButton
                            variant="primary"
                            size="large"
                            fullWidth
                            onClick={() => {
                                handleAddToCart().then(() => navigate('/cart'));
                            }}
                            disabled={product.stock <= 0}
                            sx={{ borderRadius: '10px' }}
                        >
                            Buy Now
                        </VButton>
                    </Box>
                </Box>

                {/* Related products */}
                {(relatedProducts ?? []).length > 0 && (
                    <Box sx={{ mt: 8, borderTop: '1px solid #f0f0f0', pt: 5 }}>
                        <Typography
                            sx={{
                                fontSize: 20,
                                fontWeight: 700,
                                mb: 3,
                                color: '#1a1a1a',
                            }}
                        >
                            You may also like
                        </Typography>
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
                                gap: 2,
                            }}
                        >
                            {(relatedProducts ?? []).map((rp) => {
                                const rpStyle = badgeVisual[rp.badge] ?? badgeVisual.none;
                                const rpHasBadge = rp.badge && rp.badge !== 'none';
                                return (
                                    <Box
                                        key={rp.id}
                                        onClick={() => navigate(`/shop/${rp.id}`)}
                                        sx={{
                                            borderRadius: '16px',
                                            border: rpHasBadge ? `2px solid ${rpStyle.text}` : '1px solid #f0f0f0',
                                            p: 2.5,
                                            cursor: 'pointer',
                                            position: 'relative',
                                            transition: 'transform 0.2s, box-shadow 0.2s, border 0.2s',
                                            boxShadow: rpHasBadge ? `0 0 0 1px ${rpStyle.bg}` : 'none',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: rpHasBadge
                                                    ? `0 4px 16px rgba(0,0,0,0.08), 0 0 0 1px ${rpStyle.bg}`
                                                    : '0 4px 16px rgba(0,0,0,0.04)',
                                            },
                                        }}
                                    >
                                        {rpHasBadge && (
                                            <Chip
                                                label={rp.badge.toUpperCase()}
                                                size="small"
                                                sx={{
                                                    bgcolor: rpStyle.bg,
                                                    color: rpStyle.text,
                                                    fontSize: 9,
                                                    fontWeight: 700,
                                                    height: 20,
                                                    position: 'absolute',
                                                    top: 8,
                                                    right: 8,
                                                    zIndex: 10,
                                                }}
                                            />
                                        )}
                                        <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.5, color: '#1a1a1a' }}>
                                            {rp.name}
                                        </Typography>
                                        <Typography sx={{ fontWeight: 700, fontSize: 18, color: '#1a1a1a' }}>
                                            ${rp.price ? Number(rp.price).toFixed(2) : 'N/A'}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>
                )}
            </Container>
        </Box>
    );
};
