const path = require('path');
const fs = require('fs');

// Store exchange rates in a simple JSON file (no DB migration needed)
const RATES_FILE = path.join(__dirname, '../../data/exchange-rates.json');

function ensureDataDir() {
  const dir = path.dirname(RATES_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readRates() {
  ensureDataDir();
  if (!fs.existsSync(RATES_FILE)) {
    // Default rates
    const defaults = { USD_to_YER_Sanaa: 550, USD_to_YER_Aden: 1700 };
    fs.writeFileSync(RATES_FILE, JSON.stringify(defaults, null, 2));
    return defaults;
  }
  return JSON.parse(fs.readFileSync(RATES_FILE, 'utf8'));
}

function writeRates(rates) {
  ensureDataDir();
  fs.writeFileSync(RATES_FILE, JSON.stringify(rates, null, 2));
}

class SystemSettingsController {
  /**
   * GET /api/SystemSettings/exchange-rates
   */
  getExchangeRates(req, res) {
    try {
      const rates = readRates();
      res.json(rates);
    } catch (error) {
      throw error;
    }
  }

  /**
   * PUT /api/SystemSettings/exchange-rates
   */
  updateExchangeRates(req, res) {
    try {
      const { USD_to_YER_Sanaa, USD_to_YER_Aden } = req.body;

      if (!USD_to_YER_Sanaa || !USD_to_YER_Aden) {
        res.status(400);
        throw new Error('Both USD_to_YER_Sanaa and USD_to_YER_Aden are required');
      }

      const rates = {
        USD_to_YER_Sanaa: parseFloat(USD_to_YER_Sanaa),
        USD_to_YER_Aden: parseFloat(USD_to_YER_Aden)
      };

      writeRates(rates);
      res.status(204).send();
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new SystemSettingsController();
