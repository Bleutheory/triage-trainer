

import React from 'react';

interface NotificationPanelProps {
    notifications: string[];
    onRequestResupply: () => void;
    resupplyDisabled: boolean;
    disableLabel?: string;
  }

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  onRequestResupply,
  resupplyDisabled,
  disableLabel
}) => (
  <section>
    <h4>Notifications</h4>
    <ul className="compact-list">
      {notifications.map((note, idx) => (
        <li key={idx}>{note}</li>
      ))}
    </ul>
    <button
  onClick={onRequestResupply}
  disabled={resupplyDisabled}
>
  {resupplyDisabled
    ? `Request Resupply (${disableLabel})`
    : 'Request Resupply'}
</button>
  </section>
);

export default NotificationPanel;