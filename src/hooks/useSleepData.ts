import { useContext } from 'react'
import { SleepContext } from '../context/SleepContext'
export type { SleepLog, DailySleepStats } from '../context/SleepContext'

export const useSleepData = () => {
    const context = useContext(SleepContext)
    if (context === undefined) {
        throw new Error('useSleepData must be used within a SleepProvider')
    }
    return context
}
