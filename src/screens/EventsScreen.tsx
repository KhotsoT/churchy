import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Event, EventType } from '../types';
import { formatDate } from '../utils/helpers';
import { eventService } from '../services/eventService';
import { useToastStore } from '../store/toastStore';
import { useConfirmStore } from '../store/confirmStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Calendar from '../components/ui/Calendar';
import { SkeletonList } from '../components/ui/Skeleton';
import EmptyState, { EmptyStateIcons } from '../components/ui/EmptyState';
import './EventsScreen.css';

export default function EventsScreen() {
  const navigate = useNavigate();
  const { showToast } = useToastStore();
  const { show: showConfirm } = useConfirmStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<EventType | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'calendar'>('list');

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadEvents();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, filterType]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const response = await eventService.getAll({ 
        search: searchQuery,
        type: filterType !== 'all' ? filterType : undefined
      });
      if (response.success && response.data) {
        setEvents(response.data.data || []);
      } else {
        showToast(response.error || 'Failed to load events', 'error');
      }
    } catch (error: any) {
      showToast('Failed to load events', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (event: Event) => {
    showConfirm({
      title: 'Delete Event',
      message: `Are you sure you want to delete "${event.title}"? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        const response = await eventService.delete(event.id);
        if (response.success) {
          showToast('Event deleted successfully', 'success');
          loadEvents();
        } else {
          showToast(response.error || 'Failed to delete event', 'error');
        }
      },
    });
  };

  const getEventTypeColor = (type: EventType) => {
    switch (type) {
      case EventType.SERVICE: return 'type-service';
      case EventType.MEETING: return 'type-meeting';
      case EventType.CLASS: return 'type-class';
      case EventType.SOCIAL: return 'type-social';
      case EventType.OUTREACH: return 'type-outreach';
      default: return 'type-other';
    }
  };

  const isUpcoming = (date: Date) => new Date(date) > new Date();

  return (
    <div className="events-screen">
      <div className="page-header">
        <div>
          <h1>Events</h1>
          <p className="page-subtitle">Manage church events and gatherings</p>
        </div>
        <Button variant="contained" onClick={() => navigate('/events/new')}>
          + Create Event
        </Button>
      </div>

      <Card className="filters-card">
        <div className="filters-row">
          <div className="search-wrapper">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <Input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as EventType | 'all')}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value={EventType.SERVICE}>Service</option>
            <option value={EventType.MEETING}>Meeting</option>
            <option value={EventType.CLASS}>Class</option>
            <option value={EventType.SOCIAL}>Social</option>
            <option value={EventType.OUTREACH}>Outreach</option>
            <option value={EventType.OTHER}>Other</option>
          </select>
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${view === 'list' ? 'active' : ''}`}
              onClick={() => setView('list')}
              title="List View"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </button>
            <button 
              className={`toggle-btn ${view === 'calendar' ? 'active' : ''}`}
              onClick={() => setView('calendar')}
              title="Calendar View"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </button>
          </div>
        </div>
      </Card>

      {view === 'calendar' && (
        <Calendar
          events={events.map(e => ({
            id: e.id,
            title: e.title,
            startDate: e.startDate,
            type: e.type,
          }))}
          onEventClick={(event) => navigate(`/events/${event.id}`)}
          onDateClick={(date) => {
            // Could filter events by this date or navigate to create
          }}
        />
      )}

      {view === 'list' && loading ? (
        <SkeletonList items={5} />
      ) : view === 'list' && events.length > 0 ? (
        <div className="events-list">
          {events.map((event, index) => (
            <Card key={event.id || index} className="event-card">
              <div className="event-card-content">
                <div className="event-date-badge">
                  <span className="event-month">{formatDate(event.startDate, 'MMM')}</span>
                  <span className="event-day">{formatDate(event.startDate, 'dd')}</span>
                </div>
                <div className="event-info">
                  <div className="event-header-row">
                    <h3 className="event-title">{event.title}</h3>
                    <span className={`event-type-badge ${getEventTypeColor(event.type)}`}>
                      {event.type}
                    </span>
                  </div>
                  <div className="event-meta">
                    <span className="event-time">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      {formatDate(event.startDate, 'h:mm a')}
                      {event.endDate && ` - ${formatDate(event.endDate, 'h:mm a')}`}
                    </span>
                    {event.location && (
                      <span className="event-location">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        {event.location}
                      </span>
                    )}
                  </div>
                  {event.description && (
                    <p className="event-description">{event.description}</p>
                  )}
                </div>
                <div className="event-actions">
                  {isUpcoming(event.startDate) && (
                    <span className="upcoming-badge">Upcoming</span>
                  )}
                  <Button variant="outlined" onClick={() => navigate(`/events/${event.id}`)}>
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => handleDelete(event)}
                    className="delete-btn"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : view === 'list' ? (
        <EmptyState
          icon={EmptyStateIcons.events}
          title={searchQuery ? "No events found" : "No events yet"}
          description={searchQuery 
            ? "Try adjusting your search or filters."
            : "Create your first event to get started with event management."}
          actionLabel={!searchQuery ? "Create First Event" : undefined}
          onAction={!searchQuery ? () => navigate('/events/new') : undefined}
        />
      ) : null}
    </div>
  );
}
