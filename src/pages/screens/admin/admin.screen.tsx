import React, { useState } from 'react';
import { Box, Typography, InputBase } from '@mui/material';
import { COLOR_BRAND } from '../../../common/constants/color.constant';
import { A } from './admin.constants';
import { DashboardTab } from './dashboard/dashboard.tab';
import { OrdersTab } from './orders/orders.tab';
import { DiscountsTab } from './discounts/discounts.tab';
import { CustomersTab } from './customers/customers.tab';
import { ProductsTab } from './product/products.tab';
import { CategoriesTab } from './categories/categories.tab';
import { BundlesTab } from './bundles/bundles.tab';

type AdminPage = 'dashboard' | 'orders' | 'products' | 'categories' | 'bundles' | 'discounts' | 'customers';

const NAV_SECTIONS = [
    {
        label: 'Main',
        items: [
            { id: 'dashboard' as AdminPage, label: 'Dashboard', icon: '◈' },
            { id: 'orders' as AdminPage, label: 'Orders', icon: '📦' },
            { id: 'products' as AdminPage, label: 'Products', icon: '⚡' },
        ],
    },
    {
        label: 'Store',
        items: [
            { id: 'categories' as AdminPage, label: 'Categories', icon: '▦' },
            { id: 'bundles' as AdminPage, label: 'Bundles', icon: '▣' },
            { id: 'discounts' as AdminPage, label: 'Discounts', icon: '🏷' },
            { id: 'customers' as AdminPage, label: 'Customers', icon: '👤' },
        ],
    },
];

const PAGE_TITLES: Record<AdminPage, string> = {
    dashboard: 'Dashboard',
    orders: 'Orders',
    products: 'Products',
    categories: 'Categories',
    bundles: 'Bundles',
    discounts: 'Discounts',
    customers: 'Customers',
};

export const AdminScreen: React.FC = () => {
    const [page, setPage] = useState<AdminPage>('dashboard');
    const [collapsed, setCollapsed] = useState(false);
    const [search, setSearch] = useState('');

    return (
        <Box
            sx={{
                display: 'flex',
                height: '100vh',
                bgcolor: A.bg,
                overflow: 'hidden',
                color: A.text,
                fontFamily: "'DM Sans', sans-serif",
            }}
        >
            {/* ── Sidebar ── */}
            <Box
                sx={{
                    width: collapsed ? 60 : 220,
                    flexShrink: 0,
                    bgcolor: A.surface,
                    borderRight: `1px solid ${A.border}`,
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'width 0.3s ease',
                    overflow: 'hidden',
                }}
            >
                {/* Logo */}
                <Box
                    sx={{
                        height: 56,
                        display: 'flex',
                        alignItems: 'center',
                        px: 2.25,
                        borderBottom: `1px solid ${A.border}`,
                        gap: 1.25,
                        flexShrink: 0,
                    }}
                >
                    <Box
                        sx={{
                            width: 28, height: 28,
                            bgcolor: COLOR_BRAND.accent,
                            color: COLOR_BRAND.dark,
                            borderRadius: '6px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 14,
                            flexShrink: 0,
                        }}
                    >
                        V
                    </Box>
                    {!collapsed && (
                        <Typography
                            sx={{
                                fontFamily: "'Syne', sans-serif",
                                fontWeight: 800,
                                fontSize: 16,
                                letterSpacing: 1,
                                color: A.text,
                                whiteSpace: 'nowrap',
                            }}
                        >
                            OLTA
                        </Typography>
                    )}
                </Box>

                {/* Nav */}
                <Box sx={{ flex: 1, py: 2, px: 1, overflowY: 'auto' }}>
                    {NAV_SECTIONS.map((section) => (
                        <Box key={section.label}>
                            {!collapsed && (
                                <Typography
                                    sx={{
                                        fontSize: 10,
                                        textTransform: 'uppercase',
                                        letterSpacing: 1.5,
                                        color: A.mid,
                                        px: 1.25,
                                        mt: 2,
                                        mb: 0.75,
                                    }}
                                >
                                    {section.label}
                                </Typography>
                            )}
                            {section.items.map((item) => (
                                <Box
                                    key={item.id}
                                    onClick={() => {
                                        setPage(item.id);
                                        setSearch('');
                                    }}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        px: 1.25,
                                        py: 1.125,
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        bgcolor: page === item.id ? COLOR_BRAND.accent : 'transparent',
                                        color: page === item.id ? COLOR_BRAND.dark : A.dim,
                                        '&:hover': page !== item.id
                                            ? { bgcolor: A.s2, color: A.text }
                                            : {},
                                        transition: 'background 0.15s, color 0.15s',
                                        whiteSpace: 'nowrap',
                                        mb: 0.25,
                                    }}
                                >
                                    <Box sx={{ fontSize: 16, flexShrink: 0, width: 20, textAlign: 'center' }}>
                                        {item.icon}
                                    </Box>
                                    {!collapsed && (
                                        <Typography sx={{ fontSize: 14, fontWeight: 400, color: 'inherit' }}>
                                            {item.label}
                                        </Typography>
                                    )}
                                </Box>
                            ))}
                        </Box>
                    ))}
                </Box>

                {/* Footer */}
                <Box sx={{ p: 1, borderTop: `1px solid ${A.border}` }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.25,
                            px: 1.25, py: 1,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            '&:hover': { bgcolor: A.s2 },
                        }}
                    >
                        <Box
                            sx={{
                                width: 30, height: 30,
                                borderRadius: '50%',
                                bgcolor: COLOR_BRAND.accent,
                                color: COLOR_BRAND.dark,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontFamily: "'Syne', sans-serif", fontSize: 12, fontWeight: 700,
                                flexShrink: 0,
                            }}
                        >
                            VA
                        </Box>
                        {!collapsed && (
                            <Box sx={{ overflow: 'hidden' }}>
                                <Typography sx={{ fontSize: 13, fontWeight: 500, color: A.text, whiteSpace: 'nowrap' }}>
                                    Volta Admin
                                </Typography>
                                <Typography sx={{ fontSize: 11, color: A.dim }}>Administrator</Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>

            {/* ── Main ── */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Topbar */}
                <Box
                    sx={{
                        height: 56,
                        flexShrink: 0,
                        bgcolor: A.surface,
                        borderBottom: `1px solid ${A.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        px: 3,
                        gap: 2,
                    }}
                >
                    <Box
                        onClick={() => setCollapsed((c) => !c)}
                        sx={{
                            width: 30, height: 30,
                            borderRadius: '6px',
                            border: `1px solid ${A.border}`,
                            color: A.dim,
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12,
                            userSelect: 'none',
                            '&:hover': { bgcolor: A.s2, color: A.text },
                        }}
                    >
                        {collapsed ? '▶' : '◀'}
                    </Box>

                    <Typography
                        sx={{
                            fontFamily: "'Syne', sans-serif",
                            fontSize: 16,
                            fontWeight: 700,
                            color: A.text,
                            flex: 1,
                        }}
                    >
                        {PAGE_TITLES[page]}
                    </Typography>

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            bgcolor: A.s2,
                            border: `1px solid ${A.border}`,
                            borderRadius: '8px',
                            px: 1.75,
                            py: 0.875,
                            width: 240,
                        }}
                    >
                        <Typography sx={{ color: A.mid, fontSize: 13 }}>🔍</Typography>
                        <InputBase
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search..."
                            sx={{
                                fontSize: 13,
                                color: A.text,
                                flex: 1,
                                '& input::placeholder': { color: A.mid },
                            }}
                        />
                    </Box>
                </Box>

                {/* Content */}
                <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: A.bg }}>
                    {page === 'dashboard'  && <DashboardTab />}
                    {page === 'products'   && <ProductsTab search={search} />}
                    {page === 'orders'     && <OrdersTab search={search} />}
                    {page === 'categories' && <CategoriesTab search={search} />}
                    {page === 'bundles'    && <BundlesTab search={search} />}
                    {page === 'discounts'  && <DiscountsTab />}
                    {page === 'customers'  && <CustomersTab search={search} />}
                </Box>
            </Box>
        </Box>
    );
};
