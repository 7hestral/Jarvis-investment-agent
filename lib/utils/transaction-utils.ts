import { TransactionStep } from '@/components/transaction-status'
import { v4 as uuidv4 } from 'uuid'

/**
 * Utility function to create a new step in the transaction flow
 * This function can be used on both client and server
 */
export function createTransactionStep(
  message: string, 
  status: TransactionStep['status'] = 'pending', 
  details?: string
): TransactionStep {
  return {
    id: uuidv4(),
    message,
    status,
    timestamp: Date.now(),
    details
  }
}