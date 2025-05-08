import { useMemo } from 'react'

/**
 * Returns the first EVM (Ethereum-family) and Solana wallet addresses
 * found in `user.linkedAccounts`.
 *
 * @param user – The Privy user object
 */
export function useWalletAddresses(ready: boolean, authenticated: boolean, user?: { linkedAccounts?: any[] } | null) {
  const { evmAddress, solAddress } = useMemo(() => {
    if (!ready || !authenticated || !user) return { evmAddress: '', solAddress: '' }
    const evm = user?.linkedAccounts?.find(
      (acc) => acc.chainType === 'ethereum' && acc.address
    )
    const sol = user?.linkedAccounts?.find(
      (acc) => acc.chainType === 'solana' && acc.address
    )

    return {
      evmAddress: evm?.address ?? '',
      solAddress: sol?.address ?? ''
    }
  }, [user?.linkedAccounts, ready, authenticated])

  return { evmAddress, solAddress }
}
