# 🎓 Placement Dashboard - Power BI Style

An intuitive, interactive placement analytics dashboard built with React that replicates the Power BI experience. Automatically loads and visualizes placement data from Excel files.

![Dashboard Preview](https://img.shields.io/badge/Status-Ready-success)
![React](https://img.shields.io/badge/React-19.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)

## ✨ Features

### 📊 Key Metrics Dashboard
- **Count of Company**: 170 companies visited
- **Sum of Selection count**: 1,240 total placements
- **Average CTC**: ₹5.27 LPA
- **Max CTC**: ₹21.00 LPA

### 📈 Interactive Visualizations
1. **Line Chart**: Selection trends by date with hover tooltips
2. **Pie Chart**: Branch-wise distribution with percentages
3. **Bar Chart**: Top 15 companies by placements
4. **Stacked Bar**: Company and branch breakdown

### 🎨 Power BI-Inspired Design
- Clean, professional interface
- Microsoft blue color scheme
- Segoe UI typography
- Smooth hover effects
- Responsive layout

## 🚀 Quick Start

### Option 1: Double-click to Run
Simply double-click `START_DASHBOARD.bat` in the root folder!

### Option 2: Manual Start
```bash
cd frontend/PlacementCell
npm install
npm run dev
```

The dashboard opens at: **http://localhost:5173**

## 📁 Project Structure

```
PlacementDashboard/
├── frontend/
│   └── PlacementCell/
│       ├── data/                    # Original Excel files
│       │   └── 2023_2024.xlsx
│       ├── public/
│       │   └── data/                # Public data folder
│       │       └── 2023_2024.xlsx
│       ├── src/
│       │   ├── components/          # React components
│       │   ├── utils/               # Data processing
│       │   ├── styles/              # CSS styling
│       │   ├── App.tsx              # Main dashboard
│       │   └── main.tsx             # Entry point
│       ├── package.json
│       └── vite.config.ts
├── START_DASHBOARD.bat              # Quick start script
├── IMPLEMENTATION_SUMMARY.md        # Technical details
└── README.md                        # This file
```

## 📊 Data Format

Your Excel file should contain these columns:

| Column | Description | Example |
|--------|-------------|---------|
| Company | Company name | "TCS", "Infosys" |
| Branch/Department | Student's branch | "CSE", "ECE" |
| CTC (LPA) | Package offered | 4.5, 21.0 |
| Date of Visit | Visit date | "2023-10-15" |
| Selection count | Number selected | 25, 42 |

## 🎯 How It Works

1. **Auto-Load**: Dashboard automatically loads `public/data/2023_2024.xlsx` on startup
2. **Parse**: XLSX library converts Excel to JSON
3. **Process**: Data processor calculates KPIs and aggregations
4. **Visualize**: Recharts renders interactive charts
5. **Update**: Click "Import Data" to upload new files

## 🛠️ Technology Stack

| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| TypeScript | Type safety |
| Recharts | Chart library |
| XLSX | Excel parsing |
| Vite | Build tool |
| Lucide React | Icons |

## 📱 Features Comparison

| Feature | Power BI | This Dashboard |
|---------|----------|----------------|
| KPI Cards | ✅ | ✅ |
| Line Chart | ✅ | ✅ |
| Pie Chart | ✅ | ✅ |
| Bar Chart | ✅ | ✅ |
| Stacked Chart | ✅ | ✅ |
| Hover Tooltips | ✅ | ✅ |
| Auto-Load Data | ❌ | ✅ |
| Free License | ❌ | ✅ |
| Customizable | Limited | ✅ |
| Web-Based | ✅ | ✅ |

## 🎨 Customization

### Change Colors
Edit `src/App.tsx`:
```typescript
const BRANCH_COLORS: Record<string, string> = {
    'CSE': '#2563eb',  // Change to your color
    'ECE': '#3b82f6',
    // Add more branches...
};
```

### Modify Styling
Edit `src/styles/index.css`:
```css
:root {
  --accent-blue: #0078d4;  /* Primary color */
  --bg-secondary: #f3f4f6; /* Background */
}
```

### Add New Charts
Import from Recharts and add to `App.tsx`:
```typescript
import { ScatterChart, Scatter } from 'recharts';
```

## 📈 Performance

- ✅ Handles 1000+ records smoothly
- ✅ Memoized calculations
- ✅ Optimized re-renders
- ✅ Fast chart rendering
- ✅ Instant interactions

## 🌐 Browser Support

| Browser | Support |
|---------|---------|
| Chrome | ✅ Full |
| Edge | ✅ Full |
| Firefox | ✅ Full |
| Safari | ✅ Full |
| IE11 | ❌ Not supported |

## 🔧 Troubleshooting

### Data not loading?
- Check if `public/data/2023_2024.xlsx` exists
- Open browser console (F12) for errors
- Verify Excel file format

### Charts not showing?
- Ensure data has correct column names
- Check date formats (YYYY-MM-DD)
- Verify CTC values are numbers

### Port already in use?
```bash
# Kill process on port 5173
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

## 📚 Documentation

- **[DASHBOARD_GUIDE.md](frontend/PlacementCell/DASHBOARD_GUIDE.md)**: User guide
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)**: Technical details

## 🚀 Deployment

### Build for Production
```bash
cd frontend/PlacementCell
npm run build
```

Output in `dist/` folder - deploy to any static host:
- Netlify
- Vercel
- GitHub Pages
- AWS S3
- Azure Static Web Apps

## 🎯 Future Enhancements

- [ ] Date range filters
- [ ] Branch/company filters
- [ ] Export to PDF/Excel
- [ ] Dark mode toggle
- [ ] Mobile optimization
- [ ] Real-time data sync
- [ ] Multi-year comparison
- [ ] Drill-down views

## 📝 License

This project is open-source and available for educational purposes.

## 🤝 Contributing

Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 📧 Support

For issues or questions:
1. Check browser console for errors
2. Review documentation files
3. Verify data format matches expected structure

---

**Made with ❤️ for better placement analytics**

*Replicating Power BI's intuitive design with the flexibility of React*
