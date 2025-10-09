import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: string;
    type: "increase" | "decrease";
  };
  subtitle?: string;
  className?: string;
}

export const StatsCard = ({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  className,
}: StatsCardProps) => {
  return (
    <Card className={cn("bg-white shadow-sm", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
            {trend && (
              <p
                className={cn(
                  "text-sm mt-1",
                  trend.type === "increase" ? "text-green-600" : "text-red-600"
                )}
              >
                {trend.type === "increase" ? "↑" : "↓"} {trend.value}
              </p>
            )}
          </div>
          <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <Icon className="h-6 w-6 text-gray-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
