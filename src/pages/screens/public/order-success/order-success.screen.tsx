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
        <Box sx={{ bgcolor: '#ffffff', display: 'flex', alignItems: 'center', minHeight: 'calc(100vh - 64px)' }}>
            <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
                <Box sx={{ py: 5 }}>
                    <Box
                        sx={{
                            width: 72,
                            height: 72,
                            borderRadius: '50%',
                            bgcolor: '#1a1a1a',
                            mx: 'auto',
                            mb: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 32,
                            color: COLOR_BRAND.accent,
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
                            color: '#1a1a1a',
                        }}
                    >
                        Order Confirmed
                    </Typography>
                    <Typography sx={{ color: '#888', mb: 1 }}>
                        Thank you for your purchase!
                    </Typography>
                    {orderId && (
                        <Typography sx={{ color: '#bbb', fontSize: 14, mb: 3 }}>
                            Order #{orderId}
                        </Typography>
                    )}

                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
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
