import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navbar from "@/components/navbar";
import StudentTable from "@/components/student-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Student } from "@shared/schema";

export default function Dashboard() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [classFilter, setClassFilter] = useState<string>("");
  const [riskFilter, setRiskFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

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

  const { data: students, isLoading: studentsLoading, refetch } = useQuery({
    queryKey: ["/api/students", classFilter, riskFilter, searchTerm],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/students/stats"],
    enabled: isAuthenticated,
    retry: false,
  });

  const handleSearch = () => {
    refetch();
  };

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Dashboard Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white" data-testid="heading-dashboard">Student Dashboard</h1>
              <p className="mt-2 text-gray-400">Monitor student progress and risk levels</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <span className="text-sm text-gray-400">Last updated: <span data-testid="text-last-updated">2 minutes ago</span></span>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gray-800 border-gray-700" data-testid="card-stats-low">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <div className="w-6 h-6 bg-green-500 rounded"></div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">Low Risk</p>
                    <p className="text-2xl font-bold text-white" data-testid="text-low-risk-count">
                      {statsLoading ? "..." : stats?.lowRisk || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700" data-testid="card-stats-medium">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-amber-500/10 rounded-lg">
                    <div className="w-6 h-6 bg-amber-500 rounded"></div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">Medium Risk</p>
                    <p className="text-2xl font-bold text-white" data-testid="text-medium-risk-count">
                      {statsLoading ? "..." : stats?.mediumRisk || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700" data-testid="card-stats-high">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <div className="w-6 h-6 bg-red-500 rounded"></div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">High Risk</p>
                    <p className="text-2xl font-bold text-white" data-testid="text-high-risk-count">
                      {statsLoading ? "..." : stats?.highRisk || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700" data-testid="card-stats-total">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <div className="w-6 h-6 bg-blue-500 rounded"></div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">Total Students</p>
                    <p className="text-2xl font-bold text-white" data-testid="text-total-count">
                      {statsLoading ? "..." : stats?.total || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Class</label>
                    <Select value={classFilter} onValueChange={setClassFilter}>
                      <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white" data-testid="select-class-filter">
                        <SelectValue placeholder="All Classes" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="">All Classes</SelectItem>
                        <SelectItem value="9A">Class 9A</SelectItem>
                        <SelectItem value="9B">Class 9B</SelectItem>
                        <SelectItem value="10A">Class 10A</SelectItem>
                        <SelectItem value="10B">Class 10B</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Risk Level</label>
                    <Select value={riskFilter} onValueChange={setRiskFilter}>
                      <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white" data-testid="select-risk-filter">
                        <SelectValue placeholder="All Risk Levels" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="">All Risk Levels</SelectItem>
                        <SelectItem value="low">Low Risk</SelectItem>
                        <SelectItem value="medium">Medium Risk</SelectItem>
                        <SelectItem value="high">High Risk</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    data-testid="input-search"
                  />
                  <Button 
                    onClick={handleSearch}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    data-testid="button-search"
                  >
                    Search
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Students Table */}
          <StudentTable 
            students={students as Student[] || []} 
            isLoading={studentsLoading} 
          />
        </div>
      </main>
    </div>
  );
}
