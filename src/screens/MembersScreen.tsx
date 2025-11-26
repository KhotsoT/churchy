import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Member, MembershipStatus } from '../types';
import { formatDate, getInitials } from '../utils/helpers';
import { memberService } from '../services/memberService';
import { useToastStore } from '../store/toastStore';
import { useConfirmStore } from '../store/confirmStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { SkeletonList } from '../components/ui/Skeleton';
import EmptyState, { EmptyStateIcons } from '../components/ui/EmptyState';
import './MembersScreen.css';

export default function MembersScreen() {
  const navigate = useNavigate();
  const { showToast } = useToastStore();
  const { show: showConfirm } = useConfirmStore();
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<MembershipStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMembers();
  }, [filterStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadMembers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, filterStatus]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const response = await memberService.getAll({
        search: searchQuery,
        status: filterStatus !== 'all' ? filterStatus : undefined,
      });
      if (response.success && response.data) {
        setMembers(response.data.data || []);
      } else {
        showToast(response.error || 'Failed to load members', 'error');
      }
    } catch (error: any) {
      console.error('Error loading members:', error);
      showToast('Failed to load members', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (member: Member) => {
    showConfirm({
      title: 'Delete Member',
      message: `Are you sure you want to delete ${member.firstName} ${member.lastName}? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        const response = await memberService.delete(member.id);
        if (response.success) {
          showToast('Member deleted successfully', 'success');
          loadMembers();
        } else {
          showToast(response.error || 'Failed to delete member', 'error');
        }
      },
    });
  };

  const getStatusColor = (status: MembershipStatus) => {
    switch (status) {
      case MembershipStatus.ACTIVE:
        return 'status-active';
      case MembershipStatus.MEMBER:
        return 'status-member';
      case MembershipStatus.INACTIVE:
        return 'status-inactive';
      case MembershipStatus.VISITOR:
        return 'status-visitor';
      default:
        return '';
    }
  };

  return (
    <div className="members-screen">
      <div className="page-header">
        <div>
          <h1>Members</h1>
          <p className="page-subtitle">Manage your church members</p>
        </div>
        <Button variant="contained" onClick={() => navigate('/members/new')}>
          + Add Member
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
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as MembershipStatus | 'all')}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value={MembershipStatus.ACTIVE}>Active</option>
            <option value={MembershipStatus.MEMBER}>Member</option>
            <option value={MembershipStatus.INACTIVE}>Inactive</option>
            <option value={MembershipStatus.VISITOR}>Visitor</option>
          </select>
        </div>
      </Card>

      {loading ? (
        <SkeletonList items={6} />
      ) : members.length > 0 ? (
        <div className="members-grid">
          {members.map((member, index) => (
            <Card key={member.id || index} className="member-card" onClick={() => navigate(`/members/${member.id}`)}>
              <div className="member-card-content">
                <div className="member-avatar" style={{ backgroundColor: `hsl(${member.firstName.charCodeAt(0) * 10}, 60%, 50%)` }}>
                  {getInitials(member.firstName, member.lastName)}
                </div>
                <div className="member-info">
                  <div className="member-header">
                    <h3 className="member-name">{member.firstName} {member.lastName}</h3>
                    <span className={`status-badge ${getStatusColor(member.membershipStatus)}`}>
                      {member.membershipStatus}
                    </span>
                  </div>
                  {member.email && <p className="member-email">{member.email}</p>}
                  {member.phone && <p className="member-phone">{member.phone}</p>}
                </div>
              </div>
              <div className="member-card-actions">
                <Button
                  variant="text"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/members/${member.id}`);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="text"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(member);
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
          icon={EmptyStateIcons.members}
          title={searchQuery ? "No members found" : "No members yet"}
          description={searchQuery 
            ? "Try adjusting your search or filters to find what you're looking for."
            : "Get started by adding your first church member to the directory."}
          actionLabel={!searchQuery ? "Add First Member" : undefined}
          onAction={!searchQuery ? () => navigate('/members/new') : undefined}
        />
      )}
    </div>
  );
}
