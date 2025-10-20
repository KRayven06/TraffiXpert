"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Thermometer } from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";

const hours = Array.from({ length: 24 }, (_, i) => i);
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const generateHeatmapData = () => Array.from({ length: 7 }, () =>
  Array.from({ length: 24 }, () => Math.random())
);

const getColor = (value: number) => {
    if (value > 0.8) return "bg-destructive/80";
    if (value > 0.6) return "bg-destructive/60";
    if (value > 0.4) return "bg-yellow-400/50";
    if (value > 0.2) return "bg-primary/40";
    return "bg-primary/20";
}

export function CongestionHeatmap() {
    const [heatmapData, setHeatmapData] = useState<number[][]>([]);

    useEffect(() => {
        setHeatmapData(generateHeatmapData());
    }, []);

    if (heatmapData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg">Congestion Heatmap</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                        Loading heatmap...
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-lg">Congestion Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 text-xs">
                    <div></div>
                    <div className="grid grid-cols-12 text-center text-muted-foreground">
                        {hours.filter(h => h % 2 === 0).map(hour => (
                            <div key={hour} className="col-span-1">{hour.toString().padStart(2, '0')}</div>
                        ))}
                    </div>

                    {days.map((day, dayIndex) => (
                        <React.Fragment key={day}>
                            <div className="text-muted-foreground font-medium pr-2 text-right">{day}</div>
                            <div className="grid grid-cols-24 gap-px">
                                {hours.map(hour => (
                                    <div
                                        key={`${day}-${hour}`}
                                        className={cn(
                                            "h-4 w-full rounded-sm",
                                            getColor(heatmapData[dayIndex][hour])
                                        )}
                                        title={`Congestion: ${(heatmapData[dayIndex][hour] * 100).toFixed(0)}%`}
                                    />
                                ))}
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
