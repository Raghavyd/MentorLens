import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import type { ScoreHistory, AttendanceHistory } from "@shared/schema";

interface AttendanceChartProps {
  studentId: string;
}

export function AttendanceChart({ studentId }: AttendanceChartProps) {
  const { data: attendanceHistory, isLoading } = useQuery({
    queryKey: ["/api/students", studentId, "attendance-history"],
    enabled: !!studentId,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400 text-sm">Loading chart...</div>
      </div>
    );
  }

  if (!attendanceHistory || attendanceHistory.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400 text-sm">No attendance data available</div>
      </div>
    );
  }

  const chartData = (attendanceHistory as AttendanceHistory[]).map((entry) => ({
    date: new Date(entry.createdAt || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    attendance: parseFloat(entry.attendanceRate || '0'),
  }));

  return (
    <ResponsiveContainer width="100%" height="100%" data-testid="chart-attendance">
      <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12, fill: '#9CA3AF' }}
          axisLine={{ stroke: '#4B5563' }}
        />
        <YAxis 
          tick={{ fontSize: 12, fill: '#9CA3AF' }}
          axisLine={{ stroke: '#4B5563' }}
          domain={[0, 100]}
        />
        <Line 
          type="monotone" 
          dataKey="attendance" 
          stroke="#3B82F6" 
          strokeWidth={2}
          dot={{ fill: '#3B82F6', strokeWidth: 0, r: 3 }}
          activeDot={{ r: 4, stroke: '#3B82F6', strokeWidth: 2, fill: '#1F2937' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface ScoreChartProps {
  studentId: string;
}

export function ScoreChart({ studentId }: ScoreChartProps) {
  const { data: scoreHistory, isLoading } = useQuery({
    queryKey: ["/api/students", studentId, "score-history"],
    enabled: !!studentId,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400 text-sm">Loading chart...</div>
      </div>
    );
  }

  if (!scoreHistory || scoreHistory.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400 text-sm">No score data available</div>
      </div>
    );
  }

  const chartData = (scoreHistory as ScoreHistory[]).map((entry) => ({
    date: new Date(entry.createdAt || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: parseFloat(entry.score || '0'),
  }));

  return (
    <ResponsiveContainer width="100%" height="100%" data-testid="chart-scores">
      <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12, fill: '#9CA3AF' }}
          axisLine={{ stroke: '#4B5563' }}
        />
        <YAxis 
          tick={{ fontSize: 12, fill: '#9CA3AF' }}
          axisLine={{ stroke: '#4B5563' }}
          domain={[0, 100]}
        />
        <Line 
          type="monotone" 
          dataKey="score" 
          stroke="#10B981" 
          strokeWidth={2}
          dot={{ fill: '#10B981', strokeWidth: 0, r: 3 }}
          activeDot={{ r: 4, stroke: '#10B981', strokeWidth: 2, fill: '#1F2937' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
