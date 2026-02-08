import { useState } from 'react'
import { Moon, Star, Clock } from 'lucide-react'

export function SleepTracker() {
    const [bedTime, setBedTime] = useState('')
    const [wakeTime, setWakeTime] = useState('')
    const [quality, setQuality] = useState(0)

    const calculateDuration = () => {
        if (!bedTime || !wakeTime) return null

        const [startH, startM] = bedTime.split(':').map(Number)
        const [endH, endM] = wakeTime.split(':').map(Number)

        const startDate = new Date(2000, 0, 1, startH, startM)
        const endDate = new Date(2000, 0, 1, endH, endM)

        let diff = (endDate.getTime() - startDate.getTime()) / 1000 / 60 / 60
        if (diff < 0) diff += 24

        return isNaN(diff) ? null : diff.toFixed(1)
    }

    const duration = calculateDuration()

    return (
        <div className="card w-full max-w-sm mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
                <Moon className="text-purple-400 w-6 h-6" />
                <h2 className="text-xl font-bold">Sleep Tracking</h2>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Bedtime</label>
                        <div className="relative">
                            <input
                                type="time"
                                value={bedTime}
                                onChange={e => setBedTime(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded p-2 text-sm focus:border-purple-500 outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Wake Time</label>
                        <div className="relative">
                            <input
                                type="time"
                                value={wakeTime}
                                onChange={e => setWakeTime(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded p-2 text-sm focus:border-purple-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {duration && (
                    <div className="text-center py-2 bg-purple-900/20 rounded-lg">
                        <div className="flex items-center justify-center gap-2 text-purple-300">
                            <Clock className="w-4 h-4" />
                            <span>{duration} hours</span>
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-xs text-gray-400 mb-2 text-center">Quality</label>
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setQuality(star)}
                                className={`p-1 transition-colors ${quality >= star ? 'text-yellow-400' : 'text-gray-600'}`}
                            >
                                <Star className={`w-6 h-6 ${quality >= star ? 'fill-current' : ''}`} />
                            </button>
                        ))}
                    </div>
                </div>

                <button className="w-full mt-4 btn-primary py-2 rounded-lg">
                    Log Sleep
                </button>
            </div>
        </div>
    )
}
