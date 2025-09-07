import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { Student } from "@shared/schema";

interface StudentTableProps {
  students: Student[];
  isLoading: boolean;
}

export default function StudentTable({ students, isLoading }: StudentTableProps) {
  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
      case 'high':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getDefaultAvatar = (name: string) => {
    const avatars = [
      "https://images.unsplash.com/photo-1494790108755-2616b332fe3c?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60",
    ];
    // Simple hash to pick consistent avatar for each name
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return avatars[hash % avatars.length];
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-800 border-gray-700" data-testid="card-students-loading">
        <CardHeader className="border-b border-gray-700">
          <CardTitle className="text-white">Students</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full bg-gray-700" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32 bg-gray-700" />
                  <Skeleton className="h-3 w-20 bg-gray-700" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!students || students.length === 0) {
    return (
      <Card className="bg-gray-800 border-gray-700" data-testid="card-students-empty">
        <CardHeader className="border-b border-gray-700">
          <CardTitle className="text-white">Students</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-gray-600 rounded"></div>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No students found</h3>
            <p className="text-gray-400">Try adjusting your filters or upload student data to get started.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700" data-testid="card-students">
      <CardHeader className="border-b border-gray-700">
        <CardTitle className="text-white">Students</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-700">
              <TableRow>
                <TableHead className="text-gray-300">Student</TableHead>
                <TableHead className="text-gray-300">Class</TableHead>
                <TableHead className="text-gray-300">Attendance</TableHead>
                <TableHead className="text-gray-300">Score Average</TableHead>
                <TableHead className="text-gray-300">Risk Level</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id} className="hover:bg-gray-700 transition-colors" data-testid={`student-row-${student.id}`}>
                  <TableCell className="py-4">
                    <div className="flex items-center">
                      <img 
                        className="h-10 w-10 rounded-full object-cover" 
                        src={student.profileImageUrl || getDefaultAvatar(student.name)} 
                        alt={student.name}
                        data-testid="img-student-avatar"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white" data-testid="text-student-name">{student.name}</div>
                        <div className="text-sm text-gray-400" data-testid="text-student-id">{student.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-300" data-testid="text-student-class">{student.class}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-300" data-testid="text-student-attendance">{student.attendance}%</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-300" data-testid="text-student-score">{student.scoreAverage}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRiskBadgeColor(student.riskLevel)} data-testid="badge-student-risk">
                      {student.riskLevel.charAt(0).toUpperCase() + student.riskLevel.slice(1)} Risk
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link href={`/students/${student.id}`}>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-blue-400 hover:text-blue-300 p-0 h-auto"
                          data-testid="button-view-student"
                        >
                          View
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-400 hover:text-gray-300 p-0 h-auto"
                        data-testid="button-edit-student"
                      >
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="bg-gray-800 px-6 py-3 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400" data-testid="text-pagination-info">
              Showing 1 to {students.length} of {students.length} results
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                disabled
                className="bg-gray-700 border-gray-600 text-gray-300"
                data-testid="button-pagination-prev"
              >
                Previous
              </Button>
              <Button 
                variant="default" 
                size="sm"
                className="bg-blue-600 text-white"
                data-testid="button-pagination-current"
              >
                1
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                disabled
                className="bg-gray-700 border-gray-600 text-gray-300"
                data-testid="button-pagination-next"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
