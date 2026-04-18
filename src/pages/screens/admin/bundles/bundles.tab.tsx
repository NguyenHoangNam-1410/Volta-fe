import React, { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import {
    Box,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Chip,
} from '@mui/material';
import { ADMIN_COLOR } from '../admin.constants';
import { VTable, VButton, VToggle } from '../../../../common/components';
import type { VTableColumn } from '../../../../common/components/VTable';
import {
    getAllBundles,
    createBundle,
    updateBundle,
    deleteBundle,
    getBundleItems,
    addBundleItem,
    removeBundleItem,
} from '../../../../apis/bundles/bundle.api';
import { getAllProduct } from '../../../../apis/products/product.api';
import type { Bundle, RequestCreateBundleDto, BundleItem } from '../../../../apis/bundles/bundle.interface';
import type { Product } from '../../../../apis/products/product.interface';
import { useSnackbar } from '../../../../common/contexts/snackbar.context';

const SWR_KEY = 'admin-bundles';

export const BundlesTab: React.FC<{ search?: string }> = ({ search = '' }) => {
    const { showSnackbar } = useSnackbar();
    const [page] = useState(1);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Bundle | null>(null);
    const [form, setForm] = useState<RequestCreateBundleDto>({
        name: '', description: '', bundle_price: 0, is_active: true, product_ids: [],
    });
    const [deleteDialogId, setDeleteDialogId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);

    // Detail drawer
    const [detailBundle, setDetailBundle] = useState<Bundle | null>(null);
    const [bundleItems, setBundleItems] = useState<BundleItem[]>([]);
    const [addProductId, setAddProductId] = useState('');

    const { data: bundleRes, isLoading } = useSWR(
        [SWR_KEY, page, search],
        () => getAllBundles({ search, page, limit: 50 }).then((r) => r.data),
    );

    const { data: allProducts } = useSWR(
        'admin-products-for-bundle',
        () => getAllProduct({ page: 1, limit: 200 }).then((r) => r.data.data ?? []),
    );

    const bundles: Bundle[] = bundleRes?.data ?? [];

    useEffect(() => {
        if (detailBundle) {
            getBundleItems(detailBundle.id).then((r) => setBundleItems(r.data));
        }
    }, [detailBundle]);

    const openCreate = () => {
        setEditing(null);
        setForm({ name: '', description: '', bundle_price: 0, is_active: true, product_ids: [] });
        setOpen(true);
    };

    const openEdit = (b: Bundle) => {
        setEditing(b);
        setForm({ name: b.name, description: b.description, bundle_price: b.bundle_price, is_active: b.is_active, product_ids: [] });
        setOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editing) {
                await updateBundle(editing.id, form);
                showSnackbar('Bundle updated', 'success');
            } else {
                await createBundle(form);
                showSnackbar('Bundle created', 'success');
            }
            setOpen(false);
            mutate([SWR_KEY, page, search]);
        } catch {
            showSnackbar('Failed to save bundle', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (deleteDialogId === null) return;
        try {
            await deleteBundle(deleteDialogId);
            showSnackbar('Bundle deleted', 'success');
            mutate([SWR_KEY, page, search]);
        } catch {
            showSnackbar('Failed to delete', 'error');
        } finally {
            setDeleteDialogId(null);
        }
    };

    const handleAddItem = async () => {
        if (!detailBundle || !addProductId) return;
        try {
            await addBundleItem(detailBundle.id, { product_id: Number(addProductId), quantity: 1 });
            const res = await getBundleItems(detailBundle.id);
            setBundleItems(res.data);
            setAddProductId('');
            showSnackbar('Item added', 'success');
        } catch {
            showSnackbar('Failed to add item', 'error');
        }
    };

    const handleRemoveItem = async (itemId: number) => {
        if (!detailBundle) return;
        try {
            await removeBundleItem(detailBundle.id, itemId);
            setBundleItems((prev) => prev.filter((i) => i.id !== itemId));
            showSnackbar('Item removed', 'success');
        } catch {
            showSnackbar('Failed to remove item', 'error');
        }
    };

    const getProductName = (pid: number) => {
        return (allProducts ?? []).find((p: Product) => p.id === pid)?.name ?? `#${pid}`;
    };

    const columns: VTableColumn<Bundle>[] = [
        { key: 'id', label: 'ID', width: 60 },
        { key: 'name', label: 'Name' },
        {
            key: 'bundle_price',
            label: 'Price',
            width: 100,
            render: (row) => (
                <Typography sx={{ color: ADMIN_COLOR.accent, fontWeight: 700, fontSize: 13 }}>
                    ${Number(row.bundle_price).toFixed(2)}
                </Typography>
            ),
        },
        {
            key: 'is_active',
            label: 'Status',
            width: 80,
            render: (row) => (
                <Chip
                    label={row.is_active ? 'Active' : 'Inactive'}
                    size="small"
                    sx={{
                        bgcolor: row.is_active ? 'rgba(77,255,145,0.12)' : 'rgba(136,136,136,0.12)',
                        color: row.is_active ? '#4dff91' : '#888',
                        fontSize: 11,
                        fontWeight: 600,
                    }}
                />
            ),
        },
        {
            key: 'actions',
            label: '',
            width: 260,
            align: 'right',
            render: (row) => (
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <VButton variant="ghost" size="small" onClick={() => setDetailBundle(row)}>
                        Items
                    </VButton>
                    <VButton variant="ghost" size="small" onClick={() => openEdit(row)}>
                        Edit
                    </VButton>
                    <VButton variant="danger" size="small" onClick={() => setDeleteDialogId(row.id)}>
                        Delete
                    </VButton>
                </Box>
            ),
        },
    ];

    const dialogSx = {
        bgcolor: ADMIN_COLOR.surface,
        color: ADMIN_COLOR.text,
        border: `1px solid ${ADMIN_COLOR.border}`,
        borderRadius: '16px',
    };

    const fieldSx = {
        mb: 2,
        '& .MuiInputBase-root': { color: ADMIN_COLOR.text },
        '& .MuiInputLabel-root': { color: ADMIN_COLOR.dim },
        '& .MuiOutlinedInput-notchedOutline': { borderColor: ADMIN_COLOR.border },
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography sx={{ color: ADMIN_COLOR.dim, fontSize: 13 }}>
                    {bundles.length} bundles
                </Typography>
                <VButton variant="secondary" size="small" onClick={openCreate}>
                    New Bundle
                </VButton>
            </Box>

            {isLoading ? (
                <Typography sx={{ color: ADMIN_COLOR.dim }}>Loading...</Typography>
            ) : (
                <VTable columns={columns} data={bundles} />
            )}

            {/* Create/Edit dialog */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: dialogSx }}>
                <DialogTitle sx={{ color: ADMIN_COLOR.text }}>{editing ? 'Edit Bundle' : 'New Bundle'}</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Name"
                        fullWidth
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        sx={{ ...fieldSx, mt: 1 }}
                    />
                    <TextField
                        label="Description"
                        fullWidth
                        multiline
                        rows={3}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        sx={fieldSx}
                    />
                    <TextField
                        label="Bundle Price"
                        fullWidth
                        type="number"
                        value={form.bundle_price}
                        onChange={(e) => setForm({ ...form, bundle_price: Number(e.target.value) })}
                        sx={fieldSx}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
                        <Typography sx={{ color: ADMIN_COLOR.dim, fontSize: 13 }}>Active</Typography>
                        <VToggle checked={form.is_active} onChange={(v) => setForm({ ...form, is_active: v })} />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <VButton variant="ghost" onClick={() => setOpen(false)}>Cancel</VButton>
                    <VButton variant="secondary" onClick={handleSave} loading={saving}>Save</VButton>
                </DialogActions>
            </Dialog>

            {/* Delete confirm */}
            <Dialog open={deleteDialogId !== null} onClose={() => setDeleteDialogId(null)} maxWidth="xs" PaperProps={{ sx: dialogSx }}>
                <DialogTitle sx={{ color: ADMIN_COLOR.text }}>Delete Bundle</DialogTitle>
                <DialogContent>
                    <Typography sx={{ color: ADMIN_COLOR.dim }}>Are you sure? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <VButton variant="ghost" onClick={() => setDeleteDialogId(null)}>Cancel</VButton>
                    <VButton variant="danger" onClick={handleDelete}>Delete</VButton>
                </DialogActions>
            </Dialog>

            {/* Bundle items dialog */}
            <Dialog open={detailBundle !== null} onClose={() => setDetailBundle(null)} maxWidth="sm" fullWidth PaperProps={{ sx: dialogSx }}>
                <DialogTitle sx={{ color: ADMIN_COLOR.text }}>
                    Bundle Items — {detailBundle?.name}
                </DialogTitle>
                <DialogContent>
                    {bundleItems.length === 0 ? (
                        <Typography sx={{ color: ADMIN_COLOR.dim, fontSize: 13 }}>No items in this bundle.</Typography>
                    ) : (
                        <Box sx={{ mb: 2 }}>
                            {bundleItems.map((item) => (
                                <Box
                                    key={item.id}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        py: 1,
                                        borderBottom: `1px solid ${ADMIN_COLOR.border}`,
                                    }}
                                >
                                    <Typography sx={{ fontSize: 13, color: ADMIN_COLOR.text }}>
                                        {getProductName(item.product_id)}
                                    </Typography>
                                    <VButton variant="danger" size="small" onClick={() => handleRemoveItem(item.id)}>
                                        Remove
                                    </VButton>
                                </Box>
                            ))}
                        </Box>
                    )}
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <TextField
                            label="Product ID"
                            size="small"
                            type="number"
                            value={addProductId}
                            onChange={(e) => setAddProductId(e.target.value)}
                            sx={{ flex: 1, ...fieldSx, mb: 0 }}
                        />
                        <VButton variant="secondary" size="small" onClick={handleAddItem}>
                            Add
                        </VButton>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <VButton variant="ghost" onClick={() => setDetailBundle(null)}>Close</VButton>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
