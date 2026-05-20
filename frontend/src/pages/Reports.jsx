import { BarChart3, Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import { analyticsService } from '../services/analyticsService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Reports() {
  const [charts, setCharts] = useState(null);

  useEffect(() => {
    analyticsService.getCharts().then(setCharts).catch(console.error);
  }, []);

  const handleExport = async () => {
    try {
      const response = await fetch('http://localhost:8000/tickets/export');
      if (!response.ok) throw new Error('Failed to export');
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'full_report.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(error);
      alert('Export failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 mt-1">Deep dive into your support metrics.</p>
        </div>
        <button 
          onClick={handleExport}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Download className="w-5 h-5" />
          Export Full CSV
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm min-h-[400px] flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-500" />
            Tickets by Status
          </h2>
          <div className="flex-1 w-full h-[300px]">
            {charts?.status_distribution ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.status_distribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">Loading...</div>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm min-h-[400px] flex flex-col items-center justify-center text-center">
           <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
             <BarChart3 className="w-8 h-8" />
           </div>
           <h3 className="text-lg font-medium text-gray-900 mb-2">More Reports Coming Soon</h3>
           <p className="text-gray-500 max-w-sm">We are building advanced reporting features including agent performance and sentiment trends.</p>
        </div>
      </div>
    </div>
  );
}
