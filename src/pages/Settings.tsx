import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, LogOut, User, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
    const navigate = useNavigate()
    const { user, signOut } = useAuth()
    const [isSigningOut, setIsSigningOut] = useState(false)

    const handleSignOut = async () => {
        setIsSigningOut(true)
        await signOut()
        // Navigation will happen automatically via ProtectedRoute
    }

    const glassCardClass = "bg-[rgba(25,34,51,0.7)] backdrop-blur-md border border-white/10"

    return (
        <div className="min-h-screen bg-[#101622] text-white p-6 flex flex-col items-center">
            <div className="w-full max-w-md">
                <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </button>
                <h1 className="text-3xl font-bold mb-4">Settings</h1>

                {/* User Profile Section */}
                <div className={`${glassCardClass} p-4 rounded-xl mb-6`}>
                    <div className="flex items-center gap-4">
                        <div className="size-14 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/30">
                            <User className="text-primary" size={24} />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-slate-400">Logged in as</p>
                            <p className="font-bold text-white truncate">{user?.email || 'Unknown'}</p>
                        </div>
                    </div>
                </div>

                {/* Settings Options */}
                <div className="flex flex-col gap-4">
                    <div className={`${glassCardClass} p-4 rounded-xl flex items-center justify-between`}>
                        <span>Dark Mode</span>
                        <div className="w-10 h-6 bg-primary rounded-full relative">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* Sign Out Button */}
                <div className="mt-8 pt-8 border-t border-white/10">
                    <button
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                        className="w-full py-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold transition-all flex items-center justify-center gap-3 border border-red-500/20 disabled:opacity-50"
                    >
                        {isSigningOut ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Signing out...
                            </>
                        ) : (
                            <>
                                <LogOut size={20} />
                                Sign Out
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
