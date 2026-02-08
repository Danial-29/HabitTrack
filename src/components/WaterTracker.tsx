import { useState } from 'react'
import { Plus, Minus, Droplets } from 'lucide-react'

export function WaterTracker() {
    const [cups, setCups] = useState(0)
    const target = 8 // daily goal

    const addCup = () => setCups(c => c + 1)
    const removeCup = () => setCups(c => Math.max(0, c - 1))

    const progress = Math.min(100, (cups / target) * 100)

    return (
        <div className="card w-full max-w-sm mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
                <Droplets className="text-blue-400 w-6 h-6" />
                <h2 className="text-xl font-bold">Hydration</h2>
            </div>

            <div className="relative w-32 h-32 mx-auto mb-6 flex items-center justify-center rounded-full border-4 border-blue-900/30 overflow-hidden">
                <div
                    className="absolute bottom-0 w-full bg-blue-500/50 transition-all duration-500 ease-out"
                    style={{ height: `${progress}%` }}
                />
                <span className="relative z-10 text-3xl font-bold">{cups}</span>
            </div>

            <p className="text-sm text-gray-400 mb-4">Goal: {target} cups</p>

            <div className="flex justify-center gap-4">
                <button onClick={removeCup} className="p-2 rounded-full hover:bg-white/10" aria-label="Decrease water">
                    <Minus className="w-6 h-6" />
                </button>
                <button onClick={addCup} className="p-2 rounded-full bg-blue-600 hover:bg-blue-500" aria-label="Increase water">
                    <Plus className="w-6 h-6" />
                </button>
            </div>
        </div>
    )
}
