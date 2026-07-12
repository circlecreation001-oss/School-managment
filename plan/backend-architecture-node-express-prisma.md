# Backend Architecture Specification
## Node.js + Express + Prisma + PostgreSQL + JWT + Redis + Docker

Document Type: Backend System Architecture
Version: 1.0
Date: 2026-07-06
Prepared For: Engineering, Platform, and Product Teams

---

## 1. Executive Summary
This backend architecture defines a production-ready, enterprise-grade server design for the Education ERP + Website platform. It is built using Node.js, Express, Prisma ORM, PostgreSQL, JWT with refresh tokens, Redis, Docker, and Cloudinary.

The architecture is designed to support:
- Multi-tenant SaaS operations
- White-label institution deployments
- Role-based access control
- Secure authentication and authorization
- High-performance caching
- Structured logging and monitoring
- Scalable deployment with containerization

The architecture follows a layered design with clear boundaries between controllers, services, repositories, middleware, validation, and infrastructure concerns.

---

## 2. Architectural Goals
The backend must:
- Be modular and maintainable
- Support multi-tenant data isolation
- Be secure by default
- Support role-based permissions and institutional scope
- Be easy to test and deploy
- Support asynchronous and background tasks
- Scale horizontally under containerized deployment
- Provide clean API contracts for web and mobile clients

---

## 3. Overall Architecture Style
The system will follow a layered architecture with the following core layers:
1. API Layer
2. Application Layer
3. Domain/Service Layer
4. Data Access Layer
5. Infrastructure Layer

### Request Flow
1. Client sends an HTTP request to the API.
2. Routing layer dispatches the request to the appropriate controller.
3. Middleware validates authentication, authorization, tenant context, and request shape.
4. Controller parses and delegates the request to a service.
5. Service applies business rules and interacts with repositories.
6. Repository communicates with PostgreSQL through Prisma.
7. Redis may be used for caching or session-like token state.
8. Cloudinary handles file/image uploads and storage.
9. Response is returned with standardized structure and logging.

---

## 4. Technology Stack Summary
- Runtime: Node.js
- Web Framework: Express
- ORM: Prisma
- Database: PostgreSQL
- Authentication: JWT access tokens + refresh tokens
- Caching: Redis
- Containerization: Docker
- File Storage: Cloudinary
- Logging: structured application logging
- Deployment: container-based cloud environment

---

## 5. Folder Structure
A scalable monorepo-style structure is recommended for long-term maintainability.

```text
src/
  app.js
  server.js
  config/
    env.js
    prisma.js
    redis.js
    cloudinary.js
    logger.js
  constants/
    roles.js
    status.js
    error-codes.js
  docs/
    api-spec/
  middlewares/
    auth.middleware.js
    role.middleware.js
    tenant.middleware.js
    error.middleware.js
    validate.middleware.js
    upload.middleware.js
    audit.middleware.js
    rate-limit.middleware.js
  routes/
    index.js
    auth.routes.js
    users.routes.js
    students.routes.js
    admissions.routes.js
    academics.routes.js
    finance.routes.js
    communication.routes.js
    website.routes.js
    support.routes.js
  controllers/
    auth.controller.js
    users.controller.js
    students.controller.js
    admissions.controller.js
    academics.controller.js
    finance.controller.js
    communication.controller.js
    website.controller.js
    support.controller.js
  services/
    auth.service.js
    user.service.js
    student.service.js
    admission.service.js
    academic.service.js
    finance.service.js
    communication.service.js
    website.service.js
    support.service.js
    upload.service.js
    cache.service.js
  repositories/
    user.repository.js
    student.repository.js
    admission.repository.js
    academic.repository.js
    finance.repository.js
    communication.repository.js
    website.repository.js
    support.repository.js
  validators/
    auth.validator.js
    user.validator.js
    student.validator.js
    admission.validator.js
    academic.validator.js
    finance.validator.js
    communication.validator.js
    website.validator.js
    support.validator.js
  utils/
    response.js
    errors.js
    token.js
    password.js
    dates.js
    pagination.js
    file.js
    crypto.js
  prisma/
    schema.prisma
    migrations/
  jobs/
    email.job.js
    sms.job.js
    pdf.job.js
    sync.job.js
  events/
    event-emitter.js
  types/
    api.types.js
    domain.types.js
  tests/
    unit/
    integration/
    e2e/
  docker/
    Dockerfile
    docker-compose.yml
    .dockerignore
```

---

## 6. Layer Responsibilities

### 6.1 Controllers
Controllers are responsible for handling HTTP requests and responses.

Responsibilities:
- Parse incoming request data
- Validate request shape at the API boundary
- Call application services
- Return standardized API responses
- Handle HTTP-specific concerns only

Controller responsibilities should not include:
- Database access directly
- Complex business rules
- Heavy transformation logic

Example modules:
- auth.controller.js
- students.controller.js
- finance.controller.js

---

### 6.2 Services
Services contain the core business logic of the platform.

Responsibilities:
- Enforce business rules
- Coordinate multiple repository operations
- Apply authorization and workflow logic
- Manage transactions and service-level orchestration
- Communicate with Redis and external services

Services should be the central orchestration unit for business processes.

Example service areas:
- Admission workflow service
- Fee payment service
- Attendance service
- Notice publishing service
- Authentication service

---

### 6.3 Repositories
Repositories encapsulate all database interaction logic.

Responsibilities:
- Query and persist data through Prisma
- Hide Prisma-specific implementation details from services
- Centralize database access patterns
- Support filtering, sorting, pagination, and joins

Repositories should not:
- Contain application workflow logic
- Know about HTTP concerns

Example repositories:
- student.repository.js
- fee.repository.js
- audit.repository.js

---

### 6.4 Routes
Routes define the API endpoints and associate them with controllers and middleware.

Responsibilities:
- Define endpoint paths and HTTP methods
- Attach middleware for authentication, validation, and authorization
- Group routes by domain/module

Route design principles:
- Versioned API structure such as /api/v1
- Module-based route grouping
- Clear separation for public and protected routes

---

### 6.5 Middleware
Middleware handles cross-cutting concerns applied before or after a request.

Common middleware modules:
- auth.middleware.js: verifies access tokens and attaches user context
- role.middleware.js: checks if the user has required permissions
- tenant.middleware.js: loads tenant and institution context from headers or token claims
- validate.middleware.js: validates body/query/params before service invocation
- error.middleware.js: centralizes error handling and response formatting
- upload.middleware.js: handles multipart file uploads
- audit.middleware.js: records critical request actions
- rate-limit.middleware.js: prevents abuse and brute-force attempts

---

## 7. Request and Response Flow
A typical request flow is:

1. Request enters Express app.
2. Global middleware runs.
3. Route-specific middleware validates authentication and authorization.
4. Controller receives input.
5. Controller calls service.
6. Service uses repository and infrastructure services.
7. Prisma writes to PostgreSQL.
8. Redis may be consulted for cached result or refreshed after update.
9. Response is normalized and returned.
10. Logging and monitoring capture the event.

---

## 8. Validation Strategy
Validation will be handled in a dedicated validation layer to keep controllers thin and ensure consistency.

### Validation Layers
- Structural validation: body, params, query validation
- Business validation: tenant scope, user role permissions, duplicate business rules
- Domain validation: student age range, fee amount rules, admission status transitions

### Validation Tools
- Schema-based validation with a library such as Joi, Yup, or Zod
- Separate validators per domain module
- Shared validation utilities for pagination, IDs, and common fields

### Validation Principles
- Validate input early
- Reject invalid requests before business logic
- Standardize validation error format

---

## 9. Authentication Design
Authentication will use JWT access tokens and refresh tokens.

### Authentication Flow
1. User logs in with credentials.
2. Backend verifies the identity.
3. Access token is issued for short-lived use.
4. Refresh token is issued for long-lived session renewal.
5. Refresh token is stored securely, ideally hashed, and rotated on use.

### Access Token
- Short-lived
- Contains user identity and role claims
- Used for API authorization

### Refresh Token
- Long-lived
- Stored securely in server-side storage or hashed database record
- Used to issue a new access token
- Rotated for security and revocation support

### Token Security Measures
- Use strong signing algorithms
- Keep secrets in environment variables
- Set secure cookie or header-based transport rules
- Support token revocation and logout
- Optionally support device-based token tracking

---

## 10. Authorization Design
Authorization will be built with a role-based permission system.

### Authorization Model
- Roles define broad responsibility groups
- Permissions define granular capabilities
- Users receive roles and/or direct permissions
- Authorization must be checked at both route and service levels

### Example Roles
- Super Admin
- Institution Admin
- Academic Admin
- Teacher
- Student
- Parent
- Accountant
- Support Agent
- Front Desk

### Permission Examples
- manage_students
- view_fee_reports
- approve_admissions
- publish_notices
- manage_website
- view_attendance

### Authorization Strategy
- Middleware checks role and permission at the route layer.
- Services enforce business-level authorization where needed.
- Tenant and institution scope must be applied consistently.

---

## 11. Role-Based Permission Architecture
The backend should support a flexible permission system.

### Recommended Design
- Roles table: stores predefined role definitions
- Permissions table: stores granular capability definitions
- User Roles join table: maps users to roles
- User Permissions join table: allows direct overrides where needed

### Permission Evaluation Flow
1. Resolve current authenticated user.
2. Load their role and permission assignments.
3. Validate the requested action against the required permission.
4. Enforce institution and branch scope when applicable.
5. Allow or deny access.

### Best Practices
- Prefer roles for broad access and permissions for exceptional cases
- Keep permission checks centralized through middleware
- Log authorization denials for monitoring and security review

---

## 12. Logging Strategy
Logging must be structured, searchable, and environment-aware.

### Logging Layers
- Request logging for every API call
- Authentication and authorization events
- Business action logs for critical workflows
- Error logs with request context
- Background job logs

### Logging Requirements
- Include request ID, user ID, tenant ID, institution ID, and action context
- Separate info, warn, error, and debug logs
- Avoid logging sensitive personal or payment information directly
- Centralize logs for production observability

### Suggested Logging Fields
- timestamp
- level
- service
- request_id
- tenant_id
- institution_id
- user_id
- route
- status_code
- duration_ms
- message

---

## 13. Caching Strategy
Redis will be used for caching frequently accessed data and reducing database load.

### Cache Use Cases
- User session metadata and authentication state
- Tenant and institution configuration
- Lookup tables and reference data
- Frequently accessed dashboards
- Frequently requested public website content
- Rate limiting counters

### Cache Design Principles
- Cache only read-heavy, low-churn data
- Use cache invalidation when data changes
- Keep cache keys namespaced by tenant and module
- Avoid caching sensitive or highly personalized data without strong controls

### Example Cache Patterns
- Cache tenant settings for short TTLs
- Cache public website pages for a few minutes
- Cache class and section lists for active academic sessions
- Cache frequently requested reports with stale-while-revalidate behavior

---

## 14. Error Handling Strategy
The backend should use centralized error handling to provide consistency and prevent leaking internals.

### Error Handling Principles
- Controllers should not throw raw errors without context
- Services should throw domain-specific errors
- Middleware should transform errors into consistent API responses
- Errors should be logged with context

### Error Categories
- Validation errors
- Authentication errors
- Authorization errors
- Not found errors
- Conflict or duplicate errors
- External service errors
- Database errors
- Internal server errors

### Response Format
A standard error response should contain:
- status code
- error code
- message
- details if appropriate
- request ID

---

## 15. Database Access Layer
Prisma will be the primary data access layer.

### Responsibilities of Prisma Layer
- Define the data model
- Manage migrations
- Generate typed database access clients
- Enable transactional operations
- Provide relational query clarity

### Data Access Pattern
- Controllers call services
- Services call repositories
- Repositories call Prisma client methods
- Prisma executes against PostgreSQL

### Transaction Management
- Use transactions for financial operations, admissions approvals, and account-changing workflows
- Keep transactions short and focused
- Avoid cross-service transactions across external systems

---

## 16. File Upload and Media Handling
Cloudinary will be used for file storage and media optimization.

### Upload Use Cases
- Student documents
- Staff profile pictures
- Website gallery assets
- Notice attachments
- Admission documents

### File Handling Strategy
- Upload to Cloudinary through a service layer
- Store metadata in PostgreSQL
- Use signed URLs or secure delivery as appropriate
- Enforce file type and size restrictions

---

## 17. Background Jobs and Asynchronous Processing
Background jobs will be used for tasks that should not block request handling.

### Common Background Jobs
- Sending emails and SMS notifications
- Generating reports or certificates
- Processing bulk imports
- Creating PDF invoices or transcripts
- Syncing external systems

### Execution Strategy
- Use job queues and worker services
- Separate worker processes from the API server
- Ensure retries and dead-letter handling for failures

---

## 18. Security Architecture
Security must be embedded into every layer of the backend.

### Security Controls
- HTTPS everywhere
- JWT-based access with refresh token rotation
- Password hashing with a strong algorithm
- Tenant and institution scope enforcement
- Input validation and output sanitization
- Rate limiting for login and public forms
- Secure headers and CORS configuration
- Secrets management via environment variables or secret vaults

### Sensitive Operations
- Password reset
- Fee payments
- Student profile edits
- Role and permission changes
- Admin configuration changes
- Financial reconciliation

These should be logged and require stronger validation.

---

## 19. Docker Architecture
Docker will containerize the application and support consistent deployment.

### Container Responsibilities
- API container for Node.js application
- PostgreSQL container for relational data
- Redis container for caching and queue support
- Optional worker container for background jobs

### Benefits
- Consistent development and production environments
- Faster onboarding for new engineers
- Easy scaling and deployment
- Simplified dependency management

### Recommended Setup
- One container for the API server
- One container for Prisma migrations or startup jobs
- One container for Redis
- One container for PostgreSQL
- Optional worker container for jobs and scheduled tasks

---

## 20. API Design Principles
The backend API should be consistent and predictable.

### Principles
- Use RESTful resource-oriented routes
- Use versioned endpoints such as /api/v1
- Return predictable JSON structures
- Use standard HTTP status codes
- Support pagination and filtering for list endpoints
- Use clear resource names and nested resources as needed

### Example Endpoint Structure
- /api/v1/auth/login
- /api/v1/students
- /api/v1/students/:id/attendance
- /api/v1/fees/payments
- /api/v1/notices
- /api/v1/website/pages

---

## 21. Multi-Tenant Backend Considerations
The backend must preserve tenant, institution, and branch context across requests.

### Tenant Context Strategy
- Identify tenant from JWT claims, subdomain, request header, or domain mapping
- Attach tenant and institution context to the request object
- Use this context in all authorization and repository queries
- Enforce tenant filtering in repository queries

### Why This Matters
- Prevents cross-tenant data leakage
- Supports white-label deployments
- Allows one platform instance to serve many institutions safely

---

## 22. Deployment and Observability
### Observability Requirements
- Metrics collection for request latency, error rate, and throughput
- Centralized logs and traces
- Health checks for API and database services
- Alerting for elevated error rates and service degradation

### Health Checks
- /healthz for basic readiness and liveness checks
- Database connectivity check
- Redis connectivity check
- External storage service check

---

## 23. Testing Architecture
Backend testing should cover the following levels:
- Unit tests for services and validators
- Integration tests for repositories and Prisma interactions
- API tests for controllers and middleware
- End-to-end tests for major workflows such as login, admissions, and payments

### Testing Goals
- Verify business rules and access control
- Prevent regression in tenant scoping and permissions
- Ensure data integrity for critical financial and academic actions

---

## 24. Recommended Module Boundaries
### Authentication and Identity Module
- Login, logout, password reset, token refresh, role resolution

### User Management Module
- Create, update, deactivate, and profile management for all users

### Student Management Module
- Student profile, admission, enrollment, attendance, documents

### Academic Module
- Classes, subjects, timetables, assessments, results

### Finance Module
- Fee structures, fees, payments, receipts, expenses

### Communication Module
- Notices, messages, events, notifications

### Website Module
- Pages, media, SEO settings, contact forms

### Support Module
- Tickets, messages, assignments, escalations

---

## 25. Architectural Best Practices
- Keep controllers thin
- Put business logic in services
- Keep repositories focused on storage access
- Use middleware for cross-cutting concerns
- Prefer clear interfaces and modular boundaries
- Avoid circular dependencies
- Use dependency injection patterns where appropriate
- Make all modules testable in isolation
- Protect high-value financial and student data aggressively

---

## 26. Final Backend Architecture Recommendation
The recommended backend architecture is a layered, modular Node.js application built with Express and Prisma over PostgreSQL. It will use JWT and refresh tokens for authentication, Redis for caching and rate limiting, Docker for deployment consistency, and Cloudinary for media storage.

This design is suitable for a production-grade, multi-tenant education platform that needs:
- secure authentication and authorization
- strong role-based permission management
- enterprise-grade logging and error handling
- scalable data access through Prisma
- reliable deployment using Docker
- white-label support for many institutions
