import { OpportunityCard } from './opportunity-card'

interface PendleOpportunitiesSectionProps {
  tool: any
}

export function PendleOpportunitiesSection({ tool }: PendleOpportunitiesSectionProps) {
  const results = tool.result || []
  return (
    <div className="flex flex-col items-center gap-6">
      {results.length === 0 && <div>No opportunities found.</div>}
      {results.map((opp: any, i: number) => (
        <OpportunityCard key={i} {...opp} />
      ))}
    </div>
  )
} 