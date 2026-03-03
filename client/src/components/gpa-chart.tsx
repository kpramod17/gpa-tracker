import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Plus } from "lucide-react";
import { calculateTermGPA } from "@/lib/gpa-utils";
import type { TermWithCourses } from "@shared/schema";

interface GpaChartProps {
  terms: TermWithCourses[];
}

export function GpaChart({ terms }: GpaChartProps) {
  // Sort terms chronologically
  const sortedTerms = [...terms].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    const seasonOrder = { spring: 1, summer: 2, fall: 3, winter: 4 };
    return (seasonOrder[a.season as keyof typeof seasonOrder] || 0) - (seasonOrder[b.season as keyof typeof seasonOrder] || 0);
  });

  const maxGpa = 4.0;

  return (
    <Card className="mt-8">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          GPA Progression
        </h3>
        <div className="h-64 flex items-end justify-start gap-4 overflow-x-auto pb-4">
          {sortedTerms.map((term, index) => {
            const termStats = calculateTermGPA(term.courses);
            const height = (termStats.gpa / maxGpa) * 100;
            
            return (
              <div key={term.id} className="flex flex-col items-center min-w-16" data-testid={`chart-bar-${term.id}`}>
                <div className="w-12 bg-primary/20 rounded-t flex items-end justify-center" style={{ height: '180px' }}>
                  <div 
                    className="w-full bg-primary rounded-t transition-all duration-500" 
                    style={{ height: `${height}%` }}
                  />
                </div>
                <div className="mt-2 text-center">
                  <p className="text-xs text-muted-foreground">{term.season.charAt(0).toUpperCase() + term.season.slice(1)} '{term.year.toString().slice(-2)}</p>
                  <p className="text-sm font-medium">{termStats.gpa.toFixed(2)}</p>
                </div>
              </div>
            );
          })}
          
          {/* Placeholder for future terms */}
          <div className="flex flex-col items-center min-w-16 opacity-50">
            <div className="w-12 bg-muted rounded-t border-2 border-dashed border-border flex items-center justify-center" style={{ height: '180px' }}>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2 text-center">
              <p className="text-xs text-muted-foreground">Next Term</p>
              <p className="text-sm font-medium">-</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
