import React from 'react';
import { Calendar, User, Folder } from 'lucide-react';
import { Email } from '../../types/email.types';

interface EmailCardProps {
    email: Email;
    isSelected?: boolean;
    onClick: () => void;
    onReplyClick: () => void;
}

export const EmailCard: React.FC<EmailCardProps> = ({
    email,
    isSelected = false,
    onClick,
    onReplyClick
}) => {
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'Invalid Date';
        }
    };

    const truncateText = (text: string, maxLength: number = 120) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const getFolderColor = (folder: string) => {
        switch (folder) {
            case 'inbox': return { bg: 'var(--accent-blue-light)', color: 'var(--accent-blue)', icon: '📥' };
            case 'sent': return { bg: 'var(--accent-green-light)', color: 'var(--accent-green)', icon: '📤' };
            case 'spam': return { bg: 'var(--accent-red-light)', color: 'var(--accent-red)', icon: '🚫' };
            default: return { bg: 'var(--accent-orange-light)', color: 'var(--accent-orange)', icon: '📁' };
        }
    };

    const getCategoryColor = (category: string | undefined) => {
        switch (category?.toLowerCase()) {
            case 'interested': return { bg: 'var(--accent-green-light)', color: 'var(--accent-green)', icon: '✅' };
            case 'not interested': return { bg: 'var(--accent-red-light)', color: 'var(--accent-red)', icon: '❌' };
            case 'spam': return { bg: 'var(--accent-red-light)', color: 'var(--accent-red)', icon: '🚫' };
            case 'meeting booked': return { bg: 'var(--accent-blue-light)', color: 'var(--accent-blue)', icon: '📅' };
            case 'out of office': return { bg: 'var(--accent-orange-light)', color: 'var(--accent-orange)', icon: '🏠' };
            default: return { bg: 'var(--accent-red-light)', color: 'var(--accent-red)', icon: '❓' };
        }
    };

    const folderStyle = getFolderColor(email.folder);
    const categoryStyle = getCategoryColor(email.category);

    return (
        <article
            className={`card cursor-pointer transition-all duration-300 group hover:scale-[1.02] ${isSelected ? 'ring-2 ring-offset-2 ring-blue-400' : ''
                }`}
            style={{
                ...(isSelected && {
                    transform: 'translateY(-2px)',
                    boxShadow: 'var(--shadow-elevated)'
                })
            } as React.CSSProperties}
            onClick={onClick}
            role="button"
            tabIndex={0}
            aria-label={`Email from ${email.from.name || email.from.address}: ${email.subject || 'No subject'}`}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick();
                }
            }}
        >
            <div className="p-6">
                {/* Enhanced Header */}
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-[200px]">
                        <h3 className="text-subheading font-medium break-words group-hover:text-blue-600 transition-colors"
                            style={{ color: 'var(--text-primary)' }}>
                            {email.subject || '(No Subject)'}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                            <User className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                            <span className="text-body truncate max-w-[250px]" style={{ color: 'var(--text-secondary)' }}>
                                {email.from.name || email.from.address}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                        <span
                            className="inline-flex items-center px-3 py-1 rounded-full text-caption font-medium"
                            style={{
                                background: categoryStyle.bg,
                                color: categoryStyle.color
                            }}
                        >
                            <span className="mr-1">{categoryStyle.icon}</span>
                            {email.category && email.category.trim() !== '' ? email.category : 'Not Interested'}
                        </span>
                        <div className="flex items-center gap-2 text-caption" style={{ color: 'var(--text-muted)' }}>
                            <Calendar className="w-3 h-3" />
                            <time dateTime={email.date}>
                                {formatDate(email.date)}
                            </time>
                        </div>
                    </div>
                </div>

                {/* Enhanced Body Preview */}
                <div className="mb-4">
                    <p className="text-body leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {truncateText(email.body_text || '')}
                    </p>
                </div>

                {/* Enhanced Footer */}
                <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
                    <div className="flex items-center gap-3">
                        <span
                            className="inline-flex items-center px-2 py-1 rounded-md text-caption font-medium"
                            style={{
                                background: folderStyle.bg,
                                color: folderStyle.color
                            }}
                        >
                            <span className="mr-1">{folderStyle.icon}</span>
                            <Folder className="w-3 h-3 mr-1" />
                            {email.folder}
                        </span>
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onReplyClick();
                        }}
                        className="btn-primary text-caption px-4 py-2 hover:scale-105 transition-transform"
                        aria-label={`Reply to email from ${email.from.name || email.from.address}`}
                    >
                        💬 Reply
                    </button>
                </div>

                {/* Enhanced Account Info */}
                <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-caption" style={{ color: 'var(--text-muted)' }}>📧 To:</span>
                            <span className="text-caption font-medium truncate max-w-[200px]" style={{ color: 'var(--text-secondary)' }}>
                                {email.accountId}
                            </span>
                        </div>
                        {email.to.length > 1 && (
                            <span className="text-caption px-2 py-1 rounded-full" style={{
                                background: 'var(--accent-blue-light)',
                                color: 'var(--accent-blue)'
                            }}>
                                +{email.to.length - 1} more
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
};