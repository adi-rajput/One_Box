import React from 'react';
import { Filter, User, Folder, Tag } from 'lucide-react';
import { FilterControlsProps } from '../../types/email.types';

const ACCOUNTS = [
    'aditya.2022ug3007@iiitranchi.ac.in',
    'aditya.rajput.career@gmail.com'
];

const FOLDERS: { value: 'all' | 'inbox' | 'sent' | 'spam'; label: string; icon: string }[] = [
    { value: 'all', label: 'All Folders', icon: '📁' },
    { value: 'inbox', label: 'Inbox', icon: '📥' },
    { value: 'sent', label: 'Sent', icon: '📤' },
    { value: 'spam', label: 'Spam', icon: '🚫' }
];

const CATEGORIES = [
    { value: 'all', label: 'All Categories', icon: '📋' },
    { value: 'Interested', label: 'Interested', icon: '✅' },
    { value: 'Not Interested', label: 'Not Interested', icon: '❌' },
    { value: 'Spam', label: 'Spam', icon: '🚫' },
    { value: 'Meeting Booked', label: 'Meeting Booked', icon: '📅' },
    { value: 'Out of Office', label: 'Out of Office', icon: '🏠' }
];

export const FilterControls: React.FC<FilterControlsProps> = ({
    filters,
    onFiltersChange
}) => {
    const handleAccountChange = (accountId: string) => {
        onFiltersChange({
            ...filters,
            accountId: accountId === 'all' ? '' : accountId,
            page: 1
        });
    };

    const handleFolderChange = (folder: string) => {
        onFiltersChange({
            ...filters,
            folder: folder as 'all' | 'inbox' | 'sent' | 'spam',
            page: 1
        });
    };

    const handleCategoryChange = (category: string) => {
        onFiltersChange({
            ...filters,
            clientSideCategory: category === 'all' ? '' : category,
            page: 1
        });
    };

    return (
        <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
                <Filter className="w-5 h-5" style={{ color: 'var(--accent-blue)' }} />
                <h3 className="text-subheading" style={{ color: 'var(--text-primary)' }}>
                    Filters
                </h3>
            </div>

            <div className="space-y-6">
                {/* Account Filter */}
                <div>
                    <label className="flex items-center gap-2 text-body font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                        <User className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} />
                        Account
                    </label>
                    <select
                        value={filters.accountId || 'all'}
                        onChange={(e) => handleAccountChange(e.target.value)}
                        className="form-input"
                        aria-label="Filter by account"
                    >
                        <option value="all">📧 All Accounts</option>
                        {ACCOUNTS.map((account) => (
                            <option key={account} value={account}>
                                👤 {account}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Folder Filter */}
                <div>
                    <label className="flex items-center gap-2 text-body font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                        <Folder className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />
                        Folder
                    </label>
                    <select
                        value={filters.folder || 'all'}
                        onChange={(e) => handleFolderChange(e.target.value)}
                        className="form-input"
                        aria-label="Filter by folder"
                    >
                        {FOLDERS.map((folder) => (
                            <option key={folder.value} value={folder.value}>
                                {folder.icon} {folder.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Category Filter */}
                <div>
                    <label className="flex items-center gap-2 text-body font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                        <Tag className="w-4 h-4" style={{ color: 'var(--accent-orange)' }} />
                        Category
                    </label>
                    <select
                        value={filters.clientSideCategory || 'all'}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="form-input"
                        aria-label="Filter by category"
                    >
                        {CATEGORIES.map((category) => (
                            <option key={category.value} value={category.value}>
                                {category.icon} {category.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Active Filters Display */}
            {(filters.accountId || (filters.folder && filters.folder !== 'all') || filters.clientSideCategory) && (
                <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--border-light)' }}>
                    <h4 className="text-body font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
                        🔧 Active Filters
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {filters.accountId && (
                            <span
                                className="inline-flex items-center px-3 py-1 rounded-full text-caption font-medium"
                                style={{
                                    background: 'var(--accent-blue-light)',
                                    color: 'var(--accent-blue)'
                                }}
                            >
                                👤 {filters.accountId.split('@')[0]}
                                <button
                                    onClick={() => handleAccountChange('all')}
                                    className="ml-2 p-0.5 rounded-full hover:bg-white/20 transition-colors"
                                    aria-label="Remove account filter"
                                >
                                    ✕
                                </button>
                            </span>
                        )}
                        {filters.folder && filters.folder !== 'all' && (
                            <span
                                className="inline-flex items-center px-3 py-1 rounded-full text-caption font-medium"
                                style={{
                                    background: 'var(--accent-green-light)',
                                    color: 'var(--accent-green)'
                                }}
                            >
                                {FOLDERS.find(f => f.value === filters.folder)?.icon} {FOLDERS.find(f => f.value === filters.folder)?.label}
                                <button
                                    onClick={() => handleFolderChange('all')}
                                    className="ml-2 p-0.5 rounded-full hover:bg-white/20 transition-colors"
                                    aria-label="Remove folder filter"
                                >
                                    ✕
                                </button>
                            </span>
                        )}
                        {filters.clientSideCategory && (
                            <span
                                className="inline-flex items-center px-3 py-1 rounded-full text-caption font-medium"
                                style={{
                                    background: 'var(--accent-orange-light)',
                                    color: 'var(--accent-orange)'
                                }}
                            >
                                {CATEGORIES.find(c => c.value === filters.clientSideCategory)?.icon} {filters.clientSideCategory}
                                <button
                                    onClick={() => handleCategoryChange('all')}
                                    className="ml-2 p-0.5 rounded-full hover:bg-white/20 transition-colors"
                                    aria-label="Remove category filter"
                                >
                                    ✕
                                </button>
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};