/** Shared dark-theme colour tokens for the admin panel */
export const ADMIN_COLOR = {
    bg:      '#0d0d0d',
    surface: '#141414',
    s2:      '#1a1a1a',
    border:  '#262626',
    mid:     '#555',
    muted:   '#3a3a3a',
    text:    '#e8e8e0',
    dim:     '#888',
    accent:  '#e8ff47',
    accentDark: '#0d0d0d',
    red:     '#ff4d4d',
    green:   '#4dff91',
    blue:    '#4da6ff',
    orange:  '#ffaa4d',
} as const;

export const statusColor: Record<string, { bg: string; text: string }> = {
    pending:   { bg: 'rgba(136,136,136,0.12)', text: '#888' },
    paid:      { bg: 'rgba(255,170,77,0.12)',  text: '#ffaa4d' },
    shipped:   { bg: 'rgba(77,166,255,0.12)',  text: '#4da6ff' },
    delivered: { bg: 'rgba(77,255,145,0.12)',  text: '#4dff91' },
    cancelled: { bg: 'rgba(255,77,77,0.12)',   text: '#ff4d4d' },
};
