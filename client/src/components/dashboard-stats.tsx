import { Progress } from "@/components/ui/progress";

interface DashboardStatsProps {
  stats: {
    totalOrders: number;
    completedOrders: number;
    totalEarnings: number;
    averageRating: number;
    activeServices: number;
  };
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const completionRate = stats.totalOrders > 0 ? (stats.completedOrders / stats.totalOrders) * 100 : 0;
  
  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Completion Rate</span>
          <span className="text-sm text-gray-600">{completionRate.toFixed(1)}%</span>
        </div>
        <Progress value={completionRate} className="h-2" />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Average Rating</span>
          <span className="text-sm text-gray-600">{stats.averageRating.toFixed(1)}/5.0</span>
        </div>
        <Progress value={(stats.averageRating / 5) * 100} className="h-2" />
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
          <div className="text-xs text-gray-500">Total Orders</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.activeServices}</div>
          <div className="text-xs text-gray-500">Active Services</div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">${stats.totalEarnings.toFixed(2)}</div>
          <div className="text-sm text-gray-500">Total Earnings</div>
        </div>
      </div>
    </div>
  );
}
