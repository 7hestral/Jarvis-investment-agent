import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  Globe2,
  Link,
  Youtube,
  type LucideIcon
} from 'lucide-react'

const exampleMessages: {
  heading: string
  message: string
  icon: LucideIcon
  iconAriaLabel: string
}[] = [
  {
    heading: "Explore yield opportunities on Pendle",
    message: "List the yielding opportunities on Pendle",
    icon: Globe2,
    iconAriaLabel: 'Web search'
  },
  {
    heading: 'Explain how airdrop works',
    message: 'Explain the purpose of airdrop and common ways of participating',
    icon: Globe2,
    iconAriaLabel: 'Web search'
  },
  {
    heading: 'Find videos explaining Pendle protocol',
    message: 'Find videos explaining how Pendle protocol work',
    icon: Youtube,
    iconAriaLabel: 'Video search'
  },
  {
    heading: 'Summary: https://docs.pendle.finance/ProtocolMechanics/Glossary',
    message: 'Summary: https://docs.pendle.finance/ProtocolMechanics/Glossary',
    icon: Link,
    iconAriaLabel: 'Summarize link'
  }
]
export function EmptyScreen({
  submitMessage,
  className
}: {
  submitMessage: (message: string) => void
  className?: string
}) {
  return (
    <div className={`mx-auto w-full transition-all ${className}`}>
      <div className="bg-background p-2">
        <div className="mt-2 flex flex-col items-start space-y-2 mb-4">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              name={message.message}
              onClick={async () => {
                submitMessage(message.message)
              }}
            >
              <ArrowRight size={16} className="mr-2 text-muted-foreground" />
              <message.icon
                size={16}
                className="mr-2 text-muted-foreground"
                aria-label={message.iconAriaLabel}
              />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
