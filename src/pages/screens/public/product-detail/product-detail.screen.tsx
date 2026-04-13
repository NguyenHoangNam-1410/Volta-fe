import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import {
    Box,
    Container,
    Typography,
    Chip,
    CircularProgress,
    Breadcrumbs,
    Link,
} from '@mui/material';
import { COLOR_BRAND } from '../../../../common/constants/color.constant';
import { getShopProductById } from '../../../../apis/shops/shop.api';
import { getProductRelations } from '../../../../apis/products/product.api';
import type { ProductDetail } from '../../../../apis/shops/shop.interface';
import type { Product } from '../../../../apis/products/product.interface';
import { ProductRelationType } from '../../../../apis/products/product.enum';
import { VButton } from '../../../../common/components';
import { useCart } from '../../../../common/contexts/cart.context';
import { isAuthenticated } from '../../../../common/utils/auth-session';

const badgeVisual: Record<string, { text: string; bg: string }> = {
    hot: { text: '#ff4d4d', bg: 'rgba(255,77,77,0.14)' },
    sale: { text: '#ffaa4d', bg: 'rgba(255,170,77,0.14)' },
    new: { text: '#4da6ff', bg: 'rgba(77,166,255,0.14)' },
    none: { text: '#888', bg: 'rgba(136,136,136,0.14)' },
};

export const ProductDetailScreen: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [qty, setQty] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);

    const { data: detail, isLoading } = useSWR<ProductDetail | null>(
        slug ? ['product-detail', slug] : null,
        () => getShopProductById(Number(slug)).then((r) => r.data?.[0] ?? null),
    );

    const { data: relatedProducts } = useSWR<Product[]>(
        slug ? ['product-relations', slug] : null,
        () => getProductRelations(slug!, ProductRelationType.CROSSSELL).then((r) => r.data),
    );

    const handleAddToCart = async () => {
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }
        if (!detail?.product) return;
        await addToCart({ product_id: detail.product.id, quantity: qty });
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress sx={{ color: COLOR_BRAND.dark }} />
            </Box>
        );
    }

    if (!detail?.product) {
        return (
            <Container maxWidth="xl" sx={{ py: 8 }}>
                <Typography sx={{ textAlign: 'center', color: '#888' }}>Product not found</Typography>
            </Container>
        );
    }

    const { product, images } = detail;
    const style = badgeVisual[product.badge] ?? badgeVisual.none;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa' }}>
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Breadcrumbs sx={{ mb: 3 }}>
                    <Link
                        underline="hover"
                        color="inherit"
                        sx={{ cursor: 'pointer', fontSize: 14 }}
                        onClick={() => navigate('/')}
                    >
                        Home
                    </Link>
                    <Link
                        underline="hover"
                        color="inherit"
                        sx={{ cursor: 'pointer', fontSize: 14 }}
                        onClick={() => navigate('/shop')}
                    >
                        Shop
                    </Link>
                    <Typography sx={{ fontSize: 14, color: COLOR_BRAND.dark }}>{product.name}</Typography>
                </Breadcrumbs>

                <Box sx={{ display: 'flex', gap: 5, flexDirection: { xs: 'column', md: 'row' } }}>
                    {/* Image gallery */}
                    <Box sx={{ flex: 1, maxWidth: 560 }}>
                        <Box
                            sx={{
                                bgcolor: '#fff',
                                borderRadius: '20px',
                                border: '1px solid #e8e8e8',
                                height: 400,
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
                                            border: selectedImage === idx ? `2px solid ${COLOR_BRAND.accent}` : '1px solid #e0e0e0',
                                            bgcolor: '#fff',
                                            cursor: 'pointer',
                                            overflow: 'hidden',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
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
                        {product.badge !== 'none' && (
                            <Chip
                                label={product.badge.toUpperCase()}
                                size="small"
                                sx={{
                                    bgcolor: style.bg,
                                    color: style.text,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    mb: 1.5,
                                }}
                            />
                        )}
                        <Typography
                            sx={{
                                fontFamily: '"Syne", sans-serif',
                                fontSize: 28,
                                fontWeight: 800,
                                color: COLOR_BRAND.dark,
                                mb: 1,
                            }}
                        >
                            {product.name}
                        </Typography>

                        <Typography sx={{ fontSize: 32, fontWeight: 800, color: COLOR_BRAND.dark, mb: 2 }}>
                            ${Number(product.price).toFixed(2)}
                        </Typography>

                        <Typography sx={{ color: '#666', mb: 3, lineHeight: 1.7 }}>
                            {product.description || 'No description available.'}
                        </Typography>

                        <Typography sx={{ fontSize: 13, color: product.stock > 0 ? '#4dff91' : '#ff4d4d', mb: 3, fontWeight: 600 }}>
                            {product.stock > 0 ? `In stock (${product.stock} available)` : 'Out of stock'}
                        </Typography>

                        {/* Qty + Add to cart */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '10px',
                                    overflow: 'hidden',
                                }}
                            >
                                <Box
                                    onClick={() => setQty(Math.max(1, qty - 1))}
                                    sx={{
                                        width: 40,
                                        height: 44,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        fontSize: 18,
                                        '&:hover': { bgcolor: '#f5f5f5' },
                                    }}
                                >
                                    -
                                </Box>
                                <Box
                                    sx={{
                                        width: 48,
                                        height: 44,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 600,
                                        borderLeft: '1px solid #e0e0e0',
                                        borderRight: '1px solid #e0e0e0',
                                    }}
                                >
                                    {qty}
                                </Box>
                                <Box
                                    onClick={() => setQty(Math.min(product.stock, qty + 1))}
                                    sx={{
                                        width: 40,
                                        height: 44,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        fontSize: 18,
                                        '&:hover': { bgcolor: '#f5f5f5' },
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
                    <Box sx={{ mt: 6 }}>
                        <Typography
                            sx={{
                                fontFamily: '"Syne", sans-serif',
                                fontSize: 22,
                                fontWeight: 800,
                                mb: 2,
                                color: COLOR_BRAND.dark,
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
                            {(relatedProducts ?? []).map((rp) => (
                                <Box
                                    key={rp.id}
                                    onClick={() => navigate(`/shop/${rp.id}`)}
                                    sx={{
                                        bgcolor: '#fff',
                                        borderRadius: '16px',
                                        border: '1px solid #e8e8e8',
                                        p: 2,
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s',
                                        '&:hover': { transform: 'translateY(-2px)' },
                                    }}
                                >
                                    <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.5, color: COLOR_BRAND.dark }}>
                                        {rp.name}
                                    </Typography>
                                    <Typography sx={{ fontWeight: 700, fontSize: 18, color: COLOR_BRAND.dark }}>
                                        ${Number(rp.price).toFixed(2)}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                )}
            </Container>
        </Box>
    );
};
