import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Droplets, Moon, Grid, BarChart2, TrendingUp, Clock, AlertTriangle, Activity, Loader2, Flame, Timer } from 'lucide-react'
import { useSleepData } from '../hooks/useSleepData'
import { useHydrationData } from '../hooks/useHydrationData'
import ConsistencyChart from '../components/charts/ConsistencyChart'
import SleepArchitectureChart from '../components/charts/SleepArchitectureChart'
import QualityVsDurationChart from '../components/charts/QualityVsDurationChart'
import EfficiencyTrendChart from '../components/charts/EfficiencyTrendChart'
import BedtimeQualityHeatmap from '../components/charts/BedtimeQualityHeatmap'
import HydrationTrendChart from '../components/charts/HydrationTrendChart'
import HydrationHourlyChart from '../components/charts/HydrationHourlyChart'

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

    // Hydration data
    const {
        loading: hydrationLoading,
        dailyGoal,
        getStatsForPeriod: getHydrationStats,
        getConsistencyScore: getHydrationConsistency,
        getHourlyDistribution,
        getWeekdayVsWeekend: getHydrationWeekdayWeekend,
        getDailyTrendData,
        getStreakInfo,
        getDayOfWeekStats,
        getAverageDrinkDurationByLabel,
    } = useHydrationData()

    // Calculate sleep stats
    const periodStats = getStatsForPeriod(periodDays)
    const consistencyData = getConsistencyScore(periodDays)
    const grogginess = getGrogginessFactor(periodDays)
    const weekdayWeekend = getWeekdayVsWeekend()
    const efficiencyTrend = getEfficiencyTrend(periodDays)
    const architectureData = getSleepArchitectureData(periodDays)
    const consistencyChartData = getConsistencyChartData(periodDays)
    const qualityDurationData = getQualityVsDurationData()
    const bedtimeQualityData = getBedtimeQualityData()

    // Calculate hydration stats
    const hydrationPeriodStats = getHydrationStats(periodDays)
    const hydrationConsistency = getHydrationConsistency(periodDays)
    const hourlyDistribution = getHourlyDistribution()
    const hydrationWeekdayWeekend = getHydrationWeekdayWeekend()
    const trendData = getDailyTrendData(periodDays)
    const streakInfo = getStreakInfo()
    const dayOfWeekStats = getDayOfWeekStats()
    const drinkDurations = getAverageDrinkDurationByLabel()

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

    // Explanation State
    const [explanation, setExplanation] = useState<{
        title: string;
        formula: string;
        description: string;
        variables?: { name: string; definition: string }[]
    } | null>(null)

    // Metric Explanations
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
        },
        consistency: {
            title: "Sleep Consistency Score",
            formula: "100 - (Standard Deviation ÷ 1.2)",
            description: "A measure of how strictly you maintain your bedtime and wake-up times. Higher is better for circadian rhythm.",
            variables: [
                { name: "Standard Deviation", definition: "Statistical measure of how much your sleep times vary from your average." },
                { name: "Social Jetlag", definition: "The difference between your biological clock and social schedule." }
            ]
        }
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
                            {/* Period Selector */}
                            <div className="flex items-center justify-end gap-2 mb-2">
                                <button
                                    onClick={() => setPeriodDays(7)}
                                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${periodDays === 7
                                        ? 'bg-blue-500/30 text-blue-300'
                                        : 'text-slate-500 hover:text-slate-300'
                                        }`}
                                >
                                    7 Days
                                </button>
                                <button
                                    onClick={() => setPeriodDays(30)}
                                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${periodDays === 30
                                        ? 'bg-blue-500/30 text-blue-300'
                                        : 'text-slate-500 hover:text-slate-300'
                                        }`}
                                >
                                    30 Days
                                </button>
                            </div>

                            {hydrationLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="animate-spin text-blue-400" size={32} />
                                </div>
                            ) : (
                                <>
                                    {/* ═══════════════════════════════════════════
                                        TOP ROW: Headline Cards (2x2 Grid)
                                    ═══════════════════════════════════════════ */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Avg Daily Intake */}
                                        <div className="bg-[rgba(25,34,51,0.7)] backdrop-blur-md border border-white/10 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Droplets size={14} className="text-blue-400" />
                                                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Avg Intake</span>
                                            </div>
                                            <div className="text-white text-2xl font-bold">
                                                {hydrationPeriodStats.logsCount > 0
                                                    ? hydrationPeriodStats.avgIntake >= 1000
                                                        ? `${(hydrationPeriodStats.avgIntake / 1000).toFixed(1)}L`
                                                        : `${Math.round(hydrationPeriodStats.avgIntake)}ml`
                                                    : '--'}
                                            </div>
                                        </div>

                                        {/* Consistency Score */}
                                        <div className="bg-[rgba(25,34,51,0.7)] backdrop-blur-md border border-white/10 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Activity size={14} className="text-emerald-400" />
                                                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Consistency</span>
                                            </div>
                                            <div className="text-white text-2xl font-bold">
                                                {Math.round(hydrationConsistency.score)}
                                                <span className="text-slate-400 text-sm font-normal">%</span>
                                            </div>
                                        </div>

                                        {/* Current Streak */}
                                        <div className="bg-[rgba(25,34,51,0.7)] backdrop-blur-md border border-white/10 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Flame size={14} className="text-orange-400" />
                                                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Streak</span>
                                            </div>
                                            <div className="text-white text-2xl font-bold">
                                                {streakInfo.currentStreak}
                                                <span className="text-slate-400 text-sm font-normal"> days</span>
                                            </div>
                                        </div>

                                        {/* Peak Hour */}
                                        <div className="bg-[rgba(25,34,51,0.7)] backdrop-blur-md border border-white/10 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Clock size={14} className="text-amber-400" />
                                                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Peak Hour</span>
                                            </div>
                                            <div className="text-white text-2xl font-bold">
                                                {hourlyDistribution.peakHour === 0 ? '12am'
                                                    : hourlyDistribution.peakHour === 12 ? '12pm'
                                                        : hourlyDistribution.peakHour > 12
                                                            ? `${hourlyDistribution.peakHour - 12}pm`
                                                            : `${hourlyDistribution.peakHour}am`}
                                            </div>
                                        </div>
                                    </div>

                                    {/* ═══════════════════════════════════════════
                                        DAILY TREND CHART
                                    ═══════════════════════════════════════════ */}
                                    <div className="bg-[rgba(25,34,51,0.7)] backdrop-blur-md border border-white/10 rounded-2xl p-4 border-l-4 border-l-blue-500">
                                        <h3 className="text-white font-bold text-sm mb-1">Daily Intake Trend</h3>
                                        <p className="text-slate-400 text-xs mb-4">Bars reaching goal line = target hit</p>
                                        <HydrationTrendChart data={trendData} dailyGoal={dailyGoal} />
                                    </div>

                                    {/* ═══════════════════════════════════════════
                                        HOURLY DISTRIBUTION
                                    ═══════════════════════════════════════════ */}
                                    <div className="bg-[rgba(25,34,51,0.7)] backdrop-blur-md border border-white/10 rounded-2xl p-4">
                                        <h3 className="text-white font-bold text-sm mb-1">When Do You Drink?</h3>
                                        <p className="text-slate-400 text-xs mb-4">Your hydration patterns throughout the day</p>
                                        <HydrationHourlyChart data={hourlyDistribution} />
                                    </div>

                                    {/* ═══════════════════════════════════════════
                                        ADVANCED INSIGHTS
                                    ═══════════════════════════════════════════ */}
                                    <div className="bg-[rgba(25,34,51,0.7)] backdrop-blur-md border border-white/10 rounded-2xl p-4">
                                        <h3 className="text-white font-bold text-sm mb-4">Advanced Insights</h3>

                                        {/* Weekday vs Weekend */}
                                        <div className="border-b border-white/5 pb-3 mb-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-slate-300 text-sm">Weekend vs Weekday</span>
                                                <span className={`font-bold text-sm ${Math.abs(hydrationWeekdayWeekend.difference) > 300 ? 'text-amber-400' : 'text-green-400'}`}>
                                                    {hydrationWeekdayWeekend.weekendCount > 0 && hydrationWeekdayWeekend.weekdayCount > 0
                                                        ? `${hydrationWeekdayWeekend.difference > 0 ? '+' : ''}${Math.round(hydrationWeekdayWeekend.difference)}ml`
                                                        : '--'}
                                                </span>
                                            </div>
                                            <p className="text-slate-500 text-xs">
                                                {hydrationWeekdayWeekend.difference > 300
                                                    ? 'You drink more on weekends'
                                                    : hydrationWeekdayWeekend.difference < -300
                                                        ? 'You drink less on weekends - try to stay consistent!'
                                                        : 'Your hydration is consistent across the week'}
                                            </p>
                                        </div>

                                        {/* Best & Worst Day */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                                                <p className="text-xs text-slate-400 mb-1">Best Day</p>
                                                <p className="text-lg font-bold text-green-400">{dayOfWeekStats.best?.name || '--'}</p>
                                                <p className="text-xs text-slate-500">
                                                    {dayOfWeekStats.best?.avg
                                                        ? dayOfWeekStats.best.avg >= 1000
                                                            ? `~${(dayOfWeekStats.best.avg / 1000).toFixed(1)}L avg`
                                                            : `~${Math.round(dayOfWeekStats.best.avg)}ml avg`
                                                        : ''}
                                                </p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                                <p className="text-xs text-slate-400 mb-1">Needs Work</p>
                                                <p className="text-lg font-bold text-red-400">{dayOfWeekStats.worst?.name || '--'}</p>
                                                <p className="text-xs text-slate-500">
                                                    {dayOfWeekStats.worst?.avg
                                                        ? dayOfWeekStats.worst.avg >= 1000
                                                            ? `~${(dayOfWeekStats.worst.avg / 1000).toFixed(1)}L avg`
                                                            : `~${Math.round(dayOfWeekStats.worst.avg)}ml avg`
                                                        : ''}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ═══════════════════════════════════════════
                                        DRINK DURATION BY CONTAINER
                                    ═══════════════════════════════════════════ */}
                                    {drinkDurations.length > 0 && (
                                        <div className="bg-[rgba(25,34,51,0.7)] backdrop-blur-md border border-white/10 rounded-2xl p-4">
                                            <h3 className="text-white font-bold text-sm mb-1">Drink Speeds</h3>
                                            <p className="text-slate-400 text-xs mb-4">Average time to finish by container</p>

                                            <div className="grid grid-cols-1 gap-3">
                                                {drinkDurations.map((item) => (
                                                    <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                                        <div className="size-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                                                            <Timer size={16} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs text-slate-400 truncate mb-0.5">{item.label}</p>
                                                            <div className="flex items-baseline gap-1.5">
                                                                <span className="text-lg font-bold text-white">
                                                                    {item.avgMinutes >= 60
                                                                        ? `${Math.floor(item.avgMinutes / 60)}h ${item.avgMinutes % 60}m`
                                                                        : `${item.avgMinutes}m`}
                                                                </span>
                                                                <span className="text-[10px] text-slate-500">
                                                                    ({item.count})
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
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
                                        <button
                                            onClick={() => setExplanation(metricExplanations.quality)}
                                            className="bg-[rgba(25,34,51,0.7)] backdrop-blur-md border border-white/10 rounded-xl p-4 text-left transition-all hover:bg-white/5 disabled:opacity-50 active:scale-95 cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <TrendingUp size={14} className="text-purple-400" />
                                                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Avg Quality</span>
                                            </div>
                                            <div className="text-white text-2xl font-bold">
                                                {periodStats.logsCount > 0 ? `${Math.round(periodStats.avgQuality)}` : '--'}
                                                <span className="text-slate-400 text-sm font-normal">/100</span>
                                            </div>
                                        </button>

                                        {/* Avg Duration */}
                                        <button
                                            onClick={() => setExplanation(metricExplanations.duration)}
                                            className="bg-[rgba(25,34,51,0.7)] backdrop-blur-md border border-white/10 rounded-xl p-4 text-left transition-all hover:bg-white/5 disabled:opacity-50 active:scale-95 cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <Clock size={14} className="text-blue-400" />
                                                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Avg Duration</span>
                                            </div>
                                            <div className="text-white text-2xl font-bold">
                                                {periodStats.logsCount > 0 ? formatDuration(periodStats.avgDuration) : '--'}
                                            </div>
                                        </button>

                                        {/* Sleep Debt */}
                                        <button
                                            onClick={() => setExplanation(metricExplanations.debt)}
                                            className="bg-[rgba(25,34,51,0.7)] backdrop-blur-md border border-white/10 rounded-xl p-4 text-left transition-all hover:bg-white/5 disabled:opacity-50 active:scale-95 cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <AlertTriangle size={14} className={periodStats.totalSleepDebt > 0 ? 'text-red-400' : 'text-green-400'} />
                                                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Sleep Debt</span>
                                            </div>
                                            <div className={`text-2xl font-bold ${periodStats.totalSleepDebt > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                                {periodStats.logsCount > 0 ? formatDebt(periodStats.totalSleepDebt) : '--'}
                                            </div>
                                        </button>

                                        {/* Consistency Score */}
                                        <button
                                            onClick={() => setExplanation(metricExplanations.consistency)}
                                            className="bg-[rgba(25,34,51,0.7)] backdrop-blur-md border border-white/10 rounded-xl p-4 text-left transition-all hover:bg-white/5 disabled:opacity-50 active:scale-95 cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <Activity size={14} className="text-amber-400" />
                                                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Consistency</span>
                                            </div>
                                            <div className="text-white text-2xl font-bold">
                                                {Math.round(consistencyData.score)}
                                                <span className="text-slate-400 text-sm font-normal">%</span>
                                            </div>
                                        </button>
                                    </div>

                                    {/* ═══════════════════════════════════════════
                                        MIDDLE ROW: Consistency Tracker (Full Width)
                                    ═══════════════════════════════════════════ */}
                                    <div className="bg-[rgba(25,34,51,0.7)] backdrop-blur-md border border-white/10 rounded-2xl p-4 border-l-4 border-l-purple-500">
                                        <h3 className="text-white font-bold text-sm mb-1">Sleep Schedule Consistency</h3>
                                        <p className="text-slate-400 text-xs mb-4">Aligned bars = consistent routine. Scattered bars = "Social Jetlag"</p>
                                        <ConsistencyChart data={consistencyChartData} />
                                    </div>

                                    {/* Sleep Architecture - Full Width Row */}
                                    <div className="bg-[rgba(25,34,51,0.7)] backdrop-blur-md border border-white/10 rounded-2xl p-4">
                                        <h3 className="text-white font-bold text-sm mb-1">Sleep Architecture</h3>
                                        <p className="text-slate-400 text-xs mb-4">Detailed breakdown of time in bed</p>
                                        <SleepArchitectureChart data={architectureData} />
                                    </div>

                                    {/* Bedtime vs Quality Heatmap - Full Width Row */}
                                    <div className="bg-[rgba(25,34,51,0.7)] backdrop-blur-md border border-white/10 rounded-2xl p-4">
                                        <h3 className="text-white font-bold text-sm mb-1">Bedtime vs Quality</h3>
                                        <p className="text-slate-400 text-xs mb-4">When should you go to bed for best results?</p>
                                        <BedtimeQualityHeatmap data={bedtimeQualityData} />
                                    </div>

                                    {/* ═══════════════════════════════════════════
                                        ADDITIONAL CHARTS ROW
                                    ═══════════════════════════════════════════ */}
                                    <div className="bg-[rgba(25,34,51,0.7)] backdrop-blur-md border border-white/10 rounded-2xl p-4">
                                        <h3 className="text-white font-bold text-sm mb-1">Quality vs Duration</h3>
                                        <p className="text-slate-400 text-xs mb-4">Find your personal sleep sweet spot</p>
                                        <QualityVsDurationChart data={qualityDurationData} />
                                    </div>

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
