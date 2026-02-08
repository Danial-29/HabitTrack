import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function Habits() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-[#101622] text-white p-6 flex flex-col items-center">
            <div className="w-full max-w-md">
                <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </button>
                <h1 className="text-3xl font-bold mb-4">Habit Management</h1>
                <p className="text-slate-400">Placeholder for managing and editing your habits.</p>
            </div>
        </div>
    )
}
