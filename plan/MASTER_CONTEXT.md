# MASTER_CONTEXT
## Enterprise White-Label Education ERP + Website SaaS Platform

Document Type: Master Architecture and Engineering Handbook
Version: 1.0
Date: 2026-07-06
Prepared For: Engineering, Product, Architecture, Security, DevOps, QA, and Delivery Teams

---

# 1 Project Overview

## 1.1 Purpose
The purpose of this platform is to provide a complete, modern, secure, scalable, and white-label Education ERP and website solution for educational institutions across multiple verticals. The platform must support institutional operations, student engagement, academic management, financial workflows, communication, reporting, and public-facing website experiences from a single SaaS foundation.

## 1.2 Vision
To become the go-to enterprise SaaS platform for education institutions that need a unified system to manage administration, academics, finance, communication, digital learning, and public presence under one brandable solution.

## 1.3 Mission
To deliver a production-ready, multi-tenant, white-label ERP platform that helps institutions operate efficiently, digitally transform, and scale while maintaining flexibility, governance, and security.

## 1.4 Goals
- Build a modular, multi-tenant SaaS platform suitable for many education types
- Support white-label branding for each institution
- Provide strong operational features for admissions, academics, finance, attendance, exams, library, communication, and reports
- Deliver a modern UX for admins, staff, teachers, students, and parents
- Ensure scalability, security, maintainability, and high performance
- Support future AI-driven features without breaking architecture

## 1.5 Business Model
The platform will operate as a subscription-based white-label SaaS product.

### Revenue Model
- Subscription plans by institution size and module coverage
- Per-user or per-tenant licensing where applicable
- Add-on modules and premium features
- Optional custom branding and enterprise support

## 1.6 Target Customers
- Schools
- Colleges
- Coaching Institutes
- SSC Coaching
- Railway Coaching
- Banking Coaching
- UPSC/BPSC Coaching
- NEET Coaching
- JEE Coaching
- Defence Coaching
- Computer Institutes
- Commerce Institutes
- Spoken English Institutes
- Skill Development Institutes

## 1.7 Target Institutes
The platform must support a wide range of educational entities, including:
- Small local schools
- Large multi-campus institutions
- Coaching centers with batch-based learning models
- Skill development and vocational institutes
- Professional and competitive exam training centers

## 1.8 Project Scope
The platform will include:
- Multi-tenant SaaS core platform
- White-label institution portal and administration
- Student management
- Teacher management
- Parent management
- Attendance management
- Fee management
- Examination and result management
- Homework and assignment management
- Study material management
- Library management
- Notification system
- Reporting and analytics
- Settings and configuration
- Public website and CMS
- Super admin control panel
- Backup, monitoring, deployment, and security layers

## 1.9 Out of Scope
The initial scope does not include:
- Fully custom native mobile apps unless later planned
- Deep AI features beyond agreed roadmap phases
- Third-party LMS integrations beyond essential ones
- Advanced enterprise compliance beyond the agreed standard

## 1.10 Expected Scale
The system should be designed to support:
- Hundreds to thousands of institutions
- Tens of thousands to millions of users over time
- High-volume reporting and communication workloads
- Concurrent usage spikes during admissions, exams, and fee cycles

## 1.11 Future Roadmap Summary
Planned evolution:
- AI copilots and intelligent recommendations
- Expanded analytics and predictions
- Mobile-first experiences
- Marketplace of add-on modules
- Regional expansion and localization
- Advanced automation and workflow orchestration

---

# 2 Tech Stack

## 2.1 Frontend
### Next.js 15
- Selected for server-side rendering, optimized routing, SEO support, and modern React-based development
- Suitable for public website, institutional portals, and admin dashboards

### React 19
- Selected for component-driven UI development and modern state management patterns
- Enables reusable UI architecture and maintainability

### TypeScript
- Selected to improve correctness, maintainability, and developer productivity
- Prevents common runtime errors and improves collaboration

### Tailwind CSS
- Selected for utility-first styling and rapid UI development
- Makes theming and white-label customization easier

### ShadCN UI
- Selected for modern, composable, accessible UI components
- Supports consistent design system implementation

### React Hook Form
- Selected for form handling with less boilerplate and better validation integration
- Works well with Zod schemas

### Zod
- Selected for schema validation and type-safe input validation
- Used for both frontend and backend validation contracts where appropriate

### TanStack Query
- Selected for server-state management and caching
- Improves data fetching and synchronization behavior

## 2.2 Backend
### Node.js
- Selected for JavaScript/TypeScript ecosystem compatibility and fast development cycles
- Strong fit for modern SaaS APIs and event-driven workflows

### Express.js
- Selected as the web framework for backend services
- Lightweight and flexible for modular API development

### Prisma ORM
- Selected for type-safe database access and schema migrations
- Improves developer productivity and reduces common query errors

### PostgreSQL
- Selected for robust relational data modeling, extensibility, and enterprise readiness
- Suitable for multi-tenant institutional data and analytics

### Redis
- Selected for caching, session support, rate limiting, queues, and quick shared state access

### JWT Authentication
- Selected for stateless and scalable authentication flows
- Supports secure API access for web and mobile clients

### Refresh Tokens
- Selected for long-lived sessions while keeping access tokens short-lived and secure

## 2.3 Storage
### Cloudinary
- Selected for image and media optimization and delivery
- Useful for branding assets, student images, and content media

### AWS S3 Compatible Storage
- Selected for scalable object storage for documents, uploads, and media files

## 2.4 Payments
### Razorpay
- Selected for secure online payment and fee collection workflows
- Common across Indian education institutions and SaaS payment integrations

## 2.5 Notifications
### WhatsApp Cloud API
- Selected for parent and student communication at scale

### Email
- Selected for transactional and formal communication

### SMS
- Selected for urgent alerts and OTP-style communication

### Push Notification
- Selected for web or mobile app notifications

## 2.6 Deployment
### Docker
- Selected for containerized deployment and consistency across environments

### Nginx
- Selected for reverse proxying, SSL termination, static asset handling, and request routing

### Ubuntu VPS
- Selected for cost-effective and manageable production hosting

### GitHub Actions
- Selected for CI/CD automation and seamless repository-based workflows

## 2.7 Why These Technologies Were Chosen
- Strong ecosystem support
- Good developer productivity
- Mature enterprise readiness
- Strong fit for SaaS and white-label product delivery
- Good support for scalability and maintainability

## 2.8 Alternatives Considered
- Django / Python: strong backend ecosystem but less aligned with current team and stack preference
- Laravel: strong but less suitable for the chosen full-stack JavaScript approach
- .NET: enterprise-grade but higher operational and licensing overhead for the intended SaaS scope
- Firebase: easier for prototyping, but less ideal for complex multi-tenant enterprise architecture

## 2.9 Pros and Cons Summary
| Technology | Pros | Cons |
|---|---|---|
| Next.js | SEO, SSR, modern UI | Slightly more complex setup |
| React | Component reuse | Large ecosystem requires discipline |
| TypeScript | Safety and maintainability | Learning curve |
| Tailwind | Speed and consistency | Design consistency requires standards |
| Express | Flexible and simple | Needs disciplined architecture |
| Prisma | Type safety and migrations | ORM abstraction can add complexity |
| PostgreSQL | Enterprise-grade relational database | Requires good indexing and design |
| Redis | Speed and caching | Additional operational dependency |
| Docker | Consistency | Needs orchestration discipline |

---

# 3 Folder Structure

The project should follow a modular monorepo structure to support multiple apps and shared packages.

## 3.1 Root Structure
```text
root/
  apps/
    web/
    admin/
    api/
    docs/
  packages/
    ui/
    config/
    eslint-config/
    tsconfig/
    types/
    utils/
    validation/
  infra/
    docker/
    nginx/
    scripts/
  database/
    prisma/
    migrations/
    seed/
  docs/
  scripts/
  public/
  uploads/
  shared/
```

## 3.2 Folder Responsibilities

### apps/web
- Public-facing website frontend
- Landing pages, blogs, admissions, about us, contact, course pages
- SEO and marketing-driven views

### apps/admin
- Institution admin dashboard
- Tenant administration UI
- Super admin control panel where relevant

### apps/api
- Backend application entry point
- Routing, middleware, API controllers, services, repositories
- Authentication and authorization

### apps/docs
- Documentation portal or internal docs site

### packages/ui
- Shared UI primitives and design system components
- Buttons, cards, forms, tables, modals, avatars, layout components

### packages/config
- Shared environment and configuration helpers

### packages/eslint-config
- Common lint rules across all apps

### packages/tsconfig
- Shared TypeScript compiler configuration

### packages/types
- Shared domain types and DTOs used by multiple apps

### packages/utils
- Cross-cutting utility functions

### packages/validation
- Shared validation schemas and rules

### infra/docker
- Dockerfiles and docker compose configuration

### infra/nginx
- Nginx configuration files and SSL-related settings

### database/prisma
- Prisma schema, enums, migrations, seed scripts

### database/migrations
- Versioned schema migration files

### database/seed
- Initial seed data for tenants, roles, permissions, modules, and sample records

### docs
- Product, architecture, API, operations, and onboarding documentation

### scripts
- Deployment, backup, maintenance, and utility scripts

### public
- Static assets such as logos, icons, manifest files, and public content

### uploads
- File upload storage folder for local development and non-cloud local usage

### shared
- Shared business logic, constants, enums, config values, and cross-app helpers

---

# 4 Software Architecture

## 4.1 Frontend Architecture
The frontend should follow a modular and component-driven architecture.

### Frontend Layers
- Pages and routes
- Feature modules
- Shared components
- Hooks and state management
- API clients and service adapters
- Theme and layout system

### Frontend Principles
- Reusable UI components
- Tenant-aware rendering
- Responsive and accessible layouts
- Consistent state handling with TanStack Query and React Hook Form

## 4.2 Backend Architecture
The backend should follow a layered, modular architecture for maintainability and extensibility.

### Backend Layers
- Routes / Controllers
- Services / Use Cases
- Repositories / Data Access Layer
- Prisma models and schema layer
- Middleware
- Utilities and infrastructure services

## 4.3 Database Architecture
The database architecture should support multi-tenant institutional data and academic workflows.

### Core Database Concepts
- Tenant-aware data model
- Branch and academic session awareness
- Soft delete where required
- Audit columns and change tracking
- Strong referential integrity

## 4.4 API Layer
The API layer should expose versioned REST APIs for frontend and integrations.

### API Responsibilities
- Request validation
- Authentication and authorization
- Request normalization
- Business rules orchestration
- Error handling and consistent response formatting

## 4.5 Service Layer
The service layer should host business logic and domain workflows.

### Service Responsibilities
- Student admission workflows
- Attendance calculations
- Fee processing
- Exam result generation
- Notification dispatch
- Report aggregation
- Permissions and role logic

## 4.6 Repository Layer
The repository layer should handle database interactions and query logic.

### Repository Responsibilities
- Query building and data access
- Encapsulation of Prisma operations
- Domain-specific data retrieval logic

## 4.7 Authentication Layer
The authentication layer should support:
- Login and logout
- JWT access tokens
- Refresh tokens
- Role-based access control
- Session management
- Multi-factor authentication support for privileged roles

## 4.8 Storage Layer
The storage layer should manage:
- User profile images
- Institutional logos
- Student documents
- Study materials
- PDFs, videos, and other media
- Cloudinary and AWS S3 compatible object storage integration

## 4.9 Notification Layer
The notification layer should support:
- Email
- SMS
- WhatsApp
- Push notifications
- In-app notifications

## 4.10 Deployment Layer
The deployment layer should include:
- Dockerized services
- Nginx reverse proxy
- SSL termination
- CI/CD pipelines
- Monitoring and logging systems

## 4.11 Scalability Strategy
The platform must scale horizontally and support growth in users and tenants.

### Scalability Principles
- Stateless application services
- Horizontal scaling of API and frontend instances
- Redis for shared cache and queues
- Decoupled background workers for notifications and reports
- Optimized database indexing and query strategies

---

# 5 Coding Standards

## 5.1 Naming Convention
- Use lowercase kebab-case for folders and files where appropriate
- Use PascalCase for React component names
- Use camelCase for variables and functions
- Use snake_case for database tables and columns
- Use uppercase constants for static values where appropriate

## 5.2 TypeScript Rules
- Enable strict mode
- Avoid any type unless justified and documented
- Use interfaces and type aliases consistently
- Prefer explicit return types for exported functions
- Keep types close to their usage where possible

## 5.3 React Rules
- Use functional components
- Prefer composition over heavy inheritance patterns
- Keep components small and focused
- Use shared hooks for reusable logic

## 5.4 Next.js Rules
- Use the app router conventions consistently
- Keep data fetching and rendering concerns separated
- Prefer server components where possible
- Use metadata and SEO practices for public pages

## 5.5 Express Rules
- Keep controllers thin
- Place business logic in services not in routes
- Use centralized middleware for validation, auth, and errors

## 5.6 Prisma Rules
- Use Prisma schema as the source of truth for DB modeling
- Keep migrations versioned and reviewed
- Use explicit relation names and schema annotations

## 5.7 Comments
- Use comments only where needed to explain intent, business rules, or complexity
- Avoid commenting obvious code

## 5.8 Formatting
- Use consistent formatting across codebase
- Use ESLint and Prettier rules
- Maintain readable indentation and spacing

## 5.9 Reusable Components
- Build shared UI components in the design system package
- Reuse common form controls, cards, tables, dialogs, and modals

## 5.10 Error Handling
- Use centralized error handling
- Return consistent JSON error structures from APIs
- Show user-friendly errors in the UI

## 5.11 Validation
- Validate at API boundary and UI boundary
- Use Zod or equivalent schema validation
- Return field-level validation messages where appropriate

## 5.12 Logging
- Use structured logging with context metadata
- Avoid logging secrets or sensitive personal data
- Ensure logs are searchable and auditable

## 5.13 Folder Naming
- Use lowercase kebab-case
- Group by feature and domain
- Avoid ambiguous generic folders

## 5.14 File Naming
- Use descriptive names
- Use suffixes such as service, controller, schema, test, middleware, util, types

---

# 6 Database Rules

## 6.1 Primary Keys
- Use UUIDs for primary keys where appropriate across core entities
- Use integer surrogate keys only when justified by system needs

## 6.2 UUID Strategy
- Prefer UUIDv4 or CUID-based primary keys for distributed-friendly identifiers
- Ensure consistent generation strategy across services

## 6.3 Foreign Keys
- Use foreign keys to preserve referential integrity
- Avoid orphaned records

## 6.4 Indexes
- Add indexes for frequently filtered, sorted, or joined columns
- Review indexes for query performance and storage impact

## 6.5 Soft Delete
- Use soft delete for business records where history matters
- Avoid hard delete for core domain records unless explicitly allowed

## 6.6 Audit Fields
Every major entity should include:
- created_at
- updated_at
- created_by
- updated_by
- deleted_at
- is_deleted

## 6.7 Created By / Updated By
- Track user or system actor responsible for changes
- Helpful for compliance and audit trails

## 6.8 Tenant ID
- Every tenant-scoped record should include tenant_id
- Tenant context must be enforced in queries and services

## 6.9 Normalization
- Normalize core relational data
- Avoid duplicate data where a relational model can solve it

## 6.10 Transactions
- Use transactions for multi-step financial and state-changing workflows
- Protect data integrity during payments, exam results, admissions, and inventory changes

## 6.11 Migration Rules
- Migrations must be explicit, reviewed, and reversible where practical
- Never modify migrations after deployment unless a controlled rollback path exists

---

# 7 API Standards

## 7.1 REST API Convention
- Use resource-based endpoints
- Use standard HTTP methods
- Keep endpoints intuitive and consistent

## 7.2 API Versioning
- Use URI versioning: /api/v1/...
- Preserve older versions during transitions

## 7.3 Request Format
- JSON request bodies
- Query parameters for filtering, pagination, sorting, search

## 7.4 Response Format
- Consistent success and error envelope
- Provide metadata for list responses

## 7.5 Pagination
- Support page and limit parameters
- Return total count and metadata where useful

## 7.6 Sorting
- Allow sorting by validated fields only
- Support asc/desc order

## 7.7 Filtering
- Support filters by common identifiers and status values
- Keep filter logic consistent and documented

## 7.8 Validation
- Validate request input at the boundary
- Return structured field-level validation errors

## 7.9 Error Response
- Standardized error structure
- No stack traces in production responses

## 7.10 Status Codes
- Use standard HTTP status codes consistently

## 7.11 Rate Limiting
- Apply rate limits on auth, public, and bulk endpoints
- Respect tenant-specific policy where applicable

## 7.12 Authentication
- JWT-based auth with access and refresh tokens
- Support secure session handling

## 7.13 Authorization
- Enforce RBAC and permission checks at the API layer
- Respect tenant, branch, class, and subject scopes

---

# 8 UI Design Rules

## 8.1 Typography
- Use a consistent font system and hierarchy
- Keep readability and accessibility high

## 8.2 Spacing
- Use a consistent spacing scale via Tailwind tokens
- Keep layout predictable and aligned

## 8.3 Buttons
- Use clear button hierarchy
- Distinguish primary, secondary, destructive, and neutral actions

## 8.4 Cards
- Use cards to group related content and actions
- Keep visual hierarchy consistent

## 8.5 Tables
- Use consistent table structure and column layout
- Support pagination, sorting, filtering, and empty states

## 8.6 Forms
- Use consistent form structure
- Provide helpful validation and error states
- Support accessible labels and input hints

## 8.7 Sidebar
- Keep navigation predictable and role-aware
- Group by module and business domain

## 8.8 Navbar
- Keep top-level actions obvious and accessible
- Show notifications, profile, and search where appropriate

## 8.9 Dashboard
- Provide summary widgets and quick actions
- Show KPIs clearly and consistently

## 8.10 Dark Mode
- Support dark mode as a configurable theme option
- Preserve contrast and readability

## 8.11 Accessibility
- Use accessible semantics and keyboard support
- Ensure visible focus states and readable contrast

## 8.12 Responsive Design
- Support desktop, tablet, and mobile breakpoints
- Ensure core workflows remain usable on smaller screens

## 8.13 Loading States
- Show skeletons or progress indicators for async actions
- Avoid blank screens during loading

## 8.14 Empty States
- Provide meaningful empty state guidance for no-data views

## 8.15 Error States
- Show actionable error messages and recovery options

---

# 9 Role Based Access Control

## 9.1 Roles
The platform must support the following roles:

| Role | Purpose |
|---|---|
| Super Admin | Platform-level administration and governance |
| School Admin | Institution-level administration |
| Principal | Academic oversight and institutional leadership |
| Reception | Front-desk and student support operations |
| Teacher | Teaching and academic management |
| Student | Academic and personal records access |
| Parent | Child-related academic and fee visibility |
| Accountant | Fee and financial management |
| Librarian | Library management |
| Staff | Departmental or operational access |

## 9.2 RBAC Rules
- Access must be role-based and permission-based
- Permissions should be scoped to institution, branch, class, subject, and module where relevant
- Sensitive functions must require elevated permissions
- Admin and finance roles should be restricted by policy and audit

## 9.3 Permission Model
Permissions should include:
- View
- Create
- Edit
- Delete
- Approve
- Export
- Configure
- Manage integrations

---

# 10 Security Standards

## 10.1 Authentication
- Use secure login and session management
- Support JWT and refresh token flow
- Support MFA for privileged accounts

## 10.2 Authorization
- Enforce role and permission checks on every protected action

## 10.3 Password Hashing
- Use strong password hashing algorithms
- Never store plain-text passwords

## 10.4 JWT
- Use short-lived access tokens
- Rotate refresh tokens securely

## 10.5 Refresh Token
- Store securely and invalidate on logout or suspicious activity

## 10.6 Helmet
- Apply secure HTTP headers to API responses

## 10.7 XSS Protection
- Sanitize user input and encode rendered content where necessary

## 10.8 CSRF
- Apply CSRF protections for browser-based state-changing requests where relevant

## 10.9 SQL Injection Protection
- Use Prisma and parameterized queries
- Avoid raw SQL for business logic where avoidable

## 10.10 Rate Limiting
- Limit excessive requests and abuse patterns

## 10.11 Audit Logs
- Record sensitive changes, privileged actions, and auth events

## 10.12 Encryption
- Encrypt data in transit and at rest where required
- Protect secrets in secure storage mechanisms

## 10.13 Secure Headers
- Use Content Security Policy, X-Frame-Options, Referrer-Policy, and similar protections

---

# 11 Deployment Standards

## 11.1 Docker
- Dockerize all application services and dependencies where appropriate
- Keep images small and deterministic

## 11.2 Docker Compose
- Use compose for local and staging environments where helpful
- Keep service dependencies explicit

## 11.3 Nginx
- Use Nginx as reverse proxy and SSL termination layer
- Configure request limits, caching, and routing carefully

## 11.4 SSL
- Enforce HTTPS on production routes
- Automate certificate renewal where possible

## 11.5 CI/CD
- Use GitHub Actions for build, test, scan, and deployment automation
- Include automated checks before deploy

## 11.6 Backup
- Automate database and file backups
- Store backups off-site or in isolated storage

## 11.7 Restore
- Maintain documented restore procedures and validated recovery flows

## 11.8 Monitoring
- Monitor CPU, memory, services, traffic, error rates, and resource usage

## 11.9 Logging
- Centralize logs and retain them according to policy

## 11.10 Performance
- Track latency and throughput in production
- Tune under load and during growth

---

# 12 White Label Rules

## 12.1 Logo Replacement
- Each tenant must be able to replace the application logo without affecting the platform core

## 12.2 Institute Name
- Platform should support tenant-specific institute naming and field labels where required

## 12.3 Theme
- Tenant-specific themes should be configurable and previewable

## 12.4 Primary Color
- Each tenant must be able to define a primary color

## 12.5 Secondary Color
- Each tenant should be able to define a secondary color

## 12.6 Custom Domain
- Support custom domains for tenant branded access

## 12.7 Subdomain
- Support subdomain-based tenant access where appropriate

## 12.8 Custom Email
- Allow tenant-specific email sender branding and templates

## 12.9 Feature Toggle
- Enable and disable features per tenant or subscription level

## 12.10 Subscription Based Features
- Module access and advanced capabilities should be controlled by plan and subscription status

---

# 13 Development Workflow

## 13.1 Documentation First
- Product and technical documentation should be created before implementation when feasible
- Architecture and workflow decisions should be captured early

## 13.2 Architecture First
- Major features should be reviewed against the architecture and standards before implementation

## 13.3 Database First
- Data model changes should be designed before implementation
- Schemas, relations, and migration impacts should be reviewed

## 13.4 Backend
- Backend work should follow layered architecture, validation, and secure API patterns

## 13.5 Frontend
- Frontend work should follow shared component design and accessibility patterns

## 13.6 Testing
- Testing should be planned with the feature and included in CI/CD

## 13.7 Deployment
- Deployment should be staged and validated before production rollout

## 13.8 Maintenance
- Operational issues should be documented and addressed systematically

## 13.9 Versioning
- Follow semantic versioning for packages and releases where relevant

## 13.10 Release Strategy
- Use staged releases, release notes, and rollback plans

---

# 14 AI Development Rules
Future AI-driven development must follow these rules.

## 14.1 AI Behaviors
- Never rename APIs without updating all dependents and documentation
- Never change schema without review and migration planning
- Never break architecture or bypass approved patterns
- Never duplicate logic when a shared module already exists
- Always reuse components and shared utilities where appropriate
- Always follow the documentation and standards before generating changes
- Always generate production-ready, secure, and maintainable solutions

## 14.2 AI Safety Principles
- Preserve platform consistency
- Respect tenant boundaries and security constraints
- Avoid introducing regressions
- Validate outputs against the architecture before finalizing

---

# 15 Project Principles

## 15.1 SOLID
- Single Responsibility
- Open/Closed
- Liskov Substitution
- Interface Segregation
- Dependency Inversion

## 15.2 DRY
- Avoid duplicate implementation logic
- Reuse shared services, components, and utilities

## 15.3 KISS
- Keep solutions simple and focused
- Avoid unnecessary complexity

## 15.4 Clean Architecture
- Separate domain logic from infrastructure and delivery concerns
- Keep boundaries explicit and maintainable

## 15.5 Scalable Design
- Design for growth in tenants, users, traffic, and features

## 15.6 Modular Development
- Build features as modules that can evolve independently

## 15.7 Security First
- Make security a design requirement, not a later concern

## 15.8 Performance First
- Keep critical paths efficient and measurable

## 15.9 Maintainability
- Write code that future teams can understand and extend safely

---

# 16 Final Guidance
This document is the single source of truth for the Education ERP platform architecture, engineering standards, and development expectations. Any future documentation, feature work, or code generation must align with it. The project should remain consistent, modular, secure, scalable, and maintainable through disciplined engineering practices and well-defined standards.
