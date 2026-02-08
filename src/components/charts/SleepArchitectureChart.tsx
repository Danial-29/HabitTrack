interface SleepArchitectureChartProps {
    data: {
        date: string
        latency: number
        awakeDuration: number
        totalSleepTime: number
        totalTimeInBed: number
    }[]
}

export default function SleepArchitectureChart({ data }: SleepArchitectureChartProps) {
    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
                No data available
            </div>
        )
    }

    // Find max time for scaling
    const maxTime = Math.max(...data.map(d => d.totalTimeInBed), 480) // At least 8 hours

    const chartHeight = 180
    const barHeight = 20
    const barGap = 8
    const padding = { top: 20, bottom: 30, left: 10, right: 40 }
    const chartWidth = 280

    return (
        <div className="w-full">
            <svg
                width="100%"
                height={data.length * (barHeight + barGap) + padding.top + padding.bottom}
                viewBox={`0 0 ${chartWidth} ${data.length * (barHeight + barGap) + padding.top + padding.bottom}`}
                className="font-display"
                preserveAspectRatio="xMidYMid meet"
            >
                {/* Legend */}
                <g transform={`translate(${padding.left}, 8)`}>
                    <rect x={0} y={0} width={10} height={10} rx={2} className="fill-amber-500/80" />
                    <text x={14} y={8} className="fill-slate-400 text-[8px]">Latency</text>

                    <rect x={55} y={0} width={10} height={10} rx={2} className="fill-red-500/80" />
                    <text x={69} y={8} className="fill-slate-400 text-[8px]">Awake</text>

                    <rect x={100} y={0} width={10} height={10} rx={2} className="fill-purple-500/80" />
                    <text x={114} y={8} className="fill-slate-400 text-[8px]">Sleep</text>
                </g>

                {/* Bars */}
                {data.map((entry, i) => {
                    const y = padding.top + 10 + i * (barHeight + barGap)
                    const barMaxWidth = chartWidth - padding.left - padding.right - 30

                    const latencyWidth = (entry.latency / maxTime) * barMaxWidth
                    const awakeWidth = (entry.awakeDuration / maxTime) * barMaxWidth
                    const sleepWidth = (entry.totalSleepTime / maxTime) * barMaxWidth

                    // Format date
                    const date = new Date(entry.date)
                    const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' }).substring(0, 2)

                    return (
                        <g key={entry.date}>
                            {/* Day label */}
                            <text
                                x={padding.left}
                                y={y + barHeight / 2 + 4}
                                className="fill-slate-400 text-[10px] font-medium"
                            >
                                {dayLabel}
                            </text>

                            {/* Stacked bars */}
                            <g transform={`translate(${padding.left + 25}, ${y})`}>
                                {/* Latency (amber) */}
                                <rect
                                    x={0}
                                    y={0}
                                    width={Math.max(latencyWidth, 2)}
                                    height={barHeight}
                                    rx={4}
                                    className="fill-amber-500/80"
                                />
                                {/* Awake duration (red) */}
                                <rect
                                    x={latencyWidth}
                                    y={0}
                                    width={Math.max(awakeWidth, 0)}
                                    height={barHeight}
                                    className="fill-red-500/80"
                                />
                                {/* Sleep time (purple) */}
                                <rect
                                    x={latencyWidth + awakeWidth}
                                    y={0}
                                    width={Math.max(sleepWidth, 2)}
                                    height={barHeight}
                                    rx={entry.awakeDuration === 0 && entry.latency === 0 ? 4 : 0}
                                    style={{ borderTopRightRadius: 4, borderBottomRightRadius: 4 }}
                                    className="fill-purple-500/80"
                                />
                            </g>

                            {/* Duration label */}
                            <text
                                x={chartWidth - padding.right + 5}
                                y={y + barHeight / 2 + 4}
                                className="fill-slate-300 text-[9px] font-semibold"
                            >
                                {Math.floor(entry.totalTimeInBed / 60)}h
                            </text>
                        </g>
                    )
                })}
            </svg>
        </div>
    )
}
