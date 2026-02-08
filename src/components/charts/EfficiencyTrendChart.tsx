interface EfficiencyTrendChartProps {
    data: {
        date: string
        efficiency: number
    }[]
}

export default function EfficiencyTrendChart({ data }: EfficiencyTrendChartProps) {
    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-24 text-slate-500 text-sm">
                No data available
            </div>
        )
    }

    const chartWidth = 280
    const chartHeight = 100
    const padding = { top: 15, bottom: 20, left: 30, right: 10 }
    const plotWidth = chartWidth - padding.left - padding.right
    const plotHeight = chartHeight - padding.top - padding.bottom

    // Y-axis range (efficiency percentage)
    const minEff = 60
    const maxEff = 100

    // Convert to coordinates
    const points = data.map((d, i) => ({
        x: padding.left + (i / Math.max(data.length - 1, 1)) * plotWidth,
        y: padding.top + plotHeight - ((Math.min(Math.max(d.efficiency, minEff), maxEff) - minEff) / (maxEff - minEff)) * plotHeight,
        efficiency: d.efficiency,
        date: d.date
    }))

    // Create path for line
    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

    // Create path for gradient fill
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight - padding.bottom} L ${padding.left} ${chartHeight - padding.bottom} Z`

    // 85% threshold line position
    const thresholdY = padding.top + plotHeight - ((85 - minEff) / (maxEff - minEff)) * plotHeight

    return (
        <div className="w-full">
            <svg
                width="100%"
                height={chartHeight}
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="font-display"
                preserveAspectRatio="xMidYMid meet"
            >
                <defs>
                    <linearGradient id="efficiencyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(34, 197, 94, 0.4)" />
                        <stop offset="100%" stopColor="rgba(34, 197, 94, 0)" />
                    </linearGradient>
                </defs>

                {/* 85% threshold line */}
                <line
                    x1={padding.left}
                    y1={thresholdY}
                    x2={chartWidth - padding.right}
                    y2={thresholdY}
                    className="stroke-green-500/50"
                    strokeDasharray="4,4"
                />
                <text
                    x={chartWidth - padding.right + 2}
                    y={thresholdY + 3}
                    className="fill-green-500 text-[8px]"
                >
                    85%
                </text>

                {/* Y-axis labels */}
                {[70, 85, 100].map(eff => {
                    const y = padding.top + plotHeight - ((eff - minEff) / (maxEff - minEff)) * plotHeight
                    return (
                        <text
                            key={eff}
                            x={padding.left - 5}
                            y={y + 3}
                            textAnchor="end"
                            className="fill-slate-500 text-[8px]"
                        >
                            {eff}%
                        </text>
                    )
                })}

                {/* Area fill */}
                <path
                    d={areaPath}
                    fill="url(#efficiencyGradient)"
                />

                {/* Line */}
                <path
                    d={linePath}
                    fill="none"
                    className="stroke-green-500"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Data points */}
                {points.map((point, i) => (
                    <circle
                        key={i}
                        cx={point.x}
                        cy={point.y}
                        r={4}
                        className={point.efficiency >= 85 ? 'fill-green-500' : 'fill-amber-500'}
                        style={{
                            filter: point.efficiency >= 85
                                ? 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.6))'
                                : 'drop-shadow(0 0 4px rgba(245, 158, 11, 0.6))'
                        }}
                    />
                ))}
            </svg>
        </div>
    )
}
