const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, 'data', '2023_2024.xlsx');
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

console.log('Total rows:', data.length);
console.log('\nColumn names:', Object.keys(data[0] || {}));
console.log('\nFirst 3 rows:');
console.log(JSON.stringify(data.slice(0, 3), null, 2));
