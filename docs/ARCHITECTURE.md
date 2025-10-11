# EverTrack Browser Extension Architecture

## Overview

EverTrack is a browser extension that integrates with the Everhour time tracking API to provide real-time time tracking insights directly in your browser.

## High-Level Architecture

```mermaid
graph TB
    subgraph "Browser Extension Layer"
        BG["Background Script<br/>background.js"]
        PP["Popup Interface<br/>popup.html/js"]
        SP["Settings Page<br/>settings.html/js"]
    end
    
    subgraph "Core Modules Layer"
        TIME["Time Utils<br/>src/time-utils.js"]
        API["API Utils<br/>src/api-utils.js"]
        DOM["DOM Utils<br/>src/dom-utils.js"]
    end
    
    subgraph "External APIs Layer"
        EH["Everhour API<br/>api.everhour.com"]
        CS["Chrome Storage"]
        NT["Notifications"]
    end
    
    %% Main connections with clear paths
    BG -.-> API
    PP --> TIME
    PP --> DOM
    PP -.-> API
    SP --> CS
    
    %% External connections
    API --> EH
    BG --> CS
    BG --> NT
    
    %% Styling
    classDef extension fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef module fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef external fill:#fff3e0,stroke:#e65100,stroke-width:2px
    
    class BG,PP,SP extension
    class TIME,API,DOM module
    class EH,CS,NT external
```

## Component Breakdown

### 1. Browser Extension Components

#### Background Script (`background.js`)
- **Purpose**: Persistent background process for the extension
- **Responsibilities**:
  - Manage extension lifecycle
  - Handle API polling and data fetching
  - Coordinate with browser APIs
  - Send notifications

#### Popup Interface (`popup.html/js`)
- **Purpose**: Main user interface accessible via browser toolbar
- **Responsibilities**:
  - Display current time tracking status
  - Show time summaries and progress
  - Provide quick actions for time tracking

#### Settings Page (`settings.html/js`)
- **Purpose**: Configuration interface for user preferences
- **Responsibilities**:
  - API key management
  - User preference configuration
  - Data persistence settings

### 2. Core Utility Modules

#### Time Utils (`src/time-utils.js`)
- **Purpose**: Time calculation and formatting utilities
- **Key Functions**:
  - `formatHours()` - Convert decimal hours to readable format
  - `getStatus()` - Determine current tracking status
  - `parseTime()` - Parse time strings into standardized format

#### API Utils (`src/api-utils.js`)
- **Purpose**: Everhour API integration and data management
- **Key Functions**:
  - API authentication
  - Data fetching and caching
  - Error handling and retry logic

#### DOM Utils (`src/dom-utils.js`)
- **Purpose**: DOM manipulation and UI utilities
- **Key Functions**:
  - Dynamic element creation
  - Progress bar updates
  - Text formatting and display

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant U as User
    participant P as Popup
    participant B as Background
    participant A as API Utils
    participant E as Everhour API
    
    U->>P: Opens extension popup
    P->>B: Request current data
    B->>A: Get cached data
    
    alt Data is fresh
        A->>B: Return cached data
    else Data is stale
        A->>E: Fetch fresh data
        E->>A: Return API response
        A->>A: Process & cache data
        A->>B: Return processed data
    end
    
    B->>P: Send data to popup
    P->>P: Render UI with data
    P->>U: Display time tracking info
```

## File Structure and Responsibilities

```
EverTrack/
├── manifest.json           # Extension configuration
├── background.js           # Background script
├── popup.html             # Main UI template
├── popup.js              # Main UI logic
├── settings.html         # Settings UI template
├── settings.js          # Settings UI logic
├── src/                 # Core utility modules
│   ├── time-utils.js   # Time calculations
│   ├── api-utils.js    # API integration
│   └── dom-utils.js    # DOM utilities
├── tests/              # Unit tests
│   ├── globals.js     # Test environment setup
│   ├── setup.js       # Test configuration
│   └── *.test.js      # Test suites
├── icons/             # Extension icons
└── docs/              # Documentation
```

## Extension Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Installing
    Installing --> Installed : Installation complete
    Installed --> Configuring : First launch
    Configuring --> Configured : API key set
    Configured --> Active : Ready to use
    Active --> Polling : Background data fetch
    Polling --> Active : Data updated
    Active --> Settings : User opens settings
    Settings --> Active : Settings saved
    Active --> Disabled : Extension disabled
    Disabled --> [*]
```

## API Integration Flow

```mermaid
flowchart TD
    A[Start API Request] --> B{API Key Available?}
    B -->|No| C[Redirect to Settings]
    B -->|Yes| D[Make API Request]
    D --> E{Request Successful?}
    E -->|No| F{Retry Attempts < 3?}
    F -->|Yes| G[Wait & Retry]
    G --> D
    F -->|No| H[Show Error]
    E -->|Yes| I[Process Response]
    I --> J[Cache Data]
    J --> K[Update UI]
    K --> L[End]
    C --> L
    H --> L
```

## Development Workflow

```mermaid
gitgraph
    commit id: "Initial Setup"
    commit id: "Add ESLint"
    commit id: "Add TypeScript"
    branch feature
    checkout feature
    commit id: "Implement Feature"
    commit id: "Add Tests"
    commit id: "Fix Issues"
    checkout main
    merge feature
    commit id: "Release"
```

## Testing Architecture

```mermaid
graph LR
    subgraph "Testing Layers"
        UT[Unit Tests<br/>Jest + jsdom]
        IT[Integration Tests<br/>API mocking]
        E2E[End-to-End Tests<br/>Browser automation]
    end
    
    subgraph "Test Targets"
        UTILS[Utility Functions]
        API[API Integration]
        UI[User Interface]
    end
    
    UT --> UTILS
    IT --> API
    E2E --> UI
    
    classDef test fill:#e8f5e8
    classDef target fill:#fff8e1
    
    class UT,IT,E2E test
    class UTILS,API,UI target
```

## Security Considerations

- **API Key Storage**: Encrypted storage using Chrome's secure storage API
- **Permissions**: Minimal required permissions in manifest.json
- **Data Handling**: No sensitive data stored in local storage
- **HTTPS Only**: All API communications over secure connections

## Performance Optimizations

- **Data Caching**: Smart caching to reduce API calls
- **Lazy Loading**: Load components only when needed
- **Background Polling**: Efficient polling intervals
- **Memory Management**: Proper cleanup of event listeners

## Contribution Guidelines

1. **Fork & Clone**: Fork the repository and clone locally
2. **Setup**: Run `npm install` and configure development environment
3. **Develop**: Create feature branch and implement changes
4. **Test**: Run `npm test` to ensure all tests pass
5. **Document**: Update documentation for any architectural changes
6. **Submit**: Create pull request with clear description

## Future Architecture Considerations

- **Multi-browser Support**: Abstract browser-specific APIs
- **Modular Architecture**: Consider micro-frontend approach
- **Real-time Updates**: WebSocket integration for live updates
- **Offline Support**: Service worker for offline functionality