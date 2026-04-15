import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import {
    Box,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from '@mui/material';
import { A } from '../admin.constants';
import { VTable, VButton } from '../../../../common/components';
import type { VTableColumn } from '../../../../common/components/VTable';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../../../../apis/categories/category.api';
import type { Category, RequestCreateCategoryDto } from '../../../../apis/categories/category.interface';
import { useSnackbar } from '../../../../common/contexts/snackbar.context';

const SWR_KEY = 'admin-categories';

export const CategoriesTab: React.FC<{ search?: string }> = ({ search = '' }) => {
    const { showSnackbar } = useSnackbar();
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Category | null>(null);
    const [form, setForm] = useState<RequestCreateCategoryDto>({ name: '', slug: '' });
    const [deleteDialogId, setDeleteDialogId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);

    const { data: categories, isLoading } = useSWR<Category[]>(
        SWR_KEY,
        () => getAllCategories().then((r) => {
            const d = r.data as any;
            return Array.isArray(d) ? d : (d?.data ?? []);
        }),
    );

    const filtered = (categories ?? []).filter(
        (c) => c.name.toLowerCase().includes(search.toLowerCase()),
    );

    const openCreate = () => {
        setEditing(null);
        setForm({ name: '', slug: '' });
        setOpen(true);
    };

    const openEdit = (cat: Category) => {
        setEditing(cat);
        setForm({ name: cat.name, slug: cat.slug });
        setOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editing) {
                await updateCategory(editing.id, form);
                showSnackbar('Category updated', 'success');
            } else {
                await createCategory(form);
                showSnackbar('Category created', 'success');
            }
            setOpen(false);
            mutate(SWR_KEY);
        } catch {
            showSnackbar('Failed to save category', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (deleteDialogId === null) return;
        try {
            await deleteCategory(deleteDialogId);
            showSnackbar('Category deleted', 'success');
            mutate(SWR_KEY);
        } catch {
            showSnackbar('Failed to delete', 'error');
        } finally {
            setDeleteDialogId(null);
        }
    };

    const columns: VTableColumn<Category>[] = [
        { key: 'id', label: 'ID', width: 60 },
        { key: 'name', label: 'Name' },
        { key: 'slug', label: 'Slug' },
        {
            key: 'actions',
            label: '',
            width: 180,
            align: 'right',
            render: (row) => (
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
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
        bgcolor: A.surface,
        color: A.text,
        border: `1px solid ${A.border}`,
        borderRadius: '16px',
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography sx={{ color: A.dim, fontSize: 13 }}>
                    {filtered.length} categories
                </Typography>
                <VButton variant="secondary" size="small" onClick={openCreate}>
                    New Category
                </VButton>
            </Box>

            {isLoading ? (
                <Typography sx={{ color: A.dim }}>Loading...</Typography>
            ) : (
                <VTable columns={columns} data={filtered} />
            )}

            {/* Create/Edit dialog */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: dialogSx }}>
                <DialogTitle sx={{ color: A.text }}>{editing ? 'Edit Category' : 'New Category'}</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Name"
                        fullWidth
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        sx={{ mb: 2, mt: 1, '& .MuiInputBase-root': { color: A.text }, '& .MuiInputLabel-root': { color: A.dim } }}
                    />
                    <TextField
                        label="Slug"
                        fullWidth
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                        sx={{ '& .MuiInputBase-root': { color: A.text }, '& .MuiInputLabel-root': { color: A.dim } }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <VButton variant="ghost" onClick={() => setOpen(false)}>Cancel</VButton>
                    <VButton variant="secondary" onClick={handleSave} loading={saving}>Save</VButton>
                </DialogActions>
            </Dialog>

            {/* Delete confirm */}
            <Dialog open={deleteDialogId !== null} onClose={() => setDeleteDialogId(null)} maxWidth="xs" PaperProps={{ sx: dialogSx }}>
                <DialogTitle sx={{ color: A.text }}>Delete Category</DialogTitle>
                <DialogContent>
                    <Typography sx={{ color: A.dim }}>Are you sure? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <VButton variant="ghost" onClick={() => setDeleteDialogId(null)}>Cancel</VButton>
                    <VButton variant="danger" onClick={handleDelete}>Delete</VButton>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
