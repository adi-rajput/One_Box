import React from 'react';
import { Calendar, User, Folder, Tag } from 'lucide-react';
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
            case 'inbox': return 'bg-blue-100 text-blue-800';
            case 'sent': return 'bg-green-100 text-green-800';
            case 'spam': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div
            className={`bg-white rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-md ${isSelected ? 'border-blue-500 shadow-md ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                }`}
            onClick={onClick}
        >
            <div className="p-4">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-[200px]">
                        <h3 className="font-semibold text-gray-900 break-words">
                            {email.subject || '(No Subject)'}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                            <User className="w-3 h-3 text-gray-400" />
                            <span className="truncate max-w-[220px]">{email.from.name || email.from.address}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-auto">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm">
                            <Tag className="w-3 h-3 mr-1" />
                            {email.category && email.category.trim() !== '' ? email.category : 'Not Interested'}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {formatDate(email.date)}
                        </div>
                    </div>
                </div>

                {/* Body Preview */}
                <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                    {truncateText(email.body_text || '')}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getFolderColor(email.folder)}`}>
                            <Folder className="w-3 h-3 mr-1" />
                            {email.folder}
                        </span>
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onReplyClick();
                        }}
                        className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                    >
                        Reply
                    </button>
                </div>

                {/* Account Info */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="truncate">To: {email.accountId}</span>
                        {email.to.length > 1 && (
                            <span>+{email.to.length - 1} more</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};