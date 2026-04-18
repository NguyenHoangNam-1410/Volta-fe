import React, { useState } from 'react';
import useSWR from 'swr';
import { Box, Typography, Select, MenuItem, FormControl } from '@mui/material';
import { ADMIN_COLOR, statusColor } from '../admin.constants';
import { VTable } from '../../../../common/components/VTable';
import type { VTableColumn } from '../../../../common/components/VTable';
import { VButton } from '../../../../common/components/VButton';
import { useSnackbar } from '../../../../common/contexts/snackbar.context';
import { getAllOrder, updateOrderStatus } from '../../../../apis/orders/order.api';
import type { Order } from '../../../../apis/orders/order.interface';
import { OrderStatus } from '../../../../apis/orders/order.enum';
import type { PaginatedResponse } from '../../../../common/interfaces/base-requestdto.interface';
import dayjs from 'dayjs';

interface OrdersTabProps {
    search: string;
}

const StatusPill: React.FC<{ status: string }> = ({ status }) => {
    const c = statusColor[status] ?? { bg: 'rgba(136,136,136,0.12)', text: '#888' };
    return (
        <Box
            sx={{
                display: 'inline-flex', alignItems: 'center', gap: 0.6,
                bgcolor: c.bg, color: c.text,
                fontSize: 11, fontWeight: 600,
                px: 1.25, py: 0.375, borderRadius: '50px',
            }}
        >
            <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: 'currentColor' }} />
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Box>
    );
};

const STATUS_OPTIONS = Object.values(OrderStatus);
const PAGE_SIZE = 10;

const StatCard: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
    <Box
        sx={{
            bgcolor: ADMIN_COLOR.surface, border: `1px solid ${ADMIN_COLOR.border}`, borderRadius: '10px',
            p: 2, textAlign: 'center', flex: 1,
        }}
    >
        <Typography sx={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color, mb: 0.5 }}>
            {value}
        </Typography>
        <Typography sx={{ fontSize: 11, color: ADMIN_COLOR.dim, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {label}
        </Typography>
    </Box>
);

export const OrdersTab: React.FC<OrdersTabProps> = ({ search }) => {
    const { showSnackbar } = useSnackbar();
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const swrKey = ['orders', page, PAGE_SIZE, search, statusFilter];

    const { data: ordersResp, mutate } = useSWR<PaginatedResponse<Order>>(
        swrKey,
        () => getAllOrder({
            page,
            limit: PAGE_SIZE,
            search,
            ...(statusFilter ? { status: statusFilter as OrderStatus } : {}),
        }).then((r) => r.data),
    );

    const orders = ordersResp?.data ?? [];
    const total = ordersResp?.meta?.total ?? ordersResp?.pagination?.total ?? 0;
    const totalPages = Math.ceil(total / PAGE_SIZE);

    const countByStatus = (s: OrderStatus) => orders.filter((o) => o.status === s).length;

    const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
        setUpdatingId(orderId);
        try {
            await updateOrderStatus(String(orderId), newStatus);
            showSnackbar('Order status updated', 'success');
            mutate();
        } catch {
            showSnackbar('Failed to update status', 'error');
        } finally {
            setUpdatingId(null);
        }
    };

    const columns: VTableColumn<Order>[] = [
        {
            key: 'id', label: '#', width: 70,
            render: (r) => (
                <Typography sx={{ fontSize: 13, color: ADMIN_COLOR.accent, fontFamily: 'monospace', fontWeight: 600 }}>
                    #{r.id}
                </Typography>
            ),
        },
        {
            key: 'user_id', label: 'Customer',
            render: (r) => (
                <Typography sx={{ fontSize: 13, color: ADMIN_COLOR.text }}>User #{r.user_id}</Typography>
            ),
        },
        {
            key: 'total_price', label: 'Total', width: 110,
            render: (r) => (
                <Typography sx={{ fontFamily: 'monospace', fontSize: 13, color: ADMIN_COLOR.text }}>
                    ${Number(r.total_price).toFixed(2)}
                </Typography>
            ),
        },
        {
            key: 'status', label: 'Status', width: 160,
            render: (r) => (
                <FormControl size="small" variant="outlined">
                    <Select
                        value={r.status}
                        disabled={updatingId === r.id}
                        onChange={(e) => handleStatusChange(r.id!, e.target.value as OrderStatus)}
                        sx={{
                            fontSize: 12,
                            color: statusColor[r.status]?.text ?? ADMIN_COLOR.dim,
                            bgcolor: statusColor[r.status]?.bg ?? 'transparent',
                            borderRadius: '50px',
                            '.MuiOutlinedInput-notchedOutline': { border: 'none' },
                            '.MuiSvgIcon-root': { color: ADMIN_COLOR.dim },
                            px: 0.5,
                        }}
                        renderValue={() => <StatusPill status={r.status} />}
                    >
                        {STATUS_OPTIONS.map((s) => (
                            <MenuItem key={s} value={s} sx={{ fontSize: 13 }}>
                                <StatusPill status={s} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            ),
        },
        {
            key: 'create_at', label: 'Date', width: 120,
            render: (r) => (
                <Typography sx={{ fontSize: 12, color: ADMIN_COLOR.dim }}>
                    {r.create_at ? dayjs(r.create_at).format('MMM D, YYYY') : '—'}
                </Typography>
            ),
        },
    ];

    return (
        <Box sx={{ p: 3.5 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography sx={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: ADMIN_COLOR.text, letterSpacing: -0.5 }}>
                    Orders
                </Typography>
            </Box>

            {/* Status stats */}
            <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
                <StatCard label="Pending" value={countByStatus(OrderStatus.PENDING)} color={ADMIN_COLOR.dim} />
                <StatCard label="Paid" value={countByStatus(OrderStatus.PAID)} color={ADMIN_COLOR.orange} />
                <StatCard label="Shipped" value={countByStatus(OrderStatus.SHIPPED)} color={ADMIN_COLOR.blue} />
                <StatCard label="Delivered" value={countByStatus(OrderStatus.DELIVERED)} color={ADMIN_COLOR.green} />
                <StatCard label="Cancelled" value={countByStatus(OrderStatus.CANCELLED)} color={ADMIN_COLOR.red} />
            </Box>

            {/* Filter row */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2.5, flexWrap: 'wrap' }}>
                {(['', ...STATUS_OPTIONS] as const).map((s) => (
                    <Box
                        key={s}
                        onClick={() => { setStatusFilter(s as OrderStatus | ''); setPage(1); }}
                        sx={{
                            px: 1.75, py: 0.75, borderRadius: '50px', fontSize: 12, fontWeight: 500,
                            bgcolor: statusFilter === s ? ADMIN_COLOR.accent : ADMIN_COLOR.s2,
                            color: statusFilter === s ? ADMIN_COLOR.accentDark : ADMIN_COLOR.dim,
                            border: `1px solid ${statusFilter === s ? ADMIN_COLOR.accent : ADMIN_COLOR.border}`,
                            cursor: 'pointer',
                            '&:hover': { bgcolor: statusFilter === s ? ADMIN_COLOR.accent : ADMIN_COLOR.muted },
                            transition: 'background 0.15s',
                            textTransform: 'capitalize',
                        }}
                    >
                        {s === '' ? `All (${total})` : s}
                    </Box>
                ))}
            </Box>

            {/* Table */}
            <VTable<Order> columns={columns} data={orders} />

            {/* Pagination */}
            {totalPages > 1 && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                    <VButton variant="ghost" size="small" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                        ← Prev
                    </VButton>
                    <Typography sx={{ fontSize: 12, color: ADMIN_COLOR.dim }}>
                        {page} / {totalPages}
                    </Typography>
                    <VButton variant="ghost" size="small" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                        Next →
                    </VButton>
                </Box>
            )}
        </Box>
    );
};
