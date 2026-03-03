import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { CourseForm, CourseItem } from "./course-form";
import { calculateTermGPA } from "@/lib/gpa-utils";
import type { TermWithCourses, Course } from "@shared/schema";

interface TermCardProps {
  term: TermWithCourses;
  onAddCourse: (termId: string, course: { name: string; units: number; grade: string }) => void;
  onUpdateCourse: (courseId: string, updates: { name?: string; units?: number; grade?: string }) => void;
  onDeleteCourse: (courseId: string) => void;
  onDeleteTerm: (termId: string) => void;
}

export function TermCard({ 
  term, 
  onAddCourse, 
  onUpdateCourse, 
  onDeleteCourse, 
  onDeleteTerm 
}: TermCardProps) {
  const termStats = calculateTermGPA(term.courses);
  
  const getTermColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'active':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Completed</Badge>;
      case 'active':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Active</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card className="term-card fade-in">
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${getTermColor(term.status)}`} />
            <h3 className="text-lg font-semibold text-foreground" data-testid={`term-name-${term.id}`}>
              {term.name}
            </h3>
            {getStatusBadge(term.status)}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Term GPA</p>
              <p className="text-xl font-bold text-foreground" data-testid={`term-gpa-${term.id}`}>
                {termStats.gpa.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Units</p>
              <p className="text-xl font-bold text-foreground" data-testid={`term-units-${term.id}`}>
                {termStats.totalUnits}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteTerm(term.id)}
              className="text-muted-foreground hover:text-destructive p-2"
              data-testid={`button-delete-term-${term.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="space-y-3 mb-4">
          {term.courses.map((course) => (
            <CourseItem
              key={course.id}
              course={course}
              onUpdateCourse={onUpdateCourse}
              onDeleteCourse={onDeleteCourse}
            />
          ))}
        </div>

        <CourseForm
          onAddCourse={(courseData) => onAddCourse(term.id, courseData)}
        />
      </CardContent>
    </Card>
  );
}
