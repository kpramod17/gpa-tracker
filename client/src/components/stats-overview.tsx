import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Book, Calendar, TrendingUp } from "lucide-react";
import { calculateCumulativeGPA, getProgressPercentage } from "@/lib/gpa-utils";
import type { TermWithCourses } from "@shared/schema";

interface StatsOverviewProps {
  terms: TermWithCourses[];
}

export function StatsOverview({ terms }: StatsOverviewProps) {
  const cumulativeStats = calculateCumulativeGPA(terms);
  const progressPercentage = getProgressPercentage(cumulativeStats.totalUnits);
  const activeTermsCount = terms.filter(term => term.status === 'active').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Cumulative GPA</p>
              <p className="text-3xl font-bold text-primary" data-testid="cumulative-gpa">
                {cumulativeStats.gpa.toFixed(2)}
              </p>
            </div>
            <div className="bg-primary/10 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Units</p>
              <p className="text-3xl font-bold text-foreground" data-testid="total-units">
                {cumulativeStats.totalUnits}
              </p>
              <p className="text-xs text-muted-foreground">of 72 required</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
              <Book className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>Progress</span>
              <span data-testid="progress-percentage">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${progressPercentage}%` }}
                data-testid="progress-bar"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Terms</p>
              <p className="text-3xl font-bold text-foreground" data-testid="active-terms">
                {activeTermsCount}
              </p>
            </div>
            <div className="bg-amber-100 dark:bg-amber-900/20 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
