import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import StudentTable from "@/components/student-table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Student } from "@shared/schema";

// Fake stats
const fakeStats = {
  lowRisk: 10,
  mediumRisk: 5,
  highRisk: 2,
  total: 17,
};

// Fake student data
const fakeStudents: Student[] = [
  { id: "1", name: "Aman Kumar", class: "10A", riskLevel: "low" },
  { id: "2", name: "Rahul Sharma", class: "10B", riskLevel: "medium" },
  { id: "3", name: "Priya Singh", class: "9A", riskLevel: "high" },
  { id: "4", name: "Anjali Das", class: "9B", riskLevel: "low" },
  { id: "5", name: "Vikram Roy", class: "10A", riskLevel: "medium" },
];

export default function Dashboard() {
  const [classFilter, setClassFilter] = useState<string>("");
  const [riskFilter, setRiskFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [students, setStudents] = useState<Student[]>(fakeStudents);

  // Filter students when filters or search term change
  useEffect(() => {
    let filtered = fakeStudents;

    if (classFilter) {
      filtered = filtered.filter((s) => s.class === classFilter);
    }

    if (riskFilter) {
      filtered = filtered.filter((s) => s.risk === riskFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter((s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setStudents(filtered);
  }, [classFilter, riskFilter, searchTerm]);

  const handleSearch = () => {
    // Filtering is handled by useEffect
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <p className="text-sm text-gray-400">Low Risk</p>
                <p className="text-2xl font-bold text-white">{fakeStats.lowRisk}</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <p className="text-sm text-gray-400">Medium Risk</p>
                <p className="text-2xl font-bold text-white">{fakeStats.mediumRisk}</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <p className="text-sm text-gray-400">High Risk</p>
                <p className="text-2xl font-bold text-white">{fakeStats.highRisk}</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <p className="text-sm text-gray-400">Total Students</p>
                <p className="text-2xl font-bold text-white">{fakeStats.total}</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Class</label>
                  <Select value={classFilter} onValueChange={setClassFilter}>
                    <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="All Classes" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="all">All Classes</SelectItem>
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
                    <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="All Risk Levels" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="all">All Risk Levels</SelectItem>
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
                />
                <Button 
                  onClick={handleSearch}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Students Table */}
          <StudentTable students={students} isLoading={false} />
        </div>
      </main>
    </div>
  );
}
