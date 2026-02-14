import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { HydrationLog, HydrationSettings, Json } from '../lib/database.types'

interface HydrationLogLocal {
    id: string
    amount: number
    time: string
    label: string
    logged_at: string
    completed_at: string | null
}

export interface Preset {
    amount: number
    label?: string
}

export function useHydrationData() {
    const { user } = useAuth()
    const [logs, setLogs] = useState<HydrationLogLocal[]>([])
    const [settings, setSettings] = useState<HydrationSettings | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Fetch logs and settings
    const fetchData = useCallback(async () => {
        if (!user) {
            setLogs([])
            setSettings(null)
            setLoading(false)
            return
        }

        setLoading(true)
        setError(null)

        try {
            // Fetch logs
            const { data: logsData, error: logsError } = await supabase
                .from('hydration_logs')
                .select('*')
                .eq('user_id', user.id)
                .order('logged_at', { ascending: false })

            if (logsError) throw logsError

            // Transform to local format
            const transformedLogs: HydrationLogLocal[] = (logsData || []).map((log: HydrationLog) => ({
                id: log.id,
                amount: log.amount,
                time: new Date(log.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                label: log.label,
                logged_at: log.logged_at,
                completed_at: log.completed_at,
            }))

            setLogs(transformedLogs)

            // Fetch settings
            const { data: settingsData, error: settingsError } = await supabase
                .from('hydration_settings')
                .select('*')
                .eq('user_id', user.id)
                .single()

            if (settingsError && settingsError.code !== 'PGRST116') {
                // PGRST116 = no rows returned, which is fine for new users
                throw settingsError
            }

            if (settingsData) {
                setSettings(settingsData)
            } else {
                // Create default settings for new user (upsert to avoid duplicate key error)
                const { data: newSettings, error: insertError } = await supabase
                    .from('hydration_settings')
                    .upsert({ user_id: user.id }, { onConflict: 'user_id' })
                    .select()
                    .single()

                if (insertError) throw insertError
                setSettings(newSettings)
            }
        } catch (err) {
            console.error('Error fetching hydration data:', err)
            setError(err instanceof Error ? err.message : 'Failed to fetch data')
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    // Start a new drink (active)
    const startDrink = async (amount: number, label: string = 'Active Drink') => {
        if (!user) return { error: 'Not authenticated' }

        const { data, error } = await supabase
            .from('hydration_logs')
            .insert({
                user_id: user.id,
                amount,
                label,
                completed_at: null, // Explicitly null for active
            })
            .select()
            .single()

        if (error) {
            console.error('Error starting drink:', error)
            return { error: error.message }
        }

        // Add to local state
        const newLog: HydrationLogLocal = {
            id: data.id,
            amount: data.amount,
            time: new Date(data.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            label: data.label,
            logged_at: data.logged_at,
            completed_at: null,
        }
        setLogs(prev => [newLog, ...prev])

        return { error: null }
    }

    // Add a completed log directly (history)
    const addLog = async (amount: number, label: string = 'Quick Add') => {
        if (!user) return { error: 'Not authenticated' }

        const now = new Date().toISOString()
        const { data, error } = await supabase
            .from('hydration_logs')
            .insert({
                user_id: user.id,
                amount,
                label,
                completed_at: now, // Immediately completed
            })
            .select()
            .single()

        if (error) {
            console.error('Error adding log:', error)
            return { error: error.message }
        }

        // Add to local state
        const newLog: HydrationLogLocal = {
            id: data.id,
            amount: data.amount,
            time: new Date(data.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            label: data.label,
            logged_at: data.logged_at,
            completed_at: now,
        }
        setLogs(prev => [newLog, ...prev])

        return { error: null }
    }

    // Finish a drink
    const finishDrink = async (id: string) => {
        if (!user) return { error: 'Not authenticated' }

        const now = new Date().toISOString()
        const { error } = await supabase
            .from('hydration_logs')
            .update({ completed_at: now })
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) {
            console.error('Error finishing drink:', error)
            return { error: error.message }
        }

        setLogs(prev => prev.map(log =>
            log.id === id ? { ...log, completed_at: now } : log
        ))
        return { error: null }
    }

    // Delete a log
    const deleteLog = async (id: string) => {
        if (!user) return { error: 'Not authenticated' }

        const { error } = await supabase
            .from('hydration_logs')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) {
            console.error('Error deleting log:', error)
            return { error: error.message }
        }

        setLogs(prev => prev.filter(log => log.id !== id))
        return { error: null }
    }

    // Update daily goal
    const updateDailyGoal = async (goal: number) => {
        if (!user || !settings) return { error: 'Not authenticated' }

        const { error } = await supabase
            .from('hydration_settings')
            .update({ daily_goal: goal, updated_at: new Date().toISOString() })
            .eq('user_id', user.id)

        if (error) {
            console.error('Error updating goal:', error)
            return { error: error.message }
        }

        setSettings(prev => prev ? { ...prev, daily_goal: goal } : null)
        return { error: null }
    }

    // Update presets
    const updatePresets = async (presets: Preset[]) => {
        if (!user || !settings) return { error: 'Not authenticated' }

        const { error } = await supabase
            .from('hydration_settings')
            .update({ presets: presets as unknown as Json, updated_at: new Date().toISOString() })
            .eq('user_id', user.id)

        if (error) {
            console.error('Error updating presets:', error)
            return { error: error.message }
        }

        setSettings(prev => prev ? { ...prev, presets: presets as unknown as Json } : null)
        return { error: null }
    }

    // Calculated values
    const dailyGoal = settings?.daily_goal ?? 2500

    // Parse presets with backward compatibility (handles both number[] and Preset[])
    const parsePresets = (): Preset[] => {
        const raw = settings?.presets
        if (!raw) return [{ amount: 250 }, { amount: 500 }, { amount: 750 }]
        if (Array.isArray(raw)) {
            return raw.map(item => {
                if (typeof item === 'number') return { amount: item }
                if (typeof item === 'object' && item !== null && 'amount' in item) {
                    return { amount: (item as { amount: number }).amount, label: (item as { label?: string }).label }
                }
                return { amount: 250 }
            })
        }
        return [{ amount: 250 }, { amount: 500 }, { amount: 750 }]
    }
    const presets = parsePresets()

    // Today's intake
    const today = new Date().toDateString()
    const todayIntake = logs.reduce((sum, log) => {
        // Only count COMPLETED logs
        if (!log.completed_at) return sum

        // We use logged_at for date attribution to stay consistent with how entries are created on the dashboard

        const attributionDate = new Date(log.logged_at).toDateString()
        return attributionDate === today ? sum + log.amount : sum
    }, 0)

    // Yesterday's intake
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    const yesterdayIntake = logs.reduce((sum, log) => {
        const logDate = new Date(log.logged_at).toDateString()
        return logDate === yesterday ? sum + log.amount : sum
    }, 0)

    // Today's logs only
    // Today's logs only
    const todayLogs = logs.filter(log => new Date(log.logged_at).toDateString() === today)

    // Separate active and history
    const activeLogs = logs.filter(log => !log.completed_at)
    // History logs are completed ones
    const historyLogs = logs.filter(log => !!log.completed_at)

    // Weekly stats
    const getLast7DaysStats = () => {
        const stats = []
        const now = new Date()
        const dailyTotals: { [key: string]: number } = {}

        logs.forEach(log => {
            const dateKey = new Date(log.logged_at).toDateString()
            dailyTotals[dateKey] = (dailyTotals[dateKey] || 0) + log.amount
        })

        for (let i = 6; i >= 0; i--) {
            const date = new Date(now)
            date.setDate(now.getDate() - i)
            const dateKey = date.toDateString()
            const total = dailyTotals[dateKey] || 0
            stats.push({
                percentage: Math.min(Math.round((total / dailyGoal) * 100), 100),
                total
            })
        }
        return stats
    }

    // ═══════════════════════════════════════════
    // ANALYTICS FUNCTIONS FOR STATS PAGE
    // ═══════════════════════════════════════════

    // Get daily totals map for a period
    const getDailyTotalsMap = (days: number) => {
        const now = new Date()
        const cutoff = new Date(now)
        cutoff.setDate(now.getDate() - days)
        cutoff.setHours(0, 0, 0, 0)

        const dailyTotals: { [key: string]: number } = {}
        logs.forEach(log => {
            const logDate = new Date(log.logged_at)
            if (logDate >= cutoff) {
                const dateKey = logDate.toDateString()
                dailyTotals[dateKey] = (dailyTotals[dateKey] || 0) + log.amount
            }
        })
        return dailyTotals
    }

    // Stats for a period (avg intake, consistency, log count)
    const getStatsForPeriod = (days: number) => {
        const dailyTotals = getDailyTotalsMap(days)
        const totals = Object.values(dailyTotals)
        const logsCount = totals.length
        const avgIntake = logsCount > 0 ? totals.reduce((a, b) => a + b, 0) / logsCount : 0
        const daysAtGoal = totals.filter(t => t >= dailyGoal).length
        const consistency = days > 0 ? (daysAtGoal / days) * 100 : 0

        return { avgIntake, consistency, logsCount, daysAtGoal }
    }

    // Consistency score (% of days hitting goal)
    const getConsistencyScore = (days: number) => {
        const dailyTotals = getDailyTotalsMap(days)
        const daysAtGoal = Object.values(dailyTotals).filter(t => t >= dailyGoal).length
        return { score: days > 0 ? (daysAtGoal / days) * 100 : 0, daysAtGoal, totalDays: days }
    }

    // Hourly distribution (what times of day user drinks)
    const getHourlyDistribution = () => {
        const hourlyTotals: number[] = new Array(24).fill(0)
        const hourlyCounts: number[] = new Array(24).fill(0)

        logs.forEach(log => {
            const hour = new Date(log.logged_at).getHours()
            hourlyTotals[hour] += log.amount
            hourlyCounts[hour] += 1
        })

        // Find peak hour
        let peakHour = 0
        let peakAmount = 0
        hourlyTotals.forEach((total, hour) => {
            if (total > peakAmount) {
                peakAmount = total
                peakHour = hour
            }
        })

        // Group into time periods
        const morning = hourlyTotals.slice(6, 12).reduce((a, b) => a + b, 0)
        const afternoon = hourlyTotals.slice(12, 18).reduce((a, b) => a + b, 0)
        const evening = hourlyTotals.slice(18, 24).reduce((a, b) => a + b, 0)
        const night = [...hourlyTotals.slice(0, 6), ...hourlyTotals.slice(0, 0)].reduce((a, b) => a + b, 0)

        const total = morning + afternoon + evening + night
        return {
            hourlyTotals,
            hourlyCounts,
            peakHour,
            peakAmount,
            periods: {
                morning: total > 0 ? (morning / total) * 100 : 0,
                afternoon: total > 0 ? (afternoon / total) * 100 : 0,
                evening: total > 0 ? (evening / total) * 100 : 0,
                night: total > 0 ? (night / total) * 100 : 0,
            }
        }
    }

    // Weekday vs Weekend comparison
    const getWeekdayVsWeekend = () => {
        const weekdayTotals: number[] = []
        const weekendTotals: number[] = []
        const dailyTotals = getDailyTotalsMap(30)

        Object.entries(dailyTotals).forEach(([dateStr, total]) => {
            const day = new Date(dateStr).getDay()
            if (day === 0 || day === 6) {
                weekendTotals.push(total)
            } else {
                weekdayTotals.push(total)
            }
        })

        const avgWeekday = weekdayTotals.length > 0 ? weekdayTotals.reduce((a, b) => a + b, 0) / weekdayTotals.length : 0
        const avgWeekend = weekendTotals.length > 0 ? weekendTotals.reduce((a, b) => a + b, 0) / weekendTotals.length : 0

        return {
            avgWeekday,
            avgWeekend,
            difference: avgWeekend - avgWeekday,
            weekdayCount: weekdayTotals.length,
            weekendCount: weekendTotals.length
        }
    }

    // Daily trend data for bar chart
    const getDailyTrendData = (days: number) => {
        const now = new Date()
        const data: { date: string; dateLabel: string; total: number; percentage: number }[] = []
        const dailyTotals = getDailyTotalsMap(days)

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now)
            date.setDate(now.getDate() - i)
            const dateKey = date.toDateString()
            const total = dailyTotals[dateKey] || 0
            data.push({
                date: dateKey,
                dateLabel: date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
                total,
                percentage: Math.min((total / dailyGoal) * 100, 150) // Cap at 150% for viz
            })
        }
        return data
    }

    // Streak info (consecutive days hitting goal)
    const getStreakInfo = () => {
        const now = new Date()
        let currentStreak = 0
        let longestStreak = 0
        let tempStreak = 0

        // Check from today going back
        for (let i = 0; i < 365; i++) {
            const date = new Date(now)
            date.setDate(now.getDate() - i)
            const dateKey = date.toDateString()

            const dailyTotal = logs
                .filter(log => new Date(log.logged_at).toDateString() === dateKey)
                .reduce((sum, log) => sum + log.amount, 0)

            if (dailyTotal >= dailyGoal) {
                tempStreak++
                if (i === currentStreak) {
                    currentStreak = tempStreak
                }
            } else {
                if (tempStreak > longestStreak) longestStreak = tempStreak
                tempStreak = 0
            }
        }

        if (tempStreak > longestStreak) longestStreak = tempStreak

        return { currentStreak, longestStreak }
    }

    // Best and worst day of week
    const getDayOfWeekStats = () => {
        const dayTotals: { [key: number]: number[] } = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }
        const dailyTotals = getDailyTotalsMap(30)

        Object.entries(dailyTotals).forEach(([dateStr, total]) => {
            const day = new Date(dateStr).getDay()
            dayTotals[day].push(total)
        })

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const dayAverages = Object.entries(dayTotals).map(([day, totals]) => ({
            day: Number(day),
            name: dayNames[Number(day)],
            avg: totals.length > 0 ? totals.reduce((a, b) => a + b, 0) / totals.length : 0
        }))

        const sorted = [...dayAverages].sort((a, b) => b.avg - a.avg)
        return {
            best: sorted[0],
            worst: sorted[sorted.length - 1],
            all: dayAverages
        }
    }

    return {
        logs: historyLogs, // Maintain backward compat for history views
        activeLogs,
        todayLogs,
        allLogs: logs,
        loading,
        error,
        dailyGoal,
        presets,
        todayIntake,
        yesterdayIntake,
        addLog,
        startDrink,
        finishDrink,
        deleteLog,
        updateDailyGoal,
        updatePresets,
        getLast7DaysStats,
        // Analytics for Stats page
        getStatsForPeriod,
        getConsistencyScore,
        getHourlyDistribution,
        getWeekdayVsWeekend,
        getDailyTrendData,
        getStreakInfo,
        getDayOfWeekStats,
        refetch: fetchData,
    }
}
