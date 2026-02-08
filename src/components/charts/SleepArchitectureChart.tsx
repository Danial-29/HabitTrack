import { useState } from 'react'

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
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
                No data available
            </div>
        )
    }

    // Find max time for scaling
    const maxTime = Math.max(...data.map(d => d.totalTimeInBed), 480) // At least 8 hours

    const barHeight = 24
    const barGap = 12
    const padding = { top: 25, bottom: 25, left: 10, right: 35 }
    const chartWidth = 320

    const formatMinutes = (mins: number) => `${mins} min`
    const formatTime = (mins: number) => {
        const h = Math.floor(mins / 60)
        const m = Math.round(mins % 60)
        return `${h}h ${m}m`
    }

    const selectedEntry = selectedIndex !== null ? data[selectedIndex] : null

    const handleBarClick = (index: number) => {
        setSelectedIndex(prev => prev === index ? null : index)
    }

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
                    const barMaxWidth = chartWidth - padding.left - padding.right - 25

                    const latencyWidth = (entry.latency / maxTime) * barMaxWidth
                    const awakeWidth = (entry.awakeDuration / maxTime) * barMaxWidth
                    const sleepWidth = (entry.totalSleepTime / maxTime) * barMaxWidth

                    // Format date
                    const date = new Date(entry.date)
                    const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' }).substring(0, 2)

                    const isSelected = selectedIndex === i

                    return (
                        <g
                            key={entry.date}
                            onClick={() => handleBarClick(i)}
                            style={{ cursor: 'pointer' }}
                        >
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
                                {/* Selection highlight */}
                                {isSelected && (
                                    <rect
                                        x={-4}
                                        y={-4}
                                        width={latencyWidth + awakeWidth + sleepWidth + 8}
                                        height={barHeight + 8}
                                        rx={6}
                                        className="fill-white/10 stroke-purple-400/50"
                                        strokeWidth={1.5}
                                    />
                                )}
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
                                x={chartWidth - padding.right + 2}
                                y={y + barHeight / 2 + 4}
                                className="fill-slate-300 text-[10px] font-semibold"
                            >
                                {Math.floor(entry.totalTimeInBed / 60)}h
                            </text>
                        </g>
                    )
                })}
            </svg>

            {/* Detail Modal */}
            {selectedEntry && (
                <div
                    className="mt-3 bg-[rgba(25,34,51,0.9)] backdrop-blur-xl border border-white/15 rounded-xl p-4 animate-in slide-in-from-top-2 duration-200"
                    onClick={() => setSelectedIndex(null)}
                >
                    {/* Date Header */}
                    <div className="text-white font-bold text-sm mb-3 pb-2 border-b border-white/10">
                        {new Date(selectedEntry.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric'
                        })}
                    </div>

                    {/* Metrics */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-sm bg-amber-500/80"></div>
                                <span className="text-slate-400 text-xs">Fell asleep in</span>
                            </div>
                            <span className="text-amber-400 font-semibold text-sm">{formatMinutes(selectedEntry.latency)}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-sm bg-red-500/80"></div>
                                <span className="text-slate-400 text-xs">Awake during night</span>
                            </div>
                            <span className="text-red-400 font-semibold text-sm">{formatMinutes(selectedEntry.awakeDuration)}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-sm bg-purple-500/80"></div>
                                <span className="text-slate-400 text-xs">Actual sleep</span>
                            </div>
                            <span className="text-purple-400 font-semibold text-sm">{formatTime(selectedEntry.totalSleepTime)}</span>
                        </div>

                        <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
                            <span className="text-slate-300 text-xs font-medium">Total time in bed</span>
                            <span className="text-white font-bold text-sm">{formatTime(selectedEntry.totalTimeInBed)}</span>
                        </div>
                    </div>

                    <p className="text-slate-600 text-[10px] text-center mt-3">Tap to dismiss</p>
                </div>
            )}
        </div>
    )
}
