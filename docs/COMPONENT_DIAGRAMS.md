# Component Interaction Diagrams

## System Overview

This document provides detailed visual representations of how EverTrack components interact with each other and external systems.

## 1. Extension Initialization Flow

```mermaid
sequenceDiagram
    participant B as Browser
    participant BG as Background Script
    participant ST as Storage
    participant API as Everhour API
    participant U as User
    
    B->>BG: Extension installed/enabled
    BG->>ST: Check for existing config
    
    alt First time setup
        ST->>BG: No config found
        BG->>U: Show setup notification
        U->>BG: Configure API key
        BG->>ST: Save configuration
    else Existing setup
        ST->>BG: Return saved config
        BG->>API: Validate API key
        API->>BG: Validation result
    end
    
    BG->>BG: Start background polling
    BG->>U: Extension ready
```

## 2. Popup Interaction Flow

```mermaid
graph TD
    A[User clicks extension icon] --> B[popup.html loads]
    B --> C[popup.js initializes]
    C --> D{Background data available?}
    
    D -->|Yes| E[Render current data]
    D -->|No| F[Show loading state]
    
    F --> G[Request data from background]
    G --> H[Background fetches from API]
    H --> I[Data returned to popup]
    I --> E
    
    E --> J[User interacts with UI]
    J --> K{Action type?}
    
    K -->|Start timer| L[Send start command]
    K -->|Stop timer| M[Send stop command]
    K -->|View details| N[Update display]
    K -->|Open settings| O[Open settings page]
    
    L --> P[Background processes command]
    M --> P
    P --> Q[API call executed]
    Q --> R[Update popup display]
```

## 3. Data Flow Architecture

```mermaid
flowchart TB
    subgraph "Browser Extension Layer"
        BG[Background Script]
        PP[Popup Interface]
        SET[Settings Page]
    end
    
    subgraph "Data Layer"
        CACHE[Memory Cache]
        STORAGE[Browser Storage]
        UTILS[Utility Modules]
    end
    
    subgraph "External Layer"
        EVERHOUR[Everhour API]
        NOTIFICATIONS[Browser Notifications]
    end
    
    BG <--> CACHE
    BG <--> STORAGE
    BG <--> EVERHOUR
    BG --> NOTIFICATIONS
    
    PP <--> BG
    SET <--> STORAGE
    
    UTILS <--> PP
    UTILS <--> BG
    
    classDef extension fill:#e3f2fd
    classDef data fill:#f3e5f5
    classDef external fill:#fff3e0
    
    class BG,PP,SET extension
    class CACHE,STORAGE,UTILS data
    class EVERHOUR,NOTIFICATIONS external
```

## 4. Time Tracking State Machine

```mermaid
stateDiagram-v2
    [*] --> NotConfigured
    NotConfigured --> Configured : API key set
    
    Configured --> Idle : No active timer
    Idle --> Tracking : Start timer
    Tracking --> Idle : Stop timer
    Tracking --> Paused : Pause timer
    Paused --> Tracking : Resume timer
    Paused --> Idle : Stop timer
    
    Idle --> Offline : Network unavailable
    Tracking --> Offline : Network unavailable
    Paused --> Offline : Network unavailable
    Offline --> Idle : Network restored
    
    state Tracking {
        [*] --> Active
        Active --> Updating : Sync with API
        Updating --> Active : Sync complete
    }
```

## 5. API Integration Patterns

```mermaid
graph LR
    subgraph "Request Flow"
        A[API Request] --> B[Rate Limiting]
        B --> C[Authentication]
        C --> D[Request Execution]
        D --> E[Response Handling]
    end
    
    subgraph "Error Handling"
        F[Network Error] --> G[Retry Logic]
        H[Auth Error] --> I[Re-authentication]
        J[Rate Limit] --> K[Backoff Strategy]
    end
    
    subgraph "Caching Strategy"
        L[Fresh Data] --> M[Memory Cache]
        M --> N[Background Sync]
        N --> O[Storage Persist]
    end
    
    E --> F
    E --> H
    E --> J
    E --> L
    
    G --> A
    I --> A
    K --> A
```

## 6. Component Dependencies

```mermaid
graph TB
    subgraph "Core Components"
        POPUP[popup.js]
        BACKGROUND[background.js]
        SETTINGS[settings.js]
    end
    
    subgraph "Utility Modules"
        TIME[time-utils.js]
        API[api-utils.js]
        DOM[dom-utils.js]
    end
    
    subgraph "Configuration"
        MANIFEST[manifest.json]
        PACKAGE[package.json]
        JEST[jest.config.js]
    end
    
    POPUP --> TIME
    POPUP --> API
    POPUP --> DOM
    
    BACKGROUND --> TIME
    BACKGROUND --> API
    
    SETTINGS --> DOM
    SETTINGS --> API
    
    MANIFEST --> POPUP
    MANIFEST --> BACKGROUND
    MANIFEST --> SETTINGS
    
    classDef core fill:#ffebee
    classDef util fill:#e8f5e8
    classDef config fill:#fff3e0
    
    class POPUP,BACKGROUND,SETTINGS core
    class TIME,API,DOM util
    class MANIFEST,PACKAGE,JEST config
```

## 7. User Journey Mapping

```mermaid
journey
    title New User Onboarding
    section Installation
      Install extension: 3: User
      Grant permissions: 2: User
      See welcome popup: 4: User
    section Configuration
      Open settings: 3: User
      Enter API key: 2: User
      Test connection: 4: User
      Save settings: 5: User
    section First Use
      Click extension icon: 5: User
      View time data: 5: User
      Start tracking: 5: User
      Monitor progress: 4: User
    section Regular Use
      Quick status check: 5: User
      Toggle tracking: 5: User
      View summaries: 4: User
      Adjust settings: 3: User
```

## 8. Error Handling Flow

```mermaid
flowchart TD
    A[Error Occurs] --> B{Error Type?}
    
    B -->|Network| C[Network Error Handler]
    B -->|Authentication| D[Auth Error Handler]
    B -->|Validation| E[Validation Error Handler]
    B -->|Unknown| F[Generic Error Handler]
    
    C --> G{Retry Possible?}
    G -->|Yes| H[Exponential Backoff]
    G -->|No| I[Show Offline Mode]
    
    D --> J[Clear Auth Data]
    J --> K[Redirect to Settings]
    
    E --> L[Show Validation Message]
    L --> M[Highlight Invalid Fields]
    
    F --> N[Log Error Details]
    N --> O[Show Generic Error]
    
    H --> P[Retry Request]
    I --> Q[User Notification]
    K --> Q
    M --> Q
    O --> Q
    
    P --> R{Retry Successful?}
    R -->|Yes| S[Continue Normal Flow]
    R -->|No| A
```

## 9. Performance Optimization Flow

```mermaid
graph TB
    subgraph "Performance Strategies"
        A[Lazy Loading]
        B[Data Caching]
        C[Background Sync]
        D[Memory Management]
    end
    
    subgraph "Monitoring Points"
        E[API Response Time]
        F[UI Render Time]
        G[Memory Usage]
        H[Battery Usage]
    end
    
    subgraph "Optimization Actions"
        I[Reduce API Calls]
        J[Optimize DOM Updates]
        K[Cleanup Event Listeners]
        L[Implement Debouncing]
    end
    
    A --> E
    B --> E
    C --> F
    D --> G
    
    E --> I
    F --> J
    G --> K
    H --> L
    
    classDef strategy fill:#e3f2fd
    classDef monitor fill:#f3e5f5
    classDef action fill:#e8f5e8
    
    class A,B,C,D strategy
    class E,F,G,H monitor
    class I,J,K,L action
```

## 10. Testing Strategy Overview

```mermaid
mindmap
  root((Testing Strategy))
    Unit Tests
      Time Utils
        formatHours()
        getStatus()
        parseTime()
      API Utils
        Authentication
        Data Fetching
        Error Handling
      DOM Utils
        Element Creation
        Progress Updates
        Text Formatting
    Integration Tests
      API Integration
        Full Request Flow
        Error Scenarios
        Data Transformation
      Browser Integration
        Extension Loading
        Storage Operations
        Notification System
    End-to-End Tests
      User Workflows
        Installation Flow
        Configuration Setup
        Time Tracking
      Cross-Browser
        Chrome/Edge
        Firefox
        Safari (future)
```

These diagrams provide a comprehensive visual guide for contributors to understand:

1. **System Architecture**: How components interact
2. **Data Flow**: How information moves through the system
3. **User Journeys**: How users interact with the extension
4. **Error Handling**: How the system responds to failures
5. **Performance**: How optimization strategies work
6. **Testing**: How quality assurance is structured

This visual documentation will help new contributors quickly understand the codebase structure and make meaningful contributions.