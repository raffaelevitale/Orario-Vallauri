import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, School, Palmtree, Info, Flag, Coffee } from 'lucide-react';
import styles from './SchoolCalendar.module.css';

type DayType = 'sunday' | 'startEnd' | 'holiday' | 'vacation' | 'bridge' | 'normal';

interface SpecialDay {
    day: number;
    month: number; // 0-11
    year: number;
    type: DayType;
    description?: string;
}

// Data from the image
const specialDays: SpecialDay[] = [
    // 2025
    { day: 10, month: 8, year: 2025, type: 'startEnd', description: 'Inizio lezioni' },
    { day: 1, month: 10, year: 2025, type: 'holiday', description: 'Tutti i Santi' },
    // Dec
    { day: 8, month: 11, year: 2025, type: 'holiday', description: 'Imm. Concezione' },
    { day: 23, month: 11, year: 2025, type: 'vacation', description: 'Vacanze natalizie' },
    { day: 24, month: 11, year: 2025, type: 'vacation', description: 'Vacanze natalizie' },
    { day: 25, month: 11, year: 2025, type: 'holiday', description: 'Natale' },
    { day: 26, month: 11, year: 2025, type: 'holiday', description: 'S. Stefano' },
    { day: 27, month: 11, year: 2025, type: 'vacation', description: 'Vacanze natalizie' },
    { day: 28, month: 11, year: 2025, type: 'vacation', description: 'Vacanze natalizie' },
    { day: 29, month: 11, year: 2025, type: 'vacation', description: 'Vacanze natalizie' },
    { day: 30, month: 11, year: 2025, type: 'vacation', description: 'Vacanze natalizie' },
    { day: 31, month: 11, year: 2025, type: 'vacation', description: 'Vacanze natalizie' },
    // 2026
    // Jan
    { day: 1, month: 0, year: 2026, type: 'holiday', description: 'Capodanno' },
    { day: 2, month: 0, year: 2026, type: 'vacation', description: 'Vacanze natalizie' },
    { day: 3, month: 0, year: 2026, type: 'vacation', description: 'Vacanze natalizie' },
    { day: 4, month: 0, year: 2026, type: 'vacation', description: 'Vacanze natalizie' },
    { day: 5, month: 0, year: 2026, type: 'vacation', description: 'Vacanze natalizie' },
    { day: 6, month: 0, year: 2026, type: 'holiday', description: 'Epifania' },
    // Feb
    { day: 14, month: 1, year: 2026, type: 'vacation', description: 'Vacanze carnevale' },
    { day: 15, month: 1, year: 2026, type: 'vacation', description: 'Vacanze carnevale' },
    { day: 16, month: 1, year: 2026, type: 'vacation', description: 'Vacanze carnevale' },
    { day: 17, month: 1, year: 2026, type: 'vacation', description: 'Vacanze carnevale' },
    // Apr
    { day: 2, month: 3, year: 2026, type: 'vacation', description: 'Vacanze pasquali' },
    { day: 3, month: 3, year: 2026, type: 'vacation', description: 'Vacanze pasquali' },
    { day: 4, month: 3, year: 2026, type: 'vacation', description: 'Vacanze pasquali' },
    { day: 5, month: 3, year: 2026, type: 'holiday', description: 'Santa Pasqua' },
    { day: 6, month: 3, year: 2026, type: 'holiday', description: 'Lunedì dell\'Angelo' },
    { day: 7, month: 3, year: 2026, type: 'vacation', description: 'Vacanze pasquali' },
    { day: 25, month: 3, year: 2026, type: 'holiday', description: 'Festa della Liberazione' },
    // May
    { day: 1, month: 4, year: 2026, type: 'holiday', description: 'Festa del Lavoro' },
    { day: 2, month: 4, year: 2026, type: 'bridge', description: 'Ponte' },
    // Jun
    { day: 1, month: 5, year: 2026, type: 'bridge', description: 'Ponte' },
    { day: 2, month: 5, year: 2026, type: 'holiday', description: 'Festa della Repubblica' },
    { day: 12, month: 5, year: 2026, type: 'startEnd', description: 'Termine lezioni' },
];

const months2025 = [
    { value: 8, name: 'Settembre', year: 2025 },
    { value: 9, name: 'Ottobre', year: 2025 },
    { value: 10, name: 'Novembre', year: 2025 },
    { value: 11, name: 'Dicembre', year: 2025 },
];

const months2026 = [
    { value: 0, name: 'Gennaio', year: 2026 },
    { value: 1, name: 'Febbraio', year: 2026 },
    { value: 2, name: 'Marzo', year: 2026 },
    { value: 3, name: 'Aprile', year: 2026 },
    { value: 4, name: 'Maggio', year: 2026 },
    { value: 5, name: 'Giugno', year: 2026 },
];

const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
};

const getDayName = (date: Date) => {
    const days = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'];
    return days[date.getDay()];
};

const getDayType = (day: number, month: number, year: number): { type: DayType; description?: string } => {
    const date = new Date(year, month, day);
    const isSunday = date.getDay() === 0;

    const special = specialDays.find(
        (d) => d.day === day && d.month === month && d.year === year
    );

    if (special) {
        return { type: special.type, description: special.description };
    }

    if (isSunday) {
        return { type: 'sunday' };
    }

    return { type: 'normal' };
};

const LegendItem = ({ type, label, icon: Icon }: { type: DayType, label: string, icon: any }) => (
    <div className={`${styles.legendItem} ${styles[type]}`}>
        <div className={styles.legendIconWrapper}>
            <Icon size={14} className={styles.legendIcon} />
        </div>
        <span>{label}</span>
    </div>
);

export const SchoolCalendar = () => {
    const renderMonth = (month: { value: number; name: string; year: number }) => {
        const daysInMonth = getDaysInMonth(month.value, month.year);
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        return (
            <div key={`${month.year}-${month.value}`} className={styles.monthCard}>
                <div className={styles.monthHeader}>
                    <div className={styles.monthName}>{month.name}</div>
                </div>
                <div className={styles.daysList}>
                    {days.map((day) => {
                        const { type, description } = getDayType(day, month.value, month.year);
                        const date = new Date(month.year, month.value, day);
                        const dayName = getDayName(date);

                        return (
                            <div
                                key={day}
                                className={`${styles.dayRow} ${styles[type] || ''}`}
                            >
                                <span className={styles.dayNumber}>{day}</span>
                                <span className={styles.dayName}>{dayName}</span>
                                {description && <span className={styles.dayDesc}>{description}</span>}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.iconContainer}>
                    <Calendar size={32} className={styles.headerIcon} />
                </div>
                <h2 className={styles.title}>Calendario Scolastico 2025/2026</h2>
            </div>

            <div className={styles.legend}>
                <LegendItem type="sunday" label="Domenica" icon={Coffee} />
                <LegendItem type="startEnd" label="Inizio/Termine" icon={School} />
                <LegendItem type="holiday" label="Festività" icon={Flag} />
                <LegendItem type="vacation" label="Vacanze" icon={Palmtree} />
                <LegendItem type="bridge" label="Ponte" icon={Info} />
            </div>

            <div className={styles.yearSection}>
                <div className={styles.yearTitle}>
                    <span className={styles.yearBadge}>2025</span>
                </div>
                <div className={styles.monthsGrid}>
                    {months2025.map(renderMonth)}
                </div>
            </div>

            <div className={styles.yearSection}>
                <div className={styles.yearTitle}>
                    <span className={styles.yearBadge}>2026</span>
                </div>
                <div className={styles.monthsGrid}>
                    {months2026.map(renderMonth)}
                </div>
            </div>
        </div>
    );
};
