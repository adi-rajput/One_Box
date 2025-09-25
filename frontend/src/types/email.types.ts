// Email data types based on backend API responses
export interface EmailAddress {
    address: string;
    name?: string;
}

export interface Email {
    messageId: string;
    subject: string;
    from: EmailAddress;
    to: EmailAddress[];
    cc?: EmailAddress[];
    bcc?: EmailAddress[];
    date: string;
    body_text: string;
    body_html?: string;
    folder: 'inbox' | 'sent' | 'spam' | 'all';
    accountId: string;
    category?: string;
    hasAttachments?: boolean;
    importance?: 'low' | 'normal' | 'high';
}

export interface ApiResponse<T> {
    data?: T;
    error?: string;
    message?: string;
}

export interface ReplyResponse {
    replies: string[];
}

export interface SearchFilters {
    query?: string;
    accountId?: string;
    folder?: 'inbox' | 'sent' | 'spam' | 'all';
    category?: string;
    clientSideCategory?: string;
    page?: number;
}export interface EmailListProps {
    emails: Email[];
    isLoading: boolean;
    onEmailSelect: (email: Email) => void;
    selectedEmailId?: string;
}

export interface SearchBoxProps {
    onSearch: (query: string) => void;
    placeholder?: string;
    isLoading?: boolean;
}

export interface FilterControlsProps {
    filters: SearchFilters;
    onFiltersChange: (filters: SearchFilters) => void;
    accounts?: string[];
}

export interface ReplyModalProps {
    email: Email | null;
    isOpen: boolean;
    onClose: () => void;
    replies: string[];
    isGenerating: boolean;
    onGenerateReplies: (email: Email) => void;
}