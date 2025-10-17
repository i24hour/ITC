const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const QRCode = require('qrcode');
const cors = require('cors');
const os = require('os');

const app = express();
const PORT = 3000;

// Get local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const LOCAL_IP = getLocalIP();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const CSV_FILE = path.join(__dirname, 'inventory_data.csv');

// Read CSV and return data
function readCSV() {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(CSV_FILE)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

// Write data back to CSV
function writeCSV(data, headers) {
  return new Promise((resolve, reject) => {
    try {
      let csvContent = headers.join(',') + '\n';
      data.forEach(row => {
        const values = headers.map(header => row[header] || '0');
        csvContent += values.join(',') + '\n';
      });
      fs.writeFileSync(CSV_FILE, csvContent);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

// Get bins with quantity greater than specified value for a SKU
app.post('/api/search-bins', async (req, res) => {
  try {
    const { sku, value } = req.body;
    const data = await readCSV();
    
    const filteredBins = data.filter(row => {
      const skuValue = parseInt(row[sku] || 0);
      return skuValue > parseInt(value);
    });

    res.json(filteredBins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all SKU columns
app.get('/api/skus', async (req, res) => {
  try {
    const data = await readCSV();
    if (data.length > 0) {
      const skus = Object.keys(data[0]).filter(key => key !== 'Bin No.');
      res.json(skus);
    } else {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate QR code for bin
app.post('/api/generate-qr', async (req, res) => {
  try {
    const { binNo, sku, value } = req.body;
    // Create a URL that can be scanned and opened on mobile
    const scanUrl = `http://${LOCAL_IP}:${PORT}/scan.html?binNo=${encodeURIComponent(binNo)}&sku=${encodeURIComponent(sku)}&value=${value}`;
    const qrCodeUrl = await QRCode.toDataURL(scanUrl);
    res.json({ qrCode: qrCodeUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Process QR code scan (subtract value from bin)
app.post('/api/process-scan', async (req, res) => {
  try {
    const { binNo, sku, value } = req.body;
    const data = await readCSV();
    
    // Get headers
    const headers = ['Bin No.'].concat(Object.keys(data[0]).filter(key => key !== 'Bin No.'));
    
    // Find and update the bin
    const binIndex = data.findIndex(row => row['Bin No.'] === binNo);
    if (binIndex === -1) {
      return res.status(404).json({ error: 'Bin not found' });
    }

    const currentValue = parseInt(data[binIndex][sku] || 0);
    const newValue = Math.max(0, currentValue - parseInt(value));
    data[binIndex][sku] = newValue.toString();

    await writeCSV(data, headers);
    
    res.json({ 
      success: true, 
      binNo, 
      sku, 
      previousValue: currentValue, 
      newValue,
      subtracted: value 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current inventory status
app.get('/api/inventory', async (req, res) => {
  try {
    const data = await readCSV();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server running!`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: http://${LOCAL_IP}:${PORT}`);
  console.log(`\n📱 Use the Network URL to scan QR codes from your phone\n`);
});
