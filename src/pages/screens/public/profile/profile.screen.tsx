import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import {
    Box,
    Container,
    Typography,
    TextField,
    Divider,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    getProfile,
    updateProfile,
    getAllAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
} from '../../../../apis/profiles/profile.api';
import type { UserProfile, Address, RequestCreateAddressDto } from '../../../../apis/profiles/profile.interface';
import { VButton } from '../../../../common/components';
import { VBreadcrumb } from '../../../../common/components/VBreadcrumb';
import { useSnackbar } from '../../../../common/contexts/snackbar.context';
import { getStoredUser, setAuthenticatedSession, isAuthenticated } from '../../../../common/utils/auth-session';

const inputSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '10px',
        '& fieldset': { borderColor: '#e8e8e8' },
        '&:hover fieldset': { borderColor: '#ccc' },
        '&.Mui-focused fieldset': { borderColor: '#1a1a1a' },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: '#1a1a1a' },
};

const EMPTY_ADDR: RequestCreateAddressDto = { label: '', street: '', city: '', country: '', is_default: false };

export const ProfileScreen: React.FC = () => {
    const navigate = useNavigate();
    const { showSnackbar } = useSnackbar();

    const storedUser = getStoredUser();
    const [fullName, setFullName] = useState(storedUser?.full_name ?? '');
    const [phone, setPhone] = useState(storedUser?.phone ?? '');
    const [password, setPassword] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);

    const [addrDialog, setAddrDialog] = useState(false);
    const [editingAddr, setEditingAddr] = useState<Address | null>(null);
    const [addrForm, setAddrForm] = useState<RequestCreateAddressDto>(EMPTY_ADDR);
    const [savingAddr, setSavingAddr] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    useEffect(() => {
        if (!isAuthenticated()) navigate('/login');
    }, [navigate]);

    const { data: profile, isLoading } = useSWR<UserProfile>(
        'profile',
        () => getProfile().then((r) => r.data),
        {
            onSuccess: (data) => {
                setFullName(data.user.full_name ?? '');
                setPhone(data.user.phone ?? '');
            },
        },
    );

    const { data: addresses, mutate: mutateAddresses } = useSWR<Address[]>(
        'profile-addresses',
        () => getAllAddresses().then((r) => {
            const d = r.data as any;
            return Array.isArray(d) ? d : (d?.data ?? []);
        }),
    );

    const handleSaveProfile = async () => {
        setSavingProfile(true);
        try {
            const updated = await updateProfile({
                full_name: fullName,
                phone,
                ...(password ? { password } : {}),
            });
            // Sync stored user in localStorage
            if (updated.data?.user) {
                setAuthenticatedSession(updated.data.user);
            } else if (storedUser) {
                setAuthenticatedSession({ ...storedUser, full_name: fullName, phone });
            }
            setPassword('');
            showSnackbar('Profile updated', 'success');
        } catch {
            showSnackbar('Failed to update profile', 'error');
        } finally {
            setSavingProfile(false);
        }
    };

    const openCreateAddr = () => {
        setEditingAddr(null);
        setAddrForm(EMPTY_ADDR);
        setAddrDialog(true);
    };

    const openEditAddr = (addr: Address) => {
        setEditingAddr(addr);
        setAddrForm({ label: addr.label ?? '', street: addr.street, city: addr.city, country: addr.country, is_default: addr.is_default });
        setAddrDialog(true);
    };

    const handleSaveAddr = async () => {
        setSavingAddr(true);
        try {
            if (editingAddr) {
                await updateAddress(editingAddr.id, addrForm);
                showSnackbar('Address updated', 'success');
            } else {
                await createAddress(addrForm);
                showSnackbar('Address added', 'success');
            }
            mutateAddresses();
            setAddrDialog(false);
        } catch {
            showSnackbar('Failed to save address', 'error');
        } finally {
            setSavingAddr(false);
        }
    };

    const handleDeleteAddr = async (id: number) => {
        setDeletingId(id);
        try {
            await deleteAddress(id);
            showSnackbar('Address deleted', 'success');
            mutateAddresses();
        } catch {
            showSnackbar('Failed to delete address', 'error');
        } finally {
            setDeletingId(null);
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress sx={{ color: '#1a1a1a' }} />
            </Box>
        );
    }

    const user = profile?.user ?? storedUser;
    const addrList: Address[] = addresses ?? [];

    return (
        <Box sx={{ bgcolor: '#ffffff' }}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <VBreadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Profile' }]} />

                <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
                    {/* Left — Personal info */}
                    <Box sx={{ flex: 1 }}>
                        {/* Avatar block */}
                        <Box
                            sx={{
                                display: 'flex', alignItems: 'center', gap: 2.5, mb: 4,
                                p: 3, borderRadius: '16px', border: '1px solid #f0f0f0',
                            }}
                        >
                            <Box
                                sx={{
                                    width: 56, height: 56, borderRadius: '50%',
                                    bgcolor: '#1a1a1a', color: '#e8ff47',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 800, fontSize: 22, flexShrink: 0,
                                }}
                            >
                                {(user?.full_name?.[0] ?? 'U').toUpperCase()}
                            </Box>
                            <Box>
                                <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#1a1a1a' }}>
                                    {user?.full_name}
                                </Typography>
                                <Typography sx={{ fontSize: 13, color: '#888' }}>
                                    {user?.email}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Personal info form */}
                        <Typography
                            sx={{
                                fontFamily: '"Syne", sans-serif',
                                fontWeight: 800, fontSize: 20, color: '#1a1a1a', mb: 3,
                            }}
                        >
                            Personal Information
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                            <TextField
                                label="Full Name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                fullWidth
                                sx={inputSx}
                            />
                            <TextField
                                label="Phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                fullWidth
                                sx={inputSx}
                            />
                            <TextField
                                label="Email"
                                value={user?.email ?? ''}
                                fullWidth
                                disabled
                                sx={inputSx}
                            />
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 2, color: '#1a1a1a' }}>
                            Change Password
                        </Typography>
                        <TextField
                            label="New Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            fullWidth
                            placeholder="Leave blank to keep current"
                            sx={{ ...inputSx, mb: 3 }}
                        />

                        <VButton
                            variant="secondary"
                            onClick={handleSaveProfile}
                            loading={savingProfile}
                            sx={{ borderRadius: '10px' }}
                        >
                            Save Changes
                        </VButton>
                    </Box>

                    {/* Right — Addresses */}
                    <Box sx={{ width: { xs: '100%', md: 400 }, flexShrink: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                            <Typography
                                sx={{
                                    fontFamily: '"Syne", sans-serif',
                                    fontWeight: 800, fontSize: 20, color: '#1a1a1a',
                                }}
                            >
                                Addresses
                            </Typography>
                            <VButton
                                variant="ghost"
                                size="small"
                                onClick={openCreateAddr}
                                sx={{ borderRadius: '8px', borderColor: '#e8e8e8', color: '#555' }}
                            >
                                + Add
                            </VButton>
                        </Box>

                        {addrList.length === 0 ? (
                            <Box
                                sx={{
                                    textAlign: 'center', py: 6,
                                    borderRadius: '16px', border: '1px dashed #e8e8e8',
                                }}
                            >
                                <Typography sx={{ color: '#bbb', fontSize: 14 }}>
                                    No addresses saved yet.
                                </Typography>
                                <VButton
                                    variant="ghost"
                                    size="small"
                                    onClick={openCreateAddr}
                                    sx={{ mt: 1.5, borderRadius: '8px', borderColor: '#e8e8e8', color: '#888' }}
                                >
                                    Add your first address
                                </VButton>
                            </Box>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {addrList.map((addr) => (
                                    <Box
                                        key={addr.id}
                                        sx={{
                                            p: 2.5,
                                            borderRadius: '16px',
                                            border: addr.is_default ? '2px solid #1a1a1a' : '1px solid #f0f0f0',
                                            position: 'relative',
                                        }}
                                    >
                                        {addr.is_default && (
                                            <Box
                                                sx={{
                                                    position: 'absolute', top: 12, right: 12,
                                                    bgcolor: '#1a1a1a', color: '#e8ff47',
                                                    fontSize: 10, fontWeight: 800,
                                                    px: 1, py: 0.25, borderRadius: '4px',
                                                }}
                                            >
                                                DEFAULT
                                            </Box>
                                        )}
                                        {addr.label && (
                                            <Typography sx={{ fontWeight: 700, fontSize: 13, color: '#1a1a1a', mb: 0.5 }}>
                                                {addr.label}
                                            </Typography>
                                        )}
                                        <Typography sx={{ fontSize: 14, color: '#555' }}>
                                            {addr.street}
                                        </Typography>
                                        <Typography sx={{ fontSize: 13, color: '#888' }}>
                                            {addr.city}{addr.country ? `, ${addr.country}` : ''}
                                        </Typography>

                                        <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                                            <VButton
                                                variant="ghost"
                                                size="small"
                                                onClick={() => openEditAddr(addr)}
                                                sx={{ borderRadius: '8px', fontSize: 12, borderColor: '#e8e8e8', color: '#555' }}
                                            >
                                                Edit
                                            </VButton>
                                            <VButton
                                                variant="danger"
                                                size="small"
                                                loading={deletingId === addr.id}
                                                onClick={() => handleDeleteAddr(addr.id)}
                                                sx={{ borderRadius: '8px', fontSize: 12 }}
                                            >
                                                Delete
                                            </VButton>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>
                </Box>
            </Container>

            {/* Add / Edit Address Dialog */}
            <Dialog
                open={addrDialog}
                onClose={() => setAddrDialog(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 700, fontSize: 18, color: '#1a1a1a' }}>
                    {editingAddr ? 'Edit Address' : 'Add Address'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            label="Label (e.g. Home, Office)"
                            value={addrForm.label ?? ''}
                            onChange={(e) => setAddrForm({ ...addrForm, label: e.target.value })}
                            fullWidth
                            sx={inputSx}
                        />
                        <TextField
                            label="Street"
                            value={addrForm.street}
                            onChange={(e) => setAddrForm({ ...addrForm, street: e.target.value })}
                            fullWidth
                            sx={inputSx}
                        />
                        <TextField
                            label="City"
                            value={addrForm.city}
                            onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                            fullWidth
                            sx={inputSx}
                        />
                        <TextField
                            label="Country"
                            value={addrForm.country ?? ''}
                            onChange={(e) => setAddrForm({ ...addrForm, country: e.target.value })}
                            fullWidth
                            sx={inputSx}
                        />
                        <Box
                            onClick={() => setAddrForm((f) => ({ ...f, is_default: !f.is_default }))}
                            sx={{
                                display: 'flex', alignItems: 'center', gap: 1.5,
                                px: 2, py: 1.5, borderRadius: '10px',
                                border: addrForm.is_default ? '2px solid #1a1a1a' : '1px solid #e8e8e8',
                                cursor: 'pointer', userSelect: 'none',
                                transition: 'all 0.15s',
                            }}
                        >
                            <Box
                                sx={{
                                    width: 18, height: 18, borderRadius: '50%',
                                    border: '2px solid #1a1a1a',
                                    bgcolor: addrForm.is_default ? '#1a1a1a' : 'transparent',
                                    transition: 'background 0.15s',
                                }}
                            />
                            <Typography sx={{ fontSize: 14, fontWeight: addrForm.is_default ? 600 : 400 }}>
                                Set as default address
                            </Typography>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <VButton variant="ghost" onClick={() => setAddrDialog(false)} sx={{ borderRadius: '8px' }}>
                        Cancel
                    </VButton>
                    <VButton
                        variant="secondary"
                        onClick={handleSaveAddr}
                        loading={savingAddr}
                        sx={{ borderRadius: '8px' }}
                    >
                        Save
                    </VButton>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
