import { ethers } from "ethers";

// ERC20 standard interface
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function decimals() view returns (uint8)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

// Known token addresses on your local forked mainnet
// You can expand this list as needed
const KNOWN_TOKENS = [
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
  "0xe08c45f3cfe70f4e03668dc6e84af842bee95a68", // PT
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
  "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
  // Add more tokens as you discover them
];

// Token data interface
export interface TokenData {
  symbol: string;
  balance: string;
  name: string;
  address: string;
}

export interface WalletBalanceResult {
  tokens: TokenData[];
}

// Helper function to get token data including balance
async function getTokenData(tokenAddress: string, walletAddress: string, provider: ethers.JsonRpcProvider): Promise<TokenData | null> {
  try {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    
    // Get token info and balance in parallel
    const [balance, symbol, name, decimals] = await Promise.all([
      tokenContract.balanceOf(walletAddress),
      tokenContract.symbol().catch(() => "UNKNOWN"),
      tokenContract.name().catch(() => "Unknown Token"),
      tokenContract.decimals().catch(() => 18)
    ]);
    
    // Only return tokens with positive balance
    if (balance > 0) {
      const formattedBalance = ethers.formatUnits(balance, decimals);
      return {
        address: tokenAddress,
        symbol,
        name,
        balance: formattedBalance
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching data for token ${tokenAddress}:`, error);
    return null;
  }
}

// Function to discover tokens by scanning transfer events
async function discoverTokens(walletAddress: string, provider: ethers.JsonRpcProvider): Promise<string[]> {
  try {
    // Get the current block
    const currentBlock = await provider.getBlockNumber();
    
    // We'll scan the last 10000 blocks or fewer if we're not that far in
    const lookbackBlocks = Math.min(10000, currentBlock);
    const fromBlock = currentBlock - lookbackBlocks;
    
    // Create a filter for all ERC20 Transfer events to or from our address
    const filter = {
      topics: [
        ethers.id("Transfer(address,address,uint256)"),
        null,
        ethers.zeroPadValue(walletAddress, 32)
      ],
      fromBlock,
      toBlock: currentBlock
    };
    
    // Alternative filter for transfers FROM our address
    const filterFrom = {
      topics: [
        ethers.id("Transfer(address,address,uint256)"),
        ethers.zeroPadValue(walletAddress, 32)
      ],
      fromBlock,
      toBlock: currentBlock
    };
    
    // Get all logs matching our filters
    const logs = await provider.getLogs(filter);
    const logsFrom = await provider.getLogs(filterFrom);
    
    // Combine and deduplicate the token addresses
    const tokenAddresses = new Set();
    
    [...logs, ...logsFrom].forEach(log => {
      tokenAddresses.add(log.address.toLowerCase());
    });
    
    return Array.from(tokenAddresses) as string[];
  } catch (error) {
    console.error("Error scanning for token transfers:", error);
    // If scanning fails (e.g., due to RPC limitations), return empty array
    return [];
  }
}

// Main function to get all token balances
export async function getWalletBalances(
  walletAddressParam?: string,
  rpcUrl: string = "http://localhost:8545"
): Promise<WalletBalanceResult> {
  // Use provided wallet address, environment variable, or default to the sample address
  const walletAddress = walletAddressParam || 
                        (typeof window === 'undefined' ? process.env.WALLET_ADDRESS : undefined) || 
                        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  
  try {
    // Get ETH balance
    const ethBalance = await provider.getBalance(walletAddress);
    const formattedEthBalance = ethers.formatEther(ethBalance);
    
    // Start with our known tokens
    let tokenAddresses = new Set(KNOWN_TOKENS.map(addr => addr.toLowerCase()));
    
    // Try to discover additional tokens
    try {
      const discoveredTokens = await discoverTokens(walletAddress, provider);
      discoveredTokens.forEach(addr => tokenAddresses.add(addr));
    } catch (error) {
      console.error("Token discovery failed, using only known tokens");
    }
    
    // Get data for all tokens in parallel
    const tokenDataPromises = Array.from(tokenAddresses).map(addr => 
      getTokenData(addr, walletAddress, provider)
    );
    const tokenDataResults = await Promise.all(tokenDataPromises);
    
    // Filter out null results (tokens with zero balance or errors)
    const tokenData = tokenDataResults.filter(data => data !== null) as TokenData[];
    
    // Sort by balance value (descending)
    tokenData.sort((a, b) => {
      // Simple string comparison for sorting (not perfect but works for most cases)
      return parseFloat(b.balance) - parseFloat(a.balance);
    });
    
    // Add ETH to the tokens array
    const formattedTokens: TokenData[] = [
      {
        symbol: "ETH",
        balance: formattedEthBalance,
        name: "Ethereum",
        address: "0x0000000000000000000000000000000000000000" // Zero address for ETH
      },
      ...tokenData
    ];
    
    // Create the final result object
    return {
      tokens: formattedTokens
    };
  } catch (error) {
    console.error("Error fetching wallet balances:", error);
    throw error;
  }
} 