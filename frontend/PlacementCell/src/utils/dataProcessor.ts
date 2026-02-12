export interface PlacementRecord {
  'S. No'?: number;
  'Name of the Company'?: string;
  'Date of Visit'?: number | string;
  'CTC in LPA'?: number;
  'Final Selection Count'?: number | string;
  __EMPTY?: number | string;
  __EMPTY_1?: number | string;
  __EMPTY_2?: number | string;
  __EMPTY_3?: number | string;
  __EMPTY_4?: number | string;
  __EMPTY_5?: number | string;
  __EMPTY_6?: number | string;
  __EMPTY_7?: number | string;
  __EMPTY_8?: number | string;
  __EMPTY_9?: number | string;
  __EMPTY_10?: number | string;
  Total?: number;
  [key: string]: any;
}

const BRANCH_COLUMNS = [
  'Final Selection Count', // AI & DS
  '__EMPTY',     // CSE
  '__EMPTY_1',   // IT
  '__EMPTY_2',   // ECE
  '__EMPTY_3',   // EEE
  '__EMPTY_4',   // MECH
  '__EMPTY_5',   // AUTO
  '__EMPTY_6',   // CIVIL
  '__EMPTY_7',   // BIO
  '__EMPTY_8',   // CHE
  '__EMPTY_9',   // MAR
];

const BRANCH_NAMES = ['AI & DS', 'CSE', 'IT', 'ECE', 'EEE', 'MECH', 'AUTO', 'CIVIL', 'BIO', 'CHE', 'MAR'];

function excelDateToJSDate(serial: number): Date {
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);
  return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate());
}

function parseValue(val: any): number {
  if (val === 'NA' || val === null || val === undefined || val === '') return 0;
  const num = typeof val === 'number' ? val : parseFloat(val);
  return isNaN(num) ? 0 : num;
}

export interface KPIMetrics {
  totalCompanies: number;
  totalOffers: number;
  totalSelections: number;
  highestCTC: number;
  averageCTC: number;
  eligiblePlacedPercent: number;
}

export interface MonthlyTrend {
  month: string;
  offers: number;
  companies: number;
}

export interface DateTrend {
  date: string;
  selections: number;
}

export interface CompanyStats {
  name: string;
  offers: number;
  selections: number;
  ctc: number;
  type: 'Mass' | 'Premium' | 'Core';
  date: string;
  departments: Record<string, number>;
}

export interface BranchStats {
  branch: string;
  selections: number;
  percentage: number;
}

export interface CTCBand {
  name: string;
  value: number;
  range: string;
}

/**
 * Calculate KPIs from placement data
 */
export const calculateKPIs = (data: PlacementRecord[]): KPIMetrics => {
  if (data.length <= 1) return {
    totalCompanies: 0,
    totalOffers: 0,
    totalSelections: 0,
    highestCTC: 0,
    averageCTC: 0,
    eligiblePlacedPercent: 0,
  };

  const validData = data.slice(1).filter(d => d['Name of the Company']);
  const uniqueCompanies = new Set(validData.map(d => d['Name of the Company']).filter(Boolean));
  
  const totalSelections = validData.reduce((sum, record) => {
    const total = parseValue(record.Total);
    return sum + total;
  }, 0);
  
  const ctcValues = validData
    .map(d => parseValue(d['CTC in LPA']))
    .filter(ctc => ctc > 0);

  const highestCTC = ctcValues.length > 0 ? Math.max(...ctcValues) : 0;
  const averageCTC = ctcValues.length > 0 
    ? ctcValues.reduce((sum, ctc) => sum + ctc, 0) / ctcValues.length 
    : 0;

  return {
    totalCompanies: uniqueCompanies.size,
    totalOffers: validData.length,
    totalSelections,
    highestCTC: Math.round(highestCTC * 100) / 100,
    averageCTC: Math.round(averageCTC * 100) / 100,
    eligiblePlacedPercent: 0,
  };
};

/**
 * Process date-wise trends from data
 */
export const processDateTrends = (data: PlacementRecord[]): DateTrend[] => {
  if (data.length <= 1) return [];

  const dateMap: Record<string, number> = {};
  const validData = data.slice(1).filter(d => d['Name of the Company']);

  validData.forEach(record => {
    const dateSerial = record['Date of Visit'];
    if (!dateSerial || typeof dateSerial !== 'number') return;

    const date = excelDateToJSDate(dateSerial);
    const dateKey = date.toISOString().split('T')[0];
    const total = parseValue(record.Total);
    
    dateMap[dateKey] = (dateMap[dateKey] || 0) + total;
  });

  return Object.keys(dateMap)
    .sort()
    .map(date => ({ date, selections: dateMap[date] }));
};

/**
 * Process monthly trends from data
 */
export const processMonthlyTrends = (data: PlacementRecord[]): MonthlyTrend[] => {
  if (data.length === 0) {
    return [
      { month: 'Aug 23', offers: 45, companies: 8 },
      { month: 'Sep 23', offers: 120, companies: 15 },
      { month: 'Oct 23', offers: 250, companies: 22 },
      { month: 'Nov 23', offers: 80, companies: 12 },
      { month: 'Dec 23', offers: 35, companies: 6 },
      { month: 'Jan 24', offers: 95, companies: 14 },
    ];
  }

  const monthMap: Record<string, { offers: number; companies: Set<string> }> = {};

  data.forEach(record => {
    const dateStr = record.Date || record['Visit Date'] || '';
    if (!dateStr) return;

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return;

    const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    
    if (!monthMap[monthKey]) {
      monthMap[monthKey] = { offers: 0, companies: new Set() };
    }
    
    monthMap[monthKey].offers += 1;
    if (record.Company) {
      monthMap[monthKey].companies.add(record.Company);
    }
  });

  const months = Object.keys(monthMap).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateA.getTime() - dateB.getTime();
  });

  return months.map(month => ({
    month,
    offers: monthMap[month].offers,
    companies: monthMap[month].companies.size,
  }));
};

/**
 * Aggregate branch statistics
 */
export const aggregateBranchStats = (data: PlacementRecord[]): BranchStats[] => {
  if (data.length <= 1) return [];

  const branchMap: Record<string, number> = {};
  const validData = data.slice(1).filter(d => d['Name of the Company']);

  BRANCH_NAMES.forEach((branchName, idx) => {
    const colKey = BRANCH_COLUMNS[idx];
    const total = validData.reduce((sum, record) => {
      return sum + parseValue(record[colKey]);
    }, 0);
    if (total > 0) branchMap[branchName] = total;
  });

  const total = Object.values(branchMap).reduce((sum, count) => sum + count, 0);

  return Object.entries(branchMap)
    .map(([branch, selections]) => ({
      branch,
      selections,
      percentage: total > 0 ? Math.round((selections / total) * 10000) / 100 : 0,
    }))
    .sort((a, b) => b.selections - a.selections);
};

/**
 * Aggregate company statistics
 */
export const aggregateCompanyStats = (data: PlacementRecord[]): CompanyStats[] => {
  if (data.length <= 1) return [];

  const validData = data.slice(1).filter(d => d['Name of the Company']);

  return validData
    .map(record => {
      const departments: Record<string, number> = {};
      BRANCH_NAMES.forEach((branchName, idx) => {
        const val = parseValue(record[BRANCH_COLUMNS[idx]]);
        if (val > 0) departments[branchName] = val;
      });

      const ctc = parseValue(record['CTC in LPA']);
      return {
        name: record['Name of the Company'] || 'Unknown',
        offers: 1,
        selections: parseValue(record.Total),
        ctc,
        type: (ctc >= 8 ? 'Premium' : ctc >= 6 ? 'Core' : 'Mass') as 'Mass' | 'Premium' | 'Core',
        date: typeof record['Date of Visit'] === 'number' 
          ? excelDateToJSDate(record['Date of Visit']).toISOString().split('T')[0]
          : '',
        departments,
      };
    })
    .filter(c => c.selections > 0)
    .sort((a, b) => b.selections - a.selections);
};

/**
 * Get company-branch breakdown for stacked bar chart
 */
export const getCompanyBranchBreakdown = (data: PlacementRecord[]): Array<{
  company: string;
  branches: Record<string, number>;
  total: number;
}> => {
  if (data.length <= 1) return [];

  const validData = data.slice(1).filter(d => d['Name of the Company']);

  return validData
    .map(record => {
      const branches: Record<string, number> = {};
      BRANCH_NAMES.forEach((branchName, idx) => {
        const val = parseValue(record[BRANCH_COLUMNS[idx]]);
        if (val > 0) branches[branchName] = val;
      });

      return {
        company: record['Name of the Company'] || 'Unknown',
        branches,
        total: parseValue(record.Total),
      };
    })
    .filter(c => c.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 20);
};

/**
 * Calculate CTC distribution bands
 */
export const calculateCTCDistribution = (data: PlacementRecord[]): CTCBand[] => {
  if (data.length === 0) {
    return [
      { name: '< 4 LPA', value: 300, range: '0-4' },
      { name: '4-6 LPA', value: 450, range: '4-6' },
      { name: '6-10 LPA', value: 200, range: '6-10' },
      { name: '10+ LPA', value: 50, range: '10+' },
    ];
  }

  const bands = {
    '< 4 LPA': 0,
    '4-6 LPA': 0,
    '6-10 LPA': 0,
    '10+ LPA': 0,
  };

  data.forEach(record => {
    const ctc = record.CTC || record['CTC (LPA)'] || 0;
    const ctcNum = typeof ctc === 'string' ? parseFloat(ctc.replace(/[₹,\s]/g, '')) : ctc;
    
    if (isNaN(ctcNum) || ctcNum === 0) return;

    if (ctcNum < 4) bands['< 4 LPA']++;
    else if (ctcNum < 6) bands['4-6 LPA']++;
    else if (ctcNum < 10) bands['6-10 LPA']++;
    else bands['10+ LPA']++;
  });

  return Object.entries(bands).map(([name, value]) => ({
    name,
    value,
    range: name === '< 4 LPA' ? '0-4' : name === '4-6 LPA' ? '4-6' : name === '6-10 LPA' ? '6-10' : '10+',
  }));
};

/**
 * Generate insights from data
 */
export const generateInsights = (
  data: PlacementRecord[],
  kpis: KPIMetrics,
  trends: MonthlyTrend[],
  companies: CompanyStats[]
): string[] => {
  const insights: string[] = [];

  if (data.length === 0) {
    return [
      "Target achieved: 85% eligible students placed.",
      "Oct 2023 recorded peak recruitment activity.",
      "MuSigma offering highest package of ₹21 LPA.",
      "CSE & ECE contributed 60% of total offers.",
    ];
  }

  // Highest CTC insight
  const premiumCompanies = companies.filter(c => c.ctc >= 20);
  if (premiumCompanies.length > 0) {
    insights.push(`₹20+ LPA offers from ${premiumCompanies.length} companies (${premiumCompanies.map(c => c.name).join(', ')})`);
  }

  // Peak month insight
  if (trends.length > 0) {
    const peakMonth = trends.reduce((max, t) => t.offers > max.offers ? t : max);
    insights.push(`Peak hiring month: ${peakMonth.month} with ${peakMonth.offers} offers`);
  }

  // Department contribution
  const deptCounts: Record<string, number> = {};
  data.forEach(d => {
    const dept = d.Branch || d.Department || 'Unknown';
    deptCounts[dept] = (deptCounts[dept] || 0) + 1;
  });
  const topDepts = Object.entries(deptCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);
  if (topDepts.length >= 2) {
    const total = topDepts.reduce((sum, [, count]) => sum + count, 0);
    const percent = Math.round((total / data.length) * 100);
    insights.push(`${topDepts.map(([dept]) => dept).join(' & ')} contributed ${percent}% of total offers`);
  }

  // Core vs IT split
  const coreCompanies = companies.filter(c => c.type === 'Core').length;
  const itCompanies = companies.filter(c => c.type === 'Mass' || c.type === 'Premium').length;
  if (coreCompanies > 0 && itCompanies > 0) {
    insights.push(`${Math.round((coreCompanies / (coreCompanies + itCompanies)) * 100)}% Core placements vs ${Math.round((itCompanies / (coreCompanies + itCompanies)) * 100)}% IT placements`);
  }

  // Average CTC insight
  if (kpis.averageCTC > 0) {
    insights.push(`Average CTC of ₹${kpis.averageCTC} LPA across all placements`);
  }

  return insights.slice(0, 4);
};
