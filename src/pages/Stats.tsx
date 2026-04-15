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
    const [periodDays, setPeriodDays] = useState<number>(7)

    const {
        logs: sleepLogs,
        loading: sleepLoading,
        calculateStats,
        targetHours,
        targetBedtime,
        targetWakeTime,
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
    const weekdayWeekend = getWeekdayVsWeekend(periodDays)
    const efficiencyTrend = getEfficiencyTrend(periodDays)
    const architectureData = getSleepArchitectureData(periodDays)
    const consistencyChartData = getConsistencyChartData(periodDays)
    const qualityDurationData = getQualityVsDurationData(periodDays)
    const bedtimeQualityData = getBedtimeQualityData(periodDays)

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

    const [explanation, setExplanation] = useState<{
        title: string;
        formula: string;
        description: string;
        variables?: { name: string; definition: string }[]
    } | null>(null)

    // Schedule detail modal state
    const [scheduleDetail, setScheduleDetail] = useState<{
        title: string;
        value: string;
        description: string;
        reasoning: string[];
        dataPoints?: { label: string; value: string; highlight?: boolean }[];
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
            title: "Acute 14-Day Sleep Debt",
            formula: "∑ max(0, Biological Baseline - Actual Hours) over 14 days",
            description: "The accumulated biological need for sleep relative to your historical optimum, strictly capped at a 14-day rolling window.",
            variables: [
                { name: "Biological Baseline", definition: "Your data-driven optimal sleep duration (Default: 8 hours)." },
                { name: "Actual Hours", definition: "Net sleep duration recorded for the night." }
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
                            <div className="flex items-center justify-end gap-1.5 mb-2">
                                {[
                                    { value: 7, label: '7D' },
                                    { value: 30, label: '30D' },
                                    { value: 90, label: '90D' },
                                    { value: 0, label: 'All' },
                                ].map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setPeriodDays(opt.value)}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${periodDays === opt.value
                                            ? 'bg-purple-500/30 text-purple-300'
                                            : 'text-slate-500 hover:text-slate-300'
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
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
                                                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">14-Day Debt</span>
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
                                        YOUR OPTIMISED SLEEP SCHEDULE
                                    ═══════════════════════════════════════════ */}
                                    {sleepLogs.length >= 5 && (() => {
                                        const allStats = sleepLogs.map(log => ({ log, stats: calculateStats(log) }))

                                        // --- Optimal bedtime ---
                                        const bedtimeBuckets = new Map<number, { totalQuality: number, count: number, totalEfficiency: number }>()
                                        allStats.forEach(({ log, stats }) => {
                                            const [h] = log.lightsOut.split(':').map(Number)
                                            if (!bedtimeBuckets.has(h)) bedtimeBuckets.set(h, { totalQuality: 0, count: 0, totalEfficiency: 0 })
                                            const b = bedtimeBuckets.get(h)!
                                            b.totalQuality += log.subjectiveQuality
                                            b.totalEfficiency += stats.sleepEfficiency
                                            b.count++
                                        })
                                        const globalAvgQ = allStats.reduce((s, a) => s + a.log.subjectiveQuality, 0) / allStats.length
                                        const C = 3
                                        let bestBedtimeHour = 23, bestBedtimeScore = 0
                                        const bedtimeRanking: { hour: number, rawAvg: number, adjScore: number, count: number, avgEff: number }[] = []
                                        bedtimeBuckets.forEach((bucket, hour) => {
                                            const rawAvg = bucket.totalQuality / bucket.count
                                            const adjQ = (bucket.count * rawAvg + C * globalAvgQ) / (bucket.count + C)
                                            const avgEff = bucket.totalEfficiency / bucket.count
                                            const score = adjQ * 6 + (avgEff / 100) * 40
                                            bedtimeRanking.push({ hour, rawAvg, adjScore: score, count: bucket.count, avgEff })
                                            if (score > bestBedtimeScore && bucket.count >= 2) { bestBedtimeScore = score; bestBedtimeHour = hour }
                                        })
                                        bedtimeRanking.sort((a, b) => b.adjScore - a.adjScore)

                                        // --- Optimal duration ---
                                        const durationBuckets = new Map<number, { totalQuality: number, count: number, totalEfficiency: number }>()
                                        allStats.forEach(({ log, stats }) => {
                                            const dH = Math.floor(stats.totalSleepTime / 60)
                                            if (!durationBuckets.has(dH)) durationBuckets.set(dH, { totalQuality: 0, count: 0, totalEfficiency: 0 })
                                            const b = durationBuckets.get(dH)!
                                            b.totalQuality += log.subjectiveQuality
                                            b.totalEfficiency += stats.sleepEfficiency
                                            b.count++
                                        })
                                        let optDurH = Math.round(targetHours), optDurScore = 0
                                        const durationRanking: { hour: number, rawAvg: number, adjAvg: number, count: number, avgEff: number }[] = []
                                        durationBuckets.forEach((bucket, hour) => {
                                            const rawAvg = bucket.totalQuality / bucket.count
                                            const adjQ = (bucket.count * rawAvg + C * globalAvgQ) / (bucket.count + C)
                                            const avgEff = bucket.totalEfficiency / bucket.count
                                            durationRanking.push({ hour, rawAvg, adjAvg: adjQ, count: bucket.count, avgEff })
                                            if (adjQ > optDurScore && bucket.count >= 2) { optDurScore = adjQ; optDurH = hour }
                                        })
                                        durationRanking.sort((a, b) => b.adjAvg - a.adjAvg)

                                        const avgLatency = Math.round(allStats.reduce((s, a) => s + a.log.latency, 0) / allStats.length)
                                        const avgEfficiency = Math.round(allStats.reduce((s, a) => s + a.stats.sleepEfficiency, 0) / allStats.length)
                                        const idealBedMin = bestBedtimeHour * 60 + 30
                                        const idealWakeMin = idealBedMin + avgLatency + optDurH * 60
                                        const wakeH = Math.floor((idealWakeMin % (24 * 60)) / 60)
                                        const wakeM = idealWakeMin % 60

                                        const fmt12 = (h24: number, m: number) => {
                                            const p = h24 >= 12 ? 'PM' : 'AM'
                                            const h = h24 > 12 ? h24 - 12 : h24 === 0 ? 12 : h24
                                            return `${h}:${m.toString().padStart(2, '0')} ${p}`
                                        }
                                        const hrLabel = (h: number) => {
                                            const p = ((h % 24) + 24) % 24 >= 12 ? 'PM' : 'AM'
                                            const d = ((h % 24) + 24) % 24 > 12 ? ((h % 24) + 24) % 24 - 12 : ((h % 24) + 24) % 24 === 0 ? 12 : ((h % 24) + 24) % 24
                                            return `${d} ${p}`
                                        }

                                        // Tips
                                        const tips: { emoji: string, text: string }[] = []
                                        if (weekdayWeekend.difference > 60) tips.push({ emoji: '📅', text: `You oversleep ${Math.round(weekdayWeekend.difference)}min more on weekends. Try to keep within 30 min.` })
                                        if (grogginess.avgMinutes > 15) tips.push({ emoji: '🥱', text: `You linger ~${Math.round(grogginess.avgMinutes)} min in bed after waking. Try putting your alarm across the room.` })
                                        if (consistencyData.score < 70) tips.push({ emoji: '🎯', text: `Bedtime consistency is ${Math.round(consistencyData.score)}%. A steady schedule boosts quality significantly.` })
                                        if (avgLatency > 20) tips.push({ emoji: '🧘', text: `It takes ~${avgLatency} min to fall asleep. Wind-down rituals 30 min before bed can help.` })
                                        if (avgEfficiency < 85) tips.push({ emoji: '🛏️', text: `Efficiency is ${avgEfficiency}%. Reserve your bed for sleep only — no screens.` })

                                        // Detail builders
                                        const bedtimeDetail = {
                                            title: '🌙 Ideal Bedtime',
                                            value: fmt12(bestBedtimeHour, 30),
                                            description: `Going to bed around ${hrLabel(bestBedtimeHour)} consistently gives you the best combination of sleep quality and efficiency.`,
                                            reasoning: [
                                                `Analyzed ${sleepLogs.length} nights across ${bedtimeBuckets.size} different bedtime hours.`,
                                                `Used a Bayesian-adjusted score (quality × 60% + efficiency × 40%) to prevent hours with few entries from unfairly winning.`,
                                                `${hrLabel(bestBedtimeHour)} scored highest with ${bedtimeBuckets.get(bestBedtimeHour)?.count ?? 0} nights logged.`
                                            ],
                                            dataPoints: bedtimeRanking.slice(0, 5).map(r => ({
                                                label: `${hrLabel(r.hour)} (${r.count}×)`,
                                                value: `Quality ${r.rawAvg.toFixed(1)}/10 · Eff ${Math.round(r.avgEff)}%`,
                                                highlight: r.hour === bestBedtimeHour
                                            }))
                                        }
                                        const wakeDetail = {
                                            title: '☀️ Ideal Wake Time',
                                            value: fmt12(wakeH, wakeM),
                                            description: `This wake time is calculated from your ideal bedtime + your average sleep latency + your optimal sleep duration.`,
                                            reasoning: [
                                                `Ideal bedtime: ${fmt12(bestBedtimeHour, 30)}`,
                                                `+ Avg time to fall asleep: ~${avgLatency} min`,
                                                `+ Optimal sleep duration: ${optDurH}–${optDurH + 1} hours`,
                                                `= Ideal wake: ${fmt12(wakeH, wakeM)}`,
                                                `Your current target is ${targetWakeTime}.`
                                            ]
                                        }
                                        const durationDetail = {
                                            title: '⏱️ Optimal Duration',
                                            value: `${optDurH}–${optDurH + 1}h`,
                                            description: `Sleeping ${optDurH}–${optDurH + 1} hours gives you the highest quality ratings based on your logged data.`,
                                            reasoning: [
                                                `Bucketed all ${sleepLogs.length} nights by duration hour.`,
                                                `Applied Bayesian smoothing to prevent small samples from skewing results.`,
                                                `Your target is ${targetHours}h — ${Math.abs(optDurH - targetHours) < 1 ? 'very close to your optimal!' : optDurH > targetHours ? 'you may benefit from sleeping a bit more.' : 'you might be able to trim time slightly.'}`
                                            ],
                                            dataPoints: durationRanking.slice(0, 5).map(r => ({
                                                label: `${r.hour}–${r.hour + 1}h (${r.count}×)`,
                                                value: `Quality ${r.rawAvg.toFixed(1)}/10 · Eff ${Math.round(r.avgEff)}%`,
                                                highlight: r.hour === optDurH
                                            }))
                                        }
                                        const latencyDetail = {
                                            title: '😴 Fall Asleep Time',
                                            value: `~${avgLatency} min`,
                                            description: `On average, it takes you ${avgLatency} minutes to fall asleep after lights out.`,
                                            reasoning: [
                                                `Averaged sleep latency across all ${sleepLogs.length} logs.`,
                                                avgLatency <= 15 ? `This is excellent — under 15 min is considered ideal.` : avgLatency <= 25 ? `This is normal, but could be improved with a consistent wind-down routine.` : `This is high. Consider no screens 30 min before bed, and keep the room cool and dark.`,
                                                `Latency is factored into the wake time calculation to keep the schedule realistic.`
                                            ]
                                        }

                                        return (
                                            <div className="bg-gradient-to-br from-[rgba(25,34,51,0.9)] to-[rgba(40,20,60,0.7)] backdrop-blur-md border border-purple-500/20 rounded-2xl p-5 shadow-[0_0_30px_rgba(147,51,234,0.1)]">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-lg">✨</span>
                                                    <h3 className="text-white font-bold text-sm">Your Optimised Sleep Schedule</h3>
                                                </div>
                                                <p className="text-slate-400 text-[11px] mb-5">Based on {sleepLogs.length} nights — tap any card for details.</p>

                                                {/* Hero cards — clickable */}
                                                <div className="grid grid-cols-2 gap-3 mb-4">
                                                    <button onClick={() => setScheduleDetail(bedtimeDetail)} className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-center transition-all active:scale-95 hover:bg-purple-500/20">
                                                        <span className="text-lg">🌙</span>
                                                        <p className="text-slate-400 text-[9px] uppercase font-bold tracking-wider mt-1 mb-1">Ideal Bedtime</p>
                                                        <p className="text-purple-300 text-lg font-bold">{fmt12(bestBedtimeHour, 30)}</p>
                                                        <p className="text-purple-400/50 text-[9px] mt-1">Tap for details →</p>
                                                    </button>
                                                    <button onClick={() => setScheduleDetail(wakeDetail)} className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center transition-all active:scale-95 hover:bg-amber-500/20">
                                                        <span className="text-lg">☀️</span>
                                                        <p className="text-slate-400 text-[9px] uppercase font-bold tracking-wider mt-1 mb-1">Ideal Wake Time</p>
                                                        <p className="text-amber-300 text-lg font-bold">{fmt12(wakeH, wakeM)}</p>
                                                        <p className="text-amber-400/50 text-[9px] mt-1">Tap for details →</p>
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-3 gap-2 mb-5">
                                                    <button onClick={() => setScheduleDetail(durationDetail)} className="bg-white/[0.04] rounded-xl p-2.5 text-center transition-all active:scale-95 hover:bg-white/[0.08]">
                                                        <p className="text-slate-500 text-[9px] uppercase font-bold tracking-wider mb-1">Duration</p>
                                                        <p className="text-white text-sm font-bold">{optDurH}–{optDurH + 1}h</p>
                                                    </button>
                                                    <button onClick={() => setScheduleDetail(latencyDetail)} className="bg-white/[0.04] rounded-xl p-2.5 text-center transition-all active:scale-95 hover:bg-white/[0.08]">
                                                        <p className="text-slate-500 text-[9px] uppercase font-bold tracking-wider mb-1">Fall Asleep</p>
                                                        <p className="text-white text-sm font-bold">~{avgLatency}min</p>
                                                    </button>
                                                    <div className="bg-white/[0.04] rounded-xl p-2.5 text-center">
                                                        <p className="text-slate-500 text-[9px] uppercase font-bold tracking-wider mb-1">Your Target</p>
                                                        <p className="text-white text-sm font-bold">{targetHours}h</p>
                                                    </div>
                                                </div>

                                                {/* Target comparison */}
                                                <div className="bg-white/[0.03] rounded-xl p-3 mb-4">
                                                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-2">vs Your Targets</p>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-slate-500 text-xs">Bedtime</span>
                                                            <span className="text-slate-300 text-xs font-medium">{targetBedtime} → <span className="text-purple-400 font-bold">{fmt12(bestBedtimeHour, 30)}</span></span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-slate-500 text-xs">Wake</span>
                                                            <span className="text-slate-300 text-xs font-medium">{targetWakeTime} → <span className="text-amber-400 font-bold">{fmt12(wakeH, wakeM)}</span></span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-slate-500 text-xs">Duration</span>
                                                            <span className="text-slate-300 text-xs font-medium">{targetHours}h → <span className="text-green-400 font-bold">{optDurH}–{optDurH + 1}h</span></span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Tips */}
                                                {tips.length > 0 && (
                                                    <div>
                                                        <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-2.5">Personalised Tips</p>
                                                        <div className="space-y-2">
                                                            {tips.map((tip, i) => (
                                                                <div key={i} className="flex items-start gap-2 bg-white/[0.03] rounded-lg px-3 py-2">
                                                                    <span className="text-sm mt-0.5 shrink-0">{tip.emoji}</span>
                                                                    <p className="text-slate-300 text-[11px] leading-relaxed">{tip.text}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })()}

                                    {/* Schedule Detail Modal */}
                                    {scheduleDetail && (
                                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setScheduleDetail(null)}>
                                            <div className="bg-[#101622] border border-purple-500/20 w-full max-w-sm rounded-2xl p-6 shadow-[0_0_40px_rgba(147,51,234,0.15)] animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[85vh]" onClick={e => e.stopPropagation()}>
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-lg font-bold text-white">{scheduleDetail.title}</h3>
                                                    <button onClick={() => setScheduleDetail(null)} className="text-slate-500 hover:text-white text-xl leading-none">×</button>
                                                </div>

                                                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 text-center mb-4">
                                                    <p className="text-purple-300 text-2xl font-bold">{scheduleDetail.value}</p>
                                                </div>

                                                <p className="text-slate-300 text-sm leading-relaxed mb-4">{scheduleDetail.description}</p>

                                                <div className="mb-4">
                                                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-2">How We Calculated This</p>
                                                    <div className="space-y-2">
                                                        {scheduleDetail.reasoning.map((r, i) => (
                                                            <div key={i} className="flex items-start gap-2">
                                                                <span className="text-purple-400 text-xs mt-0.5 shrink-0">•</span>
                                                                <p className="text-slate-400 text-xs leading-relaxed">{r}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {scheduleDetail.dataPoints && scheduleDetail.dataPoints.length > 0 && (
                                                    <div>
                                                        <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-2">Ranking</p>
                                                        <div className="space-y-1.5">
                                                            {scheduleDetail.dataPoints.map((dp, i) => (
                                                                <div key={i} className={`flex items-center justify-between py-1.5 px-3 rounded-lg ${dp.highlight ? 'bg-purple-500/15 border border-purple-500/20' : 'bg-white/[0.03]'}`}>
                                                                    <div className="flex items-center gap-2">
                                                                        {dp.highlight && <span className="text-[10px]">⭐</span>}
                                                                        <span className={`text-xs font-medium ${dp.highlight ? 'text-purple-300' : 'text-slate-400'}`}>{dp.label}</span>
                                                                    </div>
                                                                    <span className={`text-[11px] font-medium ${dp.highlight ? 'text-purple-300' : 'text-slate-500'}`}>{dp.value}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

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
