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

    // Dynamic axis ranges based on actual data
    const durations = data.map(d => d.durationHours)
    const rawMinDuration = Math.min(...durations)
    const rawMaxDuration = Math.max(...durations)
    // Add padding and round to nice numbers
    const minDuration = Math.max(0, Math.floor(rawMinDuration) - 1)
    const maxDuration = Math.ceil(rawMaxDuration) + 1
    const minQuality = 1
    const maxQuality = 10

    // Generate grid line values for X-axis (every hour)
    const xGridLines: number[] = []
    for (let h = Math.ceil(minDuration); h <= Math.floor(maxDuration); h++) {
        xGridLines.push(h)
    }

    // Generate X-axis labels (pick ~3-5 evenly spaced labels)
    const xLabels = xGridLines.filter((_, i) => {
        if (xGridLines.length <= 5) return true
        // Show every 2nd label if many
        return i % 2 === 0 || i === xGridLines.length - 1
    })

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
                {xGridLines.map(h => {
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
                {xLabels.map(h => {
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

            {/* Data Summary */}
            {data.length >= 2 && (() => {
                // Overall stats
                const avgDuration = data.reduce((s, d) => s + d.durationHours, 0) / data.length
                const avgQuality = data.reduce((s, d) => s + d.quality, 0) / data.length

                // Find sweet spot: bucket durations by hour and find highest avg quality
                const buckets = new Map<number, number[]>()
                data.forEach(d => {
                    const bucket = Math.floor(d.durationHours)
                    if (!buckets.has(bucket)) buckets.set(bucket, [])
                    buckets.get(bucket)!.push(d.quality)
                })

                let bestBucket = { hour: 0, avg: 0, count: 0 }
                buckets.forEach((qualities, hour) => {
                    const avg = qualities.reduce((a, b) => a + b, 0) / qualities.length
                    if (qualities.length >= 2 && avg > bestBucket.avg) {
                        bestBucket = { hour, avg, count: qualities.length }
                    }
                })

                // Simple correlation: compare avg quality of above-avg vs below-avg duration
                const aboveAvg = data.filter(d => d.durationHours >= avgDuration)
                const belowAvg = data.filter(d => d.durationHours < avgDuration)
                const aboveAvgQuality = aboveAvg.length > 0 ? aboveAvg.reduce((s, d) => s + d.quality, 0) / aboveAvg.length : 0
                const belowAvgQuality = belowAvg.length > 0 ? belowAvg.reduce((s, d) => s + d.quality, 0) / belowAvg.length : 0
                const qualityDiff = aboveAvgQuality - belowAvgQuality

                let correlationText = ''
                let correlationColor = 'text-slate-400'
                if (Math.abs(qualityDiff) < 0.5) {
                    correlationText = 'Duration doesn\'t strongly affect your quality'
                    correlationColor = 'text-slate-400'
                } else if (qualityDiff > 0) {
                    correlationText = 'More sleep tends to improve your quality'
                    correlationColor = 'text-green-400'
                } else {
                    correlationText = 'Sleeping longer doesn\'t always mean better quality'
                    correlationColor = 'text-amber-400'
                }

                // Best & worst nights
                const sorted = [...data].sort((a, b) => b.quality - a.quality)
                const best = sorted[0]
                const worst = sorted[sorted.length - 1]

                return (
                    <div className="mt-4 space-y-3">
                        {/* Insight callout */}
                        <div className="px-3 py-2.5 rounded-xl bg-blue-500/5 border border-blue-500/10">
                            <p className={`text-[11px] font-medium ${correlationColor}`}>
                                💡 {correlationText}
                            </p>
                        </div>

                        {/* Stats row */}
                        <div className="grid grid-cols-3 gap-2">
                            <div className="bg-white/[0.03] rounded-lg p-2 text-center">
                                <p className="text-slate-500 text-[9px] uppercase font-bold tracking-wider mb-0.5">Avg Duration</p>
                                <span className="text-white text-sm font-bold">{avgDuration.toFixed(1)}h</span>
                            </div>
                            <div className="bg-white/[0.03] rounded-lg p-2 text-center">
                                <p className="text-slate-500 text-[9px] uppercase font-bold tracking-wider mb-0.5">Avg Quality</p>
                                <span className={`text-sm font-bold ${avgQuality >= 7 ? 'text-green-400' : avgQuality >= 5 ? 'text-amber-400' : 'text-red-400'}`}>{avgQuality.toFixed(1)}/10</span>
                            </div>
                            <div className="bg-white/[0.03] rounded-lg p-2 text-center">
                                <p className="text-slate-500 text-[9px] uppercase font-bold tracking-wider mb-0.5">Nights</p>
                                <span className="text-white text-sm font-bold">{data.length}</span>
                            </div>
                        </div>

                        {/* Sweet spot */}
                        {bestBucket.count >= 2 && (
                            <div className="px-3 py-2 rounded-lg bg-green-500/5 border border-green-500/10 flex items-center gap-2">
                                <span className="text-[10px]">⭐</span>
                                <span className="text-green-400/80 text-[11px] font-medium">
                                    Sweet spot: <span className="font-bold">{bestBucket.hour}–{bestBucket.hour + 1}h</span> sleep — avg quality {bestBucket.avg.toFixed(1)}/10
                                </span>
                            </div>
                        )}

                        {/* Best & worst */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-white/[0.03] rounded-lg p-2.5">
                                <p className="text-slate-500 text-[9px] uppercase font-bold tracking-wider mb-1">Best Night</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 text-[10px]">{best.durationHours.toFixed(1)}h</span>
                                    <span className="text-green-400 text-sm font-bold">{best.quality}/10</span>
                                </div>
                                <p className="text-slate-600 text-[9px] mt-0.5">{new Date(best.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                            </div>
                            <div className="bg-white/[0.03] rounded-lg p-2.5">
                                <p className="text-slate-500 text-[9px] uppercase font-bold tracking-wider mb-1">Worst Night</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 text-[10px]">{worst.durationHours.toFixed(1)}h</span>
                                    <span className="text-red-400 text-sm font-bold">{worst.quality}/10</span>
                                </div>
                                <p className="text-slate-600 text-[9px] mt-0.5">{new Date(worst.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                            </div>
                        </div>
                    </div>
                )
            })()}
        </div>
    )
}
