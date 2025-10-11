# Contributor Onboarding Guide

## Welcome to EverTrack!

This guide will help you get up and running with the EverTrack browser extension development environment.

## Quick Start Flowchart

```mermaid
flowchart TD
    A[Start Contributing] --> B{Have Node.js 18+?}
    B -->|No| C[Install Node.js from nodejs.org]
    B -->|Yes| D[Fork & Clone Repository]
    C --> D
    D --> E[Run 'npm install']
    E --> F[Run 'npm test' to verify setup]
    F --> G{All tests pass?}
    G -->|No| H[Check troubleshooting guide]
    G -->|Yes| I[Load extension in browser]
    I --> J[Ready to develop!]
    H --> F
```

## Development Environment Setup

### Prerequisites

```mermaid
graph LR
    subgraph "Required Tools"
        A[Node.js 18+]
        B[Git]
        C[VS Code<br/>Recommended]
    end
    
    subgraph "Browser Support"
        D[Chrome/Edge<br/>Chromium-based]
        E[Firefox<br/>WebExtensions]
    end
    
    A --> F[Development Ready]
    B --> F
    C --> F
    D --> G[Testing Ready]
    E --> G
    
    classDef required fill:#ffebee
    classDef browser fill:#e3f2fd
    
    class A,B,C required
    class D,E browser
```

### Step-by-Step Setup

1. **Environment Check**
   ```bash
   node --version  # Should be 18.0.0 or higher
   npm --version   # Should be 9.0.0 or higher
   git --version   # Any recent version
   ```

2. **Repository Setup**
   ```bash
   git clone https://github.com/djretief/ever-track.git
   cd ever-track
   npm install
   ```

3. **Verify Installation**
   ```bash
   npm test  # Runs linting, type checking, and unit tests
   ```

## Codebase Navigation

```mermaid
mindmap
  root((EverTrack))
    Browser Extension
      manifest.json
      background.js
      popup.html/js
      settings.html/js
    Core Modules
      src/time-utils.js
      src/api-utils.js
      src/dom-utils.js
    Development
      tests/
      jest.config.js
      package.json
      eslint.config.js
    Documentation
      README.md
      docs/ARCHITECTURE.md
      CHANGELOG.md
```

## Development Workflow

```mermaid
gitgraph
    commit id: "Fork repo"
    commit id: "Clone locally"
    branch feature/new-feature
    checkout feature/new-feature
    commit id: "Implement feature"
    commit id: "Add tests"
    commit id: "Update docs"
    commit id: "Run npm test"
    checkout main
    merge feature/new-feature
    commit id: "Feature merged"
```

## Common Development Tasks

### Adding a New Feature

```mermaid
flowchart TD
    A[Identify Feature Need] --> B[Create Feature Branch]
    B --> C[Write Tests First<br/>TDD Approach]
    C --> D[Implement Feature]
    D --> E[Run Tests<br/>'npm test']
    E --> F{Tests Pass?}
    F -->|No| G[Fix Issues]
    G --> E
    F -->|Yes| H[Update Documentation]
    H --> I[Create Pull Request]
    I --> J[Code Review]
    J --> K{Approved?}
    K -->|No| L[Address Feedback]
    L --> J
    K -->|Yes| M[Merge to Main]
```

### Bug Fixing Process

```mermaid
sequenceDiagram
    participant U as User/Issue
    participant D as Developer
    participant T as Tests
    participant R as Repository
    
    U->>D: Reports bug
    D->>D: Reproduce issue
    D->>T: Write failing test
    D->>D: Fix bug
    D->>T: Run tests
    T->>D: Tests pass
    D->>R: Commit fix
    D->>U: Close issue
```

## Code Quality Standards

### Testing Requirements

```mermaid
pie title Test Coverage Goals
    "Unit Tests" : 80
    "Integration Tests" : 15
    "Documentation" : 5
```

### Code Quality Checklist

- [ ] **ESLint**: No errors (warnings acceptable for console statements)
- [ ] **TypeScript**: All type checks pass
- [ ] **Jest Tests**: All unit tests pass
- [ ] **Documentation**: Updated for new features
- [ ] **Commit Messages**: Clear and descriptive

## Browser Extension Development

### Loading Extension for Testing

```mermaid
flowchart LR
    A[Open Chrome] --> B[Go to chrome://extensions/]
    B --> C[Enable Developer Mode]
    C --> D[Click 'Load Unpacked']
    D --> E[Select EverTrack folder]
    E --> F[Extension loaded!]
    F --> G[Test functionality]
    G --> H{Changes made?}
    H -->|Yes| I[Click refresh icon]
    I --> G
    H -->|No| J[Development complete]
```

### Extension Architecture Understanding

```mermaid
graph TB
    subgraph "Browser Context"
        BG[Background Script<br/>Always running]
        PP[Popup<br/>On-demand]
        CS[Content Scripts<br/>Page interaction]
    end
    
    subgraph "Storage & APIs"
        ST[Browser Storage]
        NT[Notifications]
        AL[Alarms/Timers]
    end
    
    subgraph "External"
        API[Everhour API]
    end
    
    BG --> ST
    BG --> NT
    BG --> AL
    BG --> API
    PP --> BG
    CS --> BG
    
    classDef browser fill:#e1f5fe
    classDef storage fill:#f3e5f5
    classDef external fill:#fff3e0
    
    class BG,PP,CS browser
    class ST,NT,AL storage
    class API external
```

## Module Development Guide

### Time Utils Module (`src/time-utils.js`)

```mermaid
graph LR
    A[Decimal Hours<br/>e.g. 8.75] --> B[formatHours()]
    B --> C[Readable Time<br/>e.g. "8h 45m"]
    
    D[Time String<br/>e.g. "2:30 PM"] --> E[parseTime()]
    E --> F[Normalized Time<br/>Object]
    
    G[Current Status] --> H[getStatus()]
    H --> I[Status String<br/>Working/Break/Done]
```

### API Utils Module (`src/api-utils.js`)

```mermaid
sequenceDiagram
    participant M as Module
    participant C as Cache
    participant A as API
    
    M->>C: Check cache
    alt Cache valid
        C->>M: Return cached data
    else Cache expired
        M->>A: Fetch fresh data
        A->>M: Return API response
        M->>C: Update cache
        M->>M: Return processed data
    end
```

## Testing Your Changes

### Unit Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- time-utils.test.js

# Run tests in watch mode
npm test -- --watch
```

### Manual Testing Checklist

- [ ] Extension loads without errors
- [ ] Popup displays correctly
- [ ] Settings page functions properly
- [ ] API integration works
- [ ] Time formatting is accurate
- [ ] No console errors

## Troubleshooting Common Issues

### Jest Module Loading Issues

```mermaid
flowchart TD
    A[Jest Test Fails] --> B{Module loading error?}
    B -->|Yes| C[Check globals.js setup]
    C --> D[Ensure window.EverTrackTime cleared]
    D --> E[Re-run tests]
    B -->|No| F[Check test syntax]
    F --> G[Verify test environment]
    G --> E
```

### Extension Loading Issues

```mermaid
flowchart TD
    A[Extension won't load] --> B{Manifest errors?}
    B -->|Yes| C[Check manifest.json syntax]
    B -->|No| D{Background script errors?}
    D -->|Yes| E[Check browser console]
    D -->|No| F{Permission issues?}
    F -->|Yes| G[Review required permissions]
    F -->|No| H[Check file paths]
```

## Getting Help

### Community Resources

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Comprehensive guides in `/docs`
- **Code Comments**: Inline documentation in source files

### Before Asking for Help

1. Check existing GitHub issues
2. Review this documentation
3. Run `npm test` to verify environment
4. Include error messages and steps to reproduce

## Contributing Best Practices

### Code Style

- Follow ESLint configuration
- Use meaningful variable names
- Add JSDoc comments for functions
- Keep functions small and focused

### Commit Guidelines

```
type(scope): description

Examples:
feat(popup): add time tracking summary
fix(api): handle network timeout errors
docs(architecture): add component diagrams
test(utils): add edge cases for time formatting
```

### Pull Request Template

1. **Description**: What does this PR do?
2. **Testing**: How was this tested?
3. **Documentation**: What docs were updated?
4. **Breaking Changes**: Any breaking changes?

## Next Steps

Once you're set up:

1. **Explore the code**: Start with `popup.js` for UI logic
2. **Run tests**: Understand the testing patterns
3. **Check issues**: Look for "good first issue" labels
4. **Ask questions**: Don't hesitate to ask for clarification

Welcome to the team!