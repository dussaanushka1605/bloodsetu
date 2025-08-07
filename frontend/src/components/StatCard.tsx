
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  horizontal?: boolean; // New prop for horizontal layout
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  className,
  trend,
  trendValue,
  horizontal = false,
}) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className={cn("p-6", horizontal && "flex items-center justify-between")}>
        <div className={cn(
          "flex", 
          horizontal ? "flex-row items-center justify-between w-full" : "flex-col"
        )}>
          <div className={cn(horizontal && "flex-1")}>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h2 className={cn("font-bold", horizontal ? "text-xl mt-1" : "text-3xl mt-2")}>{value}</h2>
            
            {trend && trendValue && (
              <p className={cn(
                "text-xs font-medium mt-1 flex items-center",
                trend === 'up' && "text-green-600",
                trend === 'down' && "text-red-600",
                trend === 'neutral' && "text-gray-500"
              )}>
                {trend === 'up' && <span className="mr-1">↑</span>}
                {trend === 'down' && <span className="mr-1">↓</span>}
                {trendValue}
              </p>
            )}
            
            {description && (
              <p className="text-sm text-muted-foreground mt-2">{description}</p>
            )}
          </div>
          
          {icon && (
            <div className={cn(
              "p-2 rounded-full",
              horizontal ? "bg-primary/10 ml-4" : "bg-primary/10 mt-4"
            )}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
