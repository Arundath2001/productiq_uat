import { Loader, AlertTriangle, Trash2, CheckCircle, LogOut } from "lucide-react";
import React, { useState } from "react";

const ConfirmAlert = ({
  alertInfo,
  handleClose,
  handleSubmit,
  showDateInput = false,
  dateLabel = "Destination arrival date",
  datePlaceholder = "Select arrival date",
  onDateChange = null,
  isDeleting,
  icon: CustomIcon,
  title = "Are You Sure?",
  confirmText = "Yes",
  cancelText = "No",
  confirmColor,
  iconBgColor,
  iconColor,
}) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [error, setError] = useState("");

  const handleDateInputChange = (e) => {
    const value = e.target.value;
    const dateObj = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateObj < today) {
      setError("Please select a future date");
    } else {
      setError("");
    }

    setSelectedDate(value);
    if (onDateChange) {
      onDateChange(value);
    }
  };

  const handleSubmitClick = () => {
    if (showDateInput) {
      if (!selectedDate) {
        setError("Please select a date");
        return;
      }

      const dateObj = new Date(selectedDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dateObj < today) {
        setError("Please select a future date");
        return;
      }

      handleSubmit(dateObj);
    } else {
      handleSubmit();
    }
  };

  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Determine intelligent defaults based on the alertInfo text
  const lowerAlert = (alertInfo || "").toLowerCase();
  const isDelete = lowerAlert.includes("delete") || lowerAlert.includes("remove");
  const isComplete = lowerAlert.includes("complete");
  const isLogout = lowerAlert.includes("log out") || lowerAlert.includes("logout");

  const Icon = CustomIcon || (isDelete ? Trash2 : isComplete ? CheckCircle : isLogout ? LogOut : AlertTriangle);
  
  const finalIconBgColor = iconBgColor || (isDelete ? "bg-red-100" : isComplete ? "bg-green-100" : isLogout ? "bg-red-100" : "bg-yellow-100");
  const finalIconColor = iconColor || (isDelete ? "text-red-600" : isComplete ? "text-green-600" : isLogout ? "text-red-600" : "text-yellow-600");
  const finalConfirmColor = confirmColor || (isDelete ? "bg-red-500 hover:bg-red-600 shadow-red-200" : isComplete ? "bg-green-500 hover:bg-green-600 shadow-green-200" : "bg-blue-600 hover:bg-blue-700 shadow-blue-200");

  return (
    <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in zoom-in-95 duration-200 p-6 m-4 relative z-[100]">
      <div className={`w-12 h-12 rounded-full ${finalIconBgColor} flex items-center justify-center mx-auto mb-4`}>
        <Icon className={`w-6 h-6 ${finalIconColor}`} />
      </div>
      <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-center text-gray-600 mb-6 text-sm">
        {alertInfo}
      </p>

      {showDateInput && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
            {dateLabel}
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateInputChange}
            placeholder={datePlaceholder}
            min={getTodayString()}
            disabled={isDeleting}
            className={`w-full px-3 py-2.5 border rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              error ? "border-red-500" : "border-gray-200 hover:border-gray-300"
            } ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
          />
          {error && (
            <p className="text-red-500 text-xs text-center mt-1.5">{error}</p>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={isDeleting ? undefined : handleClose}
          className={`flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer ${
            isDeleting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {cancelText}
        </button>
        <button
          onClick={isDeleting ? undefined : handleSubmitClick}
          className={`flex-1 px-4 py-2.5 rounded-xl text-white font-medium shadow-sm transition-colors cursor-pointer flex items-center justify-center ${finalConfirmColor} ${
            isDeleting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isDeleting ? <Loader className="size-4 animate-spin" /> : confirmText}
        </button>
      </div>
    </div>
  );
};

export default ConfirmAlert;
