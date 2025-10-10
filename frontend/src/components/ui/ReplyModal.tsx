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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="card-elevated w-full max-w-5xl max-h-[90vh] overflow-hidden animate-scale-in" style={{ background: 'var(--surface-elevated)' }}>
                {/* Enhanced Header */}
                <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border-light)' }}>
                    <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg" style={{ background: 'var(--accent-blue-light)' }}>
                            <Reply className="w-5 h-5" style={{ color: 'var(--accent-blue)' }} />
                        </div>
                        <div>
                            <h2 className="text-heading" style={{ color: 'var(--text-primary)' }}>
                                💬 Reply to Email
                            </h2>
                            <p className="text-caption mt-1" style={{ color: 'var(--text-secondary)' }}>
                                Generate AI-powered suggestions or write your own
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                        style={{ color: 'var(--text-muted)' }}
                        aria-label="Close modal"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row h-[calc(90vh-120px)]">
                    {/* Enhanced Left Panel - Original Email */}
                    <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r p-6 overflow-y-auto" style={{ borderColor: 'var(--border-light)' }}>
                        <h3 className="text-subheading mb-4" style={{ color: 'var(--text-primary)' }}>
                            📧 Original Email
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <span className="text-caption font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                                    Subject
                                </span>
                                <p className="text-body mt-1" style={{ color: 'var(--text-primary)' }}>
                                    {email.subject || '(No Subject)'}
                                </p>
                            </div>
                            <div>
                                <span className="text-caption font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                                    From
                                </span>
                                <p className="text-body mt-1" style={{ color: 'var(--text-primary)' }}>
                                    {email.from.name ? `${email.from.name} <${email.from.address}>` : email.from.address}
                                </p>
                            </div>
                            <div>
                                <span className="text-caption font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                                    Date
                                </span>
                                <p className="text-body mt-1" style={{ color: 'var(--text-primary)' }}>
                                    {new Date(email.date).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <span className="text-caption font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                                    Message
                                </span>
                                <div className="mt-2 p-4 rounded-lg" style={{ background: 'var(--background)' }}>
                                    <p className="text-body leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                                        {formatEmailPreview(email.body_text)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Right Panel - Reply Options */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-subheading" style={{ color: 'var(--text-primary)' }}>
                                🤖 AI Suggestions
                            </h3>
                            <button
                                onClick={handleGenerateReplies}
                                disabled={isGenerating}
                                className="btn-primary"
                            >
                                {isGenerating ? (
                                    <>
                                        <LoadingSpinner size="sm" color="white" />
                                        <span>Generating...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        <span>Generate Replies</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Enhanced Reply Suggestions */}
                        {isGenerating ? (
                            <div className="flex items-center justify-center py-16 animate-fade-in">
                                <div className="text-center">
                                    <LoadingSpinner size="lg" />
                                    <p className="text-body mt-6" style={{ color: 'var(--text-secondary)' }}>
                                        🧠 Generating AI-powered reply suggestions...
                                    </p>
                                    <p className="text-caption mt-2" style={{ color: 'var(--text-muted)' }}>
                                        This might take a moment
                                    </p>
                                </div>
                            </div>
                        ) : replies.length > 0 ? (
                            <div className="space-y-4 mb-8 animate-slide-in-up">
                                {replies.map((reply, index) => (
                                    <div
                                        key={index}
                                        className={`card cursor-pointer transition-all duration-200 hover:scale-[1.02] ${selectedReply === reply ? 'ring-2 ring-blue-400' : ''
                                            }`}
                                        style={{
                                            ...(selectedReply === reply && {
                                                background: 'var(--accent-blue-light)',
                                                borderColor: 'var(--accent-blue)'
                                            })
                                        }}
                                        onClick={() => setSelectedReply(reply)}
                                    >
                                        <div className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-caption px-2 py-1 rounded-full" style={{
                                                            background: 'var(--accent-green-light)',
                                                            color: 'var(--accent-green)'
                                                        }}>
                                                            🤖 AI Suggestion {index + 1}
                                                        </span>
                                                    </div>
                                                    <p className="text-body leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
                                                        {reply}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCopyReply(reply, index);
                                                    }}
                                                    className="ml-4 p-2 rounded-lg transition-colors hover:bg-gray-100"
                                                    style={{ color: 'var(--text-muted)' }}
                                                    aria-label="Copy reply"
                                                >
                                                    {copiedIndex === index ? (
                                                        <span className="text-caption font-medium px-2 py-1 rounded" style={{
                                                            background: 'var(--accent-green-light)',
                                                            color: 'var(--accent-green)'
                                                        }}>
                                                            ✅ Copied!
                                                        </span>
                                                    ) : (
                                                        <Copy className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 animate-fade-in">
                                <div className="mb-4">
                                    <Reply className="w-12 h-12 mx-auto" style={{ color: 'var(--text-muted)' }} />
                                </div>
                                <h4 className="text-subheading mb-2" style={{ color: 'var(--text-primary)' }}>
                                    Ready to generate suggestions
                                </h4>
                                <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
                                    Click &quot;Generate Replies&quot; to get AI-powered suggestions
                                </p>
                            </div>
                        )}

                        {/* Enhanced Custom Reply */}
                        <div className="border-t pt-6" style={{ borderColor: 'var(--border-light)' }}>
                            <label className="flex items-center gap-2 text-body font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                                ✍️ Write Your Own Reply
                            </label>
                            <textarea
                                value={customReply}
                                onChange={(e) => setCustomReply(e.target.value)}
                                placeholder="Type your custom reply here..."
                                rows={6}
                                className="form-input resize-none"
                                style={{
                                    fontFamily: 'inherit',
                                    lineHeight: '1.6'
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Enhanced Footer */}
                <div className="flex items-center justify-between p-6 border-t" style={{ borderColor: 'var(--border-light)', background: 'var(--background)' }}>
                    <div className="text-body" style={{ color: 'var(--text-secondary)' }}>
                        {replies.length > 0 && (
                            <span className="px-2 py-1 rounded-full" style={{
                                background: 'var(--accent-green-light)',
                                color: 'var(--accent-green)'
                            }}>
                                ✨ {replies.length} suggestion{replies.length !== 1 ? 's' : ''} generated
                            </span>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={!selectedReply && !customReply.trim()}
                            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            📤 Use Reply
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};