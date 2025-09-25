import React from 'react';
import { Filter, User, Folder, Tag } from 'lucide-react';
import { FilterControlsProps } from '../../types/email.types';

const ACCOUNTS = [
    'krishsri128@gmail.com',
    'krish.2022ug3018@iiitranchi.ac.in'
];

const FOLDERS = [
    { value: 'all', label: 'All Folders' },
    { value: 'inbox', label: 'Inbox' },
    { value: 'sent', label: 'Sent' },
    { value: 'spam', label: 'Spam' }
]; export const FilterControls: React.FC<FilterControlsProps> = ({
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
            folder: folder as any,
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
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-black" />
                <h3 className="font-semibold text-black">Filters</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Account Filter */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-black mb-2">
                        <User className="w-4 h-4" />
                        Account
                    </label>
                    <select
                        value={filters.accountId || 'all'}
                        onChange={(e) => handleAccountChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-black"
                    >
                        <option value="all">All Accounts</option>
                        {ACCOUNTS.map((account) => (
                            <option key={account} value={account}>
                                {account}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-black mb-2">
                        <Folder className="w-4 h-4" />
                        Folder
                    </label>
                    <select
                        value={filters.folder || 'all'}
                        onChange={(e) => handleFolderChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-black"
                    >
                        {FOLDERS.map((folder) => (
                            <option key={folder.value} value={folder.value}>
                                {folder.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-black mb-2">
                        <Tag className="w-4 h-4" />
                        Category
                    </label>
                    <select
                        value={filters.clientSideCategory || 'all'}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-black"
                    >
                        <option value="all">All Categories</option>
                        <option value="Interested">Interested</option>
                        <option value="Not Interested">Not Interested</option>
                        <option value="Spam">Spam</option>
                        <option value="Meeting Booked">Meeting Booked</option>
                        <option value="Out of Office">Out of Office</option>
                    </select>
                </div>
            </div>

            {/* Active Filters Display */}
            {(filters.accountId || (filters.folder && filters.folder !== 'all') || filters.clientSideCategory) && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                        {filters.accountId && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {filters.accountId}
                                <button
                                    onClick={() => handleAccountChange('all')}
                                    className="ml-1 text-blue-600 hover:text-blue-800"
                                >
                                    ×
                                </button>
                            </span>
                        )}
                        {filters.folder && filters.folder !== 'all' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {FOLDERS.find(f => f.value === filters.folder)?.label}
                                <button
                                    onClick={() => handleFolderChange('all')}
                                    className="ml-1 text-green-600 hover:text-green-800"
                                >
                                    ×
                                </button>
                            </span>
                        )}
                        {filters.clientSideCategory && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                Category: {filters.clientSideCategory}
                                <button
                                    onClick={() => handleCategoryChange('all')}
                                    className="ml-1 text-purple-600 hover:text-purple-800"
                                >
                                    ×
                                </button>
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};