import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { gradeOptions, gradePoints } from "@/lib/gpa-utils";
import type { Course } from "@shared/schema";

interface CourseFormProps {
  onAddCourse: (course: { name: string; units: number; grade: string }) => void;
}

export function CourseForm({ onAddCourse }: CourseFormProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [units, setUnits] = useState<number>(3);
  const [grade, setGrade] = useState<string>("A");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim()) return;
    
    onAddCourse({
      name: courseName.trim(),
      units,
      grade,
    });
    
    setCourseName("");
    setUnits(3);
    setGrade("A");
    setIsAdding(false);
  };

  const handleCancel = () => {
    setCourseName("");
    setUnits(3);
    setGrade("A");
    setIsAdding(false);
  };

  if (!isAdding) {
    return (
      <Button
        variant="outline"
        className="w-full py-3 border-2 border-dashed border-border hover:border-primary text-muted-foreground hover:text-primary transition-colors rounded-lg flex items-center justify-center gap-2"
        onClick={() => setIsAdding(true)}
        data-testid="button-add-course"
      >
        <Plus className="h-4 w-4" />
        Add Course
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-3 bg-muted/50 rounded-lg space-y-3">
      <div>
        <Label htmlFor="course-name" className="text-xs text-muted-foreground">Course Name</Label>
        <Input
          id="course-name"
          type="text"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          placeholder="e.g., Computer Science Fundamentals"
          className="mt-1"
          data-testid="input-course-name"
          autoFocus
        />
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor="course-units" className="text-xs text-muted-foreground">Units</Label>
          <Select value={units.toString()} onValueChange={(value) => setUnits(parseInt(value))}>
            <SelectTrigger className="mt-1" data-testid="select-course-units">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="course-grade" className="text-xs text-muted-foreground">Grade</Label>
          <Select value={grade} onValueChange={setGrade}>
            <SelectTrigger className="mt-1" data-testid="select-course-grade">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {gradeOptions.map((gradeOption) => (
                <SelectItem key={gradeOption} value={gradeOption}>
                  {gradeOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-xs text-muted-foreground">Points</Label>
          <div className="mt-1 px-2 py-1 bg-primary/10 text-primary rounded text-sm font-medium text-center">
            {gradePoints[grade]}
          </div>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="flex-1" data-testid="button-save-course">
          Save Course
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={handleCancel} data-testid="button-cancel-course">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

interface CourseItemProps {
  course: Course;
  onUpdateCourse: (id: string, updates: { name?: string; units?: number; grade?: string }) => void;
  onDeleteCourse: (id: string) => void;
}

export function CourseItem({ course, onUpdateCourse, onDeleteCourse }: CourseItemProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
      <div className="flex-1">
        <Input
          type="text"
          value={course.name}
          onChange={(e) => onUpdateCourse(course.id, { name: e.target.value })}
          className="bg-transparent border-none text-foreground placeholder-muted-foreground focus:outline-none font-medium"
          placeholder="Course Name"
          data-testid={`input-course-name-${course.id}`}
        />
      </div>
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center">
          <Label className="text-xs text-muted-foreground mb-1">Units</Label>
          <Select 
            value={course.units.toString()} 
            onValueChange={(value) => onUpdateCourse(course.id, { units: parseInt(value) })}
          >
            <SelectTrigger className="w-16" data-testid={`select-units-${course.id}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex flex-col items-center">
          <Label className="text-xs text-muted-foreground mb-1">Grade</Label>
          <Select 
            value={course.grade} 
            onValueChange={(value) => onUpdateCourse(course.id, { grade: value })}
          >
            <SelectTrigger className="w-16" data-testid={`select-grade-${course.id}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {gradeOptions.map((gradeOption) => (
                <SelectItem key={gradeOption} value={gradeOption}>
                  {gradeOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex flex-col items-center">
          <Label className="text-xs text-muted-foreground mb-1">Points</Label>
          <span className="px-2 py-1 bg-primary/10 text-primary rounded text-sm font-medium">
            {gradePoints[course.grade]}
          </span>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDeleteCourse(course.id)}
          className="text-muted-foreground hover:text-destructive p-1"
          data-testid={`button-delete-${course.id}`}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
