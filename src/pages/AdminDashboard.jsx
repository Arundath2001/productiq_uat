import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  PlaneTakeoff,
  Ship,
  Users,
  Building2,
  Activity,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { authUser } = useAuthStore();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/dashboard/stats`,
          { withCredentials: true }
        );
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
        toast.error("Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Welcome back, {authUser?.username}. Here's what's happening today.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Air Voyages"
          value={stats?.totalAirVoyages || 0}
          icon={PlaneTakeoff}
          color="bg-sky-100 text-sky-600"
        />
        <MetricCard
          title="Sea Voyages"
          value={stats?.totalSeaVoyages || 0}
          icon={Ship}
          color="bg-blue-100 text-blue-600"
        />
        <MetricCard
          title="Total Clients"
          value={stats?.totalClients || 0}
          icon={Building2}
          color="bg-indigo-100 text-indigo-600"
        />
        <MetricCard
          title="System Users"
          value={stats?.totalSystemUsers || 0}
          icon={Users}
          color="bg-purple-100 text-purple-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-gray-400" />
            Top 10 Active Clients
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.topClients || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 12 }} 
                />
                <RechartsTooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar 
                  dataKey="value" 
                  name="Packages / Cargo Volume" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Stats side panel */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Insights</h2>
          <div className="space-y-6">
            <div className="border-b border-gray-50 pb-4">
              <p className="text-sm text-gray-500 mb-1">Most Active Client</p>
              <p className="text-xl font-bold text-gray-900">
                {stats?.topClients && stats.topClients.length > 0 ? stats.topClients[0].name : "N/A"}
              </p>
            </div>
            <div className="border-b border-gray-50 pb-4">
              <p className="text-sm text-gray-500 mb-1">Voyage Distribution</p>
              <div className="flex gap-2 mt-2">
                <div className="flex-1 bg-sky-100 rounded-lg p-2 text-center">
                  <span className="block text-sky-700 font-bold">{stats?.totalAirVoyages || 0}</span>
                  <span className="text-xs text-sky-600 uppercase tracking-wider">Air</span>
                </div>
                <div className="flex-1 bg-blue-100 rounded-lg p-2 text-center">
                  <span className="block text-blue-700 font-bold">{stats?.totalSeaVoyages || 0}</span>
                  <span className="text-xs text-blue-600 uppercase tracking-wider">Sea</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">System Health</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-sm font-medium text-gray-700">All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
    <div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
  </div>
);

export default AdminDashboard;
