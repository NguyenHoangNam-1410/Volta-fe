import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Box,
    Typography,
    Badge,
    Container,
} from '@mui/material';
import { COLOR_BRAND } from '../../common/constants/color.constant';
import { useCart } from '../../common/contexts/cart.context';
import { isAuthenticated, getStoredUser, clearSession } from '../../common/utils/auth-session';

const NAV_TABS = [
    { label: 'Home', path: '/' },
    { label: 'Shop', path: '/shop' },
];

export const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { cart } = useCart();
    const authenticated = isAuthenticated();
    const user = getStoredUser();

    const handleSignOut = () => {
        clearSession();
        navigate('/');
        window.location.reload();
    };

    return (
        <AppBar
            position="sticky"
            elevation={0}
            sx={{
                bgcolor: '#ffffff',
                borderBottom: '1px solid #eee',
            }}
        >
            <Container maxWidth="xl">
                <Toolbar
                    disableGutters
                    sx={{
                        height: 64,
                        display: 'flex',
                        justifyContent: 'space-between',
                    }}
                >
                    {/* Logo */}
                    <Box
                        onClick={() => navigate('/')}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            cursor: 'pointer',
                        }}
                    >
                        <Box
                            sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '8px',
                                bgcolor: COLOR_BRAND.dark,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: COLOR_BRAND.accent,
                                fontFamily: '"Syne", sans-serif',
                                fontWeight: 800,
                                fontSize: 16,
                            }}
                        >
                            V
                        </Box>
                        <Typography
                            sx={{
                                fontFamily: '"Syne", sans-serif',
                                fontWeight: 800,
                                fontSize: 18,
                                letterSpacing: 1.5,
                                color: COLOR_BRAND.dark,
                            }}
                        >
                            OLTA
                        </Typography>
                    </Box>

                    {/* Center tabs */}
                    <Box
                        sx={{
                            display: 'flex',
                            gap: 0.5,
                            bgcolor: '#f5f5f5',
                            borderRadius: '12px',
                            p: 0.5,
                        }}
                    >
                        {NAV_TABS.map((tab) => {
                            const isActive =
                                tab.path === '/'
                                    ? location.pathname === '/'
                                    : location.pathname.startsWith(tab.path);
                            return (
                                <Box
                                    key={tab.path}
                                    onClick={() => navigate(tab.path)}
                                    sx={{
                                        px: 3,
                                        py: 1,
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        bgcolor: isActive ? '#ffffff' : 'transparent',
                                        boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                                        color: isActive ? COLOR_BRAND.dark : '#888',
                                        fontWeight: isActive ? 600 : 400,
                                        fontSize: 14,
                                        transition: 'all 0.15s ease',
                                        userSelect: 'none',
                                        '&:hover': {
                                            color: COLOR_BRAND.dark,
                                        },
                                    }}
                                >
                                    {tab.label}
                                </Box>
                            );
                        })}
                    </Box>

                    {/* Right: Cart + Account */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {/* Cart */}
                        <Badge
                            badgeContent={cart.count}
                            sx={{
                                cursor: 'pointer',
                                '& .MuiBadge-badge': {
                                    bgcolor: COLOR_BRAND.dark,
                                    color: COLOR_BRAND.accent,
                                    fontSize: 10,
                                    fontWeight: 700,
                                    minWidth: 18,
                                    height: 18,
                                },
                            }}
                            onClick={() => navigate('/cart')}
                        >
                            <Box
                                sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '10px',
                                    border: '1px solid #e8e8e8',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: COLOR_BRAND.dark,
                                    fontSize: 16,
                                    '&:hover': { bgcolor: '#f8f8f8' },
                                }}
                            >
                                {'$'}
                            </Box>
                        </Badge>

                        {/* Account */}
                        {authenticated ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box
                                    sx={{
                                        width: 34,
                                        height: 34,
                                        borderRadius: '50%',
                                        bgcolor: COLOR_BRAND.dark,
                                        color: COLOR_BRAND.accent,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 700,
                                        fontSize: 13,
                                    }}
                                >
                                    {(user?.full_name?.[0] ?? 'U').toUpperCase()}
                                </Box>
                                <Box
                                    onClick={handleSignOut}
                                    sx={{
                                        fontSize: 13,
                                        color: '#888',
                                        cursor: 'pointer',
                                        '&:hover': { color: COLOR_BRAND.dark },
                                    }}
                                >
                                    Sign out
                                </Box>
                            </Box>
                        ) : (
                            <Box
                                onClick={() => navigate('/login')}
                                sx={{
                                    px: 2.5,
                                    py: 1,
                                    borderRadius: '10px',
                                    bgcolor: COLOR_BRAND.dark,
                                    color: COLOR_BRAND.accent,
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    '&:hover': { bgcolor: '#1a1a1a' },
                                }}
                            >
                                Sign in
                            </Box>
                        )}
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};
