import React, { useState } from 'react';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Clock, 
  AlertTriangle, 
  AlertCircle, 
  BookOpen, 
  MessageSquare, 
  X,
  RotateCw,
  Info
} from 'lucide-react';

export default function NotificationDrawer({
  notifications = [],
  unreadCount = 0,
  isOpen = false,
  onClose,
  onMarkRead,
  onMarkAllRead,
  onRefresh,
  isRefreshing = false
}) {
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  if (!isOpen) return null;

  const displayList = filter === 'unread' 
    ? notifications.filter((n) => !n.is_read)
    : notifications;

  const getStageBadge = (type) => {
    switch (type) {
      case 'due_in_3_days':
        return { label: 'Due in 3 Days', color: 'badge-sage', icon: Clock };
      case 'due_tomorrow':
        return { label: 'Due Tomorrow', color: 'badge-amber', icon: Clock };
      case 'due_today':
        return { label: 'Due Today', color: 'badge-red', icon: AlertCircle };
      case 'overdue':
        return { label: 'Overdue Alert', color: 'badge-red', icon: AlertTriangle };
      case 'borrow_confirmation':
        return { label: 'Loan Issued', color: 'badge-forest', icon: BookOpen };
      case 'return_confirmation':
        return { label: 'Returned', color: 'badge-sage', icon: Check };
      case 'feedback_response':
        return { label: 'Staff Reply', color: 'badge-lavender', icon: MessageSquare };
      default:
        return { label: 'Notice', color: 'badge-parchment', icon: Info };
    }
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="notification-drawer-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="notification-drawer-content" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="notif-header">
          <div className="notif-title-group">
            <div className="notif-bell-icon-wrap">
              <Bell size={18} />
              {unreadCount > 0 && <span className="notif-mini-badge">{unreadCount}</span>}
            </div>
            <div>
              <h3 className="notif-heading">Patron Notifications</h3>
              <p className="notif-subheading">
                {unreadCount > 0 
                  ? `${unreadCount} unread reminder${unreadCount > 1 ? 's' : ''}` 
                  : 'All notifications caught up'}
              </p>
            </div>
          </div>

          <div className="notif-header-actions">
            <button
              type="button"
              className="notif-icon-btn"
              onClick={onRefresh}
              title="Refresh notifications"
              disabled={isRefreshing}
            >
              <RotateCw size={15} className={isRefreshing ? 'spin-icon' : ''} />
            </button>
            <button
              type="button"
              className="notif-close-btn"
              onClick={onClose}
              aria-label="Close notifications"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Action Controls & Filter Tabs */}
        <div className="notif-filter-bar">
          <div className="notif-tabs">
            <button
              type="button"
              className={`notif-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              className={`notif-tab ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              className="mark-all-read-btn"
              onClick={onMarkAllRead}
            >
              <CheckCheck size={14} />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="notif-list-container">
          {displayList.length > 0 ? (
            displayList.map((notif) => {
              const badgeInfo = getStageBadge(notif.reminder_type);
              const BadgeIcon = badgeInfo.icon;

              return (
                <div
                  key={notif.id}
                  className={`notif-item-card ${notif.is_read ? 'read' : 'unread'}`}
                  onClick={() => !notif.is_read && onMarkRead(notif.id)}
                >
                  <div className="notif-item-top">
                    <span className={`notif-stage-tag ${badgeInfo.color}`}>
                      <BadgeIcon size={12} />
                      {badgeInfo.label}
                    </span>
                    <span className="notif-time">{formatTimestamp(notif.created_at)}</span>
                  </div>

                  <h4 className="notif-item-title">{notif.title}</h4>
                  <p className="notif-item-message">{notif.message}</p>

                  <div className="notif-item-bottom">
                    {!notif.is_read ? (
                      <button
                        type="button"
                        className="notif-mark-single-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkRead(notif.id);
                        }}
                      >
                        <Check size={12} />
                        Mark as read
                      </button>
                    ) : (
                      <span className="notif-status-read">
                        <Check size={12} /> Read
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="notif-empty-state">
              <div className="notif-empty-icon">
                <Bell size={28} />
              </div>
              <h4 className="notif-empty-title">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </h4>
              <p className="notif-empty-desc">
                When you borrow library books or when return dates approach, automated reminders and 
                circulation notices will appear here.
              </p>
            </div>
          )}
        </div>

        {/* Drawer Footer Notice */}
        <div className="notif-footer-note">
          <Info size={13} />
          <span>Reminders are automatically monitored by the LibraryEase scheduler.</span>
        </div>
      </div>
    </div>
  );
}
