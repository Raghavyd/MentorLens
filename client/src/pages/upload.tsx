import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload as UploadIcon, FileText, CheckCircle, AlertCircle } from "lucide-react";

interface CsvPreviewRow {
  name: string;
  class: string;
  attendance: string;
  scoreAverage: number;
  riskLevel: string;
}

interface CsvPreviewResponse {
  preview: CsvPreviewRow[];
  totalRows: number;
}

export default function Upload() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CsvPreviewResponse | null>(null);
  const [uploadHistory, setUploadHistory] = useState([
    {
      id: 1,
      filename: "students_march_2024.csv",
      records: 192,
      date: "March 15, 2024",
      status: "success" as const,
    },
    {
      id: 2,
      filename: "students_february_2024.csv",
      records: 180,
      date: "February 28, 2024",
      status: "warning" as const,
    },
  ]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const previewMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('csvFile', file);
      
      const response = await fetch('/api/upload/csv/preview', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status}: ${errorText}`);
      }

      return response.json() as Promise<CsvPreviewResponse>;
    },
    onSuccess: (data) => {
      setPreview(data);
      toast({
        title: "Preview Generated",
        description: `Found ${data.totalRows} rows in the CSV file`,
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to preview CSV file",
        variant: "destructive",
      });
    },
  });

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('csvFile', file);
      
      const response = await fetch('/api/upload/csv', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status}: ${errorText}`);
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/students/stats"] });
      
      // Add to upload history
      setUploadHistory(prev => [{
        id: prev.length + 1,
        filename: selectedFile?.name || 'unknown.csv',
        records: data.count,
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        status: 'success' as const,
      }, ...prev]);

      setSelectedFile(null);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast({
        title: "Import Successful",
        description: data.message,
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Import Failed",
        description: "Failed to import CSV data",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      previewMutation.mutate(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a valid CSV file",
        variant: "destructive",
      });
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      previewMutation.mutate(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a valid CSV file",
        variant: "destructive",
      });
    }
  };

  const handleImport = () => {
    if (selectedFile) {
      importMutation.mutate(selectedFile);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getRiskLevelBadgeColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-amber-600 bg-amber-100';
      case 'high':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-white" data-testid="heading-upload">Upload Student Data</h1>
            <p className="mt-2 text-gray-400">Import student information from CSV files</p>
          </div>

          {/* Upload Section */}
          <Card className="bg-gray-800 border-gray-700" data-testid="card-upload">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                  <UploadIcon className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Upload CSV File</h3>
                <p className="text-gray-400 mb-6">Select a CSV file containing student data</p>
                
                <div 
                  className="border-2 border-dashed border-gray-600 rounded-lg p-8 hover:border-gray-500 transition-colors cursor-pointer"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="dropzone-upload"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    accept=".csv" 
                    className="hidden" 
                    onChange={handleFileSelect}
                    data-testid="input-file"
                  />
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                      <FileText className="w-8 h-8 text-gray-500" />
                    </div>
                    <p className="text-white font-medium">
                      {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">CSV files only</p>
                    {previewMutation.isPending && (
                      <p className="text-blue-400 text-sm mt-2">Processing file...</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview Section */}
          {preview && (
            <Card className="bg-gray-800 border-gray-700" data-testid="card-preview">
              <CardHeader className="border-b border-gray-700">
                <CardTitle className="text-white">Data Preview</CardTitle>
                <p className="text-sm text-gray-400">Review the first 5 rows before importing</p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-700">
                      <TableRow>
                        <TableHead className="text-gray-300">Name</TableHead>
                        <TableHead className="text-gray-300">Class</TableHead>
                        <TableHead className="text-gray-300">Attendance</TableHead>
                        <TableHead className="text-gray-300">Score Average</TableHead>
                        <TableHead className="text-gray-300">Risk Level</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {preview.preview.map((row, index) => (
                        <TableRow key={index} data-testid={`preview-row-${index}`}>
                          <TableCell className="text-white" data-testid="cell-name">{row.name}</TableCell>
                          <TableCell className="text-gray-300" data-testid="cell-class">{row.class}</TableCell>
                          <TableCell className="text-gray-300" data-testid="cell-attendance">{row.attendance}</TableCell>
                          <TableCell className="text-gray-300" data-testid="cell-score">{row.scoreAverage}</TableCell>
                          <TableCell data-testid="cell-risk">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskLevelBadgeColor(row.riskLevel)}`}>
                              {row.riskLevel.charAt(0).toUpperCase() + row.riskLevel.slice(1)} Risk
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="px-6 py-4 border-t border-gray-700 bg-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400" data-testid="text-preview-summary">
                      {preview.totalRows} rows detected • Ready to import
                    </div>
                    <div className="flex space-x-3">
                      <Button 
                        variant="outline"
                        className="bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600"
                        onClick={handleCancel}
                        data-testid="button-cancel"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleImport}
                        disabled={importMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        data-testid="button-import"
                      >
                        {importMutation.isPending ? "Importing..." : "Import Data"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Import History */}
          <Card className="bg-gray-800 border-gray-700" data-testid="card-history">
            <CardHeader className="border-b border-gray-700">
              <CardTitle className="text-white">Import History</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {uploadHistory.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg" data-testid={`history-item-${item.id}`}>
                  <div className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full ${
                      item.status === 'success' ? 'bg-green-500' : 
                      item.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-white" data-testid="text-filename">{item.filename}</p>
                      <p className="text-xs text-gray-400" data-testid="text-details">
                        {item.records} records imported • {item.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {item.status === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {item.status === 'warning' && <AlertCircle className="w-4 h-4 text-amber-500" />}
                    <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      item.status === 'success' 
                        ? 'bg-green-100 text-green-800' 
                        : item.status === 'warning'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`} data-testid="badge-status">
                      {item.status === 'success' ? 'Success' : item.status === 'warning' ? 'Warning' : 'Error'}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
