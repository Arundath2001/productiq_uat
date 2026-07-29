import { Info } from "lucide-react";
import React, { useState } from "react";

const QuantityTooltip = ({ quantityTypes }) => {
  const [isVisible, setIsVisible] = useState(false);

  if (!quantityTypes || quantityTypes.length === 0) return null;
  return (
    <div className="relative inline-block">
      <div
        className="cursor-pointer"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        <Info size={15} className="text-blue-400" />
      </div>

      {isVisible && (
        <div className="absolute ml-2 left-full w-48 z-50 top-1/2 -translate-y-1/2 bg-white border border-gray-500 rounded-lg p-3 shadow-lg">
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-gray-500"></div>
          <div className="absolute -left-[7px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-white"></div>

          <div className="text-sm font-semibold text-gray-700 mb-2">
            Quantity Types
          </div>

          <div className="space-y-2">
            {quantityTypes.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-gray-600 capitalize">{item.type}:</span>
                <span className="text-gray-900 font-medium">
                  {item.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuantityTooltip;
