import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Container, Typography } from '@mui/material';
import { COLOR_BRAND } from '../../../../common/constants/color.constant';
import { VButton } from '../../../../common/components';

export const OrderSuccessScreen: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const orderId = (location.state as { orderId?: number })?.orderId;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa', display: 'flex', alignItems: 'center' }}>
            <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
                <Box
                    sx={{
                        bgcolor: '#fff',
                        borderRadius: '24px',
                        border: '1px solid #e8e8e8',
                        p: 5,
                    }}
                >
                    <Box
                        sx={{
                            width: 72,
                            height: 72,
                            borderRadius: '50%',
                            bgcolor: COLOR_BRAND.accent,
                            mx: 'auto',
                            mb: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 32,
                            color: COLOR_BRAND.dark,
                            fontWeight: 800,
                        }}
                    >
                        V
                    </Box>
                    <Typography
                        sx={{
                            fontFamily: '"Syne", sans-serif',
                            fontWeight: 800,
                            fontSize: 28,
                            mb: 1,
                            color: COLOR_BRAND.dark,
                        }}
                    >
                        Order Confirmed
                    </Typography>
                    <Typography sx={{ color: '#666', mb: 1 }}>
                        Thank you for your purchase!
                    </Typography>
                    {orderId && (
                        <Typography sx={{ color: '#888', fontSize: 14, mb: 3 }}>
                            Order #{orderId}
                        </Typography>
                    )}

                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
                        <VButton variant="secondary" onClick={() => navigate('/shop')} sx={{ borderRadius: '10px' }}>
                            Continue Shopping
                        </VButton>
                        <VButton variant="ghost" onClick={() => navigate('/')} sx={{ borderRadius: '10px', color: '#555', borderColor: '#ddd' }}>
                            Go Home
                        </VButton>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};
