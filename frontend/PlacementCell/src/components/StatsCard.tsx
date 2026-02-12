import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    color?: string; // e.g., var(--accent-blue) or var(--accent-green)
    suffix?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color = 'var(--accent-blue)', suffix }) => {
    return (
        <div className="control-card">
            <div className="kpi-icon-container" style={{ backgroundColor: `${color}15`, color: color }}>
                <Icon size={20} />
            </div>
            <div>
                <div className="kpi-value">
                    {value}
                    {suffix && <span style={{ fontSize: '14px', marginLeft: '4px', opacity: 0.6 }}>{suffix}</span>}
                </div>
                <div className="kpi-label">{title}</div>
            </div>
        </div>
    );
};

export default StatsCard;
