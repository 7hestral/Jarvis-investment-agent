const axios = require('axios');

async function getMarkets() {
  try {
    const BASE_URL = 'https://api-v2.pendle.finance/core';
    const CHAIN_ID = 1; // Ethereum mainnet
    const url = `${BASE_URL}/v1/${CHAIN_ID}/markets/active`;
    
    console.log('Fetching available markets...');
    
    const response = await axios.get(url, {
      headers: {
        'Accept': 'application/json'
      },
      timeout: 30000
    });
    
    if (response.data && response.data.markets) {
      const markets = response.data.markets.slice(0, 5); // Just show first 5 for brevity
      console.log('Available markets (first 5):', markets.map(m => ({
        address: m.address,
        name: m.name,
        expiry: m.expiry,
        tokens: {
          pt: m.pt,
          yt: m.yt,
          sy: m.sy
        }
      })));
      return markets;
    } else {
      console.log('Unexpected response format:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Failed to fetch markets:', error.message);
    if (error.response && error.response.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    return [];
  }
}

async function simulateApiCall(market) {
  try {
    const BASE_URL = 'https://api-v2.pendle.finance/core/v1';
    // Remove "1-" prefix from token address if present
    const marketAddress = market.address;
    const ptAddress = market.pt.startsWith('1-') ? market.pt.substring(2) : market.pt;
    const ETH_ADDRESS = '0x0000000000000000000000000000000000000000';
    // WETH address for API compatibility
    const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'; 
    const amountInWei = '1000000000000000000'; // 1 ETH
    const slippage = 1.0; // 100%
    
    const url = `${BASE_URL}/sdk/1/markets/${marketAddress}/swap`;
    const params = {
      tokenIn: WETH_ADDRESS, // Use WETH instead of ETH for API compatibility
      tokenOut: ptAddress,
      amountIn: amountInWei,
      slippage: slippage,
      receiver: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      enableAggregator: true
    };
    
    console.log('Making request with params:', JSON.stringify(params, null, 2));
    console.log(`Market: ${market.name}, Expiry: ${market.expiry}`);
    
    const response = await axios.get(url, {
      params,
      headers: {
        'Accept': 'application/json'
      },
      timeout: 30000
    });
    
    if (response.data && response.data.tx) {
      console.log('Received transaction data with slippage:', slippage);
      console.log('Transaction value:', response.data.tx.value);
      console.log('Transaction recipient:', response.data.tx.to);
      return true;
    } else {
      console.log('Full response:', JSON.stringify(response.data, null, 2));
      return false;
    }
  } catch (error) {
    console.error('API call failed:', error.message);
    if (error.response && error.response.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

async function main() {
  const markets = await getMarkets();
  if (markets.length > 0) {
    await simulateApiCall(markets[0]);
  }
}

main();