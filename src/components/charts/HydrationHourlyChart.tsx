interface HydrationHourlyChartProps {
    data: {
        hourlyTotals: number[]
        hourlyCounts: number[]
        peakHour: number
        periods: {
            morning: number
            afternoon: number
            evening: number
            night: number
        }
    }
}

export default function HydrationHourlyChart({ data }: HydrationHourlyChartProps) {
    const { hourlyTotals, peakHour } = data

    // Check if there's any data
    const totalAmount = hourlyTotals.reduce((a, b) => a + b, 0)
    if (totalAmount === 0) {
        return (
            <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
                No data available
            </div>
        )
    }

    // Find max for scaling
    const maxHourly = Math.max(...hourlyTotals)

    // Group hours into 6-hour blocks for cleaner display
    const blocks = [
        { label: 'Night', range: '12am-6am', hours: [0, 1, 2, 3, 4, 5], color: 'bg-slate-600' },
        { label: 'Morning', range: '6am-12pm', hours: [6, 7, 8, 9, 10, 11], color: 'bg-blue-500' },
        { label: 'Afternoon', range: '12pm-6pm', hours: [12, 13, 14, 15, 16, 17], color: 'bg-blue-400' },
        { label: 'Evening', range: '6pm-12am', hours: [18, 19, 20, 21, 22, 23], color: 'bg-blue-600' },
    ]

    // Calculate block totals
    const blockData = blocks.map(block => ({
        ...block,
        total: block.hours.reduce((sum, h) => sum + hourlyTotals[h], 0),
        percentage: block.hours.reduce((sum, h) => sum + hourlyTotals[h], 0) / totalAmount * 100
    }))

    // Format peak hour
    const formatHour = (h: number) => {
        if (h === 0) return '12am'
        if (h === 12) return '12pm'
        return h > 12 ? `${h - 12}pm` : `${h}am`
    }

    return (
        <div className="space-y-4">
            {/* Period breakdown bars */}
            <div className="space-y-2.5">
                {blockData.map((block) => (
                    <div key={block.label} className="flex items-center gap-3">
                        <div className="w-20 text-right">
                            <span className="text-xs text-slate-300 font-medium">{block.label}</span>
                        </div>
                        <div className="flex-1 h-6 bg-white/5 rounded-lg overflow-hidden relative">
                            <div
                                className={`h-full rounded-lg transition-all duration-500 ${block.color}`}
                                style={{
                                    width: `${Math.max(block.percentage, 2)}%`,
                                    boxShadow: block.percentage > 0 ? '0 0 10px rgba(59, 130, 246, 0.3)' : undefined
                                }}
                            />
                            {block.percentage > 15 && (
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/80">
                                    {Math.round(block.percentage)}%
                                </span>
                            )}
                        </div>
                        <div className="w-14 text-right">
                            <span className="text-[10px] text-slate-500">{block.range}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Peak hour indicator */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <svg className="size-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400">Peak Hydration Hour</p>
                        <p className="text-sm font-bold text-white">{formatHour(peakHour)}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-slate-400">Amount</p>
                    <p className="text-sm font-bold text-blue-400">{maxHourly >= 1000 ? `${(maxHourly / 1000).toFixed(1)}L` : `${maxHourly}ml`}</p>
                </div>
            </div>
        </div>
    )
}
