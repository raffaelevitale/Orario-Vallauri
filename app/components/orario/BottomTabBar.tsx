"use client";

import { Calendar, GraduationCap, Users } from "lucide-react";
import styles from "./BottomTabBar.module.css";

export type TabId = "orario" | "classi" | "docenti";

interface BottomTabBarProps {
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; icon: typeof Calendar }[] = [
    { id: "classi", label: "Alunni", icon: GraduationCap },
    { id: "orario", label: "Orario", icon: Calendar },
    { id: "docenti", label: "Docenti", icon: Users },
];

export function BottomTabBar({ activeTab, onTabChange }: BottomTabBarProps) {
    return (
        <nav className={styles.tabBar}>
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        className={`${styles.tab} ${isActive ? styles.active : ""}`}
                        onClick={() => onTabChange(tab.id)}
                        aria-label={tab.label}
                        aria-selected={isActive}
                        role="tab"
                    >
                        <Icon size={22} className={styles.tabIcon} />
                        <span className={styles.tabLabel}>{tab.label}</span>
                    </button>
                );
            })}
        </nav>
    );
}
