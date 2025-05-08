// Array of welcome messages to display
const welcomeMessages = [
  'Which yield opportunity should we open first with your crypto wallet?',
  "Let's maximize your crypto potential",
  'Your crypto wallet is the key; which opportunity should we open first?',
  'Your crypto, amplified'
]

// Get a message by index or seed
export const getWelcomeMessage = (indexOrSeed?: number): string => {
  if (indexOrSeed === undefined) {
    return welcomeMessages[0]
  }

  // Use modulo to ensure the index is within bounds
  const index =
    typeof indexOrSeed === 'number'
      ? Math.abs(indexOrSeed) % welcomeMessages.length
      : 0

  return welcomeMessages[index]
}

// Get all available messages
export const getAllWelcomeMessages = (): string[] => {
  return [...welcomeMessages]
}

interface WelcomeMessageProps {
  className?: string
  // Optional seed or index to deterministically select a message
  seed?: number
  // Optional specific message index to display
  messageIndex?: number
}

export function WelcomeMessage({
  className,
  seed,
  messageIndex
}: WelcomeMessageProps) {
  // If messageIndex is provided, use it directly
  // Otherwise use the seed if provided
  const index = messageIndex !== undefined ? messageIndex : seed
  const message = getWelcomeMessage(index)

  return (
    <p className={`text-center text-3xl font-semibold ${className}`}>
      {message}
    </p>
  )
}
