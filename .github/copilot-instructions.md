## Coding Style Guidelines

### Communication Style
- **No Icons/Emojis**: Never use icons, emojis, or Unicode symbols in code, comments, commit messages, or documentation
- **Professional Tone**: Use clear, professional language without decorative elements
- **Plain Text**: Prefer plain text formatting over visual embellishments

## Code Quality & Architecture Improvements

### Project Structure Enhancements
- [x] Organize build scripts into `/scripts` or `/tools` directory
- [ ] Create browser-specific asset folders if project grows
- [x] Consider `/src` directory for core logic and `/public` for static assets
- [x] Add architecture diagrams or flowcharts for contributor onboarding

### Code Quality & Development
- [x] Implement TypeScript for type safety and better tooling
- [x] Add unit tests for core logic (time calculations, API integration)
- [x] Set up ESLint or similar for consistent code style
- [ ] Consider bundler (Webpack, Vite) for optimization and dependency management
- [ ] Document API endpoints and expected responses for maintainers

### Build & Release System
- [ ] Add CI/CD integration (GitHub Actions) for automated builds and linting
- [ ] Implement automated packaging and upload to browser stores
- [x] Add automated testing pipeline
- [x] Set up code quality checks in CI

### Extension Architecture
- [ ] Review and implement more granular permissions (least privilege principle)
- [ ] Further abstract browser APIs for better cross-browser support
- [ ] Add opt-in telemetry or error reporting for better support
- [ ] Implement proper error boundaries and fallback mechanisms

### Security & Performance
- [ ] Audit permissions and reduce to minimum required
- [ ] Implement content security policy review
- [ ] Add performance monitoring for API calls
- [ ] Review and optimize bundle sizes

### Testing & Quality Assurance
- [x] Add unit tests for utility functions
- [ ] Implement integration tests for API interactions
- [ ] Add end-to-end tests for browser extension functionality
- [ ] Set up automated browser testing across different versions

**Note**: Unit testing setup complete with Jest framework and breakthrough solution for browser extension module loading. Working test suite covers time formatting utilities with comprehensive edge cases. Established clean module loading pattern for future browser extension testing.

### Documentation & Maintenance
- [ ] Create contributor guidelines and code of conduct
- [ ] Add API documentation with examples
- [ ] Create troubleshooting guide with common issues
- [ ] Document extension architecture and data flow
- [ ] Add performance and security considerations to docs