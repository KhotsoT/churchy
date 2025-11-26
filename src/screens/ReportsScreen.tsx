import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { donationService } from '../services/donationService';
import { attendanceService } from '../services/attendanceService';
import { memberService } from '../services/memberService';
import { useToastStore } from '../store/toastStore';
import { formatCurrency } from '../utils/helpers';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import './ReportsScreen.css';

export default function ReportsScreen() {
  const { showToast } = useToastStore();
  const [reportType, setReportType] = useState('donations');
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [donationStats, setDonationStats] = useState<any>(null);
  const [attendanceStats, setAttendanceStats] = useState<any>(null);
  const [memberStats, setMemberStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadDonationReport = async () => {
    setLoading(true);
    try {
      const response = await donationService.getStats({ startDate, endDate });
      if (response.success && response.data) {
        setDonationStats(response.data);
      } else {
        showToast(response.error || 'Failed to load donation report', 'error');
      }
    } catch (error: any) {
      showToast('Failed to load donation report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceReport = async () => {
    setLoading(true);
    try {
      const response = await attendanceService.getStats({ startDate, endDate });
      if (response.success && response.data) {
        setAttendanceStats(response.data);
      } else {
        showToast(response.error || 'Failed to load attendance report', 'error');
      }
    } catch (error: any) {
      showToast('Failed to load attendance report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadMemberReport = async () => {
    setLoading(true);
    try {
      const response = await memberService.getAll();
      if (response.success && response.data) {
        const members = response.data.data || [];
        const byStatus = members.reduce((acc: any, m: any) => {
          acc[m.membershipStatus] = (acc[m.membershipStatus] || 0) + 1;
          return acc;
        }, {});
        setMemberStats(byStatus);
      } else {
        showToast(response.error || 'Failed to load member report', 'error');
      }
    } catch (error: any) {
      showToast('Failed to load member report', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reportType === 'donations') {
      loadDonationReport();
    } else if (reportType === 'attendance') {
      loadAttendanceReport();
    } else if (reportType === 'membership') {
      loadMemberReport();
    }
  }, [reportType, startDate, endDate]);

  const donationChartData = donationStats?.byType
    ? Object.entries(donationStats.byType).map(([type, amount]) => ({
        type: type.charAt(0).toUpperCase() + type.slice(1),
        amount,
      }))
    : [];

  const attendanceChartData = attendanceStats
    ? [
        { name: 'Present', value: attendanceStats.present },
        { name: 'Absent', value: attendanceStats.absent },
        { name: 'Late', value: attendanceStats.late },
      ]
    : [];

  const memberChartData = memberStats
    ? Object.entries(memberStats).map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count,
      }))
    : [];

  const COLORS = ['#4A90E2', '#7B68EE', '#50C878', '#F39C12', '#E74C3C'];

  return (
    <div className="reports-screen">
      <h1>Reports</h1>
      <Card>
        <div className="report-filters">
          <Select
            label="Report Type"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            options={[
              { value: 'donations', label: 'Donations' },
              { value: 'attendance', label: 'Attendance' },
              { value: 'membership', label: 'Membership' },
            ]}
          />
          <Input
            type="date"
            label="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            type="date"
            label="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </Card>

      {loading ? (
        <div className="loading-text">Loading report...</div>
      ) : (
        <>
          {reportType === 'donations' && donationStats && (
            <Card>
              <h3>Donation Report</h3>
              <div className="stats-summary">
                <div className="stat-item">
                  <span className="stat-label">Total Donations:</span>
                  <span className="stat-value">{formatCurrency(donationStats.total || 0)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Monthly Donations:</span>
                  <span className="stat-value">{formatCurrency(donationStats.monthly || 0)}</span>
                </div>
              </div>
              {donationChartData.length > 0 && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={donationChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="amount" fill="#4A90E2" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          )}

          {reportType === 'attendance' && attendanceStats && (
            <Card>
              <h3>Attendance Report</h3>
              <div className="stats-summary">
                <div className="stat-item">
                  <span className="stat-label">Total:</span>
                  <span className="stat-value">{attendanceStats.total || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Present:</span>
                  <span className="stat-value">{attendanceStats.present || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Absent:</span>
                  <span className="stat-value">{attendanceStats.absent || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Late:</span>
                  <span className="stat-value">{attendanceStats.late || 0}</span>
                </div>
              </div>
              {attendanceChartData.length > 0 && (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={attendanceChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {attendanceChartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card>
          )}

          {reportType === 'membership' && memberStats && (
            <Card>
              <h3>Membership Report</h3>
              {memberChartData.length > 0 && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={memberChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#50C878" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
}
