import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, BarChart3, TrendingUp, Calendar } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <GraduationCap className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Academic GPA Tracker
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Track your academic progress, manage terms and courses, and monitor your GPA growth
          </p>
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-login"
          >
            Get Started
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Organize Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Create and manage academic terms (semesters) with courses and grades.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                GPA Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Automatic GPA calculations for both individual terms and cumulative progress.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                Progress Visualization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Interactive charts and statistics to visualize your academic journey.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Card className="inline-block border-0 shadow-lg bg-blue-50 dark:bg-gray-800">
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Features Include:
              </h2>
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>✓ Term and course management</li>
                  <li>✓ Automatic GPA calculations</li>
                  <li>✓ Grade point tracking</li>
                  <li>✓ CSV bulk import/export</li>
                </ul>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>✓ Progress visualization</li>
                  <li>✓ Statistical analysis</li>
                  <li>✓ Secure user authentication</li>
                  <li>✓ Responsive design</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}