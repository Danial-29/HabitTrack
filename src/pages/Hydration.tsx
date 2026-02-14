import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    ChevronLeft,
    PlusCircle,
    Droplet,
    Trash2,
    Edit2,
    Loader2,
    Timer,
    Check,
    Grid
} from 'lucide-react'
import { useHydrationData } from '../hooks/useHydrationData'
import type { Preset } from '../hooks/useHydrationData'

export default function Hydration() {
    const navigate = useNavigate()
    const [isCustomModalOpen, setIsCustomModalOpen] = useState(false)
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false)
    const [customAmount, setCustomAmount] = useState('')
    const [customLabel, setCustomLabel] = useState('')
    const [saveAsPreset, setSaveAsPreset] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [presetToDelete, setPresetToDelete] = useState<number | null>(null)

    const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null)
    const [tempGoal, setTempGoal] = useState('')

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const isLongPress = useRef(false)

    // Use Supabase hook
    const {
        todayLogs,
        loading,
        dailyGoal,
        presets: quickButtons,
        todayIntake: intake,
        activeLogs,
        addLog,
        startDrink,
        finishDrink,
        deleteLog,
        updateDailyGoal,
        updatePresets,
        getLast7DaysStats,
    } = useHydrationData()

    // Calculate weekly stats
    const weeklyStats = getLast7DaysStats()
    const weeklyTotal = weeklyStats.reduce((sum, day) => sum + day.total, 0)
    const weeklyAverage = Math.round(weeklyTotal / 7)

    // Percentage clamped between 0 and 100
    const percentage = Math.min(Math.max(Math.round((intake / dailyGoal) * 100), 0), 100)

    // Wave animation calculation
    const waveTop = 110 - (percentage * 1.2)

    const addIntake = async (amount: number, label: string = "Quick Add") => {
        await addLog(amount, label)
    }

    const handlePressStart = (preset: Preset) => {
        isLongPress.current = false
        timerRef.current = setTimeout(() => {
            isLongPress.current = true
            handleDeletePreset(preset.amount)
        }, 600)
    }

    const handlePressEnd = async (preset: Preset) => {
        if (timerRef.current) {
            clearTimeout(timerRef.current)
        }
        if (!isLongPress.current) {
            // Open choice modal instead of immediate add
            setSelectedPreset(preset)
        }
        isLongPress.current = false
    }

    const handlePresetAction = async (action: 'add' | 'start') => {
        if (!selectedPreset) return

        const label = selectedPreset.label || `${selectedPreset.amount}ml Serving`

        if (action === 'add') {
            await addIntake(selectedPreset.amount, label)
        } else {
            await startDrink(selectedPreset.amount, label)
        }

        setSelectedPreset(null)
    }

    const handlePressCancel = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current)
        }
        isLongPress.current = false
    }

    const handleDeleteLog = async (id: string) => {
        await deleteLog(id)
    }

    const handleDeletePreset = (amount: number) => {
        setPresetToDelete(amount)
        setIsDeleteModalOpen(true)
    }

    const confirmDeletePreset = async () => {
        if (presetToDelete) {
            await updatePresets(quickButtons.filter(p => p.amount !== presetToDelete))
            setIsDeleteModalOpen(false)
            setPresetToDelete(null)
        }
    }

    const handleCustomSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const amount = Number(customAmount)
        if (amount > 0) {
            const label = customLabel.trim() || 'Custom Entry'
            await addIntake(amount, label)
            if (saveAsPreset && !quickButtons.some(p => p.amount === amount)) {
                const newPreset = { amount, label: customLabel.trim() || undefined }
                const newPresets = [...quickButtons, newPreset].sort((a, b) => a.amount - b.amount)
                await updatePresets(newPresets)
            }
            setCustomAmount('')
            setCustomLabel('')
            setSaveAsPreset(false)
            setIsCustomModalOpen(false)
        }
    }

    const handleStartCustomDrink = async () => {
        const amount = Number(customAmount)
        if (amount > 0) {
            const label = customLabel.trim() || 'Active Drink'
            await startDrink(amount, label)
            setCustomAmount('')
            setCustomLabel('')
            setSaveAsPreset(false)
            setIsCustomModalOpen(false)
        }
    }

    const handleGoalSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const target = Number(tempGoal)
        if (target > 0) {
            await updateDailyGoal(target)
            setIsGoalModalOpen(false)
        }
    }

    const openGoalModal = () => {
        setTempGoal(String(dailyGoal))
        setIsGoalModalOpen(true)
    }

    // Custom styling
    const glassCardClass = "backdrop-blur-[12px] bg-white/[0.03] border border-white/10"
    const neonGlowClass = "shadow-[0_0_15px_rgba(43,108,238,0.3)]"
    const buttonGlowClass = "shadow-[0_0_10px_rgba(43,108,238,0.2)]"

    return (
        <div className="min-h-screen bg-[#101622] text-white font-[Manrope] antialiased flex flex-col items-center">
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-[430px] mx-auto bg-[#101622] shadow-2xl">

                {/* Header */}
                <header className="flex items-center justify-between p-6 pt-8">
                    <button
                        onClick={() => navigate(-1)}
                        className={`flex items-center justify-center size-10 rounded-xl ${glassCardClass} hover:bg-white/10 transition-colors`}
                    >
                        <ChevronLeft className="text-white" size={24} />
                    </button>
                    <h1 className="text-xl font-bold tracking-tight">Hydration</h1>
                    <button
                        onClick={() => navigate('/hydration/heatmap')}
                        className={`flex items-center justify-center size-10 rounded-xl ${glassCardClass} hover:bg-white/10 transition-colors`}
                    >
                        <Grid size={20} className="text-white" />
                    </button>
                </header>

                {/* Weekly Progress Mini Chart */}
                <div className="px-6 mb-6">
                    <div className={`${glassCardClass} rounded-xl p-4`}>
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Weekly Average</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-2xl font-bold">{(weeklyAverage / 1000).toFixed(1)}L</p>
                                </div>
                            </div>
                            <div className="flex gap-1 items-end h-12">
                                {weeklyStats.map((day, i) => (
                                    <div
                                        key={i}
                                        className={`w-1.5 rounded-full ${i === 6 ? `bg-[#2b6cee] ${neonGlowClass}` : 'bg-[#2b6cee]/20'}`}
                                        style={{ height: `${Math.max(day.percentage, 5)}%` }}
                                    ></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Active Drinks Section */}
                {activeLogs && activeLogs.length > 0 && (
                    <div className="px-6 mb-6">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Active Drinks</h3>
                        <div className="space-y-3">
                            {activeLogs.map(log => (
                                <div key={log.id} className={`${glassCardClass} rounded-xl p-4 flex items-center justify-between border-l-4 border-l-[#2b6cee]`}>
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-lg bg-[#2b6cee]/10 flex items-center justify-center animate-pulse">
                                            <Timer className="text-[#2b6cee]" size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{log.label || 'Drinking...'}</p>
                                            <p className="text-xs text-[#2b6cee] font-medium">Started {log.time}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <p className="font-bold text-2xl">{log.amount}<span className="text-sm text-gray-500 ml-0.5">ml</span></p>
                                        <button
                                            onClick={() => finishDrink(log.id)}
                                            className="size-10 rounded-full bg-[#2b6cee] hover:bg-[#2b6cee]/90 flex items-center justify-center text-white transition-all active:scale-95 shadow-lg shadow-[#2b6cee]/20"
                                        >
                                            <Check size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteLog(log.id)}
                                            className="size-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 transition-all active:scale-95"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Central Water Visual */}
                <div className="flex flex-col items-center justify-center py-4 relative">
                    <div className={`relative w-[240px] h-[240px] bg-[rgba(43,108,238,0.1)] rounded-full overflow-hidden border-4 border-[rgba(43,108,238,0.3)] flex items-center justify-center ${neonGlowClass}`}>
                        {/* Dynamic Wave Fill */}
                        <div
                            className="absolute left-[-50%] w-[200%] h-[200%] bg-[#2b6cee] rounded-[38%] opacity-80 animate-[spin_6s_linear_infinite]"
                            style={{ top: `${waveTop}%` }}
                        ></div>
                        <div
                            className="absolute left-[-45%] w-[200%] h-[200%] bg-[#2b6cee] rounded-[35%] opacity-40 animate-[spin_10s_linear_infinite]"
                            style={{ top: `${waveTop - 5}%` }}
                        ></div>

                        <div className="z-20 text-center relative pointer-events-none">
                            <p className="text-5xl font-extrabold tracking-tighter">
                                {percentage}<span className="text-2xl font-bold">%</span>
                            </p>
                            <p className="text-xs font-medium uppercase tracking-widest opacity-80 mt-1">Reached</p>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <div
                            onClick={openGoalModal}
                            className="group relative inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
                        >
                            <p className="text-gray-400 text-sm font-medium">Daily Goal: {dailyGoal}ml</p>
                            <Edit2 size={12} className="text-[#2b6cee] opacity-50 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-white text-lg font-bold mt-1">{intake}ml logged</p>
                    </div>
                </div>

                {/* Quick Add Controls (Dynamic Grid) */}
                <div className="px-6 mt-8 space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                        {quickButtons.map(preset => (
                            <div key={preset.amount} className="relative">
                                <button
                                    onPointerDown={() => handlePressStart(preset)}
                                    onPointerUp={() => handlePressEnd(preset)}
                                    onPointerLeave={handlePressCancel}
                                    onContextMenu={(e) => e.preventDefault()}
                                    className={`w-full flex flex-col items-center justify-center h-20 rounded-xl ${glassCardClass} border-[#2b6cee]/30 hover:bg-[#2b6cee]/10 active:scale-95 transition-all select-none`}
                                >
                                    {preset.label && (
                                        <span className="text-white/60 text-[10px] font-medium mb-0.5 truncate max-w-full px-2">{preset.label}</span>
                                    )}
                                    <span className="text-[#2b6cee] font-bold text-lg">{preset.amount}</span>
                                    <span className="text-[10px] uppercase font-bold text-[#2b6cee]/70">ml</span>
                                </button>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => setIsCustomModalOpen(true)}
                        className={`w-full bg-[#2b6cee] hover:bg-[#2b6cee]/90 text-white font-bold h-14 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${buttonGlowClass}`}
                    >
                        <PlusCircle size={24} />
                        Custom Entry / New Preset
                    </button>
                </div>

                {/* Log History */}
                <div className="mt-10 px-6 pb-24">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold">Today's History</h3>
                        <button
                            onClick={() => navigate('/hydration/history')}
                            className="text-[#2b6cee] text-sm font-bold"
                        >
                            View All
                        </button>
                    </div>
                    <div className="space-y-3">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="animate-spin text-primary" size={24} />
                            </div>
                        ) : todayLogs.length === 0 ? (
                            <p className="text-gray-500 text-center py-4 text-sm">No logs for today</p>
                        ) : todayLogs.map((log) => (
                            <div key={log.id} className={`${glassCardClass} rounded-xl p-4 flex items-center justify-between group`}>
                                <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-lg bg-[#2b6cee]/10 flex items-center justify-center">
                                        <Droplet className="text-[#2b6cee]" size={20} fill="currentColor" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{log.label}</p>
                                        <p className="text-xs text-gray-500">
                                            {log.completed_at ? (() => {
                                                if (log.completed_at === (log.logged_at)) return log.time // Backwards compat for old logs

                                                const startTime = new Date(log.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                const endTime = new Date(log.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

                                                // If differ by more than a minute, show range
                                                if (startTime !== endTime) {
                                                    return `${startTime} - ${endTime}`
                                                }
                                                return startTime
                                            })() : log.time}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <p className="font-bold text-[#2b6cee]">{log.amount}ml</p>
                                    <button onClick={() => handleDeleteLog(log.id)} className="text-white/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Navigation Spacer for iOS */}
                <div className="h-8 w-full bg-[#101622]"></div>

                {/* Custom Entry Modal */}
                {
                    isCustomModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                            <div className="bg-[#101622] border border-white/10 w-full max-w-xs rounded-2xl p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                                <h3 className="text-lg font-bold text-center mb-6">Add Custom Amount</h3>
                                <form onSubmit={handleCustomSubmit} className="space-y-4">
                                    <div className="relative">
                                        <input
                                            type="number"
                                            autoFocus
                                            value={customAmount}
                                            onChange={(e) => setCustomAmount(e.target.value)}
                                            placeholder="330"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-center text-2xl font-bold focus:outline-none focus:border-[#2b6cee] focus:ring-1 focus:ring-[#2b6cee] placeholder:text-white/20 text-white transition-all"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">ml</span>
                                    </div>

                                    <input
                                        type="text"
                                        value={customLabel}
                                        onChange={(e) => setCustomLabel(e.target.value)}
                                        placeholder="Name this drink (optional)"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2b6cee] focus:ring-1 focus:ring-[#2b6cee] placeholder:text-white/30 text-white transition-all"
                                    />

                                    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                                        <input
                                            type="checkbox"
                                            id="savePreset"
                                            checked={saveAsPreset}
                                            onChange={(e) => setSaveAsPreset(e.target.checked)}
                                            className="w-5 h-5 rounded border-gray-600 text-[#2b6cee] focus:ring-[#2b6cee] bg-white/10 cursor-pointer"
                                        />
                                        <label htmlFor="savePreset" className="text-sm text-gray-300 select-none cursor-pointer">
                                            Save as preset button
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={handleStartCustomDrink}
                                            disabled={!customAmount}
                                            className="w-full py-3 rounded-xl bg-[#2b6cee]/20 hover:bg-[#2b6cee]/30 text-[#2b6cee] font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-[#2b6cee]/30"
                                        >
                                            Start Tracking
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!customAmount}
                                            className="w-full py-3 rounded-xl bg-[#2b6cee] hover:bg-[#2b6cee]/90 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#2b6cee]/20"
                                        >
                                            Add Now
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )
                }

                {/* Daily Goal Modal */}
                {
                    isGoalModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                            <div className="bg-[#101622] border border-white/10 w-full max-w-xs rounded-2xl p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                                <h3 className="text-lg font-bold text-center mb-2">Set Daily Goal</h3>
                                <p className="text-center text-gray-400 text-xs mb-6">Enter your target intake in milliliters.</p>
                                <form onSubmit={handleGoalSubmit} className="space-y-4">
                                    <div className="relative">
                                        <input
                                            type="number"
                                            autoFocus
                                            value={tempGoal}
                                            onChange={(e) => setTempGoal(e.target.value)}
                                            placeholder="2500"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-center text-2xl font-bold focus:outline-none focus:border-[#2b6cee] focus:ring-1 focus:ring-[#2b6cee] placeholder:text-white/20 text-white transition-all"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">ml</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsGoalModalOpen(false)}
                                            className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 font-bold transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!tempGoal}
                                            className="w-full py-3 rounded-xl bg-[#2b6cee] hover:bg-[#2b6cee]/90 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#2b6cee]/20"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )
                }

                {/* Delete Preset Modal */}
                {
                    isDeleteModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                            <div className="bg-[#101622] border border-white/10 w-full max-w-xs rounded-2xl p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                                <h3 className="text-lg font-bold text-center mb-2">Delete Preset</h3>
                                <p className="text-center text-gray-400 text-sm mb-6">
                                    Are you sure you want to remove the <span className="text-[#2b6cee] font-bold">{presetToDelete}ml</span> preset?
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setIsDeleteModalOpen(false)}
                                        className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 font-bold transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDeletePreset}
                                        className="w-full py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Preset Action Modal */}
                {
                    selectedPreset && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                            <div className="bg-[#101622] border border-white/10 w-full max-w-xs rounded-2xl p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                                <h3 className="text-lg font-bold text-center mb-1">{selectedPreset.label || 'Quick Add'}</h3>
                                <p className="text-center text-[#2b6cee] font-bold text-2xl mb-6">{selectedPreset.amount}ml</p>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => handlePresetAction('add')}
                                        className="w-full py-4 rounded-xl bg-[#2b6cee] hover:bg-[#2b6cee]/90 font-bold transition-colors shadow-lg shadow-[#2b6cee]/20 flex items-center justify-center gap-2"
                                    >
                                        <PlusCircle size={20} />
                                        Add Now
                                    </button>

                                    <button
                                        onClick={() => handlePresetAction('start')}
                                        className="w-full py-4 rounded-xl bg-[#2b6cee]/10 hover:bg-[#2b6cee]/20 text-[#2b6cee] font-bold transition-colors border border-[#2b6cee]/30 flex items-center justify-center gap-2"
                                    >
                                        <Timer size={20} />
                                        Start Tracking
                                    </button>

                                    <button
                                        onClick={() => setSelectedPreset(null)}
                                        className="w-full py-3 rounded-xl bg-transparent hover:bg-white/5 text-gray-400 font-medium transition-colors text-sm mt-2"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div >
        </div >
    )
}
