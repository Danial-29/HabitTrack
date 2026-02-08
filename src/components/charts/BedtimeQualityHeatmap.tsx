interface BedtimeQualityHeatmapProps {
    data: {
        date: string
        lightsOut: string
        quality: number
    }[]
}

export default function BedtimeQualityHeatmap({ data }: BedtimeQualityHeatmapProps) {
    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-32 text-slate-500 text-sm">
                No data available
            </div>
        )
    }

    // Group data by bedtime hour buckets
    const buckets: { [hour: string]: number[] } = {}
    const timeLabels = ['8 PM', '9 PM', '10 PM', '11 PM', '12 AM', '1 AM', '2 AM']

    // Initialize buckets
    timeLabels.forEach(label => {
        buckets[label] = []
    })

    // Categorize each data point
    data.forEach(d => {
        const [h] = d.lightsOut.split(':').map(Number)
        let bucketIndex = -1

        if (h >= 20) {
            bucketIndex = h - 20 // 20->0, 21->1, 22->2, 23->3
        } else if (h <= 2) {
            bucketIndex = h + 4 // 0->4, 1->5, 2->6
        }

        if (bucketIndex >= 0 && bucketIndex < timeLabels.length) {
            buckets[timeLabels[bucketIndex]].push(d.quality)
        }
    })

    // Calculate average quality for each bucket
    const bucketAverages = timeLabels.map(label => {
        const qualities = buckets[label]
        if (qualities.length === 0) return null
        return qualities.reduce((a, b) => a + b, 0) / qualities.length
    })

    // Color scale: 1-4 = red, 5-6 = amber, 7-8 = green, 9-10 = bright green
    const getColor = (avg: number | null) => {
        if (avg === null) return 'bg-white/5'
        if (avg >= 8) return 'bg-green-500'
        if (avg >= 6) return 'bg-green-500/60'
        if (avg >= 5) return 'bg-amber-500/60'
        if (avg >= 3) return 'bg-red-500/60'
        return 'bg-red-500'
    }

    const getGlow = (avg: number | null) => {
        if (avg === null) return ''
        if (avg >= 8) return 'shadow-[0_0_10px_rgba(34,197,94,0.5)]'
        if (avg >= 6) return 'shadow-[0_0_8px_rgba(34,197,94,0.3)]'
        return ''
    }

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-slate-500 text-[9px] uppercase tracking-wider font-bold">Bedtime</span>
                <span className="text-slate-500 text-[9px] uppercase tracking-wider font-bold">Avg Quality</span>
            </div>

            {/* Heatmap rows */}
            <div className="flex flex-col gap-2">
                {timeLabels.map((label, i) => {
                    const avg = bucketAverages[i]


                    return (
                        <div key={label} className="flex items-center gap-3">
                            <span className="text-slate-400 text-xs w-12 font-medium">{label}</span>
                            <div className="flex-1 h-6 rounded-md overflow-hidden bg-slate-800/50 relative">
                                {avg !== null ? (
                                    <div
                                        className={`h-full ${getColor(avg)} ${getGlow(avg)} transition-all duration-300`}
                                        style={{ width: `${(avg / 10) * 100}%` }}
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-[10px]">
                                        —
                                    </div>
                                )}
                            </div>
                            <span className={`text-xs font-bold w-8 text-right ${avg === null ? 'text-slate-600' :
                                avg >= 7 ? 'text-green-400' :
                                    avg >= 5 ? 'text-amber-400' : 'text-red-400'
                                }`}>
                                {avg !== null ? avg.toFixed(1) : '—'}
                            </span>
                        </div>
                    )
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-4 text-[9px] text-slate-500">
                <div className="flex items-center gap-1">
                    <div className="size-2 rounded-sm bg-red-500/60"></div>
                    <span>Poor</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="size-2 rounded-sm bg-amber-500/60"></div>
                    <span>Fair</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="size-2 rounded-sm bg-green-500/60"></div>
                    <span>Good</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="size-2 rounded-sm bg-green-500"></div>
                    <span>Great</span>
                </div>
            </div>
        </div>
    )
}
