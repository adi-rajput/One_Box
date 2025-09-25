import { Email, SearchFilters, ReplyResponse } from '../types/email.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class EmailService {
    async getAllEmails(page: number = 1): Promise<Email[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/get-all-email?page=${page}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching all emails:', error);
            throw new Error('Failed to fetch emails');
        }
    }

    async searchEmails(query: string): Promise<Email[]> {
        try {
            if (!query.trim()) {
                return [];
            }

            const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error searching emails:', error);
            throw new Error('Failed to search emails');
        }
    }

    async getFilteredEmails(filters: SearchFilters): Promise<Email[]> {
        try {
            const params = new URLSearchParams();

            if (filters.accountId) params.append('accountId', filters.accountId);
            if (filters.folder && filters.folder !== 'all') params.append('folder', filters.folder);
            if (filters.category) params.append('category', filters.category);
            if (filters.page) params.append('page', filters.page.toString());

            const response = await fetch(`${API_BASE_URL}/get-filtered-emails?${params.toString()}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching filtered emails:', error);
            throw new Error('Failed to fetch filtered emails');
        }
    }

    async suggestReplies(email: Email): Promise<string[]> {
        try {
            const params = new URLSearchParams();
            params.append('subject', email.subject || '');
            params.append('body_text', email.body_text || '');

            const response = await fetch(`${API_BASE_URL}/suggest-replies?${params.toString()}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ReplyResponse = await response.json();
            return data.replies || [];
        } catch (error) {
            console.error('Error generating reply suggestions:', error);
            throw new Error('Failed to generate reply suggestions');
        }
    }

    private handleApiError(error: any, context: string): never {
        console.error(`${context}:`, error);
        throw new Error(`${context} failed`);
    }
}

export const emailService = new EmailService();