'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import type { GenerateDailyReportOutput } from "@/ai/flows/generate-daily-report";
import { ListChecks, Lightbulb } from "lucide-react";

interface ReportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    report: GenerateDailyReportOutput;
}

export function ReportDialog({ open, onOpenChange, report }: ReportDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-headline text-2xl">Daily Traffic Report</AlertDialogTitle>
          <AlertDialogDescription>
            An AI-generated summary of today's intersection performance.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
            <p className="text-sm">{report.summary}</p>
            <div>
                <h3 className="font-semibold flex items-center gap-2 mb-2"><Lightbulb className="w-5 h-5 text-primary"/> Recommendations</h3>
                <ul className="space-y-2 list-none pl-0">
                    {report.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground p-2 bg-secondary/50 rounded-md">
                           <ListChecks className="w-4 h-4 mt-0.5 text-primary shrink-0"/>
                           <span>{rec}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => onOpenChange(false)}>Close</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
