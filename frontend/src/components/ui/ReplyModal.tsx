import React, { useState } from 'react';
import { X, Reply, Copy, Send } from 'lucide-react';
import { ReplyModalProps } from '../../types/email.types';
import { LoadingSpinner } from './LoadingSpinner';

export const ReplyModal: React.FC<ReplyModalProps> = ({
    email,
    isOpen,
    onClose,
    replies,
    isGenerating,
    onGenerateReplies
}) => {
    const [selectedReply, setSelectedReply] = useState<string>('');
    const [customReply, setCustomReply] = useState<string>('');
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    if (!isOpen || !email) return null;

    const handleCopyReply = async (reply: string, index: number) => {
        try {
            await navigator.clipboard.writeText(reply);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch (error) {
            console.error('Failed to copy reply:', error);
        }
    };

    const handleGenerateReplies = () => {
        if (email) {
            onGenerateReplies(email);
        }
    };

    const formatEmailPreview = (text: string, maxLength: number = 200) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <Reply className="w-5 h-5 text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-900">Reply to Email</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row h-[calc(95vh-120px)] sm:h-[calc(90vh-120px)]">
                    {/* Left Panel - Original Email */}
                    <div className="w-full sm:w-1/3 border-b sm:border-b-0 sm:border-r border-gray-200 p-4 sm:p-6 overflow-y-auto">
                        <h3 className="font-semibold text-gray-900 mb-3">Original Email</h3>
                        <div className="space-y-3">
                            <div>
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Subject</span>
                                <p className="text-sm text-gray-900 mt-1">{email.subject || '(No Subject)'}</p>
                            </div>
                            <div>
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">From</span>
                                <p className="text-sm text-gray-900 mt-1">
                                    {email.from.name ? `${email.from.name} <${email.from.address}>` : email.from.address}
                                </p>
                            </div>
                            <div>
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date</span>
                                <p className="text-sm text-gray-900 mt-1">
                                    {new Date(email.date).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Message</span>
                                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {formatEmailPreview(email.body_text)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Reply Options */}
                    <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">Suggested Replies</h3>
                            <button
                                onClick={handleGenerateReplies}
                                disabled={isGenerating}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isGenerating ? (
                                    <>
                                        <LoadingSpinner size="sm" className="border-white border-t-transparent" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Generate Replies
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Reply Suggestions */}
                        {isGenerating ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <LoadingSpinner size="lg" />
                                    <p className="text-gray-600 mt-4">Generating AI-powered reply suggestions...</p>
                                </div>
                            </div>
                        ) : replies.length > 0 ? (
                            <div className="space-y-4 mb-6">
                                {replies.map((reply, index) => (
                                    <div
                                        key={index}
                                        className={`border rounded-lg p-4 transition-all duration-200 cursor-pointer ${selectedReply === reply
                                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                        onClick={() => setSelectedReply(reply)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <p className="text-sm text-gray-900 leading-relaxed flex-1 whitespace-pre-wrap">
                                                {reply}
                                            </p>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCopyReply(reply, index);
                                                }}
                                                className="ml-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                                title="Copy reply"
                                            >
                                                {copiedIndex === index ? (
                                                    <span className="text-green-600 text-xs font-medium">Copied!</span>
                                                ) : (
                                                    <Copy className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-gray-400 mb-2">
                                    <Reply className="w-8 h-8 mx-auto" />
                                </div>
                                <p className="text-gray-600">Click &quot;Generate Replies&quot; to get AI-powered suggestions</p>
                            </div>
                        )}

                        {/* Custom Reply */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Or write your own reply:
                            </label>
                            <textarea
                                value={customReply}
                                onChange={(e) => setCustomReply(e.target.value)}
                                placeholder="Type your custom reply here..."
                                rows={6}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                    <div className="text-sm text-gray-600">
                        {replies.length > 0 && `${replies.length} suggestions generated`}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            Close
                        </button>
                        <button
                            disabled={!selectedReply && !customReply.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Use Reply
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};