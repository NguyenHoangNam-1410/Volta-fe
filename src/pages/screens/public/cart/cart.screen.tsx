import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    CircularProgress,
} from '@mui/material';
import { COLOR_BRAND } from '../../../../common/constants/color.constant';
import { useCart } from '../../../../common/contexts/cart.context';
import { VButton } from '../../../../common/components';

export const CartScreen: React.FC = () => {
    const navigate = useNavigate();
    const { cart, loading, updateQty, removeItem } = useCart();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress sx={{ color: COLOR_BRAND.dark }} />
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa' }}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Typography
                    sx={{
                        fontFamily: '"Syne", sans-serif',
                        fontSize: 32,
                        fontWeight: 800,
                        mb: 3,
                        color: COLOR_BRAND.dark,
                    }}
                >
                    Your Cart
                </Typography>

                {cart.items.length === 0 ? (
                    <Box
                        sx={{
                            textAlign: 'center',
                            py: 8,
                            bgcolor: '#fff',
                            borderRadius: '20px',
                            border: '1px solid #e8e8e8',
                        }}
                    >
                        <Typography sx={{ color: '#888', mb: 2 }}>Your cart is empty</Typography>
                        <VButton variant="secondary" onClick={() => navigate('/shop')}>
                            Continue Shopping
                        </VButton>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
                        {/* Items */}
                        <Box sx={{ flex: 1 }}>
                            {cart.items.map((item) => (
                                <Box
                                    key={item.id}
                                    sx={{
                                        display: 'flex',
                                        gap: 2,
                                        mb: 2,
                                        bgcolor: '#fff',
                                        borderRadius: '16px',
                                        border: '1px solid #e8e8e8',
                                        p: 2,
                                        alignItems: 'center',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: '12px',
                                            bgcolor: '#f5f5f5',
                                            flexShrink: 0,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        {item.image_url ? (
                                            <Box
                                                component="img"
                                                src={item.image_url}
                                                alt={item.product_name}
                                                sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <Typography sx={{ fontSize: 10, color: '#bbb' }}>{item.product_name}</Typography>
                                        )}
                                    </Box>

                                    <Box sx={{ flex: 1 }}>
                                        <Typography
                                            onClick={() => navigate(`/shop/${item.product_id}`)}
                                            sx={{ fontWeight: 600, fontSize: 15, cursor: 'pointer', color: COLOR_BRAND.dark, '&:hover': { textDecoration: 'underline' } }}
                                        >
                                            {item.product_name}
                                        </Typography>
                                        <Typography sx={{ fontSize: 13, color: '#888' }}>
                                            ${Number(item.product_price).toFixed(2)} each
                                        </Typography>
                                    </Box>

                                    {/* Qty stepper */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
                                        <Box
                                            onClick={() => {
                                                if (item.quantity > 1) {
                                                    updateQty({ product_id: item.product_id, quantity: item.quantity - 1 });
                                                }
                                            }}
                                            sx={{ width: 32, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5' } }}
                                        >
                                            -
                                        </Box>
                                        <Box sx={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13, borderLeft: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0' }}>
                                            {item.quantity}
                                        </Box>
                                        <Box
                                            onClick={() => updateQty({ product_id: item.product_id, quantity: item.quantity + 1 })}
                                            sx={{ width: 32, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5' } }}
                                        >
                                            +
                                        </Box>
                                    </Box>

                                    <Typography sx={{ fontWeight: 700, fontSize: 16, minWidth: 80, textAlign: 'right', color: COLOR_BRAND.dark }}>
                                        ${Number(item.line_total).toFixed(2)}
                                    </Typography>

                                    <Box
                                        onClick={() => removeItem(item.product_id)}
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            color: '#999',
                                            fontSize: 18,
                                            '&:hover': { bgcolor: '#fee', color: '#ff4d4d' },
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
                                width: { xs: '100%', md: 340 },
                                flexShrink: 0,
                                bgcolor: '#fff',
                                borderRadius: '20px',
                                border: '1px solid #e8e8e8',
                                p: 3,
                                alignSelf: 'flex-start',
                                position: { md: 'sticky' },
                                top: { md: 24 },
                            }}
                        >
                            <Typography sx={{ fontWeight: 700, fontSize: 18, mb: 2, color: COLOR_BRAND.dark }}>
                                Order Summary
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography sx={{ color: '#666' }}>Items ({cart.count})</Typography>
                                <Typography sx={{ fontWeight: 600 }}>${Number(cart.subtotal).toFixed(2)}</Typography>
                            </Box>
                            <Box sx={{ borderTop: '1px solid #e8e8e8', pt: 2, mt: 2, display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                <Typography sx={{ fontWeight: 700, fontSize: 18, color: COLOR_BRAND.dark }}>Total</Typography>
                                <Typography sx={{ fontWeight: 800, fontSize: 22, color: COLOR_BRAND.dark }}>
                                    ${Number(cart.subtotal).toFixed(2)}
                                </Typography>
                            </Box>
                            <VButton
                                variant="secondary"
                                fullWidth
                                size="large"
                                onClick={() => navigate('/checkout')}
                                sx={{ borderRadius: '10px', mb: 1.5 }}
                            >
                                Proceed to Checkout
                            </VButton>
                            <VButton
                                variant="ghost"
                                fullWidth
                                onClick={() => navigate('/shop')}
                                sx={{ borderRadius: '10px', color: '#555', borderColor: '#ddd' }}
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
