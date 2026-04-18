import React, { useState } from 'react';
import useSWR from 'swr';
import {
    Box, Typography, Modal, Divider, IconButton,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ADMIN_COLOR } from '../admin.constants';
import { VTable } from '../../../../common/components/VTable';
import type { VTableColumn } from '../../../../common/components/VTable';
import { VButton } from '../../../../common/components/VButton';
import { VTextField } from '../../../../common/components/VTextField';
import { useSnackbar } from '../../../../common/contexts/snackbar.context';
import {
    getAllDiscounts, createDiscount, updateDiscount, deleteDiscount,
} from '../../../../apis/discounts/discount.api';
import type { Discount, RequestCreateDiscountDto } from '../../../../apis/discounts/discount.interface';
import { DiscountType } from '../../../../apis/discounts/discount.enum';
import dayjs from 'dayjs';

// ── Form schema ──────────────────────────────────────────────────────────────

const schema = Yup.object({
    code: Yup.string().required('Code is required').uppercase(),
    type: Yup.string().oneOf(Object.values(DiscountType)).required('Type is required'),
    value: Yup.number().min(0, 'Value must be ≥ 0').required('Value is required'),
    min_order: Yup.number().min(0, 'Min order must be ≥ 0').required('Min order is required'),
    uses_remaining: Yup.number().nullable().transform((v) => (v === '' ? null : v)),
    expires_at: Yup.string().nullable().transform((v) => (v === '' ? null : v)),
});

const TYPE_OPTIONS = [
    { label: 'Percent (%)', value: DiscountType.Percent },
    { label: 'Fixed ($)', value: DiscountType.Fixed },
];

// ── Form Modal ───────────────────────────────────────────────────────────────

interface DiscountFormModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: RequestCreateDiscountDto) => Promise<void>;
    discount?: Discount | null;
    loading?: boolean;
}

const DiscountFormModal: React.FC<DiscountFormModalProps> = ({
    open, onClose, onSubmit, discount, loading,
}) => {
    const isEdit = !!discount;

    const formik = useFormik({
        initialValues: {
            code: discount?.code ?? '',
            type: discount?.type ?? DiscountType.Percent,
            value: discount?.value ?? 0,
            min_order: discount?.min_order ?? 0,
            uses_remaining: discount?.uses_remaining ?? (null as number | null),
            expires_at: discount?.expires_at
                ? dayjs(discount.expires_at).format('YYYY-MM-DD')
                : (null as string | null),
        },
        validationSchema: schema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            await onSubmit({
                code: values.code.toUpperCase(),
                type: values.type as DiscountType,
                value: Number(values.value),
                min_order: Number(values.min_order),
                uses_remaining: values.uses_remaining !== null ? Number(values.uses_remaining) : null,
                expires_at: values.expires_at ? new Date(values.expires_at) : null,
            });
        },
    });

    const darkFieldSx = {
        '& .MuiOutlinedInput-root': {
            color: ADMIN_COLOR.text,
            bgcolor: ADMIN_COLOR.bg,
            '& fieldset': { borderColor: ADMIN_COLOR.border },
            '&:hover fieldset': { borderColor: ADMIN_COLOR.border },
            '&.Mui-focused fieldset': { borderColor: ADMIN_COLOR.accent },
        },
        '& .MuiInputLabel-root': { color: ADMIN_COLOR.dim },
        '& .MuiInputLabel-root.Mui-focused': { color: ADMIN_COLOR.text },
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: { xs: '95vw', sm: 480 },
                    bgcolor: ADMIN_COLOR.surface,
                    border: `1px solid ${ADMIN_COLOR.border}`,
                    borderRadius: '12px',
                    p: 3,
                    outline: 'none',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography sx={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: ADMIN_COLOR.text }}>
                        {isEdit ? 'Edit Discount' : 'New Discount Code'}
                    </Typography>
                    <IconButton onClick={onClose} size="small" sx={{ color: ADMIN_COLOR.dim }}>✕</IconButton>
                </Box>
                <Divider sx={{ borderColor: ADMIN_COLOR.border, mb: 2.5 }} />

                <form onSubmit={formik.handleSubmit}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <VTextField
                            fieldType="text"
                            label="Code"
                            required
                            value={formik.values.code}
                            onChange={(v) => formik.setFieldValue('code', String(v ?? '').toUpperCase())}
                            error={formik.touched.code ? formik.errors.code : undefined}
                            sx={darkFieldSx}
                        />

                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            <VTextField
                                fieldType="dropdown"
                                label="Type"
                                required
                                options={TYPE_OPTIONS}
                                value={formik.values.type}
                                onChange={(v) => formik.setFieldValue('type', v)}
                                sx={darkFieldSx}
                            />
                            <VTextField
                                fieldType="number"
                                label={formik.values.type === DiscountType.Percent ? 'Value (%)' : 'Value ($)'}
                                required
                                value={formik.values.value}
                                onChange={(v) => formik.setFieldValue('value', v)}
                                error={formik.touched.value ? formik.errors.value as string : undefined}
                                sx={darkFieldSx}
                            />
                        </Box>

                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            <VTextField
                                fieldType="number"
                                label="Min Order ($)"
                                value={formik.values.min_order}
                                onChange={(v) => formik.setFieldValue('min_order', v)}
                                error={formik.touched.min_order ? formik.errors.min_order as string : undefined}
                                sx={darkFieldSx}
                            />
                            <VTextField
                                fieldType="number"
                                label="Uses Remaining (blank = ∞)"
                                value={formik.values.uses_remaining ?? ''}
                                onChange={(v) => formik.setFieldValue('uses_remaining', v === '' ? null : v)}
                                sx={darkFieldSx}
                            />
                        </Box>

                        <VTextField
                            fieldType="date"
                            label="Expires At (optional)"
                            value={formik.values.expires_at ?? ''}
                            onChange={(v) => formik.setFieldValue('expires_at', v === '' ? null : v)}
                            sx={darkFieldSx}
                        />

                        <Divider sx={{ borderColor: ADMIN_COLOR.border }} />

                        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
                            <VButton variant="ghost" onClick={onClose} type="button">Cancel</VButton>
                            <VButton variant="secondary" type="submit" loading={loading}>
                                {isEdit ? 'Save Changes' : 'Create Code'}
                            </VButton>
                        </Box>
                    </Box>
                </form>
            </Box>
        </Modal>
    );
};

// ── Discounts Tab ────────────────────────────────────────────────────────────

export const DiscountsTab: React.FC = () => {
    const { showSnackbar } = useSnackbar();
    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Discount | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const { data: discountsResp, mutate } = useSWR<Discount[]>(
        'discounts',
        () => getAllDiscounts().then((r) => (r.data as unknown as { data: Discount[] }).data ?? r.data),
    );

    const discounts = discountsResp ?? [];

    const handleAdd = () => {
        setEditTarget(null);
        setModalOpen(true);
    };

    const handleEdit = (d: Discount) => {
        setEditTarget(d);
        setModalOpen(true);
    };

    const handleDelete = async (d: Discount) => {
        if (!window.confirm(`Delete code "${d.code}"?`)) return;
        try {
            await deleteDiscount(d.id);
            showSnackbar('Discount deleted', 'success');
            mutate();
        } catch {
            showSnackbar('Failed to delete discount', 'error');
        }
    };

    const handleSubmit = async (values: RequestCreateDiscountDto) => {
        setSubmitting(true);
        try {
            if (editTarget) {
                await updateDiscount(editTarget.id, values);
                showSnackbar('Discount updated', 'success');
            } else {
                await createDiscount(values);
                showSnackbar('Discount created', 'success');
            }
            mutate();
            setModalOpen(false);
        } catch {
            showSnackbar('Failed to save discount', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const columns: VTableColumn<Discount>[] = [
        {
            key: 'code', label: 'Code',
            render: (r) => (
                <Box
                    sx={{
                        display: 'inline-block',
                        bgcolor: ADMIN_COLOR.s2, color: ADMIN_COLOR.accent,
                        fontFamily: 'monospace', fontSize: 12,
                        px: 1, py: 0.375, borderRadius: '4px',
                        border: `1px solid ${ADMIN_COLOR.border}`,
                    }}
                >
                    {r.code}
                </Box>
            ),
        },
        {
            key: 'type', label: 'Type', width: 90,
            render: (r) => <Typography sx={{ fontSize: 13, color: ADMIN_COLOR.dim, textTransform: 'capitalize' }}>{r.type}</Typography>,
        },
        {
            key: 'value', label: 'Value', width: 90,
            render: (r) => (
                <Typography sx={{ fontFamily: 'monospace', fontSize: 13, color: ADMIN_COLOR.text }}>
                    {r.type === DiscountType.Percent ? `${r.value}%` : `$${r.value}`}
                </Typography>
            ),
        },
        {
            key: 'min_order', label: 'Min Order', width: 110,
            render: (r) => (
                <Typography sx={{ fontFamily: 'monospace', fontSize: 13, color: ADMIN_COLOR.dim }}>
                    {r.min_order > 0 ? `$${r.min_order}` : '—'}
                </Typography>
            ),
        },
        {
            key: 'uses_remaining', label: 'Uses Left', width: 100,
            render: (r) => (
                <Typography sx={{ fontSize: 13, color: r.uses_remaining !== null && r.uses_remaining < 100 ? ADMIN_COLOR.red : ADMIN_COLOR.dim }}>
                    {r.uses_remaining === null ? '∞' : r.uses_remaining}
                </Typography>
            ),
        },
        {
            key: 'expires_at', label: 'Expires', width: 130,
            render: (r) => (
                <Typography sx={{ fontSize: 12, color: ADMIN_COLOR.dim }}>
                    {r.expires_at ? dayjs(r.expires_at).format('MMM D, YYYY') : 'No expiry'}
                </Typography>
            ),
        },
        {
            key: 'actions', label: 'Actions', width: 100,
            render: (r) => (
                <Box sx={{ display: 'flex', gap: 0.75 }}>
                    <VButton variant="ghost" size="small" onClick={() => handleEdit(r)}>Edit</VButton>
                    <VButton variant="danger" size="small" onClick={() => handleDelete(r)}>Del</VButton>
                </Box>
            ),
        },
    ];

    return (
        <Box sx={{ p: 3.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography sx={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: ADMIN_COLOR.text, letterSpacing: -0.5 }}>
                    Discounts
                </Typography>
                <VButton variant="secondary" onClick={handleAdd}>+ New Code</VButton>
            </Box>

            <VTable<Discount> columns={columns} data={discounts} />

            <DiscountFormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmit}
                discount={editTarget}
                loading={submitting}
            />
        </Box>
    );
};
