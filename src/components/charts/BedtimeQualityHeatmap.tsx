import { useState } from 'react'

interface BedtimeQualityHeatmapProps {
    data: {
        date: string
        lightsOut: string
        wakeUp: string
        quality: number
        totalSleepTime: number
    }[]
}

export default function BedtimeQualityHeatmap({ data }: BedtimeQualityHeatmapProps) {
    const [selectedBucket, setSelectedBucket] = useState<string | null>(null)

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-32 text-slate-500 text-sm">
                No data available
            </div>
        )
    }

    // Format hour to label (e.g., 22 -> "10 PM", 0 -> "12 AM")
    const hourToLabel = (h: number) => {
        const normalized = ((h % 24) + 24) % 24
        const period = normalized >= 12 ? 'PM' : 'AM'
        const display = normalized > 12 ? normalized - 12 : normalized === 0 ? 12 : normalized
        return `${display} ${period}`
    }

    // Build buckets dynamically from actual data
    const bucketMap = new Map<number, { qualities: number[], durations: number[], entries: typeof data }>()

    data.forEach(d => {
        const [h] = d.lightsOut.split(':').map(Number)
        if (!bucketMap.has(h)) {
            bucketMap.set(h, { qualities: [], durations: [], entries: [] })
        }
        const bucket = bucketMap.get(h)!
        bucket.qualities.push(d.quality)
        bucket.durations.push(d.totalSleepTime)
        bucket.entries.push(d)
    })

    // Sort buckets by hour (evening hours first, then early morning)
    const sortedHours = [...bucketMap.keys()].sort((a, b) => {
        // Normalize: hours < 12 are "next day" (add 24 for sorting)
        const normA = a < 12 ? a + 24 : a
        const normB = b < 12 ? b + 24 : b
        return normA - normB
    })

    // Build display data
    const displayBuckets = sortedHours.map(hour => {
        const bucket = bucketMap.get(hour)!
        const avg = bucket.qualities.reduce((a, b) => a + b, 0) / bucket.qualities.length
        const avgDuration = bucket.durations.reduce((a, b) => a + b, 0) / bucket.durations.length
        const label = hourToLabel(hour)
        return {
            hour,
            label,
            rawAvg: avg,
            avg, // will be overwritten with adjusted avg below
            avgDuration,
            count: bucket.qualities.length,
            entries: bucket.entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        }
    })

    // Bayesian adjustment: blend each bucket's average toward the global mean
    // based on sample size. This prevents buckets with few entries from
    // unfairly ranking higher than ones with many entries.
    const globalAvg = data.reduce((sum, d) => sum + d.quality, 0) / data.length
    const C = 5 // confidence constant — a bucket needs ~5+ entries to be "trusted"

    displayBuckets.forEach(bucket => {
        bucket.avg = (bucket.count * bucket.rawAvg + C * globalAvg) / (bucket.count + C)
    })

    // Confidence level for display
    const getConfidence = (count: number) => {
        if (count >= 10) return { label: 'High', color: 'text-green-500' }
        if (count >= 5) return { label: 'Med', color: 'text-amber-500' }
        return { label: 'Low', color: 'text-red-400' }
    }

    // Find best bedtime (using adjusted averages)
    const bestBucket = displayBuckets.reduce((best, bucket) =>
        bucket.avg > best.avg ? bucket : best,
        displayBuckets[0]
    )

    // Color scale: 1-4 = red, 5-6 = amber, 7-8 = green, 9-10 = bright green
    const getColor = (avg: number) => {
        if (avg >= 8) return 'bg-green-500'
        if (avg >= 6) return 'bg-green-500/60'
        if (avg >= 5) return 'bg-amber-500/60'
        if (avg >= 3) return 'bg-red-500/60'
        return 'bg-red-500'
    }

    const getGlow = (avg: number) => {
        if (avg >= 8) return 'shadow-[0_0_10px_rgba(34,197,94,0.5)]'
        if (avg >= 6) return 'shadow-[0_0_8px_rgba(34,197,94,0.3)]'
        return ''
    }

    const getTextColor = (avg: number) => {
        if (avg >= 7) return 'text-green-400'
        if (avg >= 5) return 'text-amber-400'
        return 'text-red-400'
    }

    const selectedData = selectedBucket !== null
        ? displayBuckets.find(b => b.label === selectedBucket)
        : null

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-slate-500 text-[9px] uppercase tracking-wider font-bold">Bedtime</span>
                <span className="text-slate-500 text-[9px] uppercase tracking-wider font-bold">Avg Quality</span>
            </div>

            {/* Heatmap rows — only hours with data */}
            <div className="flex flex-col gap-2">
                {displayBuckets.map(bucket => {
                    const isSelected = selectedBucket === bucket.label
                    const isBest = bucket.label === bestBucket.label && displayBuckets.length > 1

                    return (
                        <div
                            key={bucket.label}
                            onClick={() => setSelectedBucket(prev => prev === bucket.label ? null : bucket.label)}
                            className={`flex items-center gap-3 cursor-pointer rounded-lg px-1 py-0.5 transition-all ${isSelected ? 'bg-white/5' : 'hover:bg-white/[0.02]'}`}
                        >
                            <span className="text-slate-400 text-xs w-12 font-medium flex items-center gap-1">
                                {bucket.label}
                                {isBest && <span className="text-[8px]">⭐</span>}
                            </span>
                            <div className="flex-1 h-5 rounded-md overflow-hidden bg-slate-800/50 relative">
                                <div
                                    className={`h-full ${getColor(bucket.avg)} ${getGlow(bucket.avg)} transition-all duration-300`}
                                    style={{ width: `${(bucket.avg / 10) * 100}%` }}
                                />
                                {/* Count badge */}
                                <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[8px] text-white/40 font-medium">
                                    {bucket.count}×
                                </span>
                            </div>
                            <span className={`text-xs font-bold w-10 text-right ${getTextColor(bucket.avg)}`}>
                                {bucket.avg.toFixed(1)}
                            </span>
                        </div>
                    )
                })}
            </div>

            {/* Detail panel — shows when a row is tapped */}
            {selectedData && (() => {
                const confidence = getConfidence(selectedData.count)
                return (
                <div
                    className="mt-3 bg-[rgba(25,34,51,0.9)] backdrop-blur-xl border border-white/15 rounded-xl p-4 animate-in slide-in-from-top-2 duration-200"
                    onClick={() => setSelectedBucket(null)}
                >
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                        <div>
                            <span className="text-white font-bold text-sm">{selectedData.label} Bedtime</span>
                            <span className="text-slate-500 text-xs ml-2">({selectedData.count} {selectedData.count === 1 ? 'night' : 'nights'})</span>
                        </div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${confidence.color} ${
                            confidence.label === 'High' ? 'bg-green-500/10 border-green-500/20'
                                : confidence.label === 'Med' ? 'bg-amber-500/10 border-amber-500/20'
                                    : 'bg-red-500/10 border-red-500/20'
                        }`}>
                            {confidence.label} confidence
                        </span>
                    </div>

                    {/* Summary stats */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="bg-white/[0.03] rounded-lg p-2 text-center">
                            <p className="text-slate-500 text-[9px] uppercase font-bold tracking-wider mb-0.5">Adj. Avg</p>
                            <span className={`text-sm font-bold ${getTextColor(selectedData.avg)}`}>
                                {selectedData.avg.toFixed(1)}/10
                            </span>
                        </div>
                        <div className="bg-white/[0.03] rounded-lg p-2 text-center">
                            <p className="text-slate-500 text-[9px] uppercase font-bold tracking-wider mb-0.5">Raw Avg</p>
                            <span className={`text-sm font-bold ${getTextColor(selectedData.rawAvg)}`}>
                                {selectedData.rawAvg.toFixed(1)}/10
                            </span>
                        </div>
                        <div className="bg-white/[0.03] rounded-lg p-2 text-center">
                            <p className="text-slate-500 text-[9px] uppercase font-bold tracking-wider mb-0.5">Avg Sleep</p>
                            <span className="text-blue-400 text-sm font-bold">
                                {Math.floor(selectedData.avgDuration / 60)}h {Math.round(selectedData.avgDuration % 60)}m
                            </span>
                        </div>
                    </div>

                    {selectedData.count < 5 && (
                        <div className="mb-3 px-2.5 py-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                            <p className="text-amber-400/80 text-[10px]">
                                ⚠️ Low sample size — score adjusted toward your overall average ({globalAvg.toFixed(1)}). Log more nights at this time for a more accurate picture.
                            </p>
                        </div>
                    )}

                    {/* Individual entries list */}
                    <div className="space-y-1.5 max-h-44 overflow-y-auto">
                        {selectedData.entries.map((entry, i) => {
                            const durationH = Math.floor(entry.totalSleepTime / 60)
                            const durationM = Math.round(entry.totalSleepTime % 60)
                            return (
                                <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/[0.03]">
                                    <div className="flex flex-col">
                                        <span className="text-slate-400 text-[11px] font-medium">
                                            {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </span>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-slate-500 text-[10px]">{entry.lightsOut}</span>
                                            <span className="text-slate-600 text-[10px]">→</span>
                                            <span className="text-slate-500 text-[10px]">{entry.wakeUp}</span>
                                            <span className="text-blue-400/60 text-[10px] font-medium ml-0.5">{durationH}h{durationM}m</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="flex gap-0.5">
                                            {Array.from({ length: 10 }, (_, j) => (
                                                <div
                                                    key={j}
                                                    className={`size-1 rounded-full ${j < entry.quality
                                                        ? entry.quality >= 7 ? 'bg-green-400' : entry.quality >= 5 ? 'bg-amber-400' : 'bg-red-400'
                                                        : 'bg-white/10'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <span className={`text-[11px] font-bold ml-1 ${getTextColor(entry.quality)}`}>
                                            {entry.quality}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <p className="text-slate-600 text-[10px] text-center mt-3">Tap to dismiss</p>
                </div>
                )
            })()}

            {/* Best bedtime callout */}
            {displayBuckets.length > 1 && (
                <div className="mt-3 px-2 py-2 rounded-lg bg-green-500/5 border border-green-500/10 flex items-center gap-2">
                    <span className="text-[10px]">⭐</span>
                    <span className="text-green-400/80 text-[11px] font-medium">
                        Best quality at <span className="font-bold">{bestBucket.label}</span> — avg {bestBucket.avg.toFixed(1)}/10
                    </span>
                </div>
            )}

            {/* Legend */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 mt-3 px-1">
                <div className="flex items-center gap-1.5">
                    <div className="size-1.5 rounded-full bg-red-500/60"></div>
                    <span className="text-[8px] text-slate-500 uppercase tracking-tighter font-semibold">Poor (1-4)</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                    <div className="size-1.5 rounded-full bg-amber-500/60"></div>
                    <span className="text-[8px] text-slate-500 uppercase tracking-tighter font-semibold">Fair (5-6)</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="size-1.5 rounded-full bg-green-500/60"></div>
                    <span className="text-[8px] text-slate-500 uppercase tracking-tighter font-semibold">Good (7-8)</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="size-1.5 rounded-full bg-green-500"></div>
                    <span className="text-[8px] text-slate-500 uppercase tracking-tighter font-semibold">Great (9-10)</span>
                </div>
            </div>
        </div>
    )
}
