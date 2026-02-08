import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { SleepLog as DbSleepLog, SleepSettings } from '../lib/database.types'

export interface SleepLog {
    id: string
    date: string
    lightsOut: string
    wakeUp: string
    outOfBed: string
    latency: number
    awakenings: number
    awakeDuration: number
    subjectiveQuality: number
}

export interface DailySleepStats {
    totalTimeInBed: number
    totalSleepTime: number
    sleepEfficiency: number
    sleepQualityScore: number
    sleepDebt: number
}

export const useSleepData = () => {
    const { user } = useAuth()
    const [logs, setLogs] = useState<SleepLog[]>([])
    const [settings, setSettings] = useState<SleepSettings | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Transform DB row to local format
    const transformLog = (dbLog: DbSleepLog): SleepLog => ({
        id: dbLog.id,
        date: dbLog.date,
        lightsOut: dbLog.lights_out,
        wakeUp: dbLog.wake_up,
        outOfBed: dbLog.out_of_bed,
        latency: dbLog.latency,
        awakenings: dbLog.awakenings,
        awakeDuration: dbLog.awake_duration,
        subjectiveQuality: dbLog.subjective_quality,
    })

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
                .from('sleep_logs')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false })

            if (logsError) throw logsError

            setLogs((logsData || []).map(transformLog))

            // Fetch settings
            const { data: settingsData, error: settingsError } = await supabase
                .from('sleep_settings')
                .select('*')
                .eq('user_id', user.id)
                .single()

            if (settingsError && settingsError.code !== 'PGRST116') {
                throw settingsError
            }

            if (settingsData) {
                setSettings(settingsData)
            } else {
                // Create default settings
                const { data: newSettings, error: insertError } = await supabase
                    .from('sleep_settings')
                    .insert({ user_id: user.id })
                    .select()
                    .single()

                if (insertError) throw insertError
                setSettings(newSettings)
            }
        } catch (err) {
            console.error('Error fetching sleep data:', err)
            setError(err instanceof Error ? err.message : 'Failed to fetch data')
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    // Calculate stats for a log
    const calculateStats = (log: SleepLog): DailySleepStats => {
        const parseTime = (timeStr: string) => {
            const [h, m] = timeStr.split(':').map(Number)
            return h * 60 + m
        }

        let start = parseTime(log.lightsOut)
        let end = parseTime(log.outOfBed)

        if (start > end && start > 12 * 60) {
            end += 24 * 60
        }

        const totalTimeInBed = Math.max(0, end - start)
        const totalSleepTime = Math.max(0, totalTimeInBed - log.latency - log.awakeDuration)
        const sleepEfficiency = totalTimeInBed > 0 ? (totalSleepTime / totalTimeInBed) * 100 : 0

        // === Sleep Quality Score (100-point scale) ===
        // Formula: (Efficiency × 0.4) + (Feel × 4) + (Latency Score × 0.1) + (Awake Penalty)

        // 1. Efficiency Component (40% of score)
        // Efficiency is already 0-100, multiply by 0.4
        const efficiencyScore = Math.min(sleepEfficiency, 100) * 0.4

        // 2. Subjective Feel Component (40% of score)
        // subjectiveQuality is 1-10, multiply by 4 to get 0-40
        const feelScore = log.subjectiveQuality * 4

        // 3. Latency Score (10% of score)
        // Sweet spot is 10-25 mins = 10 points
        // 25-45 mins = 5 points
        // > 45 mins = 0 points
        let latencyScore = 0
        if (log.latency >= 10 && log.latency <= 25) {
            latencyScore = 10
        } else if (log.latency > 25 && log.latency <= 45) {
            latencyScore = 5
        } else if (log.latency < 10) {
            // Falling asleep too fast (<10 mins) could indicate sleep deprivation, give partial points
            latencyScore = 7
        }
        // > 45 mins stays at 0

        // 4. Awake Penalty (10% of score)
        // Start with 10 points
        // Subtract 2 points per awakening
        // Subtract 1 point per 10 minutes of awake_duration
        const awakeningsPenalty = log.awakenings * 2
        const awakeDurationPenalty = log.awakeDuration / 10
        const awakePenalty = Math.max(0, 10 - awakeningsPenalty - awakeDurationPenalty)

        // Total Score (0-100)
        const sleepQualityScore = efficiencyScore + feelScore + latencyScore + awakePenalty

        const targetHours = settings?.target_hours ?? 8
        const actualHours = totalSleepTime / 60
        const sleepDebt = targetHours - actualHours

        return {
            totalTimeInBed,
            totalSleepTime,
            sleepEfficiency,
            sleepQualityScore,
            sleepDebt
        }
    }

    // Add a new log
    const addLog = async (entry: Omit<SleepLog, 'id' | 'date'>) => {
        if (!user) return { error: 'Not authenticated' }

        const stats = calculateStats({
            ...entry,
            id: 'temp',
            date: new Date().toISOString().split('T')[0]
        })

        const { data, error } = await supabase
            .from('sleep_logs')
            .insert({
                user_id: user.id,
                date: new Date().toISOString().split('T')[0],
                lights_out: entry.lightsOut,
                wake_up: entry.wakeUp,
                out_of_bed: entry.outOfBed,
                latency: Math.round(entry.latency),
                awakenings: Math.round(entry.awakenings),
                awake_duration: Math.round(entry.awakeDuration),
                subjective_quality: Math.round(entry.subjectiveQuality),
                total_time_in_bed: Math.round(stats.totalTimeInBed),
                total_sleep_time: Math.round(stats.totalSleepTime),
                sleep_efficiency: Math.round(stats.sleepEfficiency),
                sleep_quality_score: Math.round(stats.sleepQualityScore),
                sleep_debt: Math.round(stats.sleepDebt),
            })
            .select()
            .single()

        if (error) {
            console.error('Error adding sleep log:', error)
            return { error: error.message }
        }

        setLogs(prev => [transformLog(data), ...prev])
        return { error: null }
    }

    // Delete a log
    const deleteLog = async (id: string) => {
        if (!user) return { error: 'Not authenticated' }

        const { error } = await supabase
            .from('sleep_logs')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) {
            console.error('Error deleting sleep log:', error)
            return { error: error.message }
        }

        setLogs(prev => prev.filter(log => log.id !== id))
        return { error: null }
    }

    // Update target hours
    const setTargetHours = async (hours: number) => {
        if (!user || !settings) return { error: 'Not authenticated' }

        const { error } = await supabase
            .from('sleep_settings')
            .update({ target_hours: hours, updated_at: new Date().toISOString() })
            .eq('user_id', user.id)

        if (error) {
            console.error('Error updating target hours:', error)
            return { error: error.message }
        }

        setSettings(prev => prev ? { ...prev, target_hours: hours } : null)
        return { error: null }
    }

    // Update target bedtime
    const setTargetBedtime = async (time: string) => {
        if (!user || !settings) return { error: 'Not authenticated' }

        const { error } = await supabase
            .from('sleep_settings')
            .update({ target_bedtime: time, updated_at: new Date().toISOString() })
            .eq('user_id', user.id)

        if (error) {
            console.error('Error updating target bedtime:', error)
            return { error: error.message }
        }

        setSettings(prev => prev ? { ...prev, target_bedtime: time } : null)
        return { error: null }
    }

    // Update target wake time
    const setTargetWakeTime = async (time: string) => {
        if (!user || !settings) return { error: 'Not authenticated' }

        const { error } = await supabase
            .from('sleep_settings')
            .update({ target_wake_time: time, updated_at: new Date().toISOString() })
            .eq('user_id', user.id)

        if (error) {
            console.error('Error updating target wake time:', error)
            return { error: error.message }
        }

        setSettings(prev => prev ? { ...prev, target_wake_time: time } : null)
        return { error: null }
    }

    // Get weekly average score
    const getWeeklyAverageScore = () => {
        if (logs.length === 0) return 0
        const totalScore = logs.reduce((sum, log) => sum + calculateStats(log).sleepQualityScore, 0)
        return totalScore / logs.length
    }

    // Get stats for a specific period (7 or 30 days)
    const getStatsForPeriod = (days: 7 | 30) => {
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - days)

        const periodLogs = logs.filter(log => new Date(log.date) >= cutoffDate)

        if (periodLogs.length === 0) {
            return {
                avgQuality: 0,
                avgDuration: 0,
                totalSleepDebt: 0,
                logsCount: 0
            }
        }

        let totalQuality = 0
        let totalDuration = 0
        let totalSleepDebt = 0

        periodLogs.forEach(log => {
            const stats = calculateStats(log)
            totalQuality += stats.sleepQualityScore
            totalDuration += stats.totalSleepTime
            totalSleepDebt += stats.sleepDebt
        })

        return {
            avgQuality: totalQuality / periodLogs.length,
            avgDuration: totalDuration / periodLogs.length, // in minutes
            totalSleepDebt: totalSleepDebt, // cumulative debt in hours
            logsCount: periodLogs.length
        }
    }

    // Calculate consistency score based on variance in lights_out times
    const getConsistencyScore = (days: 7 | 30 = 7) => {
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - days)

        const periodLogs = logs.filter(log => new Date(log.date) >= cutoffDate)

        if (periodLogs.length < 2) return { score: 100, variance: 0 }

        // Convert lights_out times to minutes from midnight (handling overnight)
        const times = periodLogs.map(log => {
            const [h, m] = log.lightsOut.split(':').map(Number)
            let minutes = h * 60 + m
            // If after midnight but before 6 AM, add 24 hours
            if (h < 6) minutes += 24 * 60
            return minutes
        })

        // Calculate mean
        const mean = times.reduce((a, b) => a + b, 0) / times.length

        // Calculate variance
        const variance = times.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / times.length
        const stdDev = Math.sqrt(variance)

        // Convert to a 0-100 score (lower variance = higher score)
        // 0 mins stdDev = 100%, 60 mins stdDev = 50%, 120 mins stdDev = 0%
        const score = Math.max(0, Math.min(100, 100 - (stdDev / 1.2)))

        return { score, variance, stdDev }
    }

    // Calculate grogginess factor (time between wake_up and out_of_bed)
    const getGrogginessFactor = (days: 7 | 30 = 7) => {
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - days)

        const periodLogs = logs.filter(log => new Date(log.date) >= cutoffDate)

        if (periodLogs.length === 0) return { avgMinutes: 0, logsCount: 0 }

        const parseTime = (timeStr: string) => {
            const [h, m] = timeStr.split(':').map(Number)
            return h * 60 + m
        }

        let totalGrogginess = 0
        periodLogs.forEach(log => {
            const wakeUp = parseTime(log.wakeUp)
            let outOfBed = parseTime(log.outOfBed)

            // Handle if times cross midnight (unlikely but safe)
            if (outOfBed < wakeUp) outOfBed += 24 * 60

            totalGrogginess += (outOfBed - wakeUp)
        })

        return {
            avgMinutes: totalGrogginess / periodLogs.length,
            logsCount: periodLogs.length
        }
    }

    // Compare weekday vs weekend sleep
    const getWeekdayVsWeekend = (days: 30 = 30) => {
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - days)

        const periodLogs = logs.filter(log => new Date(log.date) >= cutoffDate)

        const weekdayLogs: SleepLog[] = []
        const weekendLogs: SleepLog[] = []

        periodLogs.forEach(log => {
            const date = new Date(log.date)
            const dayOfWeek = date.getDay()
            // 0 = Sunday, 6 = Saturday
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                weekendLogs.push(log)
            } else {
                weekdayLogs.push(log)
            }
        })

        const calculateAvgDuration = (logList: SleepLog[]) => {
            if (logList.length === 0) return 0
            const total = logList.reduce((sum, log) => sum + calculateStats(log).totalSleepTime, 0)
            return total / logList.length
        }

        const weekdayAvg = calculateAvgDuration(weekdayLogs)
        const weekendAvg = calculateAvgDuration(weekendLogs)

        return {
            weekdayAvg, // in minutes
            weekendAvg, // in minutes
            difference: weekendAvg - weekdayAvg, // positive means sleeping more on weekends
            weekdayCount: weekdayLogs.length,
            weekendCount: weekendLogs.length
        }
    }

    // Get efficiency trend data for chart
    const getEfficiencyTrend = (days: 7 | 30 = 7) => {
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - days)

        const periodLogs = logs
            .filter(log => new Date(log.date) >= cutoffDate)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        return periodLogs.map(log => ({
            date: log.date,
            efficiency: calculateStats(log).sleepEfficiency
        }))
    }

    // Get data for sleep architecture chart
    const getSleepArchitectureData = (days: 7 | 30 = 7) => {
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - days)

        const periodLogs = logs
            .filter(log => new Date(log.date) >= cutoffDate)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        return periodLogs.map(log => {
            const stats = calculateStats(log)
            return {
                date: log.date,
                latency: log.latency,
                awakeDuration: log.awakeDuration,
                totalSleepTime: stats.totalSleepTime,
                totalTimeInBed: stats.totalTimeInBed
            }
        })
    }

    // Get data for consistency chart (floating bars)
    const getConsistencyChartData = (days: 7 | 30 = 7) => {
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - days)

        const periodLogs = logs
            .filter(log => new Date(log.date) >= cutoffDate)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        return periodLogs.map(log => ({
            date: log.date,
            lightsOut: log.lightsOut,
            wakeUp: log.wakeUp,
            outOfBed: log.outOfBed
        }))
    }

    // Get data for quality vs duration scatter plot
    const getQualityVsDurationData = (days: 30 = 30) => {
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - days)

        const periodLogs = logs.filter(log => new Date(log.date) >= cutoffDate)

        return periodLogs.map(log => {
            const stats = calculateStats(log)
            return {
                date: log.date,
                durationHours: stats.totalSleepTime / 60,
                quality: log.subjectiveQuality
            }
        })
    }

    // Get data for bedtime vs quality heatmap
    const getBedtimeQualityData = (days: 30 = 30) => {
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - days)

        const periodLogs = logs.filter(log => new Date(log.date) >= cutoffDate)

        return periodLogs.map(log => ({
            date: log.date,
            lightsOut: log.lightsOut,
            quality: log.subjectiveQuality
        }))
    }

    // Get stats for specific log or latest
    const latestStats = logs.length > 0 ? calculateStats(logs[0]) : null
    const targetHours = settings?.target_hours ?? 8
    const targetBedtime = settings?.target_bedtime ?? '23:00'
    const targetWakeTime = settings?.target_wake_time ?? '07:00'

    return {
        logs,
        loading,
        error,
        addLog,
        deleteLog,
        targetHours,
        setTargetHours,
        targetBedtime,
        setTargetBedtime,
        targetWakeTime,
        setTargetWakeTime,
        calculateStats,
        latestStats,
        getWeeklyAverageScore,
        refetch: fetchData,
        // New statistics functions
        getStatsForPeriod,
        getConsistencyScore,
        getGrogginessFactor,
        getWeekdayVsWeekend,
        getEfficiencyTrend,
        getSleepArchitectureData,
        getConsistencyChartData,
        getQualityVsDurationData,
        getBedtimeQualityData,
    }
}

