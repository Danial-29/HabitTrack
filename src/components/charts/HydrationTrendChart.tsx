interface HydrationTrendChartProps {
    data: {
        date: string
        dateLabel: string
        total: number
        percentage: number
    }[]
    dailyGoal: number
}

export default function HydrationTrendChart({ data, dailyGoal }: HydrationTrendChartProps) {
    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
                No data available
            </div>
        )
    }

    const chartHeight = 160
    const barWidth = data.length > 14 ? 8 : data.length > 7 ? 12 : 20
    const barGap = data.length > 14 ? 4 : data.length > 7 ? 6 : 10
    const chartWidth = data.length * (barWidth + barGap) + 60
    const padding = { top: 20, bottom: 35, left: 45, right: 15 }

    // Calculate max for scale (at least 100%, or highest percentage)
    const maxPercentage = Math.max(100, ...data.map(d => d.percentage))
    const maxMl = dailyGoal * (maxPercentage / 100)

    // Y-axis labels (ml values)
    const yLabels = [0, Math.round(maxMl / 2), Math.round(maxMl)]

    // Goal line position
    const goalY = padding.top + chartHeight - (100 / maxPercentage) * chartHeight

    return (
        <div className="w-full overflow-x-auto">
            <svg
                width={Math.max(chartWidth, 280)}
                height={chartHeight + padding.top + padding.bottom}
                className="font-display"
            >
                {/* Background grid lines */}
                {yLabels.map((ml, i) => {
                    const y = padding.top + chartHeight - (i / 2) * chartHeight
                    return (
                        <g key={ml}>
                            <line
                                x1={padding.left}
                                y1={y}
                                x2={chartWidth - padding.right}
                                y2={y}
                                className="stroke-white/5"
                                strokeDasharray="4,4"
                            />
                            <text
                                x={padding.left - 8}
                                y={y}
                                textAnchor="end"
                                className="fill-slate-500 text-[9px]"
                                dominantBaseline="middle"
                            >
                                {ml >= 1000 ? `${(ml / 1000).toFixed(1)}L` : `${ml}ml`}
                            </text>
                        </g>
                    )
                })}

                {/* Goal line */}
                <line
                    x1={padding.left}
                    y1={goalY}
                    x2={chartWidth - padding.right}
                    y2={goalY}
                    className="stroke-blue-400"
                    strokeWidth={1.5}
                    strokeDasharray="6,4"
                />
                <text
                    x={chartWidth - padding.right + 4}
                    y={goalY}
                    className="fill-blue-400 text-[8px] font-bold"
                    dominantBaseline="middle"
                >
                    GOAL
                </text>

                {/* Bars */}
                {data.map((entry, i) => {
                    const barHeight = (entry.percentage / maxPercentage) * chartHeight
                    const x = padding.left + 10 + i * (barWidth + barGap)
                    const y = padding.top + chartHeight - barHeight

                    // Color based on goal achievement
                    const isAtGoal = entry.percentage >= 100
                    const barClass = isAtGoal ? 'fill-blue-500' : 'fill-blue-500/50'

                    // Only show every nth label for crowded charts
                    const showLabel = data.length <= 7 || i % Math.ceil(data.length / 7) === 0

                    return (
                        <g key={entry.date}>
                            {/* Bar */}
                            <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={Math.max(barHeight, 2)}
                                rx={barWidth > 12 ? 4 : 2}
                                className={barClass}
                                style={isAtGoal ? {
                                    filter: 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.5))'
                                } : undefined}
                            />
                            {/* Day label */}
                            {showLabel && (
                                <text
                                    x={x + barWidth / 2}
                                    y={chartHeight + padding.top + 14}
                                    textAnchor="middle"
                                    className="fill-slate-400 text-[8px] font-medium"
                                >
                                    {data.length > 14 ? entry.dateLabel.split(' ')[0].charAt(0) : entry.dateLabel.split(' ')[0]}
                                </text>
                            )}
                        </g>
                    )
                })}
            </svg>
        </div>
    )
}
