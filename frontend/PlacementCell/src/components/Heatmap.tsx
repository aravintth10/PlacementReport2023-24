import React from 'react';

interface HeatmapProps {
    data: any[];
    departments: string[];
    companies: string[];
}

const Heatmap: React.FC<HeatmapProps> = ({ data, departments, companies }) => {
    // Aggregate data: { [dept]: { [company]: count } }
    const matrix: Record<string, Record<string, number>> = {};

    departments.forEach(dept => {
        matrix[dept] = {};
        companies.forEach(comp => {
            const count = data.filter(s => s.Department === dept && s.Company === comp).length;
            matrix[dept][comp] = count;
        });
    });

    // Get max count for normalization
    const maxCount = Math.max(
        ...departments.map(dept => 
            Math.max(...companies.map(comp => matrix[dept]?.[comp] || 0))
        ),
        1
    );

    const getIntensity = (count: number) => {
        if (count === 0) return 'rgba(255, 255, 255, 0.03)';
        const intensity = count / maxCount;
        if (intensity < 0.2) return 'rgba(59, 130, 246, 0.2)'; // Low - blue
        if (intensity < 0.5) return 'rgba(59, 130, 246, 0.5)'; // Medium - blue
        if (intensity < 0.8) return 'rgba(59, 130, 246, 0.8)'; // High - blue
        return 'rgba(59, 130, 246, 1)'; // 🔥 Very High - blue
    };

    const getIntensityLabel = (count: number) => {
        if (count === 0) return 'NA';
        const intensity = count / maxCount;
        if (intensity < 0.2) return 'Low';
        if (intensity < 0.5) return 'Medium';
        if (intensity < 0.8) return 'High';
        return '🔥 Very High';
    };

    return (
        <div className="control-card overflow-x-auto">
            <h3 className="visual-title mb-6">Department-wise Placement Heatmap</h3>
            <table className="heatmap-table">
                <thead>
                    <tr>
                        <th style={{ textAlign: 'left', paddingBottom: '12px' }}>DEPT</th>
                        {companies.map(comp => (
                            <th key={comp} style={{ transform: 'rotate(-45deg)', height: '80px', minWidth: '40px', fontSize: '10px' }}>
                                {comp.length > 10 ? comp.substring(0, 8) + '...' : comp}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {departments.map(dept => (
                        <tr key={dept}>
                            <td style={{ fontWeight: '600', paddingRight: '12px', color: 'var(--text-secondary)' }}>{dept}</td>
                            {companies.map(comp => (
                                <td
                                    key={`${dept}-${comp}`}
                                    className="heatmap-cell"
                                    style={{ 
                                        backgroundColor: getIntensity(matrix[dept][comp]),
                                        fontWeight: matrix[dept][comp] > 0 ? 600 : 400,
                                        color: matrix[dept][comp] > 0 ? '#0f172a' : 'transparent'
                                    }}
                                    title={`${dept} @ ${comp}: ${matrix[dept][comp]} offers (${getIntensityLabel(matrix[dept][comp])})`}
                                >
                                    {matrix[dept][comp] > 0 ? matrix[dept][comp] : ''}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="mt-6 flex items-center gap-4 text-xs text-secondary flex-wrap">
                <span className="font-semibold">Intensity Legend:</span>
                <div className="flex items-center gap-1">
                    <div style={{ width: 12, height: 12, backgroundColor: 'rgba(0, 0, 0, 0.03)', border: '1px solid rgba(0,0,0,0.1)' }}></div> 
                    <span>NA</span>
                </div>
                <div className="flex items-center gap-1">
                    <div style={{ width: 12, height: 12, backgroundColor: 'rgba(59, 130, 246, 0.2)' }}></div> 
                    <span>Low</span>
                </div>
                <div className="flex items-center gap-1">
                    <div style={{ width: 12, height: 12, backgroundColor: 'rgba(59, 130, 246, 0.5)' }}></div> 
                    <span>Medium</span>
                </div>
                <div className="flex items-center gap-1">
                    <div style={{ width: 12, height: 12, backgroundColor: 'rgba(59, 130, 246, 0.8)' }}></div> 
                    <span>High</span>
                </div>
                <div className="flex items-center gap-1">
                    <div style={{ width: 12, height: 12, backgroundColor: 'rgba(59, 130, 246, 1)' }}></div> 
                    <span>🔥 Very High</span>
                </div>
            </div>
        </div>
    );
};

export default Heatmap;
