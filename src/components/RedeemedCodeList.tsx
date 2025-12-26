import { useState, useEffect, useMemo } from 'react'
import { Trash2, Search, CheckSquare, Square, AlertCircle, Gift, RefreshCw, Calendar, RotateCcw, Check } from 'lucide-react'
import { PromoCodeService } from '../services/promoCodeService'
import { DeleteConfirmModal } from './DeleteConfirmModal'

type RedeemedCode = {
    id: string
    code: string
    type: 'starter' | 'standard'
    region: 'americas' | 'asia-pacific' | 'emea'
    redeemed_at: string
    promo_code_id: string
    verified: boolean
}

export function RedeemedCodeList() {
    const [codes, setCodes] = useState<RedeemedCode[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [typeFilter, setTypeFilter] = useState<'all' | 'starter' | 'standard'>('all')
    const [regionFilter, setRegionFilter] = useState<'all' | 'americas' | 'asia-pacific' | 'emea'>('all')
    const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set())
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [restoringId, setRestoringId] = useState<string | null>(null)

    const fetchCodes = async () => {
        try {
            setLoading(true)
            setError(null)
            // Fetch redeemed codes from promo_code_requests table
            const data = await PromoCodeService.getRedeemedCodes()
            setCodes(data)
        } catch (err: any) {
            setError(err.message || 'Failed to fetch redeemed codes')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCodes()
    }, [])

    const filteredCodes = useMemo(() => {
        return codes.filter(code => {
            const matchesSearch = code.code.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesType = typeFilter === 'all' || code.type === typeFilter
            const matchesRegion = regionFilter === 'all' || code.region === regionFilter
            return matchesSearch && matchesType && matchesRegion
        })
    }, [codes, searchTerm, typeFilter, regionFilter])

    const toggleCodeSelection = (id: string) => {
        const newSelection = new Set(selectedCodes)
        if (newSelection.has(id)) {
            newSelection.delete(id)
        } else {
            newSelection.add(id)
        }
        setSelectedCodes(newSelection)
    }

    const toggleSelectAll = () => {
        if (selectedCodes.size === filteredCodes.length) {
            setSelectedCodes(new Set())
        } else {
            setSelectedCodes(new Set(filteredCodes.map(c => c.id)))
        }
    }

    const handleDeleteSelected = async () => {
        if (selectedCodes.size === 0) return

        try {
            setDeleteLoading(true)
            await PromoCodeService.deleteRedeemedCodes(Array.from(selectedCodes))
            await fetchCodes()
            setSelectedCodes(new Set())
            setShowDeleteModal(false)
        } catch (err: any) {
            setError(err.message || 'Failed to delete codes')
        } finally {
            setDeleteLoading(false)
        }
    }

    const handleRestore = async (id: string) => {
        try {
            setRestoringId(id)
            await PromoCodeService.restoreRedeemedCode(id)

            // Optimistically remove from list
            setCodes(prev => prev.filter(c => c.id !== id))
            if (selectedCodes.has(id)) {
                const newSelection = new Set(selectedCodes)
                newSelection.delete(id)
                setSelectedCodes(newSelection)
            }
        } catch (err: any) {
            setError(err.message || 'Failed to restore code')
            fetchCodes() // Refresh on error to ensure correct state
        } finally {
            setRestoringId(null)
        }
    }

    const handleToggleVerified = async (id: string, currentStatus: boolean) => {
        try {
            // Optimistic update
            setCodes(prev => prev.map(code =>
                code.id === id ? { ...code, verified: !currentStatus } : code
            ))
            await PromoCodeService.toggleVerifiedStatus(id, !currentStatus)
        } catch (err: any) {
            setError(err.message || 'Failed to update verified status')
            fetchCodes() // Revert on failure
        }
    }

    const getTypeColor = (type: string) => {
        return type === 'starter' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
    }

    const getRegionColor = (region: string) => {
        const colors: Record<string, string> = {
            'americas': 'bg-green-100 text-green-800',
            'asia-pacific': 'bg-orange-100 text-orange-800',
            'emea': 'bg-cyan-100 text-cyan-800'
        }
        return colors[region] || 'bg-gray-100 text-gray-800'
    }

    const getDisplayType = (type: string) => {
        return type.charAt(0).toUpperCase() + type.slice(1)
    }

    const getDisplayRegion = (region: string) => {
        const regionNames: Record<string, string> = {
            'americas': 'Americas',
            'asia-pacific': 'Asia Pacific',
            'emea': 'EMEA'
        }
        return regionNames[region] || region
    }

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
    }

    if (error) {
        return (
            <div className="bg-white shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 text-red-600">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                </div>
                <button
                    onClick={fetchCodes}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        )
    }

    return (
        <div className="bg-white shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Gift className="w-5 h-5 text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-900">Redeemed Codes</h2>
                        <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium">
                            {filteredCodes.length} redeemed
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchCodes}
                            disabled={loading}
                            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors text-sm"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        {selectedCodes.size > 0 && (
                            <>
                                <span className="text-sm text-gray-600">
                                    {selectedCodes.size} selected
                                </span>
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    disabled={deleteLoading}
                                    className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Selected
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search codes..."
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                    </div>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                        <option value="all">All Types</option>
                        <option value="starter">Starter</option>
                        <option value="standard">Standard</option>
                    </select>
                    <select
                        value={regionFilter}
                        onChange={(e) => setRegionFilter(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                        <option value="all">All Regions</option>
                        <option value="americas">Americas</option>
                        <option value="asia-pacific">Asia Pacific</option>
                        <option value="emea">EMEA</option>
                    </select>
                    {filteredCodes.length > 0 && (
                        <button
                            onClick={toggleSelectAll}
                            className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 hover:bg-gray-50 transition-colors text-sm"
                        >
                            {selectedCodes.size === filteredCodes.length ? (
                                <>
                                    <CheckSquare className="w-4 h-4 text-blue-600" />
                                    Deselect All
                                </>
                            ) : (
                                <>
                                    <Square className="w-4 h-4" />
                                    Select All
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Codes List */}
            <div className="p-6">
                {loading ? (
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="border border-gray-200 p-4 animate-pulse">
                                <div className="flex items-center justify-between">
                                    <div className="h-4 bg-gray-200 w-1/4"></div>
                                    <div className="flex gap-2">
                                        <div className="h-6 bg-gray-200 w-16"></div>
                                        <div className="h-6 bg-gray-200 w-20"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredCodes.length === 0 ? (
                    <div className="text-center py-12">
                        <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No redeemed codes found</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredCodes.map((code) => (
                            <div
                                key={code.id}
                                className={`group border p-4 transition-colors ${selectedCodes.has(code.id)
                                    ? 'border-blue-300 bg-blue-50'
                                    : 'border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => toggleCodeSelection(code.id)}
                                            className="text-gray-400 hover:text-blue-600 transition-colors"
                                        >
                                            {selectedCodes.has(code.id) ? (
                                                <CheckSquare className="w-5 h-5 text-blue-600" />
                                            ) : (
                                                <Square className="w-5 h-5" />
                                            )}
                                        </button>
                                        <code className="bg-gray-100 px-2 py-1 text-sm font-mono">
                                            {code.code}
                                        </code>
                                        <div className="flex gap-2">
                                            <span className={`px-2 py-1 text-xs font-medium ${getTypeColor(code.type)}`}>
                                                {getDisplayType(code.type)}
                                            </span>
                                            <span className={`px-2 py-1 text-xs font-medium ${getRegionColor(code.region)}`}>
                                                {getDisplayRegion(code.region)}
                                            </span>

                                        </div>
                                    </div>

                                    <div className="flex justify-center flex-1 mx-4">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleToggleVerified(code.id, code.verified);
                                            }}
                                            className={`px-3 py-1 text-xs font-medium border rounded-full flex items-center gap-1.5 transition-all ${code.verified
                                                ? 'bg-green-100 text-green-800 border-green-200 shadow-sm opacity-100'
                                                : 'bg-transparent text-gray-400 border-dashed border-gray-300 hover:border-gray-400 hover:text-gray-500 opacity-0 group-hover:opacity-100'
                                                }`}
                                            title={code.verified ? "Verified" : "Mark as verified"}
                                        >
                                            {code.verified ? <Check className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                                            {code.verified ? 'Verified' : 'Unverified'}
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <span>{formatDateTime(code.redeemed_at)}</span>
                                        </div>
                                        <div className="flex items-center border-l border-gray-300 pl-4 gap-2">
                                            <button
                                                onClick={() => handleRestore(code.id)}
                                                disabled={restoringId === code.id}
                                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                                                title="Restore to available"
                                            >
                                                <RotateCcw className={`w-4 h-4 ${restoringId === code.id ? 'animate-spin' : ''}`} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedCodes(new Set([code.id]))
                                                    setShowDeleteModal(true)
                                                }}
                                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                title="Delete code"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false)
                    if (selectedCodes.size === 1) {
                        setSelectedCodes(new Set())
                    }
                }}
                onConfirm={handleDeleteSelected}
                count={selectedCodes.size}
                isLoading={deleteLoading}
            />
        </div>
    )
}
