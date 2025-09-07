import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/navbar";
import { AttendanceChart, ScoreChart } from "@/components/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import type { Student, Alert, Intervention } from "@shared/schema";

export default function StudentDetail() {
  const { id } = useParams();
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [interventionNote, setInterventionNote] = useState("");

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

  const { data: student, isLoading: studentLoading } = useQuery({
    queryKey: ["/api/students", id],
    enabled: isAuthenticated && !!id,
    retry: false,
  });

  const { data: alerts } = useQuery({
    queryKey: ["/api/students", id, "alerts"],
    enabled: isAuthenticated && !!id,
    retry: false,
  });

  const { data: interventions } = useQuery({
    queryKey: ["/api/students", id, "interventions"],
    enabled: isAuthenticated && !!id,
    retry: false,
  });

  const addInterventionMutation = useMutation({
    mutationFn: async (note: string) => {
      return await apiRequest("POST", `/api/students/${id}/interventions`, {
        note,
        outcome: "in_progress",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students", id, "interventions"] });
      setInterventionNote("");
      toast({
        title: "Success",
        description: "Intervention added successfully",
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
        description: "Failed to add intervention",
        variant: "destructive",
      });
    },
  });

  const handleAddIntervention = () => {
    if (!interventionNote.trim()) {
      toast({
        title: "Error",
        description: "Please enter an intervention note",
        variant: "destructive",
      });
      return;
    }
    addInterventionMutation.mutate(interventionNote);
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading || !isAuthenticated || studentLoading) {
    return null;
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Student not found</h1>
            <Link href="/">
              <Button className="mt-4" data-testid="button-back-home">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" data-testid="button-back">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white" data-testid="text-student-name">
                  {student.name}
                </h1>
                <p className="text-gray-400">
                  Class <span data-testid="text-student-class">{student.class}</span> • Student ID: <span data-testid="text-student-id">{student.id}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className={getRiskBadgeColor(student.riskLevel)} data-testid="badge-risk-level">
                {student.riskLevel.charAt(0).toUpperCase() + student.riskLevel.slice(1)} Risk
              </Badge>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                data-testid="button-add-intervention"
                onClick={() => {
                  const element = document.getElementById('add-intervention');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Add Intervention
              </Button>
            </div>
          </div>

          {/* Student Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gray-800 border-gray-700" data-testid="card-current-status">
              <CardHeader>
                <CardTitle className="text-white">Current Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Attendance</span>
                  <span className="text-white font-medium" data-testid="text-attendance">
                    {student.attendance}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Score Average</span>
                  <span className="text-white font-medium" data-testid="text-score-average">
                    {student.scoreAverage}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Updated</span>
                  <span className="text-white font-medium" data-testid="text-last-updated">
                    {formatDate(student.updatedAt || '')}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Attendance Chart */}
            <Card className="bg-gray-800 border-gray-700" data-testid="card-attendance-chart">
              <CardHeader>
                <CardTitle className="text-white">Attendance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32">
                  <AttendanceChart studentId={id || ''} />
                </div>
              </CardContent>
            </Card>

            {/* Scores Chart */}
            <Card className="bg-gray-800 border-gray-700" data-testid="card-score-chart">
              <CardHeader>
                <CardTitle className="text-white">Score Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32">
                  <ScoreChart studentId={id || ''} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Alerts and Interventions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Alerts */}
            <Card className="bg-gray-800 border-gray-700" data-testid="card-alerts">
              <CardHeader>
                <CardTitle className="text-white">Recent Alerts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!alerts || alerts.length === 0 ? (
                  <p className="text-gray-400 text-center py-4" data-testid="text-no-alerts">
                    No alerts found for this student
                  </p>
                ) : (
                  alerts.map((alert: Alert) => (
                    <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-700 rounded-lg" data-testid={`alert-${alert.id}`}>
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        alert.status === 'active' ? 'bg-red-500' : 'bg-gray-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm text-white font-medium" data-testid="text-alert-reason">
                          {alert.reason}
                        </p>
                        <p className="text-xs text-gray-400 mt-1" data-testid="text-alert-date">
                          {formatDate(alert.createdAt || '')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Interventions */}
            <Card className="bg-gray-800 border-gray-700" data-testid="card-interventions">
              <CardHeader>
                <CardTitle className="text-white">Interventions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!interventions || interventions.length === 0 ? (
                  <p className="text-gray-400 text-center py-4" data-testid="text-no-interventions">
                    No interventions recorded for this student
                  </p>
                ) : (
                  interventions.map((intervention: Intervention) => (
                    <div key={intervention.id} className="p-4 bg-gray-700 rounded-lg" data-testid={`intervention-${intervention.id}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white" data-testid="text-intervention-date">
                          {formatDate(intervention.createdAt || '')}
                        </span>
                        <Badge 
                          variant={intervention.outcome === 'completed' ? 'default' : 'secondary'}
                          className={
                            intervention.outcome === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : intervention.outcome === 'in_progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }
                          data-testid="badge-intervention-outcome"
                        >
                          {intervention.outcome.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-300" data-testid="text-intervention-note">
                        {intervention.note}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Add Intervention */}
          <Card className="bg-gray-800 border-gray-700" id="add-intervention" data-testid="card-add-intervention">
            <CardHeader>
              <CardTitle className="text-white">Add New Intervention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Describe the intervention plan..."
                value={interventionNote}
                onChange={(e) => setInterventionNote(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
                data-testid="textarea-intervention-note"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleAddIntervention}
                  disabled={addInterventionMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="button-save-intervention"
                >
                  {addInterventionMutation.isPending ? "Adding..." : "Add Intervention"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
