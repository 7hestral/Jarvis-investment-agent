import { OpportunityCard } from './opportunity-card'

interface PendleOpportunitiesSectionProps {
  tool: any
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function PendleOpportunitiesSection({ 
  tool, 
  isOpen, 
  onOpenChange 
}: PendleOpportunitiesSectionProps) {
  const results = tool.result || []
  return (
    <div className="w-full">
      {results.length === 0 && <div>No opportunities found.</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map((opp: any, i: number) => (
          <OpportunityCard key={i} {...opp} />
        ))}
      </div>
    </div>
  )
}