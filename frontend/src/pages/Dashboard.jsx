import { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import { Ticket, CheckCircle2, AlertCircle, TrendingUp, Brain, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { analyticsService } from '../services/analyticsService';
import feedbackService from '../services/feedbackService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accuracyMetrics, setAccuracyMetrics] = useState(null);

  useEffect(() => {
    if (user?.role === 'user') {
      setLoading(false);
      return;
    }

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

      // Fetch accuracy metrics only for admins (non-blocking — don't let it delay the main load)
      if (user?.role === 'admin') {
        feedbackService.getAccuracyMetrics()
          .then(setAccuracyMetrics)
          .catch((err) => console.error('Error loading accuracy metrics:', err));
      }
    };

    fetchAnalytics();
  }, [user]);

  const stats = overview ? [
    { title: 'Total Tickets',    value: overview.total_tickets.toString(),       icon: Ticket,       accentColor: 'purple' },
    { title: 'Resolution Rate', value: `${overview.resolution_rate}%`,           icon: TrendingUp,   accentColor: 'green'  },
    { title: 'Resolved Tickets',value: overview.resolved_tickets.toString(),      icon: CheckCircle2, accentColor: 'blue'   },
    // High Urgency card: only shown when value > 0
    ...(overview.high_urgency_tickets > 0
      ? [{ title: 'High Urgency', value: overview.high_urgency_tickets.toString(), icon: AlertCircle, accentColor: 'red' }]
      : []),
  ] : [];

  const COLORS = ['#4f46e5', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Overview</h1>
          <p className="text-slate-400 text-sm mt-1">Track your AI support agent's performance</p>
        </div>
        <div className="flex gap-3">
          {user?.role !== 'user' && (
            <button 
              onClick={() => navigate('/admin/reports')}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all duration-200 text-sm font-medium"
            >
              Export Report
            </button>
          )}
        </div>
      </div>

      {user?.role === 'user' ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-1">Welcome, {user?.name || 'User'}</h2>
          <p className="text-slate-400 text-sm mb-5">Submit a ticket below or view your existing tickets.</p>
          <button 
            onClick={() => navigate('/admin/tickets')}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-500/20 transition-all duration-200 text-sm font-semibold hover:-translate-y-0.5 active:scale-95"
          >
            View Tickets
          </button>
        </div>
      ) : loading ? (
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse"></div>
            ))}
          </div>
          <div className="h-[400px] bg-slate-100 rounded-2xl animate-pulse"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <StatCard key={i} {...stat} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 min-h-[400px] flex flex-col">
              <h2 className="text-base font-semibold text-slate-900 mb-1 tracking-tight">Ticket Volume</h2>
              <p className="text-xs text-slate-400 mb-4">Tickets created over time</p>
              <div className="flex-1 w-full h-[300px]">
                {charts?.volume_trend && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={charts.volume_trend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280' }}
                        dy={10}
                        tickFormatter={(val) => {
                          const d = new Date(val);
                          if (isNaN(d.getTime())) return val;
                          return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        }}
                      />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} dx={-10} />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        labelFormatter={(val) => {
                          const d = new Date(val);
                          if (isNaN(d.getTime())) return val;
                          return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                        }}
                      />
                      <Line type="monotone" dataKey="tickets" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
            
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 min-h-[400px] flex flex-col">
              <h2 className="text-base font-semibold text-slate-900 mb-1 tracking-tight">Category Distribution</h2>
              <p className="text-xs text-slate-400 mb-4">Breakdown by support topic</p>
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
                          <span className="text-xs text-slate-600 font-medium">{entry.name}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-slate-400 text-sm">No data available</p>
                )}
              </div>
            </div>
          </div>

          {/* AI Accuracy Metrics — admin only, hidden until feedback exists */}
          {user?.role === 'admin' && accuracyMetrics && accuracyMetrics.total_feedback > 0 && (
            <div className="space-y-6">
              {/* Accuracy stat cards row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* AI Accuracy card */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                        <Brain className="w-5 h-5 text-indigo-600" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">AI Accuracy</span>
                    </div>
                    <span
                      className={`text-2xl font-bold ${
                        accuracyMetrics.accuracy_rate >= 80
                          ? 'text-emerald-600'
                          : accuracyMetrics.accuracy_rate >= 60
                          ? 'text-amber-500'
                          : 'text-rose-500'
                      }`}
                    >
                      {accuracyMetrics.accuracy_rate.toFixed(1)}%
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        accuracyMetrics.accuracy_rate >= 80
                          ? 'bg-emerald-500'
                          : accuracyMetrics.accuracy_rate >= 60
                          ? 'bg-amber-400'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(accuracyMetrics.accuracy_rate, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    {accuracyMetrics.correct_count} correct · {accuracyMetrics.incorrect_count} incorrect
                  </p>
                </div>

                {/* Feedback Received card */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-violet-600" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">Feedback Received</span>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">{accuracyMetrics.total_feedback}</p>
                  <p className="text-xs text-slate-400 mt-1">Agent classifications reviewed</p>
                </div>
              </div>

              {/* Per-category accuracy table */}
              {accuracyMetrics.by_category.length > 0 && (
                <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100">
                    <h2 className="text-base font-semibold text-slate-900 tracking-tight">Accuracy by Category</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Agent feedback broken down per ticket category</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                          <th className="text-left px-6 py-3 font-semibold">Category</th>
                          <th className="text-right px-6 py-3 font-semibold">Total Feedback</th>
                          <th className="text-right px-6 py-3 font-semibold">Correct</th>
                          <th className="text-right px-6 py-3 font-semibold">Accuracy %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {accuracyMetrics.by_category.map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-3 font-medium text-slate-800 capitalize">{row.category}</td>
                            <td className="px-6 py-3 text-right text-slate-600">{row.total}</td>
                            <td className="px-6 py-3 text-right text-slate-600">{row.correct}</td>
                            <td className="px-6 py-3 text-right">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                  row.accuracy >= 80
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : row.accuracy >= 60
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-rose-50 text-rose-700'
                                }`}
                              >
                                {row.accuracy.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
