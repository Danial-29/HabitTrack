import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useHydrationData } from '../hooks/useHydrationData'

export default function HydrationHeatmap() {
    const navigate = useNavigate()
    const { allLogs, dailyGoal } = useHydrationData()

    const glassCardClass = "bg-[rgba(25,34,51,0.7)] backdrop-blur-xl border border-white/10"

    // Generate last 12 months
    const getMonths = () => {
        const months = []
        const now = new Date()
        for (let i = 0; i < 12; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
            months.push(date)
        }
        return months
    }

    const months = getMonths()

    // Helper to get days in a month
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const days = new Date(year, month + 1, 0).getDate()
        const result = []
        for (let i = 1; i <= days; i++) {
            result.push(new Date(year, month, i))
        }
        return result
    }

    // Process logs into a map for easy lookup
    const logsMap = new Map<string, number>()
    allLogs.forEach(log => {
        // Use logged_at or completed_at? completed_at is strictly for history, but logged_at works for date keying
        const dateKey = new Date(log.logged_at).toDateString()
        logsMap.set(dateKey, (logsMap.get(dateKey) || 0) + log.amount)
    })

    return (
        <div className="min-h-screen bg-[#101622] text-white font-[Manrope] p-6 flex flex-col items-center">
            <div className="w-full max-w-md flex flex-col h-full">

                {/* Header */}
                <header className="flex items-center gap-4 mb-8 sticky top-0 bg-[#101622]/90 backdrop-blur-md z-20 py-4 -mx-6 px-6 border-b border-white/5">
                    <button
                        onClick={() => navigate(-1)}
                        className={`size-10 flex items-center justify-center rounded-xl ${glassCardClass} hover:bg-white/10 transition-colors`}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Hydration History</h1>
                        <p className="text-xs text-slate-400">Past 12 Months</p>
                    </div>
                </header>

                <div className="space-y-8 pb-32">
                    {months.map((monthDate, mIdx) => {
                        const days = getDaysInMonth(monthDate)
                        const monthName = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

                        // Calculate padding for first day of month (0 = Sunday, etc)
                        const firstDayOfWeek = days[0].getDay()
                        const paddingDays = Array(firstDayOfWeek).fill(null)

                        return (
                            <div key={mIdx} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${mIdx * 50}ms` }}>
                                <h3 className="text-lg font-bold mb-3 pl-1 text-slate-200 sticky top-24 bg-[#101622]/95 py-2 z-10 w-fit pr-4 rounded-r-xl border-y border-r border-white/5 backdrop-blur-md">{monthName}</h3>

                                <div className={`p-4 rounded-3xl ${glassCardClass}`}>
                                    {/* Weekday Labels */}
                                    <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                                            <span key={i} className="text-[10px] uppercase font-bold text-slate-500">{day}</span>
                                        ))}
                                    </div>

                                    {/* Calendar Grid */}
                                    <div className="grid grid-cols-7 gap-1">
                                        {paddingDays.map((_, i) => (
                                            <div key={`pad-${i}`} />
                                        ))}

                                        {days.map((dayDate, dIdx) => {
                                            const dateKey = dayDate.toDateString()
                                            const amount = logsMap.get(dateKey) || 0
                                            const percentage = (amount / dailyGoal) * 100

                                            let bgClass = 'bg-white/5'
                                            let textClass = 'text-slate-500'
                                            let shadowClass = ''

                                            if (amount > 0) {
                                                textClass = 'text-white'
                                                if (percentage >= 100) {
                                                    bgClass = 'bg-blue-500'
                                                    shadowClass = 'shadow-[0_0_10px_rgba(59,130,246,0.5)] z-10 relative'
                                                } else if (percentage >= 50) {
                                                    bgClass = 'bg-blue-500/50'
                                                } else {
                                                    bgClass = 'bg-blue-500/20'
                                                }
                                            }

                                            return (
                                                <div
                                                    key={dIdx}
                                                    className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold transition-all hover:scale-110 relative group ${bgClass} ${textClass} ${shadowClass}`}
                                                >
                                                    {dayDate.getDate()}

                                                    {/* Tooltip */}
                                                    {amount > 0 && (
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-slate-900 border border-white/10 text-white text-[10px] rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                                                            {(amount / 1000).toFixed(1)}L
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
