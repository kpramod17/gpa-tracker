import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Download, FileText, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function CsvImportExport() {
  const [csvData, setCsvData] = useState("");
  const [isImportOpen, setIsImportOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async (csvData: string) => {
      // Parse CSV data
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',');
      const rows = lines.slice(1).map(line => line.split(','));
      
      const response = await apiRequest("POST", "/api/csv/import", { csvData: rows });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/terms"] });
      setIsImportOpen(false);
      setCsvData("");
      toast({
        title: "Import Successful",
        description: `Created ${data.termsCreated} terms and ${data.coursesCreated} courses`,
      });
    },
    onError: () => {
      toast({
        title: "Import Failed",
        description: "Failed to import CSV data. Please check the format.",
        variant: "destructive",
      });
    },
  });

  const downloadTemplate = () => {
    window.open("/api/csv/template", "_blank");
  };

  const handleImport = () => {
    if (!csvData.trim()) {
      toast({
        title: "No Data",
        description: "Please paste CSV data before importing",
        variant: "destructive",
      });
      return;
    }
    importMutation.mutate(csvData);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          CSV Import/Export
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 flex-wrap">
          <Button 
            variant="outline" 
            onClick={downloadTemplate}
            data-testid="button-download-template"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Template
          </Button>
          
          <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline"
                data-testid="button-import-csv"
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Import CSV
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Import CSV Data</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        CSV Format Requirements:
                      </p>
                      <ul className="text-xs text-yellow-700 dark:text-yellow-300 mt-1 space-y-1">
                        <li>• Headers: Term Name, Season, Year, Course Name, Units, Grade</li>
                        <li>• Season must be: fall, spring, summer, or winter</li>
                        <li>• Year must be a 4-digit number</li>
                        <li>• Grade must be a valid letter grade (A, B, C, D, F with +/- modifiers)</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="csv-data">Paste CSV Data</Label>
                  <Textarea
                    id="csv-data"
                    placeholder="Term Name,Season,Year,Course Name,Units,Grade&#10;Fall 2023,fall,2023,Calculus I,4,A&#10;Fall 2023,fall,2023,English,3,B+"
                    value={csvData}
                    onChange={(e) => setCsvData(e.target.value)}
                    className="min-h-[200px] mt-2 font-mono text-sm"
                    data-testid="textarea-csv-data"
                  />
                </div>
                
                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsImportOpen(false)}
                    data-testid="button-cancel-import"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleImport} 
                    disabled={importMutation.isPending}
                    data-testid="button-confirm-import"
                  >
                    {importMutation.isPending ? "Importing..." : "Import Data"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}