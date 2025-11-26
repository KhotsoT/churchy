import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Group, GroupType } from '../types';
import { groupService } from '../services/groupService';
import { useToastStore } from '../store/toastStore';
import { useConfirmStore } from '../store/confirmStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { SkeletonList } from '../components/ui/Skeleton';
import EmptyState, { EmptyStateIcons } from '../components/ui/EmptyState';
import './GroupsScreen.css';

export default function GroupsScreen() {
  const navigate = useNavigate();
  const { showToast } = useToastStore();
  const { show: showConfirm } = useConfirmStore();
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<GroupType | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadGroups();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, filterType]);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const response = await groupService.getAll({ 
        search: searchQuery,
        type: filterType !== 'all' ? filterType : undefined 
      });
      if (response.success && response.data) {
        setGroups(response.data.data || []);
      } else {
        showToast(response.error || 'Failed to load groups', 'error');
      }
    } catch (error: any) {
      showToast('Failed to load groups', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (group: Group) => {
    showConfirm({
      title: 'Delete Group',
      message: `Are you sure you want to delete "${group.name}"? This will remove all member associations.`,
      confirmText: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        const response = await groupService.delete(group.id);
        if (response.success) {
          showToast('Group deleted successfully', 'success');
          loadGroups();
        } else {
          showToast(response.error || 'Failed to delete group', 'error');
        }
      },
    });
  };

  const getTypeColor = (type: GroupType) => {
    switch (type) {
      case GroupType.SMALL_GROUP: return 'type-small-group';
      case GroupType.MINISTRY: return 'type-ministry';
      case GroupType.COMMITTEE: return 'type-committee';
      case GroupType.CLASS: return 'type-class';
      default: return 'type-other';
    }
  };

  const getTypeLabel = (type: GroupType) => {
    switch (type) {
      case GroupType.SMALL_GROUP: return 'Small Group';
      case GroupType.MINISTRY: return 'Ministry';
      case GroupType.COMMITTEE: return 'Committee';
      case GroupType.CLASS: return 'Class';
      default: return 'Other';
    }
  };

  return (
    <div className="groups-screen">
      <div className="page-header">
        <div>
          <h1>Groups</h1>
          <p className="page-subtitle">Manage ministries and small groups</p>
        </div>
        <Button variant="contained" onClick={() => navigate('/groups/new')}>
          + New Group
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
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as GroupType | 'all')}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value={GroupType.SMALL_GROUP}>Small Group</option>
            <option value={GroupType.MINISTRY}>Ministry</option>
            <option value={GroupType.COMMITTEE}>Committee</option>
            <option value={GroupType.CLASS}>Class</option>
            <option value={GroupType.OTHER}>Other</option>
          </select>
        </div>
      </Card>

      {loading ? (
        <SkeletonList items={5} />
      ) : groups.length > 0 ? (
        <div className="groups-grid">
          {groups.map((group, index) => (
            <Card key={group.id || index} className="group-card" onClick={() => navigate(`/groups/${group.id}`)}>
              <div className="group-card-header">
                <div className="group-icon" style={{ backgroundColor: `hsl(${group.name.charCodeAt(0) * 10}, 60%, 50%)` }}>
                  {group.name.charAt(0).toUpperCase()}
                </div>
                <div className="group-header-info">
                  <h3 className="group-name">{group.name}</h3>
                  <span className={`group-type-badge ${getTypeColor(group.type)}`}>
                    {getTypeLabel(group.type)}
                  </span>
                </div>
                <span className={`status-indicator ${group.isActive ? 'active' : 'inactive'}`}>
                  {group.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {group.description && (
                <p className="group-description">{group.description}</p>
              )}

              <div className="group-meta">
                {group.leaderId && typeof group.leaderId === 'object' && (
                  <div className="meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span>Leader: {group.leaderId.firstName} {group.leaderId.lastName}</span>
                  </div>
                )}
                <div className="meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  <span>{Array.isArray(group.members) ? group.members.length : 0} members</span>
                </div>
                {group.meetingSchedule && (
                  <div className="meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>{group.meetingSchedule}</span>
                  </div>
                )}
              </div>

              <div className="group-card-actions">
                <Button
                  variant="outlined"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/groups/${group.id}`);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(group);
                  }}
                  className="delete-btn"
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={EmptyStateIcons.groups}
          title={searchQuery ? "No groups found" : "No groups yet"}
          description={searchQuery 
            ? "Try adjusting your search or filters."
            : "Create your first group to organize members into ministries and small groups."}
          actionLabel={!searchQuery ? "Create First Group" : undefined}
          onAction={!searchQuery ? () => navigate('/groups/new') : undefined}
        />
      )}
    </div>
  );
}
