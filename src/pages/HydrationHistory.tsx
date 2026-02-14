import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Droplet, Loader2, X } from 'lucide-react'
import { useHydrationData } from '../hooks/useHydrationData'

interface DayGroup {
    date: Date
    total: number
    percentage: number
    logs: { id: string; amount: number; time: string; label: string; logged_at: string; completed_at: string | null }[]
}

interface MonthGroup {
    year: number
    month: number
    monthName: string
    total: number
    goal: number
    days: DayGroup[]
}

export default function HydrationHistory() {
    const navigate = useNavigate()
    const { allLogs, dailyGoal, loading } = useHydrationData()
    const [selectedDay, setSelectedDay] = useState<DayGroup | null>(null)

    // Process logs into month groups
    const getHistory = (): MonthGroup[] => {
        if (allLogs.length === 0) return []

        // Group by Year -> Month -> Day
        const groups: { [key: string]: DayGroup } = {}

        allLogs.forEach(log => {
            const date = new Date(log.logged_at)
            const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`

            if (!groups[key]) {
                groups[key] = {
                    date: date,
                    total: 0,
                    percentage: 0,
                    logs: []
                }
            }

            groups[key].logs.push(log)
            groups[key].total += log.amount
        })

        // Convert day groups to array and calculate percentages
        const dayGroupsArray = Object.values(groups).map(group => ({
            ...group,
            percentage: Math.min(Math.round((group.total / dailyGoal) * 100), 100)
        })).sort((a, b) => b.date.getTime() - a.date.getTime())

        // Group days into Months
        const monthGroups: { [key: string]: MonthGroup } = {}

        dayGroupsArray.forEach(day => {
            const year = day.date.getFullYear()
            const month = day.date.getMonth()
            const key = `${year}-${month}`

            if (!monthGroups[key]) {
                const monthName = day.date.toLocaleString('default', { month: 'long' })
                const daysInMonth = new Date(year, month + 1, 0).getDate()

                monthGroups[key] = {
                    year,
                    month,
                    monthName,
                    total: 0,
                    goal: dailyGoal * daysInMonth,
                    days: []
                }
            }

            monthGroups[key].days.push(day)
            monthGroups[key].total += day.total
        })

        // Sort by date descending
        return Object.values(monthGroups).sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year
            return b.month - a.month
        })
    }

    const history = getHistory()

    const glassCardClass = "backdrop-blur-[12px] bg-white/[0.03] border border-white/10"
    const neonGlowClass = "shadow-[0_0_15px_rgba(43,108,238,0.3)]"

    return (
        <div className="min-h-screen bg-[#101622] text-white font-[Manrope] antialiased flex flex-col items-center">
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-[430px] mx-auto bg-[#101622] shadow-2xl">

                {/* Header */}
                <header className="sticky top-0 z-50 bg-[#101622]/80 backdrop-blur-md flex items-center justify-between p-6 pt-8 border-b border-white/5">
                    <button
                        onClick={() => navigate(-1)}
                        className={`flex items-center justify-center size-10 rounded-xl ${glassCardClass} hover:bg-white/10 transition-colors`}
                    >
                        <ChevronLeft className="text-white" size={24} />
                    </button>
                    <h1 className="text-xl font-bold tracking-tight">History</h1>
                    <div className="size-10 flex items-center justify-center">
                        {loading && <Loader2 className="animate-spin text-primary" size={20} />}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto pb-24 px-6 space-y-8 mt-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64">
                            <Loader2 className="animate-spin text-primary" size={32} />
                            <p className="text-slate-400 mt-4">Loading history...</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 opacity-50">
                            <Droplet size={48} className="text-[#2b6cee]" />
                            <p>No history available yet.</p>
                        </div>
                    ) : (
                        history.map((monthGroup) => (
                            <div key={`${monthGroup.year}-${monthGroup.month}`} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Seasonal/Monthly Header */}
                                <div className="flex items-end justify-between mb-4 px-2">
                                    <div>
                                        <p className="text-xs font-bold text-[#2b6cee] uppercase tracking-widest mb-1">{monthGroup.year}</p>
                                        <h2 className="text-2xl font-bold">{monthGroup.monthName}</h2>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400 font-medium">Monthly Goal</p>
                                        <p className="text-sm font-bold opacity-80">
                                            {Math.round(monthGroup.total / 1000)}L <span className="text-gray-500 font-normal">/ {Math.round(monthGroup.goal / 1000)}L</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Days List */}
                                <div className="space-y-3">
                                    {monthGroup.days.map((day) => {
                                        const isToday = new Date().toDateString() === day.date.toDateString()

                                        return (
                                            <div
                                                key={day.date.toISOString()}
                                                onClick={() => setSelectedDay(day)}
                                                className={`${glassCardClass} rounded-xl p-4 flex items-center gap-4 group hover:bg-white/5 transition-colors cursor-pointer active:scale-[0.98] duration-200`}
                                            >
                                                {/* Date Column */}
                                                <div className="w-16 flex flex-col items-center justify-center border-r border-white/10 pr-4">
                                                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                                                        {day.date.toLocaleString('default', { weekday: 'short' })}
                                                    </span>
                                                    <span className={`text-xl font-bold ${isToday ? 'text-[#2b6cee]' : 'text-white'}`}>
                                                        {day.date.getDate()}
                                                    </span>
                                                </div>

                                                {/* Progress Bar Column */}
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-gray-400 font-medium">Daily Progress</span>
                                                        <span className="font-bold">{day.percentage}%</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-[#101622] rounded-full overflow-hidden border border-white/5">
                                                        <div
                                                            className={`h-full rounded-full ${day.percentage >= 100 ? `bg-[#2b6cee] ${neonGlowClass}` : 'bg-[#2b6cee]'}`}
                                                            style={{ width: `${day.percentage}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Total Column */}
                                                <div className="pl-2 min-w-[60px] text-right">
                                                    <span className="text-sm font-bold text-[#2b6cee] block">
                                                        {day.total}
                                                    </span>
                                                    <span className="text-[10px] text-gray-500 font-bold uppercase">
                                                        ml
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Day Detail Modal */}
            {selectedDay && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#101622] border border-white/10 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">

                        {/* Modal Header */}
                        <div className="p-5 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#101622] z-10">
                            <div>
                                <h3 className="text-lg font-bold">
                                    {selectedDay.date.toLocaleDateString('default', { month: 'long', day: 'numeric' })}
                                </h3>
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                                    {selectedDay.total}ml Total • {selectedDay.percentage}% Goal
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedDay(null)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>

                        {/* Logs List */}
                        <div className="p-5 overflow-y-auto space-y-3">
                            {selectedDay.logs.length === 0 ? (
                                <p className="text-gray-500 text-center py-4 text-sm">No logs recorded.</p>
                            ) : (
                                selectedDay.logs.sort((a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()).map((log) => (
                                    <div key={log.id} className={`${glassCardClass} rounded-xl p-4 flex items-center justify-between`}>
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-lg bg-[#2b6cee]/10 flex items-center justify-center">
                                                <Droplet className="text-[#2b6cee]" size={20} fill="currentColor" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">{log.label || 'Water'}</p>
                                                <p className="text-xs text-gray-500">
                                                    {(() => {
                                                        const startTime = new Date(log.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

                                                        // If completed_at exists and is different from logged_at (active drink finished)
                                                        if (log.completed_at && log.completed_at !== log.logged_at) {
                                                            const endTime = new Date(log.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                            if (startTime !== endTime) {
                                                                return `${startTime} - ${endTime}`
                                                            }
                                                        }
                                                        return startTime
                                                    })()}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="font-bold text-[#2b6cee]">{log.amount}ml</p>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-5 pt-2 border-t border-white/5 bg-[#101622]">
                            <button
                                onClick={() => setSelectedDay(null)}
                                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 font-bold transition-colors text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
