const express = require('express');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.BINANCE_API_KEY;
const API_SECRET = process.env.BINANCE_API_SECRET;
const BASE_URL = 'https://api.binance.com';

const sign = (queryString) => crypto.createHmac('sha256', API_SECRET).update(queryString).digest('hex');

app.get('/ping', (req, res) => res.json({ status: 'ok' }));

app.get('/balance', async (req, res) => {
  try {
    const timestamp = Date.now();
    const signature = sign(`timestamp=${timestamp}`);
    const response = await axios.get(`${BASE_URL}/api/v3/account`, {
      headers: { 'X-MBX-APIKEY': API_KEY },
      params: { timestamp, signature }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/order', async (req, res) => {
  const { symbol, side, amount } = req.body;
  try {
    const timestamp = Date.now();
    const query = `symbol=${symbol}&side=${side}&type=MARKET&timestamp=${timestamp}&quoteOrderQty=${amount}`;
    const signature = sign(query);
    const response = await axios.post(`${BASE_URL}/api/v3/order`, null, {
      headers: { 'X-MBX-APIKEY': API_KEY },
      params: { ...Object.fromEntries(new URLSearchParams(query)), signature }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`🚀 Server jalan di port ${PORT}`));