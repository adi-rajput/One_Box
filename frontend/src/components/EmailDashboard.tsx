'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
    const [emails, setEmails] = useState<Email[]>([]);
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
                newEmails = await emailService.searchEmails(searchQuery);
                // Search results are not paginated
                setHasMoreEmails(false);
            } else if (filters.accountId || (filters.folder && filters.folder !== 'all')) {
                newEmails = await emailService.getFilteredEmails({ ...filters, page });
            } else {
                newEmails = await emailService.getAllEmails(page);
            }

            // Always replace previous emails for new page
            setEmails(newEmails);
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
            setEmails(searchResults);
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

        // Special rule: 'Not Interested' also matches emails with missing/empty category
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

    useEffect(() => {
        loadEmails();
    }, []);

    useEffect(() => {
        if (filters.accountId || (filters.folder && filters.folder !== 'all')) {
            loadEmails(1);
        }
    }, [filters, loadEmails]);

    const displayEmails = getClientSideFilteredEmails(filteredEmails);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="fixed top-0 left-0 right-0 z-30 bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <Mail className="w-8 h-8 text-blue-600" />
                            <h1 className="text-2xl font-bold text-gray-900">ReachInBox</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleRefresh}
                                disabled={isLoading}
                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                            <div className="text-sm text-gray-600">
                                {displayEmails.length} emails
                                {filters.clientSideCategory && (
                                    <span className="text-purple-600"> (filtered by category)</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:hidden pt-16 px-4 py-6 bg-gray-50 border-b border-gray-200">
                <div className="space-y-4">
                    <SearchBox
                        onSearch={handleSearch}
                        isLoading={isSearching}
                        placeholder="Search emails by content, subject, or sender..."
                    />
                    <FilterControls
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                    />
                </div>
            </div>

            <div className="pt-16 flex lg:flex-row flex-col">
                {/* Fixed Sidebar */}
                <div className="hidden lg:flex flex-col fixed top-16 left-0 w-80 h-[calc(100vh-4rem)] overflow-y-auto bg-gray-50 border-r border-gray-200 p-6 z-20">
                    <div className="space-y-6 flex-1">
                        <SearchBox
                            onSearch={handleSearch}
                            isLoading={isSearching}
                            placeholder="Search emails by content, subject, or sender..."
                        />

                        <FilterControls
                            filters={filters}
                            onFiltersChange={handleFiltersChange}
                        />

                        {/* Page Navigation */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                            <h3 className="font-semibold text-gray-800 mb-3">Page Navigation</h3>
                            <div className="space-y-3">
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
                                        className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Previous
                                    </button>
                                    <span className="text-sm font-medium text-gray-900">Page {currentPage}</span>
                                    <button
                                        onClick={handleNextPage}
                                        disabled={!hasMoreEmails || isLoading || !!searchQuery}
                                        className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                                {!hasMoreEmails && !searchQuery && (
                                    <p className="text-xs text-gray-500 text-center">No more pages (last batch &lt; 100)</p>
                                )}
                                {searchQuery && (
                                    <p className="text-xs text-orange-600 text-center">
                                        Search results don't support pagination
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm mb-4">
                            <h3 className="font-semibold text-gray-800 mb-3">Quick Stats</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-black">
                                    <span className="text-black">Total Emails:</span>
                                    <span className="font-medium text-black">{displayEmails.length}</span>
                                </div>
                                <div className="flex justify-between text-black">
                                    <span className="text-black">Current Page:</span>
                                    <span className="font-medium text-black">{currentPage}</span>
                                </div>
                                {searchQuery && (
                                    <div className="pt-2 border-t border-gray-100">
                                        <span className="text-xs text-blue-600">
                                            Searching: "{searchQuery}"
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Main Content Wrapper (adds left margin on large screens to avoid overlap with fixed sidebar) */}
                <div className="lg:ml-80 w-full px-4 sm:px-6 lg:px-10 py-6">
                    <div className="max-w-5xl mx-auto">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                <div>
                                    <p className="text-red-800 font-medium">Error</p>
                                    <p className="text-red-700 text-sm">{error}</p>
                                </div>
                                <button
                                    onClick={() => setError(null)}
                                    className="ml-auto text-red-400 hover:text-red-600"
                                >
                                    ×
                                </button>
                            </div>
                        )}

                        {isLoading && displayEmails.length === 0 ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <LoadingSpinner size="lg" />
                                    <p className="text-gray-600 mt-4">Loading emails...</p>
                                </div>
                            </div>
                        ) : displayEmails.length === 0 ? (
                            <div className="text-center py-12">
                                <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No emails found</h3>
                                <p className="text-gray-600">
                                    {searchQuery
                                        ? `No emails match your search for "${searchQuery}"`
                                        : filters.clientSideCategory
                                            ? `No emails match the category filter "${filters.clientSideCategory}"`
                                            : 'Try adjusting your filters or refresh to load emails'
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {displayEmails.map((email, index) => (
                                    <EmailCard
                                        key={`${email.messageId}-${index}`}
                                        email={email}
                                        isSelected={selectedEmail?.messageId === email.messageId}
                                        onClick={() => handleEmailSelect(email)}
                                        onReplyClick={() => handleReplyClick(email)}
                                    />
                                ))}

                                {/* End of results message */}
                                {!hasMoreEmails && !searchQuery && displayEmails.length > 0 && (
                                    <div className="text-center py-6 text-gray-500 text-sm">Last page reached (fewer than 100 results)</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
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