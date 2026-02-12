import React, { useState, useMemo, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { parseExcel } from './utils/excelParser';
import {
    calculateKPIs,
    processDateTrends,
    aggregateBranchStats,
    aggregateCompanyStats,
    getCompanyBranchBreakdown,
    type PlacementRecord,
} from './utils/dataProcessor';
import './styles/index.css';

// Branch colors for charts
const BRANCH_COLORS: Record<string, string> = {
    'CSE': '#2563eb',
    'ECE': '#3b82f6',
    'IT': '#f59e0b',
    'MECH': '#7c3aed',
    'EEE': '#ec4899',
    'AI & DS': '#a855f7',
    'CHE': '#eab308',
    'CIVIL': '#ef4444',
    'AUTO': '#059669',
    'BIO': '#10b981',
    'MAR': '#06b6d4',
};

const BRANCH_COLOR_ARRAY = Object.values(BRANCH_COLORS);

function App() {
    const [data, setData] = useState<PlacementRecord[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
    const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

    useEffect(() => {
        const loadDefaultData = async () => {
            try {
                const response = await fetch('/data/2023_2024.xlsx');
                const blob = await response.blob();
                const file = new File([blob], '2023_2024.xlsx');
                const parsedData = await parseExcel(file);
                setData(parsedData);
            } catch (error) {
                console.error('Error loading default data:', error);
            }
        };
        loadDefaultData();
    }, []);

    const filteredData = useMemo(() => {
        if (data.length <= 1) return data;
        return data.filter((record, idx) => {
            if (idx === 0) return true;
            if (selectedBranch && selectedCompany) {
                const branchIdx = ['AI & DS', 'CSE', 'IT', 'ECE', 'EEE', 'MECH', 'AUTO', 'CIVIL', 'BIO', 'CHE', 'MAR'].indexOf(selectedBranch);
                const colKey = branchIdx === 0 ? 'Final Selection Count' : `__EMPTY${branchIdx === 1 ? '' : '_' + (branchIdx - 1)}`;
                const val = record[colKey];
                return record['Name of the Company'] === selectedCompany && val && val !== 'NA' && val !== 0;
            }
            if (selectedBranch) {
                const branchIdx = ['AI & DS', 'CSE', 'IT', 'ECE', 'EEE', 'MECH', 'AUTO', 'CIVIL', 'BIO', 'CHE', 'MAR'].indexOf(selectedBranch);
                const colKey = branchIdx === 0 ? 'Final Selection Count' : `__EMPTY${branchIdx === 1 ? '' : '_' + (branchIdx - 1)}`;
                const val = record[colKey];
                return val && val !== 'NA' && val !== 0;
            }
            if (selectedCompany) {
                return record['Name of the Company'] === selectedCompany;
            }
            return true;
        });
    }, [data, selectedBranch, selectedCompany]);

    const kpis = useMemo(() => calculateKPIs(filteredData), [filteredData]);
    const dateTrends = useMemo(() => processDateTrends(filteredData), [filteredData]);
    const branchStats = useMemo(() => aggregateBranchStats(filteredData), [filteredData]);
    const companyStats = useMemo(() => aggregateCompanyStats(filteredData), [filteredData]);
    const companyBranchBreakdown = useMemo(() => getCompanyBranchBreakdown(filteredData), [filteredData]);

    const formatDateForChart = (dateStr: string): string => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch {
            return dateStr;
        }
    };

    const allBranches = useMemo(() => {
        const branches = new Set<string>();
        companyBranchBreakdown.forEach(item => {
            Object.keys(item.branches).forEach(branch => branches.add(branch));
        });
        return Array.from(branches);
    }, [companyBranchBreakdown]);

    return (
        <div className="dashboard-container-intuitive">
            {/* Header */}
            <header className="dashboard-header">
                <img src="/svcelogo.png" alt="SVCE Logo" style={{ height: '50px', objectFit: 'contain', flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, paddingLeft: '320px' }}>
                    <h1 className="dashboard-title">Placement Dashboard</h1>
                    <p className="dashboard-subtitle">
                        Academic Year 2023-24
                        {selectedBranch && ` • ${selectedBranch}`}
                        {selectedCompany && ` • ${selectedCompany}`}
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                    {(selectedBranch || selectedCompany) && (
                        <button onClick={() => { setSelectedBranch(null); setSelectedCompany(null); }} className="import-btn-intuitive">
                            Clear Filters
                        </button>
                    )}
                    <img src="/svcelogoright.png" alt="SVCE Logo Right" style={{ height: '50px', objectFit: 'contain' }} />
                </div>
            </header>

            {/* KPI Strip */}
            <section className="kpi-strip">
                <div className="kpi-card">
                    <div className="kpi-label">Count of Company</div>
                    <div className="kpi-value-large">{kpis.totalCompanies}</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-label">Sum of Selection count</div>
                    <div className="kpi-value-large">{kpis.totalSelections.toLocaleString()}</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-label">Average of CTC (LPA)</div>
                    <div className="kpi-value-large">{kpis.averageCTC.toFixed(2)}</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-label">Max of CTC (LPA)</div>
                    <div className="kpi-value-large">{kpis.highestCTC.toFixed(2)}</div>
                </div>
            </section>

            {/* Main Line Chart */}
            <section className="chart-section-main">
                <div className="chart-card-full">
                    <h3 className="chart-title">Sum of Selection count by Date of Visit</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={dateTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                                dataKey="date" 
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                tickFormatter={(value) => {
                                    try {
                                        const date = new Date(value);
                                        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                                    } catch {
                                        return value;
                                    }
                                }}
                            />
                            <YAxis 
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                label={{ value: 'Sum of Selection count', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#ffffff', 
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}
                                labelFormatter={(value) => formatDateForChart(value)}
                                formatter={(value: number) => [`${value}`, 'Selections']}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="selections" 
                                stroke="#118dff" 
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4, fill: '#118dff' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* Secondary Charts Row */}
            <section className="charts-row">
                {/* Pie Chart - Branch Distribution */}
                <div className="chart-card">
                    <h3 className="chart-title">Sum of Selection count by Branch</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                            <Pie
                                data={branchStats}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={(entry: any) => `${entry.branch}: ${entry.percentage}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="selections"
                                onClick={(data: any) => setSelectedBranch(data?.branch)}
                                style={{ cursor: 'pointer' }}
                            >
                                {branchStats.map((entry, index) => (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={BRANCH_COLORS[entry.branch] || BRANCH_COLOR_ARRAY[index % BRANCH_COLOR_ARRAY.length]} 
                                    />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#ffffff', 
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px'
                                }}
                                formatter={(value: number, name: string, props: any) => {
                                    const payload = props?.payload;
                                    return [
                                        `${value} (${payload?.percentage || 0}%)`,
                                        'Sum of Selection count'
                                    ];
                                }}
                            />
                            <Legend 
                                verticalAlign="bottom" 
                                height={36}
                                iconType="circle"
                                wrapperStyle={{ fontSize: '11px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Horizontal Bar Chart - Company Distribution */}
                <div className="chart-card">
                    <h3 className="chart-title">Sum of Selection count by Company</h3>
                    <div style={{ height: '350px', overflowY: 'auto', overflowX: 'hidden' }}>
                        <ResponsiveContainer width="100%" height={companyStats.length * 25 + 100}>
                            <BarChart 
                                layout="vertical"
                            data={companyStats}
                            margin={{ left: 120, right: 20, top: 20, bottom: 20 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e1dfdd" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 10, fill: '#605e5c' }} axisLine={{ stroke: '#e1dfdd' }} tickLine={false} />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    tick={{ fontSize: 10, fill: '#605e5c' }}
                                    width={110}
                                    tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#ffffff', 
                                        border: '1px solid #e1dfdd',
                                        borderRadius: '2px',
                                        fontSize: '12px'
                                    }}
                                    formatter={(value: number) => [value, 'Sum of Selection count']}
                                />
                                <Bar dataKey="selections" fill="#7c3aed" radius={[0, 2, 2, 0]} onClick={(data: any) => setSelectedCompany(data?.name)} style={{ cursor: 'pointer' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            {/* Stacked Bar Chart - Company and Branch */}
            <section className="chart-section-full">
                <div className="chart-card-full">
                    <h3 className="chart-title">Sum of Selection count by Company and Branch</h3>
                    <div className="chart-scroll-container">
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart
                                data={companyBranchBreakdown.map(item => ({
                                    company: item.company,
                                    ...Object.fromEntries(
                                        allBranches.map(branch => [branch, item.branches[branch] || 0])
                                    )
                                }))}
                                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e1dfdd" vertical={false} />
                                <XAxis 
                                    dataKey="company" 
                                    angle={-45}
                                    textAnchor="end"
                                    height={100}
                                    tick={{ fontSize: 9, fill: '#605e5c' }}
                                    axisLine={{ stroke: '#e1dfdd' }}
                                    tickLine={false}
                                />
                                <YAxis 
                                    tick={{ fontSize: 10, fill: '#605e5c' }}
                                    label={{ value: 'Sum of Selection count', angle: -90, position: 'insideLeft', style: { fill: '#605e5c', fontSize: 11 } }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#ffffff', 
                                        border: '1px solid #e1dfdd',
                                        borderRadius: '2px',
                                        fontSize: '12px'
                                    }}
                                />
                                <Legend 
                                    wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }}
                                    iconType="square"
                                    onClick={(e) => {
                                        if (e.dataKey) {
                                            setSelectedBranch(e.dataKey as string);
                                        }
                                    }}
                                    style={{ cursor: 'pointer' }}
                                />
                                {allBranches.map((branch, index) => (
                                    <Bar 
                                        key={branch}
                                        dataKey={branch}
                                        stackId="a"
                                        fill={BRANCH_COLORS[branch] || BRANCH_COLOR_ARRAY[index % BRANCH_COLOR_ARRAY.length]}
                                        name={branch}
                                        onClick={() => setSelectedBranch(branch)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default App;
