import React, { useState, useEffect } from 'react'
import { X, Loader } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'

const CreateAirlineForm = ({ onCreateAirline, onUpdateAirline, setShowCreateAirline, isCreating, isUpdating, initialData }) => {
    const { authUser } = useAuthStore()

    const [formData, setFormData] = useState({
        airlineName: '',
        branchId: authUser?.branchId || ''
    })

    const [error, setError] = useState(null)

    useEffect(() => {
        if (initialData) {
            setFormData({
                airlineName: initialData.airlineName,
                branchId: initialData.branchId
            })
        }
    }, [initialData])

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        if (error) setError(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.airlineName.trim()) {
            setError("Airline name is required");
            return;
        }

        try {
            if (initialData) {
                await onUpdateAirline(initialData._id, formData);
            } else {
                await onCreateAirline(formData);
            }
            setShowCreateAirline(false);
        } catch (err) {
            setError(err.response?.data?.message || "An error occurred");
        }
    }


    return (
        <div className="fixed inset-0 flex items-center justify-center bg-[#B9B9B969] bg-opacity-50 z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
                <button
                    onClick={() => setShowCreateAirline(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {initialData ? "Edit Airline" : "Create New Airline"}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {initialData ? "Update the details of the airline" : "Add a new airline to your branch"}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Airline Name
                        </label>
                        <input
                            type="text"
                            name="airlineName"
                            value={formData.airlineName}
                            onChange={handleInputChange}
                            placeholder="Enter airline name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <button
                            type="button"
                            onClick={() => setShowCreateAirline(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isCreating || isUpdating}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
                        >
                            {(isCreating || isUpdating) ? (
                                <Loader size={16} className="animate-spin" />
                            ) : (
                                initialData ? "Update Airline" : "Create Airline"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateAirlineForm
