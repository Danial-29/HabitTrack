import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Droplets, Moon, Grid, BarChart2, TrendingUp, Clock, AlertTriangle, Activity, Loader2 } from 'lucide-react'
import { useSleepData } from '../hooks/useSleepData'
import ConsistencyChart from '../components/charts/ConsistencyChart'
import SleepArchitectureChart from '../components/charts/SleepArchitectureChart'
import QualityVsDurationChart from '../components/charts/QualityVsDurationChart'
import EfficiencyTrendChart from '../components/charts/EfficiencyTrendChart'
import BedtimeQualityHeatmap from '../components/charts/BedtimeQualityHeatmap'

type TabType = 'hydration' | 'sleep'

export default function Stats() {
    const [activeTab, setActiveTab] = useState<TabType>('hydration')
    const [periodDays, setPeriodDays] = useState<7 | 30>(7)

    // Sleep data
    const {
        loading: sleepLoading,
        getStatsForPeriod,
        getConsistencyScore,
        getGrogginessFactor,
        getWeekdayVsWeekend,
        getEfficiencyTrend,
        getSleepArchitectureData,
        getConsistencyChartData,
        getQualityVsDurationData,
        getBedtimeQualityData,
    } = useSleepData()

    // Calculate stats
    const periodStats = getStatsForPeriod(periodDays)
    const consistencyData = getConsistencyScore(periodDays)
    const grogginess = getGrogginessFactor(periodDays)
    const weekdayWeekend = getWeekdayVsWeekend()
    const efficiencyTrend = getEfficiencyTrend(periodDays)
    const architectureData = getSleepArchitectureData(periodDays)
    const consistencyChartData = getConsistencyChartData(periodDays)
    const qualityDurationData = getQualityVsDurationData()
    const bedtimeQualityData = getBedtimeQualityData()

    // Format helpers
    const formatDuration = (minutes: number) => {
        const h = Math.floor(minutes / 60)
        const m = Math.round(minutes % 60)
        return `${h}h ${m}m`
    }

    const formatDebt = (hours: number) => {
        const absHours = Math.abs(hours)
        const h = Math.floor(absHours)
        const m = Math.round((absHours - h) * 60)
        const sign = hours > 0 ? '+' : ''
        return `${sign}${h}h ${m}m`
    }

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white antialiased min-h-screen flex flex-col items-center">
            <div className="relative flex min-h-screen w-full flex-col bg-[#101622] overflow-x-hidden max-w-md shadow-2xl bg-[radial-gradient(at_0%_0%,rgba(43,108,238,0.15)_0px,transparent_50%),radial-gradient(at_100%_100%,rgba(147,51,234,0.1)_0px,transparent_50%)]">

                {/* Header */}
                <header className="flex flex-col bg-transparent p-6 pb-4 z-50">
                    {/* Back Button Row */}
                    <div className="flex items-center justify-between mb-6">
                        <Link
                            to="/"
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft size={20} />
                            <span className="text-sm font-medium">Back</span>
                        </Link>
                        <h1 className="text-white text-lg font-bold">Statistics</h1>
                        <div className="w-[60px]"></div>
                    </div>

                    {/* Tab Selector */}
                    <div className="flex items-center justify-center gap-8">
                        <button
                            onClick={() => setActiveTab('hydration')}
                            className={`flex items-center gap-2 pb-2 border-b-2 transition-all duration-300 ${activeTab === 'hydration'
                                    ? 'text-blue-400 border-blue-400'
                                    : 'text-slate-500 border-transparent hover:text-slate-300'
                                }`}
                        >
                            <Droplets size={20} />
                            <span className="font-semibold text-base">Hydration</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('sleep')}
                            className={`flex items-center gap-2 pb-2 border-b-2 transition-all duration-300 ${activeTab === 'sleep'
                                    ? 'text-purple-400 border-purple-400'
                                    : 'text-slate-500 border-transparent hover:text-slate-300'
                                }`}
                        >
                            <Moon size={20} />
                            <span className="font-semibold text-base">Sleep</span>
                        </button>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 px-6 pb-32">
                    {activeTab === 'hydration' ? (
                        <div className="flex flex-col gap-4">
                            {/* Hydration Stats Placeholder */}
                            <div className="bg-[rgba(25,34,51,0.7)] backdrop-blur-md border border-white/10 rounded-2xl p-6 border-l-4 border-l-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="size-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                                        <Droplets size={24} />
                                    </div>
                                    <h2 className="text-white font-bold text-lg">Hydration Statistics</h2>
                                </div>
                                <p className="text-slate-400 text-sm">Coming soon...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {/* Period Selector */}
                            <div className="flex items-center justify-end gap-2 mb-2">
                                <button
                                    onClick={() => setPeriodDays(7)}
                                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${periodDays === 7
                                            ? 'bg-purple-500/30 text-purple-300'
                                            : 'text-slate-500 hover:text-slate-300'
                                        }`}
                                >
                                    7 Days
                                </button>
                                <button
                                    onClick={() => setPeriodDays(30)}
                                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${periodDays === 30
                                            ? 'bg-purple-500/30 text-purple-300'
                                            : 'text-slate-500 hover:text-slate-300'
                                        }`}
                                >
                                    30 Days
                                </button>
                            </div>

                            {sleepLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="animate-spin text-purple-400" size={32} />
                                </div>
                            ) : (
                                <>
                                    {/* ═══════════════════════════════════════════
                                        TOP ROW: Headline Cards (2x2 Grid)
                                    ═══════════════════════════════════════════ */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Avg Quality */}
                                        <div className="bg-[rgba(25,34,51,0.7)] backdrop-blur-md border border-white/10 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <TrendingUp size={14} className="text-purple-400" />
                                                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Avg Quality</span>
                                            </div>
                                            <div className="text-white text-2xl font-bold">
                                                {periodStats.logsCount > 0 ? `${Math.round(periodStats.avgQuality)}` : '--'}
                                                <span className="text-slate-400 text-sm font-normal">/100</span>
                                            </div>
                                        </div>

                                        {/* Avg Duration */}
                                        <div className="bg-[rgba(25,34,51,0.7)] backdrop-blur-md border border-white/10 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Clock size={14} className="text-blue-400" />
                                                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Avg Duration</span>
                                            </div>
                                            <div className="text-white text-2xl font-bold">
                                                {periodStats.logsCount > 0 ? formatDuration(periodStats.avgDuration) : '--'}
                                            </div>
                                        </div>

                                        {/* Sleep Debt */}
                                        <div className="bg-[rgba(25,34,51,0.7)] backdrop-blur-md border border-white/10 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <AlertTriangle size={14} className={periodStats.totalSleepDebt > 0 ? 'text-red-400' : 'text-green-400'} />
                                                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Sleep Debt</span>
                                            </div>
                                            <div className={`text-2xl font-bold ${periodStats.totalSleepDebt > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                                {periodStats.logsCount > 0 ? formatDebt(periodStats.totalSleepDebt) : '--'}
                                            </div>
                                        </div>

                                        {/* Consistency Score */}
                                        <div className="bg-[rgba(25,34,51,0.7)] backdrop-blur-md border border-white/10 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Activity size={14} className="text-amber-400" />
                                                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Consistency</span>
                                            </div>
                                            <div className="text-white text-2xl font-bold">
                                                {Math.round(consistencyData.score)}
                                                <span className="text-slate-400 text-sm font-normal">%</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ═══════════════════════════════════════════
                                        MIDDLE ROW: Consistency Tracker (Full Width)
                                    ═══════════════════════════════════════════ */}
                                    <div className="bg-[rgba(25,34,51,0.7)] backdrop-blur-md border border-white/10 rounded-2xl p-4 border-l-4 border-l-purple-500">
                                        <h3 className="text-white font-bold text-sm mb-1">Sleep Schedule Consistency</h3>
                                        <p className="text-slate-400 text-xs mb-4">Aligned bars = consistent routine. Scattered bars = "Social Jetlag"</p>
                                        <ConsistencyChart data={consistencyChartData} />
                                    </div>

                                    {/* ═══════════════════════════════════════════
                                        BOTTOM ROW: Two Columns
                                    ═══════════════════════════════════════════ */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* LEFT COLUMN: Sleep Architecture */}
                                        <div className="bg-[rgba(25,34,51,0.7)] backdrop-blur-md border border-white/10 rounded-2xl p-4">
                                            <h3 className="text-white font-bold text-xs mb-1">Sleep Architecture</h3>
                                            <p className="text-slate-500 text-[10px] mb-3">Where your time in bed goes</p>
                                            <SleepArchitectureChart data={architectureData} />
                                        </div>

                                        {/* RIGHT COLUMN: Bedtime vs Quality Heatmap */}
                                        <div className="bg-[rgba(25,34,51,0.7)] backdrop-blur-md border border-white/10 rounded-2xl p-4">
                                            <h3 className="text-white font-bold text-xs mb-1">Bedtime vs Quality</h3>
                                            <p className="text-slate-500 text-[10px] mb-3">When should you go to bed?</p>
                                            <BedtimeQualityHeatmap data={bedtimeQualityData} />
                                        </div>
                                    </div>

                                    {/* ═══════════════════════════════════════════
                                        ADDITIONAL CHARTS ROW
                                    ═══════════════════════════════════════════ */}
                                    <div className="bg-[rgba(25,34,51,0.7)] backdrop-blur-md border border-white/10 rounded-2xl p-4">
                                        <h3 className="text-white font-bold text-sm mb-1">Quality vs Duration</h3>
                                        <p className="text-slate-400 text-xs mb-4">Find your personal sleep sweet spot</p>
                                        <QualityVsDurationChart data={qualityDurationData} />
                                    </div>

                                    {/* ═══════════════════════════════════════════
                                        ADVANCED INSIGHTS
                                    ═══════════════════════════════════════════ */}
                                    <div className="bg-[rgba(25,34,51,0.7)] backdrop-blur-md border border-white/10 rounded-2xl p-4">
                                        <h3 className="text-white font-bold text-sm mb-4">Advanced Insights</h3>

                                        {/* Grogginess Factor */}
                                        <div className="border-b border-white/5 pb-3 mb-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-slate-300 text-sm">Grogginess Factor</span>
                                                <span className="text-amber-400 font-bold text-sm">
                                                    {grogginess.logsCount > 0 ? `${Math.round(grogginess.avgMinutes)} min` : '--'}
                                                </span>
                                            </div>
                                            <p className="text-slate-500 text-xs">
                                                {grogginess.logsCount > 0
                                                    ? `Average time scrolling in bed before getting up`
                                                    : 'No data available'}
                                            </p>
                                        </div>

                                        {/* Weekend vs Weekday */}
                                        <div className="border-b border-white/5 pb-3 mb-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-slate-300 text-sm">Weekend vs Weekday</span>
                                                <span className={`font-bold text-sm ${weekdayWeekend.difference > 30 ? 'text-amber-400' : 'text-green-400'}`}>
                                                    {weekdayWeekend.weekendCount > 0 && weekdayWeekend.weekdayCount > 0
                                                        ? `${weekdayWeekend.difference > 0 ? '+' : ''}${Math.round(weekdayWeekend.difference)} min`
                                                        : '--'}
                                                </span>
                                            </div>
                                            <p className="text-slate-500 text-xs">
                                                {weekdayWeekend.difference > 60
                                                    ? 'You sleep significantly more on weekends - suggests weekday sleep debt'
                                                    : weekdayWeekend.difference > 0
                                                        ? 'You sleep a bit more on weekends'
                                                        : 'Your sleep is consistent across the week'}
                                            </p>
                                        </div>

                                        {/* Efficiency Trend */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-slate-300 text-sm">Efficiency Trend</span>
                                                <span className="text-green-400 text-xs">Target: 85%+</span>
                                            </div>
                                            <EfficiencyTrendChart data={efficiencyTrend} />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </main>

                {/* Premium Floating Navigation Dock */}
                <div className="fixed bottom-6 w-full max-w-md px-6 z-50">
                    <div className="bg-[rgba(16,22,34,0.85)] backdrop-blur-xl border border-white/10 rounded-full px-8 py-3 flex justify-around items-center shadow-2xl">
                        <Link to="/" className="flex flex-col items-center gap-1 text-slate-500 hover:text-white transition-colors relative top-1">
                            <Grid size={24} strokeWidth={2.5} />
                            <div className="size-1 bg-transparent rounded-full mt-1"></div>
                        </Link>

                        <button className="flex flex-col items-center gap-1 text-primary relative top-1">
                            <BarChart2 size={24} strokeWidth={2.5} />
                            <div className="size-1 bg-primary rounded-full mt-1"></div>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}
