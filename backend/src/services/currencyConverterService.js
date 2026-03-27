class CurrencyConverterService {
  constructor() {
    // Load exchange rates from environment variables with defaults
    this.usdToYerSanaaRate = parseFloat(process.env.USD_TO_YER_SANAA_RATE) || 530;
    this.usdToYerAdenRate = parseFloat(process.env.USD_TO_YER_ADEN_RATE) || 1650;
  }

  /**
   * Convert an amount from one currency to another
   * @param {number} amount - The amount to convert
   * @param {number} fromCurrency - The source currency (see Currency enum)
   * @param {number} toCurrency - The target currency (see Currency enum)
   * @returns {number} The converted amount
   */
  convert(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    // Convert whatever we have into USD first
    let amountInUsd;
    switch (fromCurrency) {
      case 1: // YER_Sanaa
        amountInUsd = amount / this.usdToYerSanaaRate;
        break;
      case 2: // YER_Aden
        amountInUsd = amount / this.usdToYerAdenRate;
        break;
      case 3: // USD
        amountInUsd = amount;
        break;
      case 4: // SAR
        // Assuming 1 USD = 3.75 SAR (fixed rate as example)
        amountInUsd = amount / 3.75;
        break;
      case 5: // EUR
        // Assuming 1 USD = 0.92 EUR (fixed rate as example)
        amountInUsd = amount / 0.92;
        break;
      default:
        throw new Error(`Unsupported source currency: ${fromCurrency}`);
    }

    // Convert USD into the target currency
    switch (toCurrency) {
      case 1: // YER_Sanaa
        return amountInUsd * this.usdToYerSanaaRate;
      case 2: // YER_Aden
        return amountInUsd * this.usdToYerAdenRate;
      case 3: // USD
        return amountInUsd;
      case 4: // SAR
        return amountInUsd * 3.75;
      case 5: // EUR
        return amountInUsd * 0.92;
      default:
        throw new Error(`Unsupported target currency: ${toCurrency}`);
    }
  }

  /**
   * Update exchange rates
   * @param {number} usdToSanaa - New USD to YER_Sanaa rate
   * @param {number} usdToAden - New USD to YER_Aden rate
   */
  updateRates(usdToSanaa, usdToAden) {
    this.usdToYerSanaaRate = usdToSanaa;
    this.usdToYerAdenRate = usdToAden;
  }

  /**
   * Get current exchange rates
   * @returns {{usdToSanaa: number, usdToAden: number}} The current rates
   */
  getRates() {
    return {
      usdToSanaa: this.usdToYerSanaaRate,
      usdToYerAden: this.usdToYerAdenRate
    };
  }
}

module.exports = CurrencyConverterService;