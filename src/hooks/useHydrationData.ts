import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { HydrationLog, HydrationSettings } from '../lib/database.types'

interface HydrationLogLocal {
    id: string
    amount: number
    time: string
    label: string
    logged_at: string
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

    // Add a new log
    const addLog = async (amount: number, label: string = 'Quick Add') => {
        if (!user) return { error: 'Not authenticated' }

        const { data, error } = await supabase
            .from('hydration_logs')
            .insert({
                user_id: user.id,
                amount,
                label,
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
        }
        setLogs(prev => [newLog, ...prev])

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
    const updatePresets = async (presets: number[]) => {
        if (!user || !settings) return { error: 'Not authenticated' }

        const { error } = await supabase
            .from('hydration_settings')
            .update({ presets, updated_at: new Date().toISOString() })
            .eq('user_id', user.id)

        if (error) {
            console.error('Error updating presets:', error)
            return { error: error.message }
        }

        setSettings(prev => prev ? { ...prev, presets } : null)
        return { error: null }
    }

    // Calculated values
    const dailyGoal = settings?.daily_goal ?? 2500
    const presets = settings?.presets ?? [250, 500, 750]

    // Today's intake
    const today = new Date().toDateString()
    const todayIntake = logs.reduce((sum, log) => {
        const logDate = new Date(log.logged_at).toDateString()
        return logDate === today ? sum + log.amount : sum
    }, 0)

    // Yesterday's intake
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    const yesterdayIntake = logs.reduce((sum, log) => {
        const logDate = new Date(log.logged_at).toDateString()
        return logDate === yesterday ? sum + log.amount : sum
    }, 0)

    // Today's logs only
    const todayLogs = logs.filter(log => new Date(log.logged_at).toDateString() === today)

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

    return {
        logs,
        todayLogs,
        allLogs: logs,
        loading,
        error,
        dailyGoal,
        presets,
        todayIntake,
        yesterdayIntake,
        addLog,
        deleteLog,
        updateDailyGoal,
        updatePresets,
        getLast7DaysStats,
        refetch: fetchData,
    }
}
