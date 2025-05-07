"use client";

import { WalletBalanceResult } from '@/lib/utils/wallet';
import { useEffect, useState } from 'react';

export function useWalletBalances(walletAddress?: string) {
  const [balances, setBalances] = useState<WalletBalanceResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalances = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const url = walletAddress 
          ? `/api/wallet/balances?address=${encodeURIComponent(walletAddress)}`
          : '/api/wallet/balances';
          
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch wallet balances');
        }
        const data = await response.json();
        setBalances(data);
      } catch (err) {
        console.error('Error in useWalletBalances:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalances();
  }, [walletAddress]);

  const refetch = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const url = walletAddress 
        ? `/api/wallet/balances?address=${encodeURIComponent(walletAddress)}`
        : '/api/wallet/balances';
        
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch wallet balances');
      }
      const data = await response.json();
      setBalances(data);
    } catch (err) {
      console.error('Error in useWalletBalances:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return { balances, isLoading, error, refetch };
} 