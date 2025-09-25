import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { SearchBoxProps } from '../../types/email.types';
import { LoadingSpinner } from './LoadingSpinner';

export const SearchBox: React.FC<SearchBoxProps> = ({
    onSearch,
    placeholder = "Search emails...",
    isLoading = false
}) => {
    const [query, setQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query);
    };

    const handleClear = () => {
        setQuery('');
        onSearch('');
    };

    return (
        <form onSubmit={handleSubmit} className="relative">
            <div className="relative flex items-center">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-16 sm:pr-20 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-black"
                    disabled={isLoading}
                />
                <div className="absolute right-2 flex items-center space-x-2">
                    {isLoading && <LoadingSpinner size="sm" />}
                    {query && !isLoading && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-2 sm:px-3 py-1 bg-blue-600 text-white text-xs sm:text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <span className="hidden sm:inline">Search</span>
                        <Search className="w-4 h-4 sm:hidden" />
                    </button>
                </div>
            </div>
        </form>
    );
};