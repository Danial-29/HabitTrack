interface QualityVsDurationChartProps {
    data: {
        date: string
        durationHours: number
        quality: number
    }[]
}

export default function QualityVsDurationChart({ data }: QualityVsDurationChartProps) {
    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
                No data available
            </div>
        )
    }

    const chartWidth = 280
    const chartHeight = 180
    const padding = { top: 20, bottom: 30, left: 35, right: 20 }
    const plotWidth = chartWidth - padding.left - padding.right
    const plotHeight = chartHeight - padding.top - padding.bottom

    // Axis ranges
    const minDuration = 4
    const maxDuration = 10
    const minQuality = 1
    const maxQuality = 10

    // Convert data to coordinates
    const points = data.map(d => ({
        x: padding.left + ((d.durationHours - minDuration) / (maxDuration - minDuration)) * plotWidth,
        y: padding.top + plotHeight - ((d.quality - minQuality) / (maxQuality - minQuality)) * plotHeight,
        date: d.date,
        duration: d.durationHours,
        quality: d.quality
    }))

    return (
        <div className="w-full">
            <svg
                width="100%"
                height={chartHeight}
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="font-display"
                preserveAspectRatio="xMidYMid meet"
            >
                {/* Grid lines */}
                {[4, 5, 6, 7, 8, 9, 10].map(h => {
                    const x = padding.left + ((h - minDuration) / (maxDuration - minDuration)) * plotWidth
                    return (
                        <line
                            key={`v-${h}`}
                            x1={x}
                            y1={padding.top}
                            x2={x}
                            y2={chartHeight - padding.bottom}
                            className="stroke-white/5"
                        />
                    )
                })}
                {[2, 4, 6, 8, 10].map(q => {
                    const y = padding.top + plotHeight - ((q - minQuality) / (maxQuality - minQuality)) * plotHeight
                    return (
                        <line
                            key={`h-${q}`}
                            x1={padding.left}
                            y1={y}
                            x2={chartWidth - padding.right}
                            y2={y}
                            className="stroke-white/5"
                        />
                    )
                })}

                {/* Axes */}
                <line
                    x1={padding.left}
                    y1={chartHeight - padding.bottom}
                    x2={chartWidth - padding.right}
                    y2={chartHeight - padding.bottom}
                    className="stroke-slate-600"
                />
                <line
                    x1={padding.left}
                    y1={padding.top}
                    x2={padding.left}
                    y2={chartHeight - padding.bottom}
                    className="stroke-slate-600"
                />

                {/* X-axis labels */}
                {[5, 7, 9].map(h => {
                    const x = padding.left + ((h - minDuration) / (maxDuration - minDuration)) * plotWidth
                    return (
                        <text
                            key={`xl-${h}`}
                            x={x}
                            y={chartHeight - 10}
                            textAnchor="middle"
                            className="fill-slate-500 text-[9px]"
                        >
                            {h}h
                        </text>
                    )
                })}

                {/* Y-axis labels */}
                {[2, 5, 8].map(q => {
                    const y = padding.top + plotHeight - ((q - minQuality) / (maxQuality - minQuality)) * plotHeight
                    return (
                        <text
                            key={`yl-${q}`}
                            x={padding.left - 8}
                            y={y + 3}
                            textAnchor="end"
                            className="fill-slate-500 text-[9px]"
                        >
                            {q}
                        </text>
                    )
                })}

                {/* Axis titles */}
                <text
                    x={chartWidth / 2}
                    y={chartHeight - 2}
                    textAnchor="middle"
                    className="fill-slate-400 text-[8px]"
                >
                    Duration (hours)
                </text>
                <text
                    x={8}
                    y={chartHeight / 2}
                    textAnchor="middle"
                    className="fill-slate-400 text-[8px]"
                    transform={`rotate(-90, 8, ${chartHeight / 2})`}
                >
                    Quality
                </text>

                {/* Data points */}
                {points.map((point, i) => (
                    <circle
                        key={i}
                        cx={point.x}
                        cy={point.y}
                        r={6}
                        className="fill-blue-400/80"
                        style={{
                            filter: 'drop-shadow(0 0 4px rgba(96, 165, 250, 0.5))'
                        }}
                    />
                ))}
            </svg>
        </div>
    )
}
