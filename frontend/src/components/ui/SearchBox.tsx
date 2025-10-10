import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { SearchBoxProps } from '../../types/email.types';
import { LoadingSpinner } from './LoadingSpinner';

export const SearchBox: React.FC<SearchBoxProps> = ({
    onSearch,
    placeholder = "Search emails..",
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
        <form onSubmit={handleSubmit} className="relative group">
            <div className="relative flex items-center">
                {/* <Search
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors group-focus-within:text-blue-500"
                    style={{ color: 'var(--text-muted)' }}
                /> */}
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className="form-input pl-12 pr-20 py-3 text-body rounded-lg border transition-all duration-200 focus:scale-[1.02] group-hover:border-blue-300"
                    style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border-medium)',
                        color: 'var(--text-primary)'
                    }}
                    disabled={isLoading}
                    aria-label="Search emails"
                />
                <div className="absolute right-3 flex items-center space-x-2">
                    {isLoading && <LoadingSpinner size="sm" />}
                    {query && !isLoading && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1 rounded-full transition-colors hover:bg-gray-100"
                            style={{ color: 'var(--text-muted)' }}
                            aria-label="Clear search"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary px-3 py-1.5 text-sm"
                        aria-label="Search"
                    >
                        <span className="hidden sm:inline">🔍</span>
                        <Search className="w-4 h-4 sm:hidden" />
                    </button>
                </div>
            </div>
        </form>
    );
};