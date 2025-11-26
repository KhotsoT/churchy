import React, { useState, useEffect } from 'react';
import { Message } from '../types';
import { formatDate } from '../utils/helpers';
import { messageService } from '../services/messageService';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { useConfirmStore } from '../store/confirmStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { SkeletonList } from '../components/ui/Skeleton';
import EmptyState, { EmptyStateIcons } from '../components/ui/EmptyState';
import './MessagesScreen.css';

interface ExtendedMessage extends Message {
  isRead: boolean;
  senderId: { id: string; firstName: string; lastName: string; email: string };
  recipientIds: { id: string; firstName: string; lastName: string }[];
}

interface Recipient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export default function MessagesScreen() {
  const { user } = useAuthStore();
  const { showToast } = useToastStore();
  const { show: showConfirm } = useConfirmStore();
  
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'announcements'>('inbox');
  const [selectedMessage, setSelectedMessage] = useState<ExtendedMessage | null>(null);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [sending, setSending] = useState(false);

  const [composeForm, setComposeForm] = useState({
    recipientIds: [] as string[],
    subject: '',
    body: '',
    isAnnouncement: false,
    priority: 'medium',
  });

  useEffect(() => {
    loadMessages();
    loadRecipients();
  }, [activeTab]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const response = await messageService.getAll({ type: activeTab });
      if (response.success && response.data) {
        setMessages(response.data.data as ExtendedMessage[] || []);
      } else {
        showToast(response.error || 'Failed to load messages', 'error');
      }
    } catch (error) {
      showToast('Failed to load messages', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadRecipients = async () => {
    try {
      const response = await messageService.getRecipients();
      if (response.success && response.data) {
        setRecipients(response.data);
      }
    } catch (error) {
      console.error('Failed to load recipients:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!composeForm.subject.trim()) {
      showToast('Please enter a subject', 'warning');
      return;
    }
    if (!composeForm.body.trim()) {
      showToast('Please enter a message', 'warning');
      return;
    }
    if (!composeForm.isAnnouncement && composeForm.recipientIds.length === 0) {
      showToast('Please select at least one recipient', 'warning');
      return;
    }

    setSending(true);
    try {
      const response = await messageService.send(composeForm);
      if (response.success) {
        showToast(composeForm.isAnnouncement ? 'Announcement sent!' : 'Message sent!', 'success');
        setShowComposeModal(false);
        setComposeForm({
          recipientIds: [],
          subject: '',
          body: '',
          isAnnouncement: false,
          priority: 'medium',
        });
        loadMessages();
      } else {
        showToast(response.error || 'Failed to send message', 'error');
      }
    } catch (error) {
      showToast('Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = (message: ExtendedMessage) => {
    showConfirm({
      title: 'Delete Message',
      message: `Are you sure you want to delete "${message.subject}"?`,
      confirmText: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        const response = await messageService.delete(message.id);
        if (response.success) {
          showToast('Message deleted', 'success');
          setSelectedMessage(null);
          loadMessages();
        } else {
          showToast(response.error || 'Failed to delete message', 'error');
        }
      },
    });
  };

  const handleMarkAsRead = async (message: ExtendedMessage) => {
    if (!message.isRead) {
      await messageService.markAsRead(message.id);
      setMessages(messages.map(m => 
        m.id === message.id ? { ...m, isRead: true } : m
      ));
    }
  };

  const toggleRecipient = (recipientId: string) => {
    setComposeForm(prev => ({
      ...prev,
      recipientIds: prev.recipientIds.includes(recipientId)
        ? prev.recipientIds.filter(id => id !== recipientId)
        : [...prev.recipientIds, recipientId],
    }));
  };

  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <div className="messages-screen">
      <div className="page-header">
        <div>
          <h1>Messages</h1>
          <p className="page-subtitle">Send and receive messages within your church</p>
        </div>
        <Button variant="contained" onClick={() => setShowComposeModal(true)}>
          + Compose Message
        </Button>
      </div>

      <div className="messages-layout">
        <Card className="messages-sidebar">
          <nav className="messages-nav">
            <button
              className={`nav-btn ${activeTab === 'inbox' ? 'active' : ''}`}
              onClick={() => setActiveTab('inbox')}
            >
              <span className="nav-icon">📥</span>
              <span className="nav-label">Inbox</span>
              {unreadCount > 0 && activeTab !== 'inbox' && (
                <span className="unread-badge">{unreadCount}</span>
              )}
            </button>
            <button
              className={`nav-btn ${activeTab === 'sent' ? 'active' : ''}`}
              onClick={() => setActiveTab('sent')}
            >
              <span className="nav-icon">📤</span>
              <span className="nav-label">Sent</span>
            </button>
            <button
              className={`nav-btn ${activeTab === 'announcements' ? 'active' : ''}`}
              onClick={() => setActiveTab('announcements')}
            >
              <span className="nav-icon">📢</span>
              <span className="nav-label">Announcements</span>
            </button>
          </nav>
        </Card>

        <div className="messages-content">
          {loading ? (
            <Card>
              <SkeletonList items={5} />
            </Card>
          ) : messages.length > 0 ? (
            <Card padding="none">
              <div className="messages-list">
                {messages.map((message, index) => (
                  <div
                    key={message.id || index}
                    className={`message-item ${!message.isRead ? 'unread' : ''} ${selectedMessage?.id === message.id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedMessage(message);
                      handleMarkAsRead(message);
                    }}
                  >
                    <div className="message-avatar">
                      {message.isAnnouncement ? '📢' : (
                        message.senderId?.firstName?.[0] || '?'
                      )}
                    </div>
                    <div className="message-preview">
                      <div className="message-header">
                        <span className="message-sender">
                          {message.isAnnouncement ? 'Announcement' : 
                            activeTab === 'sent' 
                              ? `To: ${message.recipientIds?.map(r => r.firstName).join(', ') || 'All'}`
                              : `${message.senderId?.firstName} ${message.senderId?.lastName}`
                          }
                        </span>
                        <span className="message-date">
                          {formatDate(message.createdAt, 'MMM dd')}
                        </span>
                      </div>
                      <h4 className="message-subject">{message.subject}</h4>
                      <p className="message-excerpt">{message.body.substring(0, 80)}...</p>
                    </div>
                    {!message.isRead && <div className="unread-dot"></div>}
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <EmptyState
              icon={EmptyStateIcons.messages}
              title={`No ${activeTab} messages`}
              description={activeTab === 'inbox' 
                ? "You don't have any messages yet."
                : activeTab === 'sent'
                  ? "You haven't sent any messages yet."
                  : "No announcements have been posted."}
              actionLabel="Compose Message"
              onAction={() => setShowComposeModal(true)}
            />
          )}
        </div>

        {selectedMessage && (
          <Card className="message-detail">
            <div className="detail-header">
              <div className="detail-meta">
                <h2>{selectedMessage.subject}</h2>
                <div className="detail-info">
                  <span>
                    From: {selectedMessage.senderId?.firstName} {selectedMessage.senderId?.lastName}
                  </span>
                  <span>{formatDate(selectedMessage.createdAt, 'MMM dd, yyyy at h:mm a')}</span>
                </div>
              </div>
              <div className="detail-actions">
                {selectedMessage.senderId && user?.id === selectedMessage.senderId.id && (
                  <Button
                    variant="text"
                    onClick={() => handleDeleteMessage(selectedMessage)}
                    className="delete-btn"
                  >
                    Delete
                  </Button>
                )}
                <Button variant="text" onClick={() => setSelectedMessage(null)}>
                  Close
                </Button>
              </div>
            </div>
            <div className="detail-body">
              {selectedMessage.body.split('\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Compose Modal */}
      <Modal
        isOpen={showComposeModal}
        onClose={() => setShowComposeModal(false)}
        title="Compose Message"
        size="large"
      >
        <div className="compose-form">
          <label className="checkbox-label announcement-toggle">
            <input
              type="checkbox"
              checked={composeForm.isAnnouncement}
              onChange={(e) => setComposeForm({ ...composeForm, isAnnouncement: e.target.checked })}
            />
            <span>Send as Announcement (visible to everyone)</span>
          </label>

          {!composeForm.isAnnouncement && (
            <div className="recipients-section">
              <label className="input-label">Recipients</label>
              <div className="recipients-grid">
                {recipients.map((recipient) => (
                  <label
                    key={recipient.id}
                    className={`recipient-chip ${composeForm.recipientIds.includes(recipient.id) ? 'selected' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={composeForm.recipientIds.includes(recipient.id)}
                      onChange={() => toggleRecipient(recipient.id)}
                    />
                    <span>{recipient.firstName} {recipient.lastName}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <Input
            label="Subject"
            value={composeForm.subject}
            onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
            placeholder="Enter subject..."
          />

          <div className="input-wrapper">
            <label className="input-label">Message</label>
            <textarea
              className="compose-textarea"
              value={composeForm.body}
              onChange={(e) => setComposeForm({ ...composeForm, body: e.target.value })}
              placeholder="Write your message..."
              rows={8}
            />
          </div>

          <div className="compose-actions">
            <Button variant="outlined" onClick={() => setShowComposeModal(false)}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSendMessage} loading={sending}>
              {composeForm.isAnnouncement ? 'Post Announcement' : 'Send Message'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
