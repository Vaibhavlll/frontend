import React, { memo } from "react";
import { Card } from "@/components/ui/card";

export type AnalyticsColor = "blue" | "green" | "purple" | "orange";

interface AnalyticsCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  value: string;
  color: AnalyticsColor;
}

const colorVariants: Record<AnalyticsColor, { bg: string; text: string }> = {
  blue: { bg: "bg-blue-100/80", text: "text-blue-600" },
  green: { bg: "bg-green-100/80", text: "text-green-600" },
  purple: { bg: "bg-purple-100/80", text: "text-purple-600" },
  orange: { bg: "bg-orange-100/80", text: "text-orange-600" },
};

const AnalyticsCard = memo(
  ({ icon: Icon, title, subtitle, value, color }: AnalyticsCardProps) => {
    const { bg, text } = colorVariants[color];

    return (
      <Card
        className="bg-white/80 backdrop-blur-sm border border-gray-100/60 rounded-lg hover:shadow-sm transition-all duration-300"
        style={{ padding: "10px 12px" }}
      >
        <div className="flex items-center justify-between gap-2">
          {/* Icon and titles */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className={`${bg} rounded-md flex items-center justify-center flex-shrink-0`}
              style={{
                width: "28px",
                height: "28px",
              }}
            >
              <Icon className={`${text} w-3.5 h-3.5`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-sans text-[11px] font-medium text-gray-900 truncate leading-tight">
                {title}
              </h3>
              <p className="font-sans text-[10px] text-gray-500 truncate leading-tight">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Value */}
          <div className="flex-shrink-0">
            <p className="font-sans text-xs font-medium text-gray-900 whitespace-nowrap">
              {value}
            </p>
          </div>
        </div>
      </Card>
    );
  }
);

AnalyticsCard.displayName = "AnalyticsCard";

export default AnalyticsCard;
