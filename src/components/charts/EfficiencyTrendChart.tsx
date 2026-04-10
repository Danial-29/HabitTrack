interface EfficiencyTrendChartProps {
    data: {
        date: string
        efficiency: number | null
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

    // Convert to coordinates, separating logged vs missing
    const points = data.map((d, i) => ({
        x: padding.left + (i / Math.max(data.length - 1, 1)) * plotWidth,
        y: d.efficiency !== null
            ? padding.top + plotHeight - ((Math.min(Math.max(d.efficiency, minEff), maxEff) - minEff) / (maxEff - minEff)) * plotHeight
            : null,
        efficiency: d.efficiency,
        date: d.date,
        missing: d.efficiency === null
    }))

    // Build line segments that break at gaps (connect consecutive non-null points)
    const lineSegments: string[] = []
    let currentSegment = ''

    points.forEach((p) => {
        if (p.y !== null) {
            if (currentSegment === '') {
                currentSegment = `M ${p.x} ${p.y}`
            } else {
                currentSegment += ` L ${p.x} ${p.y}`
            }
        } else {
            if (currentSegment !== '') {
                lineSegments.push(currentSegment)
                currentSegment = ''
            }
        }
    })
    if (currentSegment !== '') {
        lineSegments.push(currentSegment)
    }

    // Build area fill paths for each segment
    const areaSegments: string[] = lineSegments.map(segment => {
        // Extract the x coordinates from the path to close the area
        const coords = segment.replace(/[ML]/g, '').trim().split(/\s+/).map(Number)
        if (coords.length < 4) return '' // Need at least 2 points
        const firstX = coords[0]
        const lastX = coords[coords.length - 2]
        const bottomY = chartHeight - padding.bottom
        return `${segment} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`
    }).filter(Boolean)

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

                {/* Area fills (one per connected segment) */}
                {areaSegments.map((areaPath, i) => (
                    <path
                        key={`area-${i}`}
                        d={areaPath}
                        fill="url(#efficiencyGradient)"
                    />
                ))}

                {/* Lines (one per connected segment — breaks at gaps) */}
                {lineSegments.map((linePath, i) => (
                    <path
                        key={`line-${i}`}
                        d={linePath}
                        fill="none"
                        className="stroke-green-500"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                ))}

                {/* Data points and gap markers */}
                {points.map((point, i) => {
                    if (point.missing) {
                        // Show a small × marker for missing days
                        const gapY = padding.top + plotHeight / 2
                        return (
                            <text
                                key={i}
                                x={point.x}
                                y={gapY + 1}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="fill-slate-600 text-[8px] font-bold"
                            >
                                ×
                            </text>
                        )
                    }

                    return (
                        <circle
                            key={i}
                            cx={point.x}
                            cy={point.y!}
                            r={4}
                            className={point.efficiency! >= 85 ? 'fill-green-500' : 'fill-amber-500'}
                            style={{
                                filter: point.efficiency! >= 85
                                    ? 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.6))'
                                    : 'drop-shadow(0 0 4px rgba(245, 158, 11, 0.6))'
                            }}
                        />
                    )
                })}
            </svg>
        </div>
    )
}
