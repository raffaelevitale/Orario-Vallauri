'use client';

import Snowfall from 'react-snowfall';
import { useSnowfallStore } from '@/lib/orario/stores/snowfallStore';
import { useThemeStore } from '@/lib/orario/stores/themeStore';

export default function SnowfallEffect() {
    const isEnabled = useSnowfallStore((state) => state.isEnabled);
    const getEffectiveTheme = useThemeStore((state) => state.getEffectiveTheme);

    const theme = getEffectiveTheme();
    const snowColor = theme === 'dark' ? '#e7edff' : '#6f9eff';

    // Rendiamo disponibile il snowfall solo fino al 6 gennaio 2026, finite le feste in pratica
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();


    const epiphanyYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const endDate = new Date(epiphanyYear, 0, 6, 23, 59, 59);

    if (!isEnabled || now > endDate) {
        return null;
    }

    return (
        <Snowfall
            color={snowColor}
            snowflakeCount={200}
            style={{
                position: 'fixed',
                width: '100vw',
                height: '100vh',
                zIndex: 9999,
                pointerEvents: 'none',
            }}
        />
    );
}
