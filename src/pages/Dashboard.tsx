import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Droplets, Moon, Grid, BarChart2, Settings, Bell, Loader2 } from 'lucide-react'
import { useSleepData } from '../hooks/useSleepData'
import { useHydrationData } from '../hooks/useHydrationData'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
    const { user } = useAuth()

    // --- Hydration Data (from Supabase) ---
    const {
        todayIntake,
        yesterdayIntake,
        dailyGoal,
        loading: hydrationLoading
    } = useHydrationData()

    const waterProgress = Math.min(100, (todayIntake / dailyGoal) * 100)

    // --- Sleep Data (from Supabase) ---
    const { logs: sleepLogs, latestStats, calculateStats, loading: sleepLoading } = useSleepData()

    // Get latest sleep log details
    const latestLog = sleepLogs.length > 0 ? sleepLogs[0] : null
    const bedTime = latestLog?.lightsOut || '--:--'
    const wakeTime = latestLog?.wakeUp || '--:--'
    const sleepQuality = latestStats ? Math.round(latestStats.sleepQualityScore) : null
    const sleepDuration = latestStats ? `${Math.floor(latestStats.totalSleepTime / 60)}h ${latestStats.totalSleepTime % 60}m` : '--'

    // Yesterday's sleep
    const yesterdayLog = sleepLogs.length > 1 ? sleepLogs[1] : null
    const yesterdaySleepStats = yesterdayLog ? calculateStats(yesterdayLog) : null
    const yesterdaySleep = yesterdaySleepStats ? `${Math.floor(yesterdaySleepStats.totalSleepTime / 60)}h ${yesterdaySleepStats.totalSleepTime % 60}m` : '--'

    // --- Notification Logic ---
    const [showNotifications, setShowNotifications] = useState(false)
    const notifications = [
        { id: 1, text: "Time to drink water!", time: "10m ago" },
        { id: 2, text: "Bedtime is approaching.", time: "1h ago" },
        { id: 3, text: "Great streak! Keep it up!", time: "1d ago" }
    ]

    // Get user initials for avatar
    const userInitials = user?.email?.slice(0, 2).toUpperCase() || 'U'

    // Loading state
    const isLoading = hydrationLoading || sleepLoading

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white antialiased min-h-screen flex flex-col items-center">
            <div className="relative flex min-h-screen w-full flex-col bg-[#101622] overflow-x-hidden max-w-md shadow-2xl bg-[radial-gradient(at_0%_0%,rgba(43,108,238,0.15)_0px,transparent_50%),radial-gradient(at_100%_100%,rgba(147,51,234,0.1)_0px,transparent_50%)]">

                {/* Header */}
                <header className="flex items-center bg-transparent p-6 pb-2 justify-between z-50">
                    <div className="flex items-center gap-3">
                        <div className="relative size-12 shrink-0">
                            <div className="bg-slate-700/50 rounded-full size-12 flex items-center justify-center border-2 border-primary/30 text-slate-300">
                                <span className="font-bold text-lg">{userInitials}</span>
                            </div>
                            <div className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-[#101622]"></div>
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">Good Morning</h2>
                            <p className="text-slate-400 text-xs">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                        </div>
                    </div>
                    <div className="flex gap-2 relative">
                        <Link to="/settings" className="flex size-10 items-center justify-center rounded-full bg-[rgba(25,34,51,0.7)] backdrop-blur-md border border-white/10 text-white hover:bg-primary/20 transition-all">
                            <Settings size={20} />
                        </Link>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="flex size-10 items-center justify-center rounded-full bg-[rgba(25,34,51,0.7)] backdrop-blur-md border border-white/10 text-white hover:bg-primary/20 transition-all relative"
                        >
                            <Bell size={20} />
                            <div className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-[#101622]"></div>
                        </button>

                        {/* Notification Dropdown */}
                        {showNotifications && (
                            <div className="absolute top-12 right-0 w-64 bg-[rgba(25,34,51,0.95)] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
                                <div className="p-4 border-b border-white/10 flex justify-between items-center">
                                    <h3 className="text-white font-bold text-sm">Notifications</h3>
                                    <span className="text-xs text-primary font-bold">Mark all read</span>
                                </div>
                                <div className="flex flex-col max-h-64 overflow-y-auto">
                                    {notifications.map(notif => (
                                        <div key={notif.id} className="p-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                                            <p className="text-sm text-white font-medium">{notif.text}</p>
                                            <p className="text-[10px] text-slate-400 mt-1">{notif.time}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {/* Loading Overlay */}
                {isLoading && (
                    <div className="px-6 py-2">
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <Loader2 className="animate-spin" size={16} />
                            <span>Syncing data...</span>
                        </div>
                    </div>
                )}

                {/* Hydration Section */}
                <div className="px-6 py-4 w-full flex justify-center">
                    <Link to="/hydration" className="block w-full">
                        <div className="bg-[rgba(25,34,51,0.7)] backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden transition-transform active:scale-[0.98] duration-200 hover:bg-white/5 group border-l-4 border-l-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                            <div className="absolute -right-4 -top-4 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity">
                                <Droplets className="text-primary w-[120px] h-[120px]" />
                            </div>
                            <div className="flex justify-between items-start z-10">
                                <div className="flex items-center gap-3">
                                    <div className="size-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(43,108,238,0.3)]">
                                        <Droplets size={30} />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-lg">Hydration</h3>
                                        <p className="text-slate-400 text-sm">Target: {(dailyGoal / 1000).toFixed(1)}L</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-400 text-xs font-medium">Yesterday</p>
                                    <span className="text-white text-lg font-bold">{(yesterdayIntake / 1000).toFixed(1)}L</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 z-10">
                                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full transition-all duration-500"
                                        style={{ width: `${waterProgress}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <div className="text-slate-300 text-sm font-medium">{(todayIntake / 1000).toFixed(1)}L / {(dailyGoal / 1000).toFixed(1)}L ({Math.round(waterProgress)}%)</div>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Sleep Analysis Section */}
                <div className="px-6 py-2 w-full flex justify-center">
                    <Link to="/sleep" className="block w-full">
                        <div className="bg-[rgba(25,34,51,0.7)] backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col gap-4 border-l-4 border-l-purple-500 hover:bg-white/5 transition-colors group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                                        <Moon size={24} />
                                    </div>
                                    <h3 className="text-white font-bold">Sleep Tracker</h3>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 pointer-events-none">
                                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">Bedtime</p>
                                    <div className="text-white font-semibold text-lg">{bedTime}</div>
                                </div>
                                <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 pointer-events-none">
                                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">Wake Up</p>
                                    <div className="text-white font-semibold text-lg">{wakeTime}</div>
                                </div>
                            </div>

                            {/* Sleep Quality */}
                            <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 pointer-events-none flex justify-between items-center">
                                <div>
                                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">Sleep Quality</p>
                                    <div className="text-purple-400 font-bold text-sm">{sleepQuality !== null && sleepQuality >= 85 ? 'Restorative' : sleepQuality !== null && sleepQuality >= 70 ? 'Good' : sleepQuality !== null ? 'Needs Work' : '--'}</div>
                                </div>
                                <div className="text-white font-bold text-xl">{sleepQuality !== null ? `${sleepQuality}%` : '--'}</div>
                            </div>

                            <div className="flex items-center gap-2 py-1 justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-400 text-xs font-medium">Session:</span>
                                    <span className="text-white text-sm font-bold">{sleepDuration}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-400 text-xs font-medium">Yesterday:</span>
                                    <span className="text-white text-sm font-bold">{yesterdaySleep}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Premium Floating Navigation Dock */}
                <div className="fixed bottom-6 w-full max-w-md px-6 z-50">
                    <div className="bg-[rgba(16,22,34,0.85)] backdrop-blur-xl border border-white/10 rounded-full px-8 py-3 flex justify-around items-center shadow-2xl">
                        <button className="flex flex-col items-center gap-1 text-primary relative top-1">
                            <Grid size={24} strokeWidth={2.5} />
                            <div className="size-1 bg-primary rounded-full mt-1"></div>
                        </button>

                        <Link to="/stats" className="flex flex-col items-center gap-1 text-slate-500 hover:text-white transition-colors relative top-1">
                            <BarChart2 size={24} strokeWidth={2.5} />
                            <div className="size-1 bg-transparent rounded-full mt-1"></div>
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    )
}
