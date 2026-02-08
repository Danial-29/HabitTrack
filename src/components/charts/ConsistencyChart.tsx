interface ConsistencyChartProps {
    data: {
        date: string
        lightsOut: string
        wakeUp: string
    }[]
}

export default function ConsistencyChart({ data }: ConsistencyChartProps) {
    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
                No data available
            </div>
        )
    }

    // Convert time to minutes, handling overnight sleep
    const timeToMinutes = (time: string, isWakeUp: boolean = false) => {
        const [h, m] = time.split(':').map(Number)
        let minutes = h * 60 + m
        // For sleep times after midnight (before 6 AM), or wake times
        if (isWakeUp && h < 12) {
            minutes += 24 * 60 // Next day
        } else if (!isWakeUp && h < 6) {
            minutes += 24 * 60 // Late night sleep
        }
        return minutes
    }

    // Calculate chart bounds (9 PM = 21:00 to 12 PM next day = 36:00 in extended format)
    const minTime = 20 * 60 // 8 PM
    const maxTime = 36 * 60 // 12 PM next day (noon)
    const timeRange = maxTime - minTime

    const chartHeight = 200
    const chartWidth = data.length * 40 + 40
    const barWidth = 24
    const padding = { top: 20, bottom: 30, left: 50, right: 20 }

    // Time labels for Y axis
    const timeLabels = ['8 PM', '10 PM', '12 AM', '2 AM', '4 AM', '6 AM', '8 AM', '10 AM', '12 PM']

    return (
        <div className="w-full overflow-x-auto">
            <svg
                width={Math.max(chartWidth, 300)}
                height={chartHeight + padding.top + padding.bottom}
                className="font-display"
            >
                {/* Y-Axis Labels */}
                {timeLabels.map((label, i) => {
                    const minutes = minTime + (i * 2 * 60) // Every 2 hours
                    const y = padding.top + ((minutes - minTime) / timeRange) * chartHeight
                    return (
                        <g key={label}>
                            <text
                                x={padding.left - 8}
                                y={y}
                                textAnchor="end"
                                className="fill-slate-500 text-[10px]"
                                dominantBaseline="middle"
                            >
                                {label}
                            </text>
                            <line
                                x1={padding.left}
                                y1={y}
                                x2={chartWidth - padding.right}
                                y2={y}
                                className="stroke-white/5"
                                strokeDasharray="4,4"
                            />
                        </g>
                    )
                })}

                {/* Bars */}
                {data.map((entry, i) => {
                    const sleepStart = timeToMinutes(entry.lightsOut)
                    const sleepEnd = timeToMinutes(entry.wakeUp, true)

                    const y1 = padding.top + ((sleepStart - minTime) / timeRange) * chartHeight
                    const y2 = padding.top + ((sleepEnd - minTime) / timeRange) * chartHeight
                    const x = padding.left + 20 + i * 40

                    // Format date for label
                    const date = new Date(entry.date)
                    const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)

                    return (
                        <g key={entry.date}>
                            {/* Floating bar */}
                            <rect
                                x={x - barWidth / 2}
                                y={y1}
                                width={barWidth}
                                height={Math.max(y2 - y1, 4)}
                                rx={4}
                                className="fill-purple-500/80"
                                style={{
                                    filter: 'drop-shadow(0 0 8px rgba(147, 51, 234, 0.4))'
                                }}
                            />
                            {/* Day label */}
                            <text
                                x={x}
                                y={chartHeight + padding.top + 16}
                                textAnchor="middle"
                                className="fill-slate-400 text-[10px] font-medium"
                            >
                                {dayLabel}
                            </text>
                        </g>
                    )
                })}
            </svg>
        </div>
    )
}
