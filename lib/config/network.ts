
export const SepoliaConfig = {
    name: 'Sepolia',
    chainId: 11155111,
    scanLink: 'sepolia.etherscan.io'
}

export const MainnetConfig = {
    name: 'Mainnet',
    chainId: 1,
    scanLink: 'etherscan.io'
}

export const NetworkConfig = process.env.NODE_ENV === 'production' ? MainnetConfig : SepoliaConfig;
