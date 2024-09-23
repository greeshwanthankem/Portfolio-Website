document.addEventListener('DOMContentLoaded', () => {
    const amountInput = document.getElementById('amountInput');
    const fromCurrency = document.getElementById('fromCurrency');
    const toCurrency = document.getElementById('toCurrency');
    const resultInput = document.getElementById('resultInput');
    const swapBtn = document.getElementById('swapBtn');
    const exchangeRateDisplay = document.getElementById('exchangeRateDisplay');
    const percentageChangeDisplay = document.getElementById('percentageChangeDisplay');
    const trendDisplay = document.getElementById('trendDisplay');
    const conversionDisplay = document.getElementById('conversionDisplay');
    const toCurrencyDisplay = document.getElementById('toCurrencyDisplay');
    const circularProgress = document.querySelector('.circle');
    const percentageText = document.querySelector('.percentage');
    const detailedReportBtn = document.getElementById('detailedReportBtn');

    const apiKey = '854c997731645d57001a5f3e'; // Your API key
    const baseUrl = 'https://v6.exchangerate-api.com/v6/';

    const commonCurrencies = [
        'USD', 'EUR', 'INR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'HKD', 'NZD',
        'SEK', 'KRW', 'SGD', 'NOK', 'MXN', 'RUB', 'ZAR', 'TRY', 'BRL',
        'TWD', 'DKK', 'PLN', 'THB', 'IDR', 'HUF', 'CZK', 'ILS', 'CLP', 'PHP',
        'AED', 'COP', 'SAR', 'MYR', 'RON'
    ];

    let allCurrencies = [];

    async function fetchSupportedCurrencies() {
        try {
            const response = await fetch(`${baseUrl}${apiKey}/codes`);
            const data = await response.json();
            if (data.result === 'success') {
                allCurrencies = data.supported_codes;
                populateCurrencyDropdowns();
            } else {
                throw new Error(data['error-type']);
            }
        } catch (error) {
            console.error('Error fetching supported currencies:', error);
            allCurrencies = commonCurrencies.map(code => [code, code]);
            populateCurrencyDropdowns();
        }
    }

    function populateCurrencyDropdowns() {
        const dropdowns = [fromCurrency, toCurrency];
        dropdowns.forEach(dropdown => {
            dropdown.innerHTML = '';
            
            // Add common currencies first
            commonCurrencies.forEach(code => {
                const currencyInfo = allCurrencies.find(curr => curr[0] === code);
                if (currencyInfo) {
                    const option = document.createElement('option');
                    option.value = currencyInfo[0];
                    option.textContent = `${currencyInfo[0]} - ${currencyInfo[1]}`;
                    dropdown.appendChild(option);
                }
            });
            
            // Add a separator
            const separator = document.createElement('option');
            separator.disabled = true;
            separator.textContent = '──────────';
            dropdown.appendChild(separator);
            
            // Add all other currencies
            allCurrencies.forEach(([code, name]) => {
                if (!commonCurrencies.includes(code)) {
                    const option = document.createElement('option');
                    option.value = code;
                    option.textContent = `${code} - ${name}`;
                    dropdown.appendChild(option);
                }
            });
        });
        fromCurrency.value = 'USD';
        toCurrency.value = 'EUR';
        updateConversion();
    }

    async function getExchangeRate(from, to) {
        try {
            const response = await fetch(`${baseUrl}${apiKey}/pair/${from}/${to}`);
            const data = await response.json();
            if (data.result === 'success') {
                return data.conversion_rate;
            } else {
                throw new Error(data['error-type']);
            }
        } catch (error) {
            console.error('Error fetching exchange rate:', error);
            alert('Failed to fetch exchange rate. Please try again later.');
            return null;
        }
    }

    async function updateConversion() {
        const amount = parseFloat(amountInput.value);
        const from = fromCurrency.value;
        const to = toCurrency.value;

        if (from === to) {
            resultInput.value = amount.toFixed(2);
            updateDisplays(1, amount);
        } else {
            const rate = await getExchangeRate(from, to);
            if (rate !== null) {
                const result = amount * rate;
                resultInput.value = result.toFixed(2);
                updateDisplays(rate, result);
            }
        }
    }

    function updateDisplays(rate, result) {
        const from = fromCurrency.value;
        const to = toCurrency.value;

        exchangeRateDisplay.textContent = `1 ${from} = ${rate.toFixed(4)} ${to}`;
        conversionDisplay.textContent = `${amountInput.value} ${from} = ${result.toFixed(2)} ${to}`;
        toCurrencyDisplay.textContent = to;

        const percentageChange = ((rate - 1) * 100).toFixed(2);
        percentageChangeDisplay.textContent = `${percentageChange}%`;

        if (percentageChange > 0) {
            trendDisplay.textContent = 'Upward';
        } else if (percentageChange < 0) {
            trendDisplay.textContent = 'Downward';
        } else {
            trendDisplay.textContent = 'Stable';
        }

        // Update circular progress
        const progressPercentage = (result / 100) * 100; // Assuming max value is 100
        const dashArray = `${progressPercentage}, 100`;
        circularProgress.style.strokeDasharray = dashArray;
        percentageText.textContent = result.toFixed(2);
    }

    function swapCurrencies() {
        const tempCurrency = fromCurrency.value;
        fromCurrency.value = toCurrency.value;
        toCurrency.value = tempCurrency;
        updateConversion();
    }

    amountInput.addEventListener('input', updateConversion);
    fromCurrency.addEventListener('change', updateConversion);
    toCurrency.addEventListener('change', updateConversion);
    swapBtn.addEventListener('click', swapCurrencies);
    detailedReportBtn.addEventListener('click', () => {
        alert('Detailed report functionality not implemented in this demo.');
    });

    // Initialize Lucide icons
    lucide.createIcons();

    // Fetch supported currencies and initialize the converter
    fetchSupportedCurrencies();
});