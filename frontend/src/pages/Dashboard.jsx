import { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import { Ticket, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { analyticsService } from '../services/analyticsService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [overviewData, chartsData] = await Promise.all([
          analyticsService.getOverview(),
          analyticsService.getCharts()
        ]);
        setOverview(overviewData);
        setCharts(chartsData);
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const stats = overview ? [
    { title: 'Total Tickets', value: overview.total_tickets.toString(), trend: 'up', trendValue: '12', icon: Ticket },
    { title: 'Resolution Rate', value: `${overview.resolution_rate}%`, trend: 'up', trendValue: '5', icon: TrendingUp },
    { title: 'Resolved Tickets', value: overview.resolved_tickets.toString(), trend: 'up', trendValue: '24', icon: CheckCircle2 },
    { title: 'High Urgency', value: overview.high_urgency_tickets.toString(), trend: 'down', trendValue: '2', icon: AlertCircle },
  ] : [];

  const COLORS = ['#4f46e5', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Track your AI support agent's performance</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/reports')}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm"
          >
            Export Report
          </button>
          <button 
            onClick={() => navigate('/tickets/new')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm ring-1 ring-indigo-600 ring-offset-1"
          >
            New Ticket
          </button>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="h-[400px] bg-gray-200 rounded-xl"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <StatCard key={i} {...stat} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm min-h-[400px] flex flex-col">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Ticket Volume</h2>
              <div className="flex-1 w-full h-[300px]">
                {charts?.volume_trend && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={charts.volume_trend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} dx={-10} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line type="monotone" dataKey="tickets" stroke="#4f46e5" strokeWidth={3} dot={{r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm min-h-[400px] flex flex-col">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h2>
              <div className="flex-1 flex flex-col items-center justify-center h-[300px]">
                {charts?.category_distribution && charts.category_distribution.length > 0 ? (
                  <>
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={charts.category_distribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {charts.category_distribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex flex-wrap justify-center gap-3">
                      {charts.category_distribution.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                          <span className="text-xs text-gray-600 font-medium">{entry.name}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-gray-400 text-sm">No data available</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
