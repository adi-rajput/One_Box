# ReachInBox Frontend

A professional email management dashboard built with Next.js, TypeScript, and Tailwind CSS.

## Features

### 📧 Email Management
- **View All Emails**: Paginated list of emails with infinite scroll
- **Search Functionality**: Full-text search across email content, subjects, and senders
- **Advanced Filtering**: Filter by account and folder (inbox, sent, spam, all)
- **Real-time Updates**: Refresh functionality to get latest emails

### 🔍 Search & Filter
- **Multi-field Search**: Search in subject, body text, sender, and folder
- **Account Filtering**: Filter by specific email accounts
  - krishsri128@gmail.com
  - krish.2022ug3018@iiitranchi.ac.in
- **Folder Filtering**: View emails from specific folders
- **Active Filter Display**: Visual indication of applied filters

### 💬 AI-Powered Replies
- **Smart Reply Generation**: AI-generated contextual reply suggestions
- **Multiple Options**: Get several reply variations for each email
- **Copy to Clipboard**: Easy copying of suggested replies
- **Custom Replies**: Option to write your own responses

### 🎨 User Experience
- **Professional Design**: Clean, modern interface with Tailwind CSS
- **Responsive Layout**: Optimized for desktop, tablet, and mobile
- **Loading States**: Smooth loading indicators and transitions
- **Error Handling**: Graceful error messages and recovery
- **Accessibility**: Keyboard navigation and screen reader friendly

## Tech Stack

- **Framework**: Next.js 15.5.4 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS 4 for modern styling
- **Icons**: Lucide React for consistent iconography
- **State Management**: React hooks with custom utilities

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running on `http://localhost:4000`

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   Create `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to `http://localhost:3000`

## API Integration

The frontend integrates with 4 backend endpoints:

### 1. Get All Emails
```
GET /get-all-email?page=1
```
- Retrieves paginated list of all emails
- Default page size: 100 emails
- Sorted by date (descending)

### 2. Search Emails
```
GET /search?q=query
```
- Full-text search across multiple fields
- Returns relevant emails matching the query

### 3. Filter Emails
```
GET /get-filtered-emails?accountId=...&folder=...&page=1
```
- Filter by account ID and/or folder
- Supports pagination

### 4. Generate Replies
```
GET /suggest-replies?subject=...&body_text=...
```
- AI-powered reply generation
- Returns array of suggested responses

## Component Architecture

### Core Components
- **EmailDashboard**: Main dashboard container
- **EmailCard**: Individual email display component
- **SearchBox**: Search input with real-time feedback
- **FilterControls**: Account and folder filtering
- **ReplyModal**: AI reply generation interface

### UI Components
- **LoadingSpinner**: Consistent loading indicators
- **Responsive Design**: Mobile-first approach

### Services
- **EmailService**: API communication layer
- **Type Definitions**: TypeScript interfaces for type safety

## Key Features Implementation

### Smart Search
- Debounced search input for performance
- Multi-field elasticsearch integration
- Clear search functionality

### Responsive Filtering
- Real-time filter application
- Visual active filter indicators
- Easy filter removal

### Reply Generation
- Modal-based reply interface
- Multiple AI-generated suggestions
- Copy-to-clipboard functionality
- Custom reply composition

### Performance Optimizations
- Lazy loading with pagination
- Optimized re-renders with useCallback
- Efficient state management
- Error boundary implementation

## Development Workflow

### Code Organization
```
src/
├── app/              # Next.js app router
├── components/       # React components
│   ├── ui/          # Reusable UI components
│   └── EmailDashboard.tsx
├── hooks/           # Custom React hooks
├── services/        # API service layer
└── types/           # TypeScript definitions
```

### Best Practices
- TypeScript for type safety
- Component composition over inheritance
- Custom hooks for reusable logic
- Consistent error handling
- Responsive design patterns

## Browser Support
- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

## Performance
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.5s

## Future Enhancements
- Email composition interface
- Real-time notifications
- Advanced search filters
- Email threading
- Offline support
- PWA capabilities

## Contributing
1. Follow TypeScript best practices
2. Maintain responsive design
3. Include proper error handling
4. Add loading states for async operations
5. Write meaningful commit messages