# Coding Standards Guide for Enterprise Education ERP
## Software Engineering Handbook

Document Type: Engineering Standards and Team Handbook
Version: 1.0
Date: 2026-07-06
Prepared For: Engineering, Platform, QA, and Delivery Teams

---

## 1. Project Structure
The project should follow a consistent, scalable, and modular structure to support multi-team development and long-term maintainability.

### Recommended Monorepo Structure
- apps/
  - web/ - Next.js frontend
  - admin/ - Admin dashboard frontend
  - api/ - Express backend
  - docs/ - Documentation site
- packages/
  - ui/ - Shared UI components
  - config/ - Shared configuration
  - eslint-config/ - Shared lint rules
  - tsconfig/ - Shared TypeScript config
  - types/ - Shared domain types
  - utils/ - Shared utilities
  - validation/ - Shared validation schemas
- infra/
  - docker/
  - kubernetes/ or deployment configs
- scripts/
- tests/

### Architectural Principles
- Separate concerns clearly
- Keep business logic in services or domain modules
- Avoid mixing infrastructure and business logic
- Prefer shared packages for reusable cross-cutting concerns

---

## 2. Folder Naming Rules
Folder names should be lowercase and descriptive.

### Rules
- Use lowercase kebab-case for multi-word folder names
- Use singular names for domain folders where appropriate
- Use feature-based folders for business modules
- Avoid generic folder names such as utils, temp, or misc without context

### Examples
- src/modules/students
- src/modules/attendance
- src/services/auth
- src/components/forms

### Folder Guidelines
- Group by feature or domain rather than by layer only
- Keep folder depth reasonable and intentional
- Use index files only for public exports where appropriate

---

## 3. File Naming Rules
File names should be descriptive, consistent, and easy to scan.

### Rules
- Use kebab-case for most files
- Use PascalCase for React component files and type files where conventionally required
- Prefer descriptive names over abbreviations
- Use standard suffixes for clarity

### Recommended Suffixes
- .service.ts for services
- .controller.ts for controllers
- .router.ts for route definitions
- .schema.ts for schemas or validation rules
- .test.ts or .spec.ts for test files
- .types.ts for shared type definitions
- .utils.ts for utility functions
- .middleware.ts for Express middleware

### Examples
- student.service.ts
- attendance.controller.ts
- auth.middleware.ts
- user-profile-card.tsx

---

## 4. Component Naming Rules
React and UI components should be named clearly and consistently.

### Rules
- Use PascalCase for component names
- Use descriptive names that reflect purpose
- Keep component names domain-oriented rather than implementation-oriented
- Avoid overly generic names like Box or Item unless they are truly reusable primitives

### Examples
- StudentProfileCard
- AttendanceSummaryWidget
- FeeReceiptModal
- LoginForm

### Component File Guidelines
- One component per file unless tightly related
- Use index.ts exports where useful
- Keep presentational components separate from container logic

---

## 5. API Naming Rules
API endpoints should be intuitive, consistent, and resource-oriented.

### Rules
- Use lowercase plural resource names
- Prefer nouns over verbs
- Use nested paths for relationships
- Use standard HTTP methods for CRUD semantics

### Examples
- GET /students
- GET /students/:id
- POST /students
- PATCH /students/:id
- DELETE /students/:id
- GET /students/:id/attendance

### Naming Guidelines
- Avoid ambiguous endpoint names such as getStudentData
- Keep actions in HTTP methods, not in URLs
- Use query parameters for filtering, sorting, pagination, and search

---

## 6. Database Naming Rules
Database names and schema objects must be predictable and consistent.

### Rules
- Use lowercase snake_case for table and column names
- Use singular or plural naming consistently across the schema
- Prefer descriptive names over abbreviated ones
- Use clear foreign key naming conventions

### Examples
- students
- teacher_profiles
- fee_transactions
- attendance_records

### Table and Column Guidelines
- Primary keys: id
- Foreign keys: referenced_table_id, such as student_id
- Timestamp columns: created_at, updated_at, deleted_at
- Boolean columns: is_active, is_deleted, is_verified

### Naming Consistency
- Use one naming convention across the database schema
- Avoid mixing camelCase and snake_case

---

## 7. Prisma Naming Rules
Prisma models and fields should follow a consistent naming convention aligned with the database schema.

### Rules
- Use PascalCase for Prisma model names
- Use camelCase for field names in Prisma schema
- Use @@map to map models to snake_case table names where needed
- Use @db.* attributes appropriately for database-specific behavior

### Examples
model Student {
  id String @id @default(cuid())
  firstName String
  lastName String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("students")
}

### Prisma Guidelines
- Keep relation names meaningful
- Avoid ambiguous relation names like parent and child unless the domain clearly supports it
- Use enums for fixed categories such as status, role, or payment type

---

## 8. TypeScript Standards
TypeScript should be used consistently to improve safety, clarity, and maintainability.

### Rules
- Use TypeScript for all shared application logic and modules
- Enable strict mode in tsconfig
- Prefer explicit types over implicit any
- Avoid using any unless absolutely necessary and documented
- Prefer interfaces for object shapes and types for unions or utility types

### Recommended Practices
- Use readonly for immutable properties where appropriate
- Use discriminated unions for complex state or response shapes
- Keep type definitions close to their usage when they are domain-specific
- Share common types in a package or shared types module

### Examples
- interface StudentSummary { id: string; fullName: string; }
- type UserRole = "admin" | "teacher" | "student" | "parent";

### TypeScript Guidelines
- Keep code free of dead or unused types
- Avoid complex nested types where simpler domain types would be clearer

---

## 9. React Standards
React code should be clear, reusable, and predictable.

### Rules
- Use functional components with hooks
- Keep components focused on a single responsibility
- Split large components into smaller presentational and container components
- Use descriptive prop names and type them explicitly
- Avoid inline complex logic inside JSX

### React Guidelines
- Prefer composition over inheritance
- Keep state local unless shared across components
- Use custom hooks for reusable stateful logic
- Avoid unnecessary re-renders by using memoization carefully

### Component Structure
- Props and type definitions at the top
- Local helpers below or external utilities
- Return JSX at the end

---

## 10. Next.js Standards
Next.js should be used with a clear routing and app structure strategy.

### Rules
- Use App Router patterns consistently where applicable
- Keep route-specific logic isolated to route folders or feature modules
- Prefer server components for data-heavy views and client components only where interactivity is required
- Use metadata and SEO conventions where relevant for public pages

### Next.js Guidelines
- Separate server-side data fetching logic from UI rendering
- Use route groups and layout files intentionally and sparingly
- Avoid placing business logic directly in page components

### Performance Guidance
- Use dynamic imports for heavy components
- Optimize images and assets
- Avoid unnecessary client-side rendering for static content

---

## 11. Express Standards
Express services should be structured, secure, and consistent.

### Rules
- Organize routes, controllers, services, middleware, and validators clearly
- Use middleware for auth, validation, error handling, logging, and request context
- Keep controllers thin and focused on request/response flow
- Place business logic in services or domain modules

### Express Guidelines
- Use centralized error handling middleware
- Validate request bodies and parameters consistently
- Keep route files focused on endpoint definitions
- Use dependency injection or service composition where helpful

### Recommended Layering
- Routes -> Controllers -> Services -> Repositories/Prisma

---

## 12. Error Handling Standards
Error handling must be consistent and production-safe.

### Rules
- Do not expose internal stack traces or sensitive backend details to end users
- Use structured error responses with meaningful messages
- Centralize error handling for API and UI flows
- Distinguish between validation errors, authorization errors, and server errors

### Recommended Error Handling Pattern
- Use typed application errors where possible
- Log contextual metadata for debugging
- Return stable error codes for clients and integrations

### Examples
- ValidationError
- UnauthorizedError
- NotFoundError
- ConflictError
- InternalServerError

---

## 13. Logging Standards
Logging should be useful, structured, and secure.

### Rules
- Use structured logs rather than ad-hoc strings where possible
- Include request ID, user ID, tenant context, and action context when relevant
- Avoid logging sensitive data such as passwords, tokens, or raw PII where not necessary
- Use appropriate log levels: debug, info, warn, error

### Logging Guidelines
- Log business events and operational events separately where practical
- Do not over-log high-volume noisy events unnecessarily
- Ensure logs are searchable and reviewable

---

## 14. Validation Standards
Validation should protect the system from incorrect or malicious input.

### Rules
- Validate input at the boundary of the system
- Validate request bodies, query parameters, route params, and file uploads
- Use shared validation schemas across backend and frontend where possible
- Return clear validation errors with field-level details

### Validation Guidelines
- Prefer schema-based validation for consistency
- Validate business rules in services when they are domain-specific
- Use consistent error messages for common cases

---

## 15. Authentication Standards
Authentication must be secure, consistent, and role-aware.

### Rules
- Use secure token-based authentication with short-lived access tokens and refresh tokens where appropriate
- Enforce multi-factor authentication for privileged roles where required
- Validate token expiry, issuer, audience, and scope
- Prevent session fixation and token reuse vulnerabilities

### Authentication Guidelines
- Keep authentication logic centralized
- Support tenant-aware login and authorization context
- Use secure cookie or header handling depending on deployment model

---

## 16. Security Standards
Security must be considered in every layer of the platform.

### Rules
- Follow least-privilege access principles
- Use environment variables or secret managers for credentials
- Encrypt sensitive data at rest and in transit where required
- Validate file uploads and limit file types and sizes
- Protect against common attacks such as XSS, CSRF, SQL injection, and SSRF
- Enforce role-based and permission-based controls at the API boundary

### Security Guidelines
- Keep dependencies updated
- Perform security scanning in CI/CD
- Use audit logging for privileged and sensitive operations
- Avoid storing secrets in source control or build output

---

## 17. Git Branch Strategy
A consistent Git branching model improves collaboration and release stability.

### Recommended Branch Strategy
- main: production-ready code
- develop: integration branch for upcoming work
- feature/*: new feature branches
- bugfix/*: bug fixes
- hotfix/*: urgent production fixes
- release/*: release preparation branches

### Branch Rules
- Branches should be short-lived
- Changes should be merged through pull requests
- Direct commits to main should be avoided except for emergency procedures

---

## 18. Git Commit Message Convention
Commit messages should be clear, structured, and useful for reviewers and release notes.

### Recommended Format
<type>(<scope>): <short summary>

### Example Types
- feat: new feature
- fix: bug fix
- refactor: code cleanup or structural improvement
- docs: documentation update
- test: test addition or update
- chore: maintenance task

### Example Commit Messages
- feat(students): add student profile onboarding flow
- fix(attendance): correct duplicate attendance entry issue
- docs(api): update fee endpoint documentation

---

## 19. Pull Request Guidelines
Pull requests should be reviewable, focused, and safe to merge.

### PR Requirements
- Clear title and description
- Link to issue or requirement when applicable
- Summary of changes and rationale
- Testing evidence and validation steps
- Screenshots or documentation updates where relevant

### PR Review Expectations
- Keep PRs focused on one concern where possible
- Avoid mixing unrelated changes
- Ensure tests and lint checks pass before merge
- Document breaking changes clearly

---

## 20. Code Review Checklist
Code review should be structured and consistent.

### Review Checklist
- Does the code solve the stated problem clearly?
- Is the logic easy to follow?
- Are naming and structure consistent with standards?
- Are security concerns addressed?
- Are validations and errors handled properly?
- Are tests included or updated where needed?
- Are performance concerns considered?
- Are docs updated when behavior changes?

### Review Principles
- Focus on correctness, maintainability, and clarity
- Be constructive and specific
- Prefer suggestions over personal preference when possible

---

## 21. Documentation Standards
Documentation should be clear, current, and useful to developers and stakeholders.

### Rules
- Document architecture decisions, domain workflows, and critical integrations
- Keep README files updated for modules and services
- Use inline documentation only where it adds value
- Document API contracts, data models, and deployment assumptions

### Documentation Types
- Project overview
- Module architecture
- API documentation
- Environment setup
- Deployment runbook
- Troubleshooting guide

---

## 22. Performance Standards
Performance should be designed into the system rather than patched later.

### Rules
- Optimize expensive queries and rendering paths
- Use caching where appropriate and safe
- Avoid unnecessary network calls and large payloads
- Use pagination for large lists and datasets
- Optimize file uploads and downloads

### Performance Guidelines
- Measure before optimizing
- Favor efficient database access patterns
- Profile slow features before making changes

---

## 23. Testing Standards
Testing should be treated as a core engineering responsibility.

### Rules
- Write unit tests for business logic and critical utilities
- Add integration tests for module boundaries and service interactions
- Add API tests for authentication, validation, and data flows
- Add UI and end-to-end tests for critical user journeys
- Ensure tests run in CI/CD pipelines

### Testing Expectations
- New features should include relevant automated tests
- Bug fixes should include regression coverage where feasible

---

## 24. Deployment Standards
Deployment must be reliable, repeatable, and observable.

### Rules
- Use environment-specific configuration and secrets
- Keep deployment steps documented and scripted where possible
- Support rollback procedures for critical releases
- Validate deployments with health checks and smoke tests

### Deployment Guidelines
- Separate development, staging, and production environments
- Use containerization and infrastructure-as-code where supported
- Avoid manual production fixes when automation can support them

---

## 25. Versioning Strategy
Versioning should be predictable and compatible with release planning.

### Recommended Versioning Model
- Semantic Versioning (SemVer): MAJOR.MINOR.PATCH
- Use MAJOR for breaking changes
- Use MINOR for backward-compatible feature additions
- Use PATCH for bug fixes and small changes

### Application Versioning Guidelines
- Version the platform and individual packages consistently
- Include release notes for each version change
- Track compatibility across frontend, backend, and shared packages

---

## 26. Clean Code Principles
Code should be easy to read, understand, and maintain.

### Principles
- Write code for humans first, then machines
- Prefer clarity over cleverness
- Keep functions small and focused
- Remove dead code and avoid complexity where not needed
- Make intent obvious through naming and structure

### Clean Code Guidance
- Avoid deeply nested conditionals where possible
- Prefer early returns for readability
- Break large functions into smaller units

---

## 27. SOLID Principles
The system should be structured to support maintenance and extension.

### S - Single Responsibility Principle
Each class or module should have one clear responsibility.

### O - Open/Closed Principle
Code should be open for extension but closed for modification where practical.

### L - Liskov Substitution Principle
Derived types should be substitutable for their base types.

### I - Interface Segregation Principle
Prefer smaller focused interfaces over large broad ones.

### D - Dependency Inversion Principle
Depend on abstractions rather than concrete implementations where appropriate.

---

## 28. DRY Principles
Avoid unnecessary duplication.

### Rules
- Extract repeated logic into shared utilities or services
- Share validation rules and types across modules where possible
- Avoid copy-paste implementation patterns

### DRY Guidance
- Reuse shared patterns in a systematic way rather than creating an over-abstracted architecture

---

## 29. KISS Principles
Keep solutions simple and straightforward.

### Rules
- Choose the simplest solution that meets the requirement
- Avoid over-engineering for improbable future needs
- Prefer explicit code over clever abstractions

---

## 30. Future Development Guidelines
The engineering standards should support future growth and modernization.

### Future-Oriented Principles
- Keep the architecture modular and service-oriented where practical
- Design for extension without major refactoring
- Prepare for AI-assisted features, analytics enhancements, and mobile expansion
- Support multi-tenant scaling and white-label customization without code duplication
- Maintain a strong quality culture through automation and review

### Suggested Future Evolution Paths
- Introduce more shared packages and domain modules as the platform grows
- Expand automated testing and observability coverage
- Improve developer experience with better tooling and templates
- Continue standardizing architecture decisions over time

---

## 31. Final Recommendation
This coding standards guide should be adopted as the shared engineering handbook for the Education ERP team. It promotes consistency, maintainability, security, scalability, and high-quality delivery across frontend, backend, database, infrastructure, and DevOps work. The standards should be reviewed periodically and updated as the platform and team mature.
