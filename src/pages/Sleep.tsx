import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    ArrowLeft,
    Moon,
    Clock,
    Activity,
    Plus,
    Trash2,
    Zap,
    Loader2,
    Settings
} from 'lucide-react'
import { useSleepData } from '../hooks/useSleepData'

export default function Sleep() {
    const navigate = useNavigate()
    const { logs, addLog, deleteLog, latestStats, calculateStats, loading, targetHours, setTargetHours, targetBedtime, setTargetBedtime, targetWakeTime, setTargetWakeTime } = useSleepData()

    // Form State
    const [isEntryModalOpen, setIsEntryModalOpen] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        lightsOut: '23:00',
        wakeUp: '07:00',
        outOfBed: '07:15',
        latency: 15,
        awakenings: 1,
        awakeDuration: 10,
        subjectiveQuality: 8
    })

    // Explanation State
    const [explanation, setExplanation] = useState<{
        title: string;
        formula: string;
        description: string;
        variables?: { name: string; definition: string }[]
    } | null>(null)

    // Selected log for detail view
    const [selectedLog, setSelectedLog] = useState<typeof logs[0] | null>(null)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: name === 'lightsOut' || name === 'wakeUp' || name === 'outOfBed' ? value : Number(value)
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        await addLog({
            lightsOut: formData.lightsOut,
            wakeUp: formData.wakeUp,
            outOfBed: formData.outOfBed,
            latency: Number(formData.latency),
            awakenings: Number(formData.awakenings),
            awakeDuration: Number(formData.awakeDuration),
            subjectiveQuality: Number(formData.subjectiveQuality)
        })

        setIsSubmitting(false)
        setIsEntryModalOpen(false)
    }

    const handleDeleteLog = async (id: string) => {
        await deleteLog(id)
    }

    // Styles
    const glassCardClass = "backdrop-blur-[12px] bg-white/[0.03] border border-white/10"
    const neonText = "text-purple-400 drop-shadow-[0_0_5px_rgba(192,132,252,0.5)]"
    const glowShadow = "shadow-[0_0_20px_rgba(192,132,252,0.15)]"

    const metricExplanations = {
        quality: {
            title: "Sleep Quality Score",
            formula: "(Efficiency × 0.4) + (Feel × 4) + Latency Score + Awake Penalty",
            description: "A 100-point index combining objective metrics with your subjective experience.",
            variables: [
                { name: "Efficiency (40%)", definition: "Sleep efficiency × 0.4. Example: 95% → 38 points." },
                { name: "Subjective Feel (40%)", definition: "Your quality rating × 4. Example: 8/10 → 32 points." },
                { name: "Latency Score (10%)", definition: "10-25 min = 10pts, 25-45 min = 5pts, >45 min = 0pts." },
                { name: "Awake Penalty (10%)", definition: "10 - (awakenings × 2) - (awake mins ÷ 10)." }
            ]
        },
        efficiency: {
            title: "Sleep Efficiency (SE)",
            formula: "(Total Sleep Time / Total Time in Bed) × 100",
            description: "A global indicator of sleep quality highlighting fragmented sleep patterns.",
            variables: [
                { name: "Total Sleep Time", definition: "Time in bed minus latency and awakenings." },
                { name: "Time in Bed", definition: "Total clock time from lights out to out of bed." }
            ]
        },
        duration: {
            title: "Total Sleep Duration",
            formula: "Time in Bed - (Sleep Latency + Awake Duration)",
            description: "The net crystalline sleep duration after subtracting all wakeful periods.",
            variables: [
                { name: "Sleep Latency", definition: "Minutes spent trying to fall asleep." },
                { name: "Awake Duration", definition: "Total minutes spent awake during the night." }
            ]
        },
        debt: {
            title: "Sleep Debt",
            formula: "∑(Target Hours - Actual Hours)",
            description: "The accumulated biological need for sleep relative to your personal target.",
            variables: [
                { name: "Target Hours", definition: "Personal daily sleep goal (Default: 8 hours)." },
                { name: "Actual Hours", definition: "Net sleep duration recorded for the period." }
            ]
        }
    }

    return (
        <div className="min-h-screen bg-[#101622] text-white font-[Manrope] p-6 flex flex-col items-center">
            <div className="w-full max-w-md flex flex-col h-full">

                {/* Header */}
                <header className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className={`size-10 flex items-center justify-center rounded-xl ${glassCardClass} hover:bg-white/10 transition-colors`}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold tracking-tight">Sleep Analysis</h1>
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className={`size-10 flex items-center justify-center rounded-xl ${glassCardClass} hover:bg-white/10 transition-colors`}
                    >
                        {loading ? <Loader2 className="animate-spin text-purple-400" size={20} /> : <Settings size={20} className="text-slate-400" />}
                    </button>
                </header>

                {/* Main Stats Card */}
                <div className={`relative w-full p-5 rounded-3xl ${glassCardClass} ${glowShadow} mb-4 overflow-hidden`}>
                    {/* Decorative Elements */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />

                    <div className="relative z-10 flex flex-col items-center text-center">
                        <button
                            onClick={() => setExplanation(metricExplanations.quality)}
                            className="group flex flex-col items-center"
                        >
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 group-active:scale-95 transition-transform">Sleep Quality Score</span>
                            <div className="flex items-baseline gap-1 mb-2 group-active:scale-95 transition-transform">
                                <span className={`text-5xl font-extrabold ${neonText}`}>
                                    {latestStats ? Math.round(latestStats.sleepQualityScore) : '--'}
                                </span>
                                <span className="text-lg text-slate-500 font-bold">/ 100</span>
                            </div>
                        </button>

                        <div className="grid grid-cols-3 gap-3 w-full mt-2">
                            <button
                                onClick={() => setExplanation(metricExplanations.efficiency)}
                                className="flex flex-col items-center p-2.5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors active:scale-95"
                            >
                                <Activity size={16} className="text-blue-400 mb-1.5" />
                                <span className="text-lg font-bold">{latestStats ? Math.round(latestStats.sleepEfficiency) : '--'}%</span>
                                <span className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Efficiency</span>
                            </button>
                            <button
                                onClick={() => setExplanation(metricExplanations.duration)}
                                className="flex flex-col items-center p-2.5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors active:scale-95"
                            >
                                <Clock size={16} className="text-emerald-400 mb-1.5" />
                                <span className="text-lg font-bold">{latestStats ? `${Math.floor(latestStats.totalSleepTime / 60)}h ${latestStats.totalSleepTime % 60}m` : '--'}</span>
                                <span className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Duration</span>
                            </button>
                            <button
                                onClick={() => setExplanation(metricExplanations.debt)}
                                className="flex flex-col items-center p-2.5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors active:scale-95"
                            >
                                <Zap size={16} className={latestStats && latestStats.sleepDebt > 0 ? "text-red-400 mb-1.5" : "text-green-400 mb-1.5"} />
                                <span className="text-lg font-bold">{latestStats ? (latestStats.sleepDebt > 0 ? `+${latestStats.sleepDebt.toFixed(1)}` : latestStats.sleepDebt.toFixed(1)) : '--'}h</span>
                                <span className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Debt</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={() => setIsEntryModalOpen(true)}
                    className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-base shadow-lg shadow-purple-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 mb-6"
                >
                    <Plus size={20} />
                    Log Sleep Session
                </button>

                {/* Recent History */}
                <div className="flex items-center justify-between mb-3 px-2">
                    <h2 className="text-base font-bold">Recent History</h2>
                    <button className="text-xs text-purple-400 font-bold hover:text-purple-300">View All</button>
                </div>

                <div className="space-y-2.5 pb-24 overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col items-center py-10">
                            <Loader2 className="animate-spin text-purple-400" size={32} />
                            <p className="text-slate-400 mt-3 text-sm">Loading sleep data...</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">
                            <Moon size={40} className="mx-auto mb-3 opacity-20" />
                            <p className="text-sm">No sleep logs yet.</p>
                        </div>
                    ) : (
                        logs.map(log => {
                            const stats = calculateStats(log)
                            return (
                                <div
                                    key={log.id}
                                    onClick={() => setSelectedLog(log)}
                                    className={`group relative p-3.5 rounded-2xl ${glassCardClass} hover:bg-white/5 transition-all cursor-pointer`}
                                >
                                    <div className="flex justify-between items-start mb-1.5">
                                        <div>
                                            <p className="text-sm font-bold text-white">{new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                                            <p className="text-[11px] text-slate-400">{log.lightsOut} - {log.wakeUp}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-base font-bold ${neonText}`}>{Math.round(stats.sleepQualityScore)}</span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteLog(log.id) }}
                                                className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 mt-1.5 border-t border-white/5 pt-1.5">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                            <span className="text-[11px] text-slate-300">{Math.round(stats.sleepEfficiency)}% Eff.</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                            <span className="text-[11px] text-slate-300">{Math.floor(stats.totalSleepTime / 60)}h {stats.totalSleepTime % 60}m Sleep</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

                {/* Detail View Modal */}
                {selectedLog && (() => {
                    const stats = calculateStats(selectedLog)
                    return (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedLog(null)}>
                            <div
                                className={`w-full max-w-sm rounded-3xl p-6 ${glassCardClass} ${glowShadow} overflow-y-auto max-h-[90vh]`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-white">
                                        {new Date(selectedLog.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                                    </h2>
                                    <button
                                        onClick={() => setSelectedLog(null)}
                                        className="size-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-slate-400"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* Quality Score */}
                                <div className="text-center mb-6">
                                    <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">Sleep Quality Score</p>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className={`text-5xl font-extrabold ${neonText}`}>{Math.round(stats.sleepQualityScore)}</span>
                                        <span className="text-lg text-slate-500 font-bold">/ 100</span>
                                    </div>
                                </div>

                                {/* Time Info */}
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Lights Out</p>
                                        <p className="text-lg font-bold text-white">{selectedLog.lightsOut}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Wake Up</p>
                                        <p className="text-lg font-bold text-white">{selectedLog.wakeUp}</p>
                                    </div>
                                </div>

                                {/* Key Metrics */}
                                <div className="space-y-3 mb-4">
                                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                                        <span className="text-sm text-slate-300">Efficiency</span>
                                        <span className="text-sm font-bold text-blue-400">{Math.round(stats.sleepEfficiency)}%</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                                        <span className="text-sm text-slate-300">Duration</span>
                                        <span className="text-sm font-bold text-emerald-400">{Math.floor(stats.totalSleepTime / 60)}h {stats.totalSleepTime % 60}m</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                                        <span className="text-sm text-slate-300">Sleep Latency</span>
                                        <span className="text-sm font-bold text-white">{selectedLog.latency} min</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                                        <span className="text-sm text-slate-300">Awakenings</span>
                                        <span className="text-sm font-bold text-white">{selectedLog.awakenings}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                                        <span className="text-sm text-slate-300">Awake Duration</span>
                                        <span className="text-sm font-bold text-white">{selectedLog.awakeDuration} min</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                                        <span className="text-sm text-slate-300">Subjective Feel</span>
                                        <span className="text-sm font-bold text-purple-400">{selectedLog.subjectiveQuality}/10</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                                        <span className="text-sm text-slate-300">Sleep Debt</span>
                                        <span className={`text-sm font-bold ${stats.sleepDebt > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                            {stats.sleepDebt > 0 ? '+' : ''}{stats.sleepDebt.toFixed(1)}h
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedLog(null)}
                                    className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )
                })()}

                {/* Explanation Modal */}
                {explanation && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setExplanation(null)}>
                        <div
                            className="bg-[#101622] border border-white/10 w-full max-w-sm rounded-2xl p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-bold mb-2 text-purple-400">{explanation.title}</h3>

                            <p className="text-sm text-slate-300 leading-relaxed italic opacity-80 mb-4">
                                {explanation.description}
                            </p>

                            <div className="bg-white/5 rounded-xl p-3 border border-white/5 mb-6">
                                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1.5 tracking-tighter opacity-60">Calculation Formula</p>
                                <code className="text-[13px] font-mono text-emerald-400 break-words leading-relaxed">{explanation.formula}</code>
                            </div>

                            {explanation.variables && (
                                <div className="space-y-4">
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter opacity-60">Variables & Definitions</p>
                                    <div className="space-y-3">
                                        {explanation.variables.map((v, i) => (
                                            <div key={i} className="border-l-2 border-purple-500/30 pl-3">
                                                <p className="text-xs font-bold text-white mb-0.5">{v.name}</p>
                                                <p className="text-[11px] text-slate-400 leading-normal">{v.definition}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => setExplanation(null)}
                                className="w-full mt-8 py-3 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 font-bold transition-all border border-purple-500/20"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                )}

                {/* Entry Modal */}
                {isEntryModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-[#101622] border border-white/10 w-full max-w-sm rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">New Sleep Entry</h2>
                                <button onClick={() => setIsEntryModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs text-slate-400 uppercase font-bold">Lights Out</label>
                                        <input
                                            type="time"
                                            name="lightsOut"
                                            value={formData.lightsOut}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-purple-500"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-slate-400 uppercase font-bold">Fell Asleep In (m)</label>
                                        <input
                                            type="number"
                                            name="latency"
                                            value={formData.latency}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-purple-500"
                                            min="0"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs text-slate-400 uppercase font-bold">Wake Up</label>
                                        <input
                                            type="time"
                                            name="wakeUp"
                                            value={formData.wakeUp}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-purple-500"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-slate-400 uppercase font-bold">Out of Bed</label>
                                        <input
                                            type="time"
                                            name="outOfBed"
                                            value={formData.outOfBed}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-purple-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/5">
                                    <p className="text-xs text-slate-400 uppercase font-bold mb-2">Disruptions</p>
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm">Awakenings</label>
                                        <div className="flex items-center gap-3">
                                            <button type="button" onClick={() => setFormData(p => ({ ...p, awakenings: Math.max(0, p.awakenings - 1) }))} className="size-8 rounded-full bg-white/10 flex items-center justify-center">-</button>
                                            <span className="w-4 text-center">{formData.awakenings}</span>
                                            <button type="button" onClick={() => setFormData(p => ({ ...p, awakenings: p.awakenings + 1 }))} className="size-8 rounded-full bg-white/10 flex items-center justify-center">+</button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm">Total Awake Time (m)</label>
                                        <input
                                            type="number"
                                            name="awakeDuration"
                                            value={formData.awakeDuration}
                                            onChange={handleInputChange}
                                            className="w-20 bg-black/20 border border-white/10 rounded-lg px-2 py-1 text-center"
                                            min="0"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <label className="text-xs text-slate-400 uppercase font-bold">Subjective Quality (1-10)</label>
                                        <span className={`text-sm font-bold ${neonText}`}>{formData.subjectiveQuality}</span>
                                    </div>
                                    <input
                                        type="range"
                                        name="subjectiveQuality"
                                        min="1"
                                        max="10"
                                        step="0.5"
                                        value={formData.subjectiveQuality}
                                        onChange={handleInputChange}
                                        className="w-full accent-purple-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between text-xs text-slate-500 px-1">
                                        <span>Terrible</span>
                                        <span>Excellent</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-lg shadow-lg shadow-purple-500/20 mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Entry'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Settings Modal */}
                {isSettingsOpen && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                        <div className={`w-full max-w-sm p-6 rounded-3xl ${glassCardClass} ${glowShadow}`}>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">Sleep Settings</h2>
                                <button
                                    onClick={() => setIsSettingsOpen(false)}
                                    className="size-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-slate-400"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Target Hours */}
                                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <Clock size={20} className="text-emerald-400" />
                                        <div>
                                            <p className="text-sm font-bold text-white">Sleep Duration</p>
                                            <p className="text-xs text-slate-400">Target hours</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setTargetHours(Math.max(4, targetHours - 0.5))}
                                            className="size-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-lg transition-colors"
                                        >
                                            −
                                        </button>
                                        <span className="w-12 text-center font-bold text-lg">{targetHours}h</span>
                                        <button
                                            onClick={() => setTargetHours(Math.min(12, targetHours + 0.5))}
                                            className="size-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-lg transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Target Bedtime */}
                                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <Moon size={20} className="text-purple-400" />
                                        <div>
                                            <p className="text-sm font-bold text-white">Target Bedtime</p>
                                            <p className="text-xs text-slate-400">Lights out goal</p>
                                        </div>
                                    </div>
                                    <input
                                        type="time"
                                        value={targetBedtime}
                                        onChange={(e) => setTargetBedtime(e.target.value)}
                                        className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white font-bold text-center w-24"
                                    />
                                </div>

                                {/* Target Wake Time */}
                                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <Zap size={20} className="text-yellow-400" />
                                        <div>
                                            <p className="text-sm font-bold text-white">Target Wake Up</p>
                                            <p className="text-xs text-slate-400">Morning alarm</p>
                                        </div>
                                    </div>
                                    <input
                                        type="time"
                                        value={targetWakeTime}
                                        onChange={(e) => setTargetWakeTime(e.target.value)}
                                        className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white font-bold text-center w-24"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => setIsSettingsOpen(false)}
                                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold mt-6"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
