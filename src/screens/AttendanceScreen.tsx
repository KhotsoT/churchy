import React, { useState, useEffect } from 'react';
import { Attendance, AttendanceStatus, Event, Member } from '../types';
import { formatDate } from '../utils/helpers';
import { attendanceService } from '../services/attendanceService';
import { eventService } from '../services/eventService';
import { memberService } from '../services/memberService';
import { useToastStore } from '../store/toastStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import { SkeletonTable } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import './AttendanceScreen.css';

export default function AttendanceScreen() {
  const { showToast } = useToastStore();
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, AttendanceStatus>>({});
  const [view, setView] = useState<'take' | 'history'>('take');

  useEffect(() => {
    loadEvents();
    loadMembers();
  }, []);

  useEffect(() => {
    if (selectedEvent && selectedDate && view === 'history') {
      loadAttendance();
    }
  }, [selectedEvent, selectedDate, view]);

  const loadEvents = async () => {
    try {
      const response = await eventService.getAll();
      if (response.success && response.data) {
        setEvents(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  };

  const loadMembers = async () => {
    try {
      const response = await memberService.getAll();
      if (response.success && response.data) {
        const memberList = response.data.data || [];
        setMembers(memberList);
        // Initialize attendance records with all present
        const records: Record<string, AttendanceStatus> = {};
        memberList.forEach((m: Member) => {
          records[m.id] = AttendanceStatus.PRESENT;
        });
        setAttendanceRecords(records);
      }
    } catch (error) {
      console.error('Failed to load members:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendance = async () => {
    if (!selectedEvent) return;
    setLoading(true);
    try {
      const response = await attendanceService.getAll({
        eventId: selectedEvent,
        date: selectedDate,
      });
      if (response.success && response.data) {
        setAttendance(response.data.data || []);
        // Update attendance records based on existing data
        const records: Record<string, AttendanceStatus> = {};
        members.forEach((m) => {
          records[m.id] = AttendanceStatus.ABSENT;
        });
        response.data.data?.forEach((a: Attendance) => {
          const memberId = typeof a.memberId === 'object' ? a.memberId.id : a.memberId;
          records[memberId] = a.status;
        });
        setAttendanceRecords(records);
      }
    } catch (error: any) {
      showToast('Failed to load attendance', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAttendance = async () => {
    if (!selectedEvent) {
      showToast('Please select an event', 'warning');
      return;
    }

    setSavingAttendance(true);
    try {
      const records = Object.entries(attendanceRecords).map(([memberId, status]) => ({
        memberId,
        eventId: selectedEvent,
        date: new Date(selectedDate),
        status,
      }));

      const response = await attendanceService.bulkCreate(records);
      if (response.success) {
        showToast('Attendance saved successfully!', 'success');
        loadAttendance();
      } else {
        showToast(response.error || 'Failed to save attendance', 'error');
      }
    } catch (error: any) {
      showToast('Failed to save attendance', 'error');
    } finally {
      setSavingAttendance(false);
    }
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT: return 'status-present';
      case AttendanceStatus.ABSENT: return 'status-absent';
      case AttendanceStatus.LATE: return 'status-late';
      case AttendanceStatus.EXCUSED: return 'status-excused';
      default: return '';
    }
  };

  const presentCount = Object.values(attendanceRecords).filter(s => s === AttendanceStatus.PRESENT).length;
  const absentCount = Object.values(attendanceRecords).filter(s => s === AttendanceStatus.ABSENT).length;

  return (
    <div className="attendance-screen">
      <div className="page-header">
        <div>
          <h1>Attendance</h1>
          <p className="page-subtitle">Track attendance for services and events</p>
        </div>
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${view === 'take' ? 'active' : ''}`}
            onClick={() => setView('take')}
          >
            Take Attendance
          </button>
          <button 
            className={`toggle-btn ${view === 'history' ? 'active' : ''}`}
            onClick={() => setView('history')}
          >
            View History
          </button>
        </div>
      </div>

      <Card className="filters-card">
        <div className="filters-row">
          <Select
            label="Event"
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            options={[
              { value: '', label: 'Select event...' },
              ...events.map((e) => ({ value: e.id, label: e.title })),
            ]}
          />
          <Input
            type="date"
            label="Date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </Card>

      {view === 'take' ? (
        <>
          {selectedEvent && members.length > 0 && (
            <Card className="attendance-card">
              <div className="attendance-summary">
                <div className="summary-item summary-present">
                  <span className="summary-count">{presentCount}</span>
                  <span className="summary-label">Present</span>
                </div>
                <div className="summary-item summary-absent">
                  <span className="summary-count">{absentCount}</span>
                  <span className="summary-label">Absent</span>
                </div>
                <div className="summary-item summary-total">
                  <span className="summary-count">{members.length}</span>
                  <span className="summary-label">Total</span>
                </div>
              </div>

              <div className="quick-actions-row">
                <Button 
                  variant="outlined" 
                  onClick={() => {
                    const records: Record<string, AttendanceStatus> = {};
                    members.forEach(m => { records[m.id] = AttendanceStatus.PRESENT; });
                    setAttendanceRecords(records);
                  }}
                >
                  Mark All Present
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => {
                    const records: Record<string, AttendanceStatus> = {};
                    members.forEach(m => { records[m.id] = AttendanceStatus.ABSENT; });
                    setAttendanceRecords(records);
                  }}
                >
                  Mark All Absent
                </Button>
              </div>

              <div className="members-attendance-list">
                {members.map((member, index) => (
                  <div key={member.id || index} className="attendance-row">
                    <div className="member-info">
                      <div 
                        className="member-avatar"
                        style={{ backgroundColor: `hsl(${member.firstName.charCodeAt(0) * 10}, 60%, 50%)` }}
                      >
                        {member.firstName[0]}{member.lastName[0]}
                      </div>
                      <span className="member-name">{member.firstName} {member.lastName}</span>
                    </div>
                    <div className="status-buttons">
                      {[AttendanceStatus.PRESENT, AttendanceStatus.ABSENT, AttendanceStatus.LATE, AttendanceStatus.EXCUSED].map((status) => (
                        <button
                          key={status}
                          className={`status-btn ${getStatusColor(status)} ${attendanceRecords[member.id] === status ? 'active' : ''}`}
                          onClick={() => setAttendanceRecords({
                            ...attendanceRecords,
                            [member.id]: status,
                          })}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="save-section">
                <Button
                  variant="contained"
                  onClick={handleSaveAttendance}
                  loading={savingAttendance}
                  className="save-btn"
                >
                  Save Attendance
                </Button>
              </div>
            </Card>
          )}

          {!selectedEvent && (
            <EmptyState
              title="Select an Event"
              description="Choose an event from the dropdown above to start taking attendance."
            />
          )}
        </>
      ) : (
        <Card>
          <h3 className="section-title">Attendance History</h3>
          {loading ? (
            <SkeletonTable rows={5} />
          ) : attendance.length > 0 ? (
            <div className="table-container">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Event</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Check-in Time</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record, index) => (
                    <tr key={record.id || index}>
                      <td>
                        {record.memberId && typeof record.memberId === 'object'
                          ? `${record.memberId.firstName} ${record.memberId.lastName}`
                          : 'Unknown'}
                      </td>
                      <td>
                        {record.eventId && typeof record.eventId === 'object'
                          ? record.eventId.title
                          : 'Unknown'}
                      </td>
                      <td>{formatDate(record.date, 'MMM dd, yyyy')}</td>
                      <td>
                        <span className={`status-badge ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td>{record.checkedInAt ? formatDate(record.checkedInAt, 'h:mm a') : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No attendance records"
              description={selectedEvent 
                ? "No attendance has been recorded for this event yet."
                : "Select an event to view attendance history."}
              variant="compact"
            />
          )}
        </Card>
      )}
    </div>
  );
}
