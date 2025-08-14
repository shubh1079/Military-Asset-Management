"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: "positive" | "negative" | "neutral"
  onClick?: () => void
  className?: string
}

export default function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend = "neutral",
  onClick, 
  className 
}: MetricCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case "positive":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "negative":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case "positive":
        return "text-green-600"
      case "negative":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <Card
      className={`${onClick ? "cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200" : ""} ${className || ""}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-700">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {getTrendIcon()}
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${getTrendColor()}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend !== "neutral" && (
          <div className="mt-2">
            <Badge 
              variant="secondary" 
              className={`text-xs ${
                trend === "positive" 
                  ? "bg-green-100 text-green-800" 
                  : "bg-red-100 text-red-800"
              }`}
            >
              {trend === "positive" ? "↗ Increasing" : "↘ Decreasing"}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
