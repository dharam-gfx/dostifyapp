import React from 'react';
import { renderTextWithLinks } from '../../utils/textFormatUtils';

interface SystemMessageProps {
  message: string;
  timestamp: string;
}

/**
 * System message component for notifications and announcements
 */
export const SystemMessage: React.FC<SystemMessageProps> = ({ message, timestamp }) => (
  <div className="system-message text-center text-xs text-gray-500 my-3">
    {renderTextWithLinks(message)}{' '}
    <span className="timestamp text-[10px] text-gray-400">{timestamp}</span>
  </div>
);
