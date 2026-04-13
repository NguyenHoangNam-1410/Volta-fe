import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';
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
} from '@mui/material';
import { COLOR_BRAND } from '../../../../common/constants/color.constant';
import { getShops, getShopCategories } from '../../../../apis/shops/shop.api';
import type { Product } from '../../../../apis/products/product.interface';
import type { Category } from '../../../../apis/categories/category.interface';
import { VButton } from '../../../../common/components';
import { useCart } from '../../../../common/contexts/cart.context';
import { isAuthenticated } from '../../../../common/utils/auth-session';

const badgeVisual: Record<string, { text: string; bg: string }> = {
    hot: { text: '#ff4d4d', bg: 'rgba(255,77,77,0.14)' },
    sale: { text: '#ffaa4d', bg: 'rgba(255,170,77,0.14)' },
    new: { text: '#4da6ff', bg: 'rgba(77,166,255,0.14)' },
    none: { text: '#888', bg: 'rgba(136,136,136,0.14)' },
};

export const ShopScreen: React.FC = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [page, setPage] = useState(1);
    const [categoryId, setCategoryId] = useState<number | ''>('');
    const [sortBy, setSortBy] = useState('newest');
    const [priceRange, setPriceRange] = useState<number[]>([0, 10000]);
    const limit = 12;

    const { data: categories } = useSWR<Category[]>(
        'shop-categories',
        () => getShopCategories().then((r) => r.data),
    );

    const { data: shopRes, isLoading } = useSWR(
        ['shop-products', page, categoryId, sortBy],
        () =>
            getShops({
                search: '',
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
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0;
    });

    const handleAddToCart = async (product: Product) => {
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }
        await addToCart({ product_id: product.id, quantity: 1 });
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa' }}>
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Typography
                    sx={{
                        fontFamily: '"Syne", sans-serif',
                        fontSize: 32,
                        fontWeight: 800,
                        mb: 0.5,
                        color: COLOR_BRAND.dark,
                    }}
                >
                    Shop
                </Typography>
                <Typography sx={{ color: '#666', mb: 3 }}>
                    Browse our tech collection
                </Typography>

                <Box sx={{ display: 'flex', gap: 4 }}>
                    {/* Sidebar filters */}
                    <Box
                        sx={{
                            width: 240,
                            flexShrink: 0,
                            display: { xs: 'none', md: 'block' },
                        }}
                    >
                        <Box
                            sx={{
                                bgcolor: '#fff',
                                borderRadius: '16px',
                                border: '1px solid #e8e8e8',
                                p: 2.5,
                                mb: 2,
                            }}
                        >
                            <Typography
                                sx={{ fontSize: 13, fontWeight: 700, mb: 1.5, color: COLOR_BRAND.dark, textTransform: 'uppercase', letterSpacing: 1 }}
                            >
                                Category
                            </Typography>
                            <Box
                                onClick={() => setCategoryId('')}
                                sx={{
                                    py: 0.75,
                                    px: 1.25,
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    bgcolor: categoryId === '' ? COLOR_BRAND.accent : 'transparent',
                                    color: categoryId === '' ? COLOR_BRAND.dark : '#555',
                                    fontWeight: categoryId === '' ? 600 : 400,
                                    fontSize: 14,
                                    mb: 0.5,
                                    '&:hover': { bgcolor: categoryId === '' ? COLOR_BRAND.accent : '#f0f0f0' },
                                }}
                            >
                                All
                            </Box>
                            {(categories ?? []).map((cat) => (
                                <Box
                                    key={cat.id}
                                    onClick={() => setCategoryId(cat.id)}
                                    sx={{
                                        py: 0.75,
                                        px: 1.25,
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        bgcolor: categoryId === cat.id ? COLOR_BRAND.accent : 'transparent',
                                        color: categoryId === cat.id ? COLOR_BRAND.dark : '#555',
                                        fontWeight: categoryId === cat.id ? 600 : 400,
                                        fontSize: 14,
                                        mb: 0.5,
                                        '&:hover': { bgcolor: categoryId === cat.id ? COLOR_BRAND.accent : '#f0f0f0' },
                                    }}
                                >
                                    {cat.name}
                                </Box>
                            ))}
                        </Box>

                        <Box
                            sx={{
                                bgcolor: '#fff',
                                borderRadius: '16px',
                                border: '1px solid #e8e8e8',
                                p: 2.5,
                            }}
                        >
                            <Typography
                                sx={{ fontSize: 13, fontWeight: 700, mb: 1.5, color: COLOR_BRAND.dark, textTransform: 'uppercase', letterSpacing: 1 }}
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
                                    color: COLOR_BRAND.dark,
                                    '& .MuiSlider-thumb': { bgcolor: COLOR_BRAND.accent, border: `2px solid ${COLOR_BRAND.dark}` },
                                }}
                            />
                            <Typography sx={{ fontSize: 12, color: '#888' }}>
                                ${priceRange[0]} - ${priceRange[1]}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Products grid */}
                    <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                            <Select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                size="small"
                                sx={{
                                    minWidth: 180,
                                    bgcolor: '#fff',
                                    borderRadius: '8px',
                                    fontSize: 13,
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e0e0e0' },
                                }}
                            >
                                <MenuItem value="newest">Newest</MenuItem>
                                <MenuItem value="price_asc">Price: Low to High</MenuItem>
                                <MenuItem value="price_desc">Price: High to Low</MenuItem>
                                <MenuItem value="name">Name A-Z</MenuItem>
                            </Select>
                        </Box>

                        {isLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                                <CircularProgress sx={{ color: COLOR_BRAND.dark }} />
                            </Box>
                        ) : (
                            <>
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)', xl: 'repeat(4, 1fr)' },
                                        gap: 2,
                                    }}
                                >
                                    {sorted.map((product) => {
                                        const style = badgeVisual[product.badge] ?? badgeVisual.none;
                                        return (
                                            <Box
                                                key={product.id}
                                                sx={{
                                                    bgcolor: '#fff',
                                                    borderRadius: '16px',
                                                    border: '1px solid #e8e8e8',
                                                    overflow: 'hidden',
                                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        transform: 'translateY(-4px)',
                                                        boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
                                                    },
                                                }}
                                            >
                                                <Box
                                                    onClick={() => navigate(`/shop/${product.id}`)}
                                                    sx={{
                                                        height: 180,
                                                        bgcolor: '#f5f5f5',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <Typography sx={{ color: '#bbb', fontSize: 13 }}>
                                                        {product.name}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ p: 2 }}>
                                                    {product.badge !== 'none' && (
                                                        <Chip
                                                            label={product.badge.toUpperCase()}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: style.bg,
                                                                color: style.text,
                                                                fontSize: 10,
                                                                fontWeight: 700,
                                                                mb: 1,
                                                                height: 22,
                                                            }}
                                                        />
                                                    )}
                                                    <Typography
                                                        onClick={() => navigate(`/shop/${product.id}`)}
                                                        sx={{ fontWeight: 600, fontSize: 15, color: COLOR_BRAND.dark, mb: 0.5, cursor: 'pointer' }}
                                                    >
                                                        {product.name}
                                                    </Typography>
                                                    <Typography sx={{ color: '#888', fontSize: 12, mb: 1.5 }}>
                                                        {product.stock > 0 ? `In stock (${product.stock})` : 'Out of stock'}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <Typography sx={{ fontWeight: 800, fontSize: 20, color: COLOR_BRAND.dark }}>
                                                            ${Number(product.price).toFixed(2)}
                                                        </Typography>
                                                        <VButton
                                                            variant="secondary"
                                                            size="small"
                                                            onClick={() => handleAddToCart(product)}
                                                            disabled={product.stock <= 0}
                                                            sx={{ borderRadius: '8px', fontSize: 12 }}
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
                                    <Box sx={{ textAlign: 'center', py: 8 }}>
                                        <Typography sx={{ color: '#888' }}>No products found</Typography>
                                    </Box>
                                )}

                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                    <Pagination
                                        count={totalPages}
                                        page={page}
                                        onChange={(_e, v) => setPage(v)}
                                        sx={{
                                            '& .Mui-selected': {
                                                bgcolor: `${COLOR_BRAND.accent} !important`,
                                                color: COLOR_BRAND.dark,
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
