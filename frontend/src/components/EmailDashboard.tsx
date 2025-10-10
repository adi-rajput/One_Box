'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mail, AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Email, SearchFilters } from '../types/email.types';
import { emailService } from '../services/email.service';
import { SearchBox } from './ui/SearchBox';
import { FilterControls } from './ui/FilterControls';
import { EmailCard } from './ui/EmailCard';
import { ReplyModal } from './ui/ReplyModal';
import { LoadingSpinner } from './ui/LoadingSpinner';

export const EmailDashboard: React.FC = () => {
    // State management
    const [filteredEmails, setFilteredEmails] = useState<Email[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMoreEmails, setHasMoreEmails] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<SearchFilters>({
        accountId: '',
        folder: 'all',
        clientSideCategory: '',
        page: 1
    });
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
    const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
    const [replies, setReplies] = useState<string[]>([]);
    const [isGeneratingReplies, setIsGeneratingReplies] = useState(false);

    // Load emails
    const loadEmails = useCallback(async (page: number = 1) => {
        setIsLoading(true);
        setError(null);

        try {
            let newEmails: Email[] = [];
            if (searchQuery.trim()) {
                // include server-side filters with search
                const params = new URLSearchParams();
                params.append('q', searchQuery);
                if (filters.accountId) params.append('accountId', filters.accountId);
                if (filters.folder && filters.folder !== 'all') params.append('folder', filters.folder);
                if (filters.clientSideCategory) params.append('category', filters.clientSideCategory);

                const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/search?${params.toString()}`;
                const resp = await fetch(url);
                if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
                newEmails = await resp.json();
                // Search results are not paginated
                setHasMoreEmails(false);
            } else if (filters.accountId || (filters.folder && filters.folder !== 'all')) {
                newEmails = await emailService.getFilteredEmails({ ...filters, page });
            } else {
                newEmails = await emailService.getAllEmails(page);
            }

            // Always replace previous emails for new page
            setFilteredEmails(newEmails);

            // Continue while batch size is 100
            setHasMoreEmails(newEmails.length === 100);


        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load emails');
            console.error('Error loading emails:', err);
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery, filters]);

    const handleSearch = useCallback(async (query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);
        setHasMoreEmails(true);

        if (!query.trim()) {
            await loadEmails(1);
            return;
        }

        setIsSearching(true);
        try {
            const searchResults = await emailService.searchEmails(query);
            setFilteredEmails(searchResults);
            setHasMoreEmails(false); // search not paginated
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Search failed');
            console.error('Search error:', err);
        } finally {
            setIsSearching(false);
        }
    }, [loadEmails]);

    const getClientSideFilteredEmails = useCallback((emailList: Email[]) => {
        const selected = filters.clientSideCategory?.trim();
        if (!selected) return emailList;

        if (selected === 'Not Interested') {
            return emailList.filter(email => {
                const cat = (email.category || '').trim();
                return cat === '' || cat === 'Not Interested';
            });
        }

        return emailList.filter(email => (email.category || '').trim() === selected);
    }, [filters.clientSideCategory]);

    // Handle filter changes
    const handleFiltersChange = useCallback((newFilters: SearchFilters) => {
        setFilters(newFilters);
        setCurrentPage(1);
        setHasMoreEmails(true);
        if (!newFilters.clientSideCategory) {
            setSearchQuery('');
        }
    }, []);

    const handleEmailSelect = useCallback((email: Email) => {
        setSelectedEmail(email);
    }, []);

    const handleReplyClick = useCallback((email: Email) => {
        setSelectedEmail(email);
        setIsReplyModalOpen(true);
        setReplies([]);
    }, []);

    const handleCloseReplyModal = useCallback(() => {
        setIsReplyModalOpen(false);
        setSelectedEmail(null);
        setReplies([]);
        setIsGeneratingReplies(false);
    }, []);

    const handleGenerateReplies = useCallback(async (email: Email) => {
        setIsGeneratingReplies(true);
        try {
            const suggestions = await emailService.suggestReplies(email);
            setReplies(suggestions);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate replies');
            console.error('Reply generation error:', err);
        } finally {
            setIsGeneratingReplies(false);
        }
    }, []);

    const handleNextPage = useCallback(() => {
        if (!isLoading && hasMoreEmails) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            loadEmails(nextPage);
        }
    }, [currentPage, isLoading, hasMoreEmails, loadEmails]);

    // Refresh emails
    const handleRefresh = useCallback(() => {
        setCurrentPage(1);
        setHasMoreEmails(true);
        loadEmails(1);
    }, [loadEmails]);

    // Initial load only once while keeping hook dependencies correct
    const hasInitialLoaded = useRef(false);
    useEffect(() => {
        if (!hasInitialLoaded.current) {
            loadEmails();
            hasInitialLoaded.current = true;
        }
    }, [loadEmails]);

    useEffect(() => {
        if (filters.accountId || (filters.folder && filters.folder !== 'all')) {
            loadEmails(1);
        }
    }, [filters, loadEmails]);

    const displayEmails = getClientSideFilteredEmails(filteredEmails);

    return (
        <div className="min-h-screen" style={{ background: 'var(--background)' }}>
            {/* Enhanced Header with better spacing and visual hierarchy */}
            <header className="fixed top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-sm border-b" style={{ borderColor: 'var(--border-light)', background: 'var(--surface)' }}>
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                                <Mail className="w-7 h-7" style={{ color: 'var(--accent-blue)' }} />
                                <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>ReachInBox</h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <button
                                onClick={handleRefresh}
                                disabled={isLoading}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                    color: 'var(--text-secondary)',
                                    background: 'var(--surface)',
                                    border: '1px solid var(--border-medium)'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isLoading) {
                                        e.currentTarget.style.background = 'var(--accent-blue-light)';
                                        e.currentTarget.style.borderColor = 'var(--accent-blue)';
                                        e.currentTarget.style.color = 'var(--accent-blue)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isLoading) {
                                        e.currentTarget.style.background = 'var(--surface)';
                                        e.currentTarget.style.borderColor = 'var(--border-medium)';
                                        e.currentTarget.style.color = 'var(--text-secondary)';
                                    }
                                }}
                                aria-label="Refresh emails"
                            >
                                <RefreshCw className={`w-4 h-4 transition-transform duration-300 ${isLoading ? 'animate-spin' : ''}`} />
                                <span className="hidden sm:inline">Refresh</span>
                            </button>
                            <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                <span className="hidden sm:inline">
                                    {displayEmails.length} email{displayEmails.length !== 1 ? 's' : ''}
                                </span>
                                <span className="sm:hidden">
                                    {displayEmails.length}
                                </span>
                                {filters.clientSideCategory && (
                                    <span className="ml-2 px-2 py-1 text-xs rounded-full" style={{
                                        background: 'var(--accent-blue-light)',
                                        color: 'var(--accent-blue)'
                                    }}>
                                        filtered
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Filter Section */}
            <div className="lg:hidden pt-16 px-6 py-6 border-b animate-fade-in" style={{
                background: 'var(--surface)',
                borderColor: 'var(--border-light)'
            }}>
                <div className="space-y-6">
                    <SearchBox
                        onSearch={handleSearch}
                        isLoading={isSearching}
                        placeholder="Search..."
                    />
                    <FilterControls
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                    />
                </div>
            </div>

            <div className="pt-16 flex lg:flex-row flex-col">
                <aside className="hidden lg:flex flex-col fixed top-16 left-0 w-[25%] h-[calc(100vh-4rem)] overflow-y-auto border-r p-6 z-20 animate-slide-in-up"
                    style={{ background: 'var(--surface)', borderColor: 'var(--border-light)' }}>
                    <div className="space-y-8 flex-1">
                        <SearchBox
                            onSearch={handleSearch}
                            isLoading={isSearching}
                            placeholder="Search..."
                        />

                        <FilterControls
                            filters={filters}
                            onFiltersChange={handleFiltersChange}
                        />

                        {/* Enhanced Page Navigation */}
                        <div className="card p-5">
                            <h3 className="text-subheading mb-4" style={{ color: 'var(--text-primary)' }}>
                                Page Navigation
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={() => {
                                            if (currentPage > 1) {
                                                const prevPage = currentPage - 1;
                                                setCurrentPage(prevPage);
                                                loadEmails(prevPage);
                                            }
                                        }}
                                        disabled={currentPage <= 1 || isLoading}
                                        className="btn-secondary"
                                        aria-label="Go to previous page"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        <span className="hidden sm:inline">Previous</span>
                                    </button>
                                    <span className="text-body font-medium px-3 py-1 rounded-full" style={{
                                        background: 'var(--accent-blue-light)',
                                        color: 'var(--accent-blue)'
                                    }}>
                                        Page {currentPage}
                                    </span>
                                    <button
                                        onClick={handleNextPage}
                                        disabled={!hasMoreEmails || isLoading || !!searchQuery}
                                        className="btn-primary"
                                        aria-label="Go to next page"
                                    >
                                        <span className="hidden sm:inline">Next</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                                {!hasMoreEmails && !searchQuery && (
                                    <p className="text-caption text-center py-2" style={{ color: 'var(--text-muted)' }}>
                                        📄 You&apos;ve reached the last page
                                    </p>
                                )}
                                {searchQuery && (
                                    <p className="text-caption text-center py-2" style={{ color: 'var(--accent-orange)' }}>
                                        🔍 Search results don&apos;t support pagination
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Enhanced Stats Section */}
                        <div className="card p-5">
                            <h3 className="text-subheading mb-4" style={{ color: 'var(--text-primary)' }}>
                                Quick Stats
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-body" style={{ color: 'var(--text-secondary)' }}>
                                        📧 Total Emails
                                    </span>
                                    <span className="text-body font-semibold px-2 py-1 rounded" style={{
                                        color: 'var(--text-primary)',
                                        background: 'var(--accent-blue-light)'
                                    }}>
                                        {displayEmails.length}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-body" style={{ color: 'var(--text-secondary)' }}>
                                        📄 Current Page
                                    </span>
                                    <span className="text-body font-semibold px-2 py-1 rounded" style={{
                                        color: 'var(--text-primary)',
                                        background: 'var(--accent-green-light)'
                                    }}>
                                        {currentPage}
                                    </span>
                                </div>
                                {searchQuery && (
                                    <div className="pt-3 border-t" style={{ borderColor: 'var(--border-light)' }}>
                                        <div className="flex items-start gap-2">
                                            <span className="text-caption">🔍</span>
                                            <div>
                                                <p className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                                                    Searching for:
                                                </p>
                                                <p className="text-body font-medium mt-1 px-2 py-1 rounded" style={{
                                                    color: 'var(--accent-blue)',
                                                    background: 'var(--accent-blue-light)'
                                                }}>
                                                    &quot;{searchQuery}&quot;
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </aside>
                <main className="lg:ml-80 w-full px-12 lg:pl-20 py-8">
                    <div className="max-w-6xl mx-auto">
                        {error && (
                            <div className="mb-8 p-4 rounded-lg border animate-scale-in" style={{
                                background: 'var(--accent-red-light)',
                                borderColor: 'var(--accent-red)'
                            }}>
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-red)' }} />
                                    <div className="flex-1">
                                        <p className="font-medium text-body" style={{ color: 'var(--accent-red)' }}>
                                            Something went wrong
                                        </p>
                                        <p className="text-caption mt-1" style={{ color: 'var(--accent-red)' }}>
                                            {error}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setError(null)}
                                        className="text-caption font-medium px-2 py-1 rounded hover:bg-white/20 transition-colors"
                                        style={{ color: 'var(--accent-red)' }}
                                        aria-label="Dismiss error"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        )}

                        {isLoading && displayEmails.length === 0 ? (
                            <div className="flex items-center justify-center py-20 animate-fade-in">
                                <div className="text-center">
                                    <LoadingSpinner size="lg" />
                                    <p className="text-body mt-6" style={{ color: 'var(--text-secondary)' }}>
                                        📬 Loading your emails...
                                    </p>
                                    <p className="text-caption mt-2" style={{ color: 'var(--text-muted)' }}>
                                        This might take a moment
                                    </p>
                                </div>
                            </div>
                        ) : displayEmails.length === 0 ? (
                            <div className="text-center py-20 animate-fade-in">
                                <div className="mb-6">
                                    <Mail className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                                </div>
                                <h3 className="text-heading mb-3" style={{ color: 'var(--text-primary)' }}>
                                    {searchQuery ? '🔍 No search results' : '📭 No emails found'}
                                </h3>
                                <p className="text-body max-w-md mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                    {searchQuery
                                        ? `We couldn't find any emails matching "${searchQuery}". Try adjusting your search terms.`
                                        : filters.clientSideCategory
                                            ? `No emails match the category filter "${filters.clientSideCategory}". Try selecting a different category.`
                                            : 'Your inbox appears to be empty. Try refreshing or check your filters.'
                                    }
                                </p>
                                {(searchQuery || filters.clientSideCategory) && (
                                    <button
                                        onClick={() => {
                                            setSearchQuery('');
                                            handleFiltersChange({ ...filters, clientSideCategory: '' });
                                        }}
                                        className="btn-primary mt-6"
                                    >
                                        🔄 Clear filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4 animate-slide-in-up">
                                {displayEmails.map((email, index) => (
                                    <EmailCard
                                        key={`${email.messageId}-${index}`}
                                        email={email}
                                        isSelected={selectedEmail?.messageId === email.messageId}
                                        onClick={() => handleEmailSelect(email)}
                                        onReplyClick={() => handleReplyClick(email)}
                                    />
                                ))}

                                {/* Enhanced End of Results Message */}
                                {!hasMoreEmails && !searchQuery && displayEmails.length > 0 && (
                                    <div className="text-center py-8">
                                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{
                                            background: 'var(--accent-green-light)',
                                            color: 'var(--accent-green)'
                                        }}>
                                            <span>✅</span>
                                            <span className="text-caption font-medium">
                                                You&apos;ve reached the end! All emails loaded.
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <ReplyModal
                email={selectedEmail}
                isOpen={isReplyModalOpen}
                onClose={handleCloseReplyModal}
                replies={replies}
                isGenerating={isGeneratingReplies}
                onGenerateReplies={handleGenerateReplies}
            />
        </div>
    );
};