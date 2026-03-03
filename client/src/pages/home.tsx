import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, GraduationCap, Moon, Sun, Download, Info, LogOut, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { StatsOverview } from "@/components/stats-overview";
import { TermCard } from "@/components/term-card";
import { GpaChart } from "@/components/gpa-chart";
import { CsvImportExport } from "@/components/csv-import";
import { gradePoints } from "@/lib/gpa-utils";
import { useAuth } from "@/hooks/useAuth";
import type { TermWithCourses, InsertTerm, User } from "@shared/schema";

export default function Home() {
  const [selectedTerm, setSelectedTerm] = useState("");
  const [isDark, setIsDark] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, logout, isLoggingOut } = useAuth() as { user: User | null; logout: () => void; isLoggingOut: boolean };

  // Fetch terms
  const { data: terms = [], isLoading } = useQuery<TermWithCourses[]>({
    queryKey: ["/api/terms"],
  });

  // Create term mutation
  const createTermMutation = useMutation({
    mutationFn: async (termData: InsertTerm) => {
      const response = await apiRequest("POST", "/api/terms", termData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/terms"] });
      setSelectedTerm("");
      toast({
        title: "Success",
        description: "Term created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create term",
        variant: "destructive",
      });
    },
  });

  // Delete term mutation
  const deleteTermMutation = useMutation({
    mutationFn: async (termId: string) => {
      await apiRequest("DELETE", `/api/terms/${termId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/terms"] });
      toast({
        title: "Success",
        description: "Term deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete term",
        variant: "destructive",
      });
    },
  });

  // Create course mutation
  const createCourseMutation = useMutation({
    mutationFn: async ({ termId, courseData }: { termId: string; courseData: { name: string; units: number; grade: string } }) => {
      const response = await apiRequest("POST", `/api/terms/${termId}/courses`, courseData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/terms"] });
      toast({
        title: "Success",
        description: "Course added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add course",
        variant: "destructive",
      });
    },
  });

  // Update course mutation
  const updateCourseMutation = useMutation({
    mutationFn: async ({ courseId, updates }: { courseId: string; updates: { name?: string; units?: number; grade?: string } }) => {
      const response = await apiRequest("PATCH", `/api/courses/${courseId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/terms"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update course",
        variant: "destructive",
      });
    },
  });

  // Delete course mutation
  const deleteCourseMutation = useMutation({
    mutationFn: async (courseId: string) => {
      await apiRequest("DELETE", `/api/courses/${courseId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/terms"] });
      toast({
        title: "Success",
        description: "Course deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete course",
        variant: "destructive",
      });
    },
  });

  const handleAddTerm = () => {
    if (!selectedTerm || !user) return;
    
    const [season, year] = selectedTerm.split("-");
    const termName = `${season.charAt(0).toUpperCase() + season.slice(1)} ${year}`;
    
    createTermMutation.mutate({
      userId: user.id,
      name: termName,
      season,
      year: parseInt(year),
      status: "active",
    });
  };

  const handleAddCourse = (termId: string, courseData: { name: string; units: number; grade: string }) => {
    createCourseMutation.mutate({ termId, courseData });
  };

  const handleUpdateCourse = (courseId: string, updates: { name?: string; units?: number; grade?: string }) => {
    updateCourseMutation.mutate({ courseId, updates });
  };

  const handleDeleteCourse = (courseId: string) => {
    deleteCourseMutation.mutate(courseId);
  };

  const handleDeleteTerm = (termId: string) => {
    deleteTermMutation.mutate(termId);
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const handleExport = () => {
    const data = JSON.stringify(terms, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cgpa-data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTermOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1, currentYear, currentYear + 1];
    const seasons = ["summer", "fall", "winter", "spring"];
    
    const options = [];
    for (const year of years) {
      for (const season of seasons) {
        options.push({
          value: `${season}-${year}`,
          label: `${season.charAt(0).toUpperCase() + season.slice(1)} ${year}`
        });
      }
    }
    return options;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading your academic progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <GraduationCap className="text-primary h-8 w-8" />
              <h1 className="text-xl font-bold text-foreground">CGPA Calculator</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <UserIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">{user.firstName || user.email}</span>
                </div>
              )}
              <Button
                variant="ghost"
                onClick={handleExport}
                className="text-muted-foreground hover:text-foreground"
                data-testid="button-export"
              >
                <Download className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Export</span>
              </Button>
              <Button
                variant="ghost"
                onClick={toggleTheme}
                className="text-muted-foreground hover:text-foreground"
                data-testid="button-theme-toggle"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                onClick={() => logout()}
                disabled={isLoggingOut}
                className="text-muted-foreground hover:text-foreground"
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsOverview terms={terms} />
        
        {/* CSV Import/Export */}
        <CsvImportExport />

        {/* Term Selector */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div className="flex-1">
                <Label className="block text-sm font-medium text-foreground mb-2">Add New Term</Label>
                <div className="flex gap-3">
                  <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                    <SelectTrigger className="flex-1" data-testid="select-new-term">
                      <SelectValue placeholder="Select Term" />
                    </SelectTrigger>
                    <SelectContent>
                      {getTermOptions().map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAddTerm}
                    disabled={!selectedTerm || createTermMutation.isPending}
                    className="flex items-center gap-2"
                    data-testid="button-add-term"
                  >
                    <Plus className="h-4 w-4" />
                    Add Term
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms List */}
        <div className="space-y-6">
          {terms.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Terms Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start tracking your academic progress by adding your first term above.
                </p>
              </CardContent>
            </Card>
          ) : (
            terms.map((term) => (
              <TermCard
                key={term.id}
                term={term}
                onAddCourse={handleAddCourse}
                onUpdateCourse={handleUpdateCourse}
                onDeleteCourse={handleDeleteCourse}
                onDeleteTerm={handleDeleteTerm}
              />
            ))
          )}
        </div>

        {terms.length > 0 && <GpaChart terms={terms} />}

        {/* Grading Scale Reference */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Grading Scale Reference
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {Object.entries(gradePoints).map(([grade, points]) => (
                <div key={grade} className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="font-bold text-foreground">{grade}</p>
                  <p className="text-sm text-muted-foreground">{points}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
