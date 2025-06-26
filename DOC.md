# Memory Mate Documentation

Memory Mate is a journaling application powered by AI, specifically designed for people with Alzheimer's. The app helps users log and remember their memories and daily activities, improving their quality of life through technology-assisted memory management.

## Table of Contents

- [5.1. Business Logic](#51-business-logic)
- [5.3. UI Design](#53-ui-design)
- [5.7. Configuration Details](#57-configuration-details)
- [5.8. Launching of App to Production](#58-launching-of-app-to-production)
- [5.9. Scalability](#59-scalability)

## 5.1. Business Logic

### Core Functionality

Memory Mate's business logic is built around three primary features:

1. **Journal Entries**: Allows users to create, view, edit, and delete journal entries to document their daily activities and memories.
2. **Reminders**: Enables users to set and manage index for important events, medications, or activities.
3. **AI Assistant**: Provides an AI-powered chat interface that helps users extract meaningful information from their conversations and automatically create index.

### Data Model

The application uses Supabase as its backend service with the following database structure:

#### Tables

1. **profiles**
   - Stores user profile information
   - Fields: id, full_name, username, updated_at

2. **entries**
   - Stores journal entries
   - Fields: id, title, content, created_at, updated_at, user_id (foreign key to profiles)

3. **os_reminders**
   - Stores index
   - Fields: id, title, description, due_date, created_at, user_id (foreign key to profiles)

4. **chat_messages**
   - Stores chat history between users and the AI assistant
   - Fields: id, message, role, created_at, user_id (foreign key to profiles)

5. **user_agent_settings**
   - Stores user preferences for the AI assistant
   - Fields: id, response_tone, user_id (foreign key to profiles)

6. **credentials**
   - Stores API keys and other sensitive information
   - Fields: id, key, value

### Authentication Flow

1. Users register with email and password through Supabase Auth
2. Upon successful registration, a profile record is created
3. Login authenticates users and establishes a session
4. Protected routes require authentication
5. Session management is handled by Supabase client

### Reminder System

The reminder system integrates with the device's native calendar and index:

1. **Cross-Platform Compatibility**: 
   - iOS: Full integration with the native Reminders app
   - Android: Basic calendar integration (limited by platform capabilities)

2. **Reminder Creation Process**:
   - User creates a reminder in the app
   - Reminder is stored in the Supabase database
   - On iOS, the reminder is also created in the native Reminders app
   - A dedicated "Memory Mate" calendar is created for organization

3. **AI-Assisted Reminder Creation**:
   - The OpenAI integration can extract reminder details from chat conversations
   - Uses GPT-4o-mini model to parse natural language into structured reminder data
   - Implements Zod schema validation to ensure data integrity

### Journal System

1. **Entry Management**:
   - Create, read, update, delete (CRUD) operations for journal entries
   - Entries are stored in the Supabase database with user association
   - Timestamp tracking for creation and updates

2. **Data Synchronization**:
   - Real-time updates between the app and backend
   - Offline capabilities with local storage (partial implementation)

### AI Integration

1. **OpenAI API Integration**:
   - Uses GPT models for natural language processing
   - API key stored securely in the Supabase database
   - Custom system prompts for specialized tasks (e.g., reminder extraction)

2. **Conversation Management**:
   - Persistent chat history stored in the database
   - Context-aware responses based on user history
   - Customizable AI personality through user preferences

## 5.3. UI Design

### Design System

Memory Mate implements a cohesive design system based on Material Design 3 (MD3) principles through React Native Paper:

1. **Theming**:
   - Light and dark mode support
   - Custom color palette with primary, secondary, and tertiary colors
   - Consistent elevation levels and surface treatments

2. **Typography**:
   - Consistent text styles across the application
   - Accessibility considerations for readability
   - Custom fonts (Space Mono) for distinctive branding

3. **Component Library**:
   - React Native Paper components for consistent UI elements
   - Custom components built on top of the base library
   - Reusable patterns for common UI elements

### Navigation Structure

The app uses Expo Router for navigation with a tab-based main interface:

1. **Main Navigation**:
   - Stack-based navigation for the overall app flow
   - Tab-based navigation for the main sections
   - Modal presentations for certain screens (e.g., chat)

2. **Tab Structure**:
   - Home: Dashboard with summary information
   - Journal: List and management of journal entries
   - Reminders: List and management of index
   - Profile: User settings and information

3. **Screen Transitions**:
   - Standard push/pop navigation for detail screens
   - Modal presentation for overlay content
   - Tab switching with standard animations

### Key UI Components

1. **Form Elements**:
   - TextInput for text entry with consistent styling
   - DateTimePicker for date/time selection
   - Buttons with various styles (contained, outlined, text)
   - Helper text for form validation and guidance

2. **Lists and Cards**:
   - Card-based presentation for journal entries and index
   - List views with consistent styling
   - Swipe actions for quick operations

3. **Chat Interface**:
   - Implemented using react-native-gifted-chat
   - Bubble-style message presentation
   - Input toolbar with text input and send button
   - Support for voice input through speech recognition

### Responsive Design

1. **Device Adaptation**:
   - Flexible layouts that adapt to different screen sizes
   - Safe area insets for notches and system UI
   - Keyboard avoidance for form inputs

2. **Orientation Support**:
   - Primary orientation is portrait (as specified in app.json)
   - Limited landscape support for certain screens

### Accessibility

1. **Features**:
   - Color contrast compliance
   - Text scaling support
   - Screen reader compatibility (partial implementation)
   - Touch target sizing for motor impairments

2. **Considerations for Target Users**:
   - Simplified UI for users with cognitive impairments
   - Clear, high-contrast visual elements
   - Consistent navigation patterns
   - Forgiving interaction design

### Visual Design Elements

1. **Color Scheme**:
   - Primary: Purple/pink tones (#8E437E in light mode)
   - Secondary: Muted purple (#6F5767 in light mode)
   - Tertiary: Warm orange/brown (#815341 in light mode)
   - Background: Near-white (#FFFBFF in light mode)
   - Dark mode variants with appropriate contrast

2. **Iconography**:
   - Ionicons for tab bar and common actions
   - FontAwesome for additional UI elements
   - Consistent sizing and coloring

3. **Spacing System**:
   - Defined spacing constants (1x, 2x, 3x, etc.)
   - Consistent padding and margins throughout the app
   - Responsive spacing based on device size

## 5.7. Configuration Details

### Environment Configuration

Memory Mate uses several configuration files to manage its environment:

1. **app.json**:
   - Core Expo configuration
   - App metadata (name, version, etc.)
   - Platform-specific settings
   - Plugin configurations
   - Experimental features

2. **eas.json**:
   - EAS Build configuration
   - Build profiles (development, preview, production)
   - Submission settings
   - Version management

3. **package.json**:
   - Dependencies and devDependencies
   - Scripts for development and building
   - Jest configuration for testing

### API Keys and Secrets

1. **Storage**:
   - OpenAI API key stored in Supabase 'credentials' table
   - Supabase URL and anon key in the codebase (should be moved to environment variables)

2. **Access**:
   - API keys retrieved at runtime from the database
   - Client-side storage using AsyncStorage for session tokens

### Feature Flags

Currently, the app does not implement a formal feature flag system, but could benefit from:

1. **Remote Configuration**:
   - Implementing Firebase Remote Config or a similar service
   - Defining feature flags in the backend
   - Client-side logic to enable/disable features based on flags

2. **A/B Testing**:
   - Setting up experiments for different user experiences
   - Tracking metrics for each variant
   - Gradual rollout of new features

### Build Configuration

1. **Expo Configuration**:
   - New Architecture enabled (newArchEnabled: true)
   - TypeScript support
   - Custom plugins for calendar and speech recognition
   - Typed routes for type-safe navigation

2. **Platform-Specific Settings**:
   - iOS:
     - Bundle identifier: com.kaarlmoroti.memorymate
     - Tablet support enabled
     - Non-exempt encryption declaration
   - Android:
     - Adaptive icon configuration
     - Calendar permissions

3. **Development Tools**:
   - ESLint with Prettier integration
   - TypeScript configuration
   - Jest for testing

### Third-Party Service Integration

1. **Supabase**:
   - Authentication and database services
   - Real-time subscriptions (not currently implemented)
   - Storage capabilities (not currently implemented)

2. **OpenAI**:
   - GPT model access for AI assistant
   - API configuration for model selection and parameters
   - Response format specification using Zod

3. **Expo Services**:
   - Calendar integration
   - Speech recognition
   - Font loading
   - Splash screen management

## 5.8. Launching of App to Production

### Pre-Launch Checklist

1. **Code Quality**:
   - Complete code review
   - Fix all linting errors and warnings
   - Resolve TypeScript type issues
   - Implement comprehensive error handling

2. **Testing**:
   - Unit tests for critical business logic
   - Integration tests for API interactions
   - End-to-end tests for user flows
   - Manual testing on target devices

3. **Performance Optimization**:
   - Bundle size analysis and reduction
   - Memory usage profiling
   - Render performance optimization
   - API call optimization

4. **Security Audit**:
   - Move API keys to secure storage
   - Implement proper authentication flows
   - Review data handling practices
   - Check for common vulnerabilities

### Build Process

1. **EAS Build Configuration**:
   - Configure production build profile in eas.json
   - Set up auto-increment for version numbers
   - Configure distribution certificates and profiles

2. **Build Commands**:
   ```bash
   # Install EAS CLI if not already installed
   npm install -g eas-cli
   
   # Log in to Expo account
   eas login
   
   # Configure the project
   eas build:configure
   
   # Create a production build
   eas build --platform ios --profile production
   eas build --platform android --profile production
   ```

3. **Build Artifacts**:
   - iOS: IPA file for App Store submission
   - Android: AAB file for Google Play submission

### App Store Submission

1. **iOS App Store**:
   - Create App Store Connect listing
   - Prepare screenshots and marketing materials
   - Complete app review information
   - Submit build using EAS Submit or App Store Connect
   ```bash
   eas submit -p ios --profile production
   ```

2. **Google Play Store**:
   - Create Google Play Console listing
   - Prepare store listing assets
   - Complete content rating questionnaire
   - Submit build using EAS Submit or Play Console
   ```bash
   eas submit -p android --profile production
   ```

3. **Review Process**:
   - Prepare for potential rejection issues
   - Have documentation ready for reviewers
   - Plan for expedited reviews if necessary

### Post-Launch Monitoring

1. **Analytics Implementation**:
   - Implement a mobile analytics solution (e.g., Firebase Analytics)
   - Track key user actions and flows
   - Monitor session duration and retention

2. **Crash Reporting**:
   - Implement a crash reporting tool (e.g., Sentry)
   - Set up alerting for critical issues
   - Prioritize fixes based on impact

3. **User Feedback Collection**:
   - In-app feedback mechanism
   - App store review monitoring
   - Support email or form

4. **Performance Monitoring**:
   - API response times
   - UI rendering performance
   - Battery and memory usage

### Update Strategy

1. **Versioning**:
   - Semantic versioning (MAJOR.MINOR.PATCH)
   - Auto-increment for builds using EAS

2. **OTA Updates**:
   - Implement Expo Updates for over-the-air JavaScript updates
   - Configure update policies in app.json
   - Test update delivery before production use

3. **Release Cadence**:
   - Establish regular release schedule
   - Hotfix process for critical issues
   - Beta testing program for early feedback

## 5.9. Scalability

### Backend Scalability

1. **Supabase Scaling**:
   - Upgrade Supabase plan as user base grows
   - Implement database indexing for frequently queried fields
   - Consider read replicas for high-traffic scenarios
   - Implement connection pooling for efficient resource use

2. **API Optimization**:
   - Implement caching strategies
   - Use pagination for large data sets
   - Optimize query patterns
   - Consider implementing a CDN for static assets

3. **OpenAI API Usage**:
   - Implement rate limiting and queuing
   - Cache common responses
   - Use streaming for long responses
   - Monitor token usage and costs

### Frontend Performance

1. **React Native Optimization**:
   - Implement memo and useCallback for expensive components
   - Use virtualized lists for long scrolling content
   - Optimize image loading and caching
   - Reduce JavaScript bundle size

2. **State Management**:
   - Consider implementing a more robust state management solution (Redux, Zustand, etc.)
   - Optimize context usage to prevent unnecessary re-renders
   - Implement proper data normalization

3. **Offline Capabilities**:
   - Implement offline-first architecture
   - Use AsyncStorage for local caching
   - Sync strategies for when connectivity is restored

### User Growth Strategies

1. **Onboarding Optimization**:
   - Streamline user registration process
   - Implement guided tutorials
   - Reduce friction in initial setup

2. **Feature Expansion**:
   - Plan for additional AI-powered features
   - Consider social features for caregivers
   - Implement data export/import capabilities

3. **Localization**:
   - Prepare the app for internationalization
   - Implement multi-language support
   - Consider cultural adaptations for different regions

### Technical Debt Management

1. **Code Quality**:
   - Establish coding standards and documentation requirements
   - Implement regular refactoring sprints
   - Set up automated code quality checks

2. **Testing Strategy**:
   - Increase test coverage over time
   - Implement integration and E2E tests
   - Set up continuous integration pipelines

3. **Dependency Management**:
   - Regular updates of dependencies
   - Security vulnerability scanning
   - Evaluation of alternative libraries when needed

### Infrastructure Considerations

1. **Multi-Region Support**:
   - Plan for geographic expansion with multi-region database
   - Implement region-specific API endpoints
   - Consider data residency requirements

2. **Monitoring and Alerting**:
   - Implement comprehensive logging
   - Set up alerts for critical errors
   - Monitor system health metrics

3. **Backup and Recovery**:
   - Regular database backups
   - Disaster recovery planning
   - Data retention policies

### Security Scaling

1. **Authentication Enhancements**:
   - Implement multi-factor authentication
   - Add social login options
   - Enhance session management

2. **Data Protection**:
   - Implement end-to-end encryption for sensitive data
   - Regular security audits
   - GDPR and HIPAA compliance considerations

3. **API Security**:
   - Implement proper rate limiting
   - Use JWT with appropriate expiration
   - Regular rotation of API keys

By addressing these scalability considerations, Memory Mate can grow from a small application to a robust platform serving a large user base while maintaining performance, security, and reliability.