import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Download, GraduationCap, Calculator as CalculatorIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { gradeOptions, gradePoints, calculateTermGPA } from "@/lib/gpa-utils";
import * as XLSX from 'xlsx';

interface Course {
  id: string;
  name: string;
  units: number;
  grade: string;
}

export default function Calculator() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseName, setCourseName] = useState("");
  const [units, setUnits] = useState<number>(3);
  const [grade, setGrade] = useState<string>("A");
  const { toast } = useToast();

  const addCourse = () => {
    if (!courseName.trim()) {
      toast({
        title: "Course name required",
        description: "Please enter a course name",
        variant: "destructive",
      });
      return;
    }

    const newCourse: Course = {
      id: Math.random().toString(36).substr(2, 9),
      name: courseName.trim(),
      units,
      grade,
    };

    setCourses([...courses, newCourse]);
    setCourseName("");
    setUnits(3);
    setGrade("A");
    
    toast({
      title: "Course added",
      description: `${courseName} has been added to your GPA calculation`,
    });
  };

  const removeCourse = (id: string) => {
    setCourses(courses.filter(course => course.id !== id));
    toast({
      title: "Course removed",
      description: "Course has been removed from your calculation",
    });
  };

  const clearAll = () => {
    setCourses([]);
    toast({
      title: "All courses cleared",
      description: "All courses have been removed",
    });
  };

  const updateCourse = (id: string, updates: { name?: string; units?: number; grade?: string }) => {
    setCourses(courses.map(course => 
      course.id === id 
        ? { ...course, ...updates }
        : course
    ));
  };

  const stats = calculateTermGPA(courses);

  const downloadResults = () => {
    try {
      console.log("Starting Excel download...");
      console.log("XLSX library:", typeof XLSX);
      
      if (!XLSX || !XLSX.utils) {
        throw new Error("XLSX library not loaded properly");
      }

      // Create a new workbook
      const wb = XLSX.utils.book_new();
      console.log("Workbook created");
      
      // Create grade lookup table data
      const lookupData = [
        ['Grade Lookup Table:', '', ''],
        ['Grade', 'Points', ''],
        ['A', 4.0, ''],
        ['A-', 3.7, ''],
        ['B+', 3.3, ''],
        ['B', 3.0, ''],
        ['B-', 2.7, ''],
        ['C+', 2.3, ''],
        ['C', 2.0, ''],
        ['C-', 1.7, ''],
        ['D+', 1.3, ''],
        ['D', 1.0, ''],
        ['F', 0.0, ''],
        ['', '', ''],
      ];

      // Calculate starting row for course data (after lookup table + header)
      const courseDataStartRow = lookupData.length + 2; // +2 for gap and header
      
      // Create course data header
      const courseHeader = ['Course Name', 'Units', 'Grade', 'Grade Points'];
      
      // Create course data with formulas
      const courseData = courses.map((course, index) => {
        const currentRow = courseDataStartRow + index;
        // VLOOKUP formula to find grade points and multiply by units
        const gradePointsFormula = `=IFERROR(VLOOKUP(C${currentRow},$A$3:$B$14,2,FALSE)*B${currentRow},0)`;
        return [
          course.name,
          course.units,
          course.grade,
          { f: gradePointsFormula }  // Formula object for XLSX
        ];
      });

      // Calculate rows for totals
      const totalRowStart = courseDataStartRow + courses.length + 1;
      const totalUnitsRow = totalRowStart;
      const totalGradePointsRow = totalRowStart + 1;
      const gpaRow = totalRowStart + 2;

      // Create totals with formulas
      const totalsData = [
        ['', '', '', ''],
        ['Total Units', { f: `=SUM(B${courseDataStartRow}:B${courseDataStartRow + courses.length - 1})` }, '', ''],
        ['Total Grade Points', { f: `=SUM(D${courseDataStartRow}:D${courseDataStartRow + courses.length - 1})` }, '', ''],
        ['GPA', { f: `=IF(B${totalUnitsRow}>0,B${totalGradePointsRow}/B${totalUnitsRow},0)` }, '', '']
      ];

      // Combine all data
      const allData = [
        ...lookupData,
        courseHeader,
        ...courseData,
        ...totalsData
      ];

      console.log("Data prepared, creating worksheet...");

      // Convert to worksheet
      const ws = XLSX.utils.aoa_to_sheet(allData);
      console.log("Worksheet created");

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "GPA Calculation");
      console.log("Worksheet added to workbook");

      // Generate file and download
      const fileName = `gpa-calculation-${new Date().toISOString().split('T')[0]}.xlsx`;
      console.log("Attempting to write file:", fileName);
      
      XLSX.writeFile(wb, fileName);
      console.log("File download triggered");

      toast({
        title: "Download complete",
        description: "Your GPA calculation has been downloaded as an Excel file with working formulas",
      });
      
    } catch (error) {
      console.error("Error during Excel download:", error);
      
      // Fallback to CSV if Excel fails
      console.log("Falling back to CSV download...");
      
      const csvContent = [
        "Course Name,Units,Grade,Grade Points",
        ...courses.map(course => 
          `"${course.name}",${course.units},${course.grade},${gradePoints[course.grade] * course.units}`
        ),
        "",
        `Total Units,${stats.totalUnits},,`,
        `Total Grade Points,${stats.totalPoints},,`,
        `GPA,${stats.gpa},,`
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gpa-calculation-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download complete",
        description: "Downloaded as CSV (Excel generation failed)",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">GPA Calculator</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Calculate your Grade Point Average quickly and easily. Add your courses, grades, and units to get instant results.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Course Input Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add Course
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="course-name">Course Name</Label>
                  <Input
                    id="course-name"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="e.g., Introduction to Computer Science"
                    data-testid="input-course-name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="units">Units/Credits</Label>
                    <Select value={units.toString()} onValueChange={(value) => setUnits(parseInt(value))}>
                      <SelectTrigger data-testid="select-units">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map(unit => (
                          <SelectItem key={unit} value={unit.toString()}>{unit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="grade">Grade</Label>
                    <Select value={grade} onValueChange={setGrade}>
                      <SelectTrigger data-testid="select-grade">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {gradeOptions.map(gradeOption => (
                          <SelectItem key={gradeOption} value={gradeOption}>
                            {gradeOption} ({gradePoints[gradeOption]})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button 
                  onClick={addCourse} 
                  className="w-full"
                  data-testid="button-add-course"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Course
                </Button>
              </CardContent>
            </Card>

            {/* Course List */}
            {courses.length > 0 && (
              <Card className="mt-6">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Your Courses</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearAll}
                    data-testid="button-clear-all"
                  >
                    Clear All
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {courses.map((course) => (
                      <div 
                        key={course.id} 
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        data-testid={`course-item-${course.id}`}
                      >
                        <div className="flex-1">
                          <Input
                            type="text"
                            value={course.name}
                            onChange={(e) => updateCourse(course.id, { name: e.target.value })}
                            className="bg-transparent border-none text-foreground placeholder-muted-foreground focus:outline-none font-medium mb-1"
                            placeholder="Course Name"
                            data-testid={`input-course-name-${course.id}`}
                          />
                          <p className="text-sm text-muted-foreground">
                            {gradePoints[course.grade] * course.units} grade points
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-center">
                            <Label className="text-xs text-muted-foreground mb-1">Units</Label>
                            <Select 
                              value={course.units.toString()} 
                              onValueChange={(value) => updateCourse(course.id, { units: parseInt(value) })}
                            >
                              <SelectTrigger className="w-16" data-testid={`select-units-${course.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[1, 2, 3, 4, 5, 6].map(unit => (
                                  <SelectItem key={unit} value={unit.toString()}>{unit}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="flex flex-col items-center">
                            <Label className="text-xs text-muted-foreground mb-1">Grade</Label>
                            <Select 
                              value={course.grade} 
                              onValueChange={(value) => updateCourse(course.id, { grade: value })}
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
                            onClick={() => removeCourse(course.id)}
                            className="text-muted-foreground hover:text-destructive p-1"
                            data-testid={`button-remove-${course.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results Panel */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalculatorIcon className="h-5 w-5" />
                  GPA Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2" data-testid="calculated-gpa">
                    {stats.gpa.toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground">Current GPA</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Units:</span>
                    <span className="font-medium" data-testid="total-units">{stats.totalUnits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Grade Points:</span>
                    <span className="font-medium" data-testid="total-grade-points">{stats.totalPoints.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Courses:</span>
                    <span className="font-medium" data-testid="course-count">{courses.length}</span>
                  </div>
                </div>

                {courses.length > 0 && (
                  <Button 
                    onClick={downloadResults} 
                    className="w-full"
                    data-testid="button-download"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Results
                  </Button>
                )}

                {courses.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalculatorIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Add courses to see your GPA calculation</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Grade Scale Reference */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Grade Scale</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(gradePoints).map(([grade, points]) => (
                    <div key={grade} className="flex justify-between">
                      <span>{grade}</span>
                      <span>{points}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}