import { Icon } from "lucide-react";
import React from "react";

const EmptyState = ({ Icon = Icon, title, description }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="p-6 rounded-full bg-blue-100 mb-4">
        <Icon className="size-12 text-blue-500" />
      </div>

      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>

      <p className="text-sm text-gray-500 text-center max-w-md mb-6">
        {description}
      </p>
    </div>
  );
};

export default EmptyState;
