# BUSINESS_RULES
## Enterprise White-Label Education ERP + Website SaaS Platform

Document Type: Official Business Rule Handbook
Version: 1.0
Date: 2026-07-06
Prepared For: Product, Engineering, QA, Operations, Compliance, and AI Systems

> This document defines the production-ready business rules for the platform. It is intended to be the authoritative reference for developers, testers, product managers, and future AI-driven automation.

---

# 1. Introduction

## 1.1 Purpose
This document establishes the business rules, validation logic, permissions, and exception handling requirements for the white-label education ERP and website SaaS platform.

## 1.2 Scope
The rules apply to the following domains:
- Student lifecycle management
- Parent and guardian management
- Teacher and staff management
- Attendance tracking
- Fee collection and payment processing
- Examinations and results
- Homework and study materials
- Library operations
- Notifications and communications
- User roles and permissions
- Website and CMS content
- SaaS administration and tenant operations
- Reporting, audit, and security

## 1.3 Definitions
- Tenant: An institution or organization using the platform.
- User: A registered account belonging to a tenant.
- Student: An enrolled learner under a tenant.
- Parent: A guardian linked to one or more students.
- Teacher: A staff user responsible for teaching or academic functions.
- Super Admin: Platform operator managing tenants and subscriptions.
- Academic Session: A defined period such as 2025-2026.

## 1.4 Business Objectives
- Standardize institutional processes across multiple education verticals
- Ensure secure, consistent, and auditable operations
- Support white-label deployment across different organizations
- Improve operational transparency and financial accuracy
- Enable scalable SaaS growth with tenant isolation

## 1.5 Terminology
- Rule ID: Unique identifier for each business rule
- Validation: The condition used to verify compliance
- Exception Handling: The action to take when the rule is violated
- Impact: The operational effect of the rule

---

# 2. Student Rules

## 2.1 Admission Rules
| Rule ID | Module | Description | Priority | Validation | Exception Handling | Impact |
|---|---|---|---|---|---|---|
| BR-ST-001 | Student | Every student must be admitted under exactly one active tenant. | High | Student record must reference a valid tenant and active institution. | Reject admission and show validation error. | Prevent cross-tenant data leakage. |
| BR-ST-002 | Student | Every student must have a unique admission number within a tenant. | High | Admission number must be unique for the institution. | Auto-generate a new number or block duplicate entry. | Ensure identity integrity. |
| BR-ST-003 | Student | A student cannot be admitted if mandatory personal details are missing. | High | Required fields such as name, date of birth, guardian, and class must be present. | Block admission and prompt for missing data. | Improve data quality. |
| BR-ST-004 | Student | Admission must be linked to an academic session. | High | Admission record must include a valid academic session. | Reject admission until a session is assigned. | Maintain academic consistency. |
| BR-ST-005 | Student | Admission can only be created by authorized users such as admin, receptionist, or admission staff. | High | Role permissions must allow admission creation. | Deny access and log the security event. | Enforce role-based control. |

## 2.2 Roll Number and Enrollment Rules
| Rule ID | Module | Description | Priority | Validation | Exception Handling | Impact |
|---|---|---|---|---|---|---|
| BR-ST-006 | Student | Each student must receive a roll number after successful enrollment. | Medium | Roll number must be generated once per academic session and class. | Generate automatically if absent. | Support class-based reporting. |
| BR-ST-007 | Student | Roll numbers must be unique within a class and academic session. | High | Duplicate roll number is not allowed. | Auto-correct or reject depending on configuration. | Preserve classroom integrity. |
| BR-ST-008 | Student | Enrollment must be linked to a valid class, section, and stream. | High | Class and section references must exist and be active. | Prevent enrollment until valid mapping is provided. | Maintain structured academic records. |
| BR-ST-009 | Student | A student cannot be enrolled in more than one active section in the same session. | High | Check for overlapping active enrollments. | Block duplicate active enrollment. | Avoid academic conflicts. |

## 2.3 Student Status Rules
| Rule ID | Module | Description | Priority | Validation | Exception Handling | Impact |
|---|---|---|---|---|---|---|---|
| BR-ST-010 | Student | Student status must be one of Active, Inactive, Pending, Promoted, Transferred, or Archived. | High | Status must match allowed enum values. | Reject invalid status assignment. | Standardize lifecycle tracking. |
| BR-ST-011 | Student | A student with Pending status cannot participate in attendance or exams. | High | Access checks must enforce status restrictions. | Block action and notify admin. | Control active participation. |
| BR-ST-012 | Student | An archived student cannot be used in active attendance, fees, or exams. | High | Archived status must block operational workflows. | Restrict action with warning. | Preserve historical integrity. |

## 2.4 Transfer and Promotion Rules
| Rule ID | Module | Description | Priority | Validation | Exception Handling | Impact |
|---|---|---|---|---|---|---|
| BR-ST-013 | Student | Student transfer requires approval from an authorized administrator. | High | Transfer request must be approved before completion. | Keep request pending until approved. | Maintain control over student movement. |
| BR-ST-014 | Student | Transfer cannot be completed if the destination class or institution is invalid. | High | Validate target institution/class before action. | Reject transfer request. | Avoid invalid records. |
| BR-ST-015 | Student | Promotion must occur only within the same academic flow or approved program path. | High | Validate promotion path configuration. | Block promotion if path is invalid. | Preserve academic structure. |
| BR-ST-016 | Student | Promotion must preserve historical academic records and create a new term record. | Medium | New academic record must be generated on promotion. | Create record with audit trail if missing. | Support reporting continuity. |

## 2.5 Academic Session Rules
| Rule ID | Module | Description | Priority | Validation | Exception Handling | Impact |
|---|---|---|---|---|---|---|
| BR-ST-017 | Student | Students must belong to a current academic session for active operations. | High | Active session must be configured. | Prevent action until session is assigned. | Maintain current academic operations. |
| BR-ST-018 | Student | Session changes must create a new academic history entry. | Medium | Historical record must remain intact. | Create historical entry and mark current session change. | Support longitudinal analysis. |

## 2.6 Duplicate Prevention and Documents
| Rule ID | Module | Description | Priority | Validation | Exception Handling | Impact |
|---|---|---|---|---|---|---|---|
| BR-ST-019 | Student | Duplicate student records must be prevented using email, phone, and admission number checks. | High | Duplicate matching rules must be applied. | Flag duplicates for review. | Prevent data fragmentation. |
| BR-ST-020 | Student | Required documents must be uploaded before admission completion. | High | Document checklist must be satisfied. | Block completion until documents are provided. | Improve compliance. |
| BR-ST-021 | Student | Student documents must be versioned and traceable. | Medium | Upload history must be stored. | Create version entry and preserve previous file. | Support verification. |
| BR-ST-022 | Student | ID cards can only be generated for active students. | Medium | Student must not be archived or pending. | Block generation with notice. | Protect credential issuance. |
| BR-ST-023 | Student | Certificates may only be issued after exam or completion criteria are met. | High | Business rules must verify completion status. | Reject issuance until criteria are met. | Maintain authenticity. |
| BR-ST-024 | Student | Student archive requires an approval or admin action. | Medium | Archive operation must be audited. | Keep record in pending archive state. | Ensure controlled lifecycle change. |
| BR-ST-025 | Student | Deleting a student must follow soft delete rules and preserve audit history. | High | Soft delete flag must be used instead of hard delete. | Mark as deleted and retain record. | Protect historical data integrity. |

---

# 3. Parent Rules

| Rule ID | Module | Description | Priority | Validation | Exception Handling | Impact |
|---|---|---|---|---|---|---|
| BR-PR-001 | Parent | One parent account may be linked to multiple students within the same tenant. | High | Parent-child relationship table must allow many-to-many mapping. | Reject invalid multiple linkage if tenant mismatch. | Support family-based operations. |
| BR-PR-002 | Parent | A guardian record must have at least one valid phone number or email. | High | Contact details must be present. | Block parent registration. | Ensure communication ability. |
| BR-PR-003 | Parent | Emergency contact details must be stored for each linked student where required by policy. | Medium | Emergency contact fields must be populated if enabled. | Show warning or block based on policy. | Improve student safety. |
| BR-PR-004 | Parent | Parent login must be restricted to the parent role and linked student context. | High | Parent account must have parent role and associated students. | Deny access and log event. | Enforce account separation. |
| BR-PR-005 | Parent | Parent visibility must be limited to their own linked students and approved data. | High | Authorization checks must validate student linkage. | Deny access and log violation. | Protect privacy. |

---

# 4. Teacher Rules

| Rule ID | Module | Description | Priority | Validation | Exception Handling | Impact |
|---|---|---|---|---|---|---|
| BR-TR-001 | Teacher | Every teacher must be registered under a valid tenant. | High | Tenant reference must be present. | Reject registration. | Preserve tenant boundaries. |
| BR-TR-002 | Teacher | Every teacher must receive a unique teacher ID within the tenant. | High | Teacher ID must be unique. | Auto-generate if missing. | Support staff identification. |
| BR-TR-003 | Teacher | A teacher can be assigned to one or more subjects only if the subject exists. | High | Subject mapping must be validated. | Block assignment and prompt for correction. | Maintain curriculum integrity. |
| BR-TR-004 | Teacher | A teacher can be assigned to one or more classes only if the class exists and is active. | High | Valid class and academic session must exist. | Reject invalid assignment. | Improve class management. |
| BR-TR-005 | Teacher | Leave requests must be submitted before the leave date or within the configured policy window. | Medium | Leave request date must comply with policy. | Reject or route for approval based on policy. | Maintain staffing planning. |
| BR-TR-006 | Teacher | Teacher attendance must be recorded using the configured attendance policy. | High | Attendance entry must follow allowed rules. | Block unsupported entry. | Improve attendance accuracy. |
| BR-TR-007 | Teacher | Salary processing must be based on approved attendance and configured salary rules. | High | Salary rules must be applied. | Hold salary until validation is complete. | Ensure payroll correctness. |
| BR-TR-008 | Teacher | Resignation must be processed with approval from HR or administration. | High | Status must move through approval workflow. | Keep request pending. | Control staff exits. |
| BR-TR-009 | Teacher | Archived teachers must not be active in teaching or attendance operations. | High | Archived status must block operational workflows. | Deny action and flag user. | Maintain active workforce accuracy. |

---

# 5. Attendance Rules

| Rule ID | Module | Description | Priority | Validation | Exception Handling | Impact |
|---|---|---|---|---|---|---|
| BR-AT-001 | Attendance | Attendance for a date cannot be modified after the configured lock period. | High | Compare entry date to attendance lock policy. | Reject edit and show policy message. | Preserve record integrity. |
| BR-AT-002 | Attendance | Holidays must be excluded from regular attendance calculations. | High | Date must be checked against holiday calendar. | Mark as holiday and skip attendance requirement. | Avoid false absences. |
| BR-AT-003 | Attendance | Weekends must be treated according to institutional calendar rules. | Medium | Weekend flag must be applied. | Mark as non-working day automatically. | Improve attendance consistency. |
| BR-AT-004 | Attendance | Late entry must be flagged according to configured late entry threshold. | Medium | Compare entry time to threshold. | Mark as Late or reject if not allowed. | Improve punctuality monitoring. |
| BR-AT-005 | Attendance | Half-day attendance must be allowed only when configured by the institution. | Medium | Policy configuration must be enabled. | Reject or mark as full day depending on settings. | Support flexible attendance regimes. |
| BR-AT-006 | Attendance | Absent status must be applied when a student or teacher is not present and no approved leave exists. | High | Check present, absent, and leave states. | Apply absent automatically or require manual override. | Maintain accurate attendance records. |
| BR-AT-007 | Attendance | Leave entries must override absent status when valid. | High | Leave must be approved and within policy. | Convert leave to absence if invalid. | Reduce reporting errors. |
| BR-AT-008 | Attendance | Future attendance entry is prohibited unless explicitly allowed by admin configuration. | High | Date must not exceed current date or allowed future horizon. | Reject future entry. | Prevent erroneous records. |
| BR-AT-009 | Attendance | Past attendance edits must be logged with user, timestamp, and reason. | High | Edit event must require reason and audit entry. | Prevent edit without reason. | Ensure accountability. |
| BR-AT-010 | Attendance | Attendance changes must be approved according to the configured approval workflow. | Medium | Approval state must be verified. | Keep status pending until approved. | Improve governance. |

---

# 6. Fee Rules

| Rule ID | Module | Description | Priority | Validation | Exception Handling | Impact |
|---|---|---|---|---|---|---|
| BR-FE-001 | Fee | Every student must have a fee structure assigned according to class, session, and program. | High | Validate fee plan mapping. | Prevent fee generation until structure exists. | Ensure correct billing. |
| BR-FE-002 | Fee | Installments must follow the configured schedule and amount distribution. | High | Validate installment dates and amounts. | Reject invalid schedule. | Ensure payment discipline. |
| BR-FE-003 | Fee | Discount rules must be applied only when eligibility criteria are met. | High | Evaluate discount condition before confirmation. | Reject discount if criteria are not met. | Prevent inappropriate discounting. |
| BR-FE-004 | Fee | Scholarship must be approved by authorized staff before application. | High | Approval workflow must be completed. | Hold scholarship until approval. | Support financial control. |
| BR-FE-005 | Fee | Late fine must be applied based on overdue days and configured rules. | Medium | Compare overdue date to fine policy. | Apply default policy if rule missing. | Improve fee compliance. |
| BR-FE-006 | Fee | Partial payment must be allowed only when the institution enables installment-based collection. | High | Check configuration before partial payment. | Reject or route to full payment flow. | Maintain financial policy. |
| BR-FE-007 | Fee | Full payment must close the outstanding balance for the selected invoice. | High | Invoice balance must reach zero after payment. | Keep invoice open until full settlement. | Maintain accurate balance. |
| BR-FE-008 | Fee | Refunds must be approved and linked to a valid payment transaction ID. | High | Verify payment record and refund reason. | Reject refund without valid transaction. | Prevent financial leakage. |
| BR-FE-009 | Fee | Receipt numbers must be unique within the tenant. | High | Receipt number uniqueness check. | Auto-generate new receipt number. | Preserve financial auditability. |
| BR-FE-010 | Fee | Duplicate payment prevention must be enforced using reference ID and payment fingerprint. | High | Reject duplicate transaction IDs. | Mark as duplicate and report. | Prevent double charging. |
| BR-FE-011 | Fee | Fee edits are allowed only before the payment is finalized or within the allowed window. | Medium | Validate edit timing and status. | Block edit if payment is finalized. | Prevent fraud and errors. |
| BR-FE-012 | Fee | Fee deletion must be restricted and logged as a financial modification. | High | Soft delete or admin approval required. | Block hard delete and log event. | Preserve financial history. |

---

# 7. Examination Rules

| Rule ID | Module | Description | Priority | Validation | Exception Handling | Impact |
|---|---|---|---|---|---|---|
| BR-EX-001 | Examination | An exam can only be created by an authorized academic admin or teacher. | High | Role-based access enforcement. | Deny operation and log it. | Preserve exam integrity. |
| BR-EX-002 | Examination | Exam schedules must not conflict with existing exams for the same class or subject. | High | Check schedule overlap rules. | Reject conflicting schedule. | Avoid timetable conflicts. |
| BR-EX-003 | Examination | Marks entry must be allowed only within the configured marks entry window. | High | Validate current date against policy. | Block entry after window closes. | Ensure fairness and timing. |
| BR-EX-004 | Examination | Result publication must occur only after marks are finalized and approved. | High | Verify finalization and approval state. | Hold publication until approval. | Protect result correctness. |
| BR-EX-005 | Examination | Marks lock must prevent further edits after result publication. | High | Lock status must be enforced. | Reject edit attempts. | Preserve result integrity. |
| BR-EX-006 | Examination | Grade calculation must follow the configured grade scale. | High | Grade mapping must be available. | Apply default grade or reject entry. | Standardize evaluation. |
| BR-EX-007 | Examination | Pass or fail status must be derived from the configured passing criteria. | High | Compare obtained marks to threshold. | Use configured default if missing. | Support academic compliance. |
| BR-EX-008 | Examination | Grace marks may be applied only if permitted by policy. | Medium | Validate grace marks settings. | Reject if not allowed. | Maintain fairness. |
| BR-EX-009 | Examination | Rank calculation must be based on approved and finalized marks. | High | Only finalized results can be ranked. | Prevent ranking until finalized. | Improve academic reporting. |
| BR-EX-010 | Examination | Report cards must be generated from finalized results only. | High | Verify result approval state. | Block generation until approval. |
| BR-EX-011 | Examination | Result revision requires audit trail and authorized approval. | High | Revision must be logged. | Reject unauthorized revision. | Maintain transparency. |

---

# 8. Homework Rules

| Rule ID | Module | Description | Priority | Validation | Exception Handling | Impact |
|---|---|---|---|---|---|---|
| BR-HW-001 | Homework | Homework must be assigned to an active class and subject. | High | Validate subject/class assignment. | Reject invalid assignment. | Maintain academic workflow. |
| BR-HW-002 | Homework | Homework publish date must be before or equal to the due date. | High | Date validation. | Reject invalid schedule. | Avoid logical errors. |
| BR-HW-003 | Homework | Late submissions must be marked according to policy. | Medium | Check submission timestamp vs deadline. | Mark as late and notify teacher. | Improve evaluation consistency. |
| BR-HW-004 | Homework | Teacher review must be completed before final marks are published. | High | Review state must be completed. | Hold marks until review. | Protect fairness. |
| BR-HW-005 | Homework | Marks must be within the configured maximum marks. | High | Numeric range validation. | Reject invalid mark. | Ensure scoring integrity. |
| BR-HW-006 | Homework | Remarks must be mandatory when marks are below the passing threshold. | Medium | Conditional rule. | Force remark entry. | Increase feedback quality. |

---

# 9. Study Material Rules

| Rule ID | Module | Description | Priority | Validation | Exception Handling | Impact |
|---|---|---|---|---|---|---|
| BR-SM-001 | Study Material | Study materials must be uploaded by authorized staff only. | High | Role-based permission check. | Reject upload. | Ensure content control. |
| BR-SM-002 | Study Material | File size must not exceed the configured maximum limit. | Medium | File size validation. | Reject oversized file. | Protect storage and performance. |
| BR-SM-003 | Study Material | Only allowed file formats may be uploaded. | High | Extension and MIME validation. | Reject unsupported format. | Maintain compatibility. |
| BR-SM-004 | Study Material | Visibility must be restricted by class, subject, role, or tenant policy. | High | Evaluate access rules. | Hide content from unauthorized users. | Protect intellectual property. |
| BR-SM-005 | Study Material | Download permissions must follow the visibility rules. | High | Download access must be authorized. | Block download and log event. | Prevent unauthorized distribution. |
| BR-SM-006 | Study Material | New versions of materials must preserve previous versions for audit purposes. | Medium | Versioning strategy required. | Create new version and retain old file. | Enable content traceability. |

---

# 10. Library Rules

| Rule ID | Module | Description | Priority | Validation | Exception Handling | Impact |
|---|---|---|---|---|---|---|
| BR-LB-001 | Library | A book can be issued only if it is available in inventory. | High | Availability check. | Reject issue request. | Prevent stock errors. |
| BR-LB-002 | Library | Book return must be recorded within the due date. | High | Return date validation. | Mark late and calculate fine. | Improve accountability. |
| BR-LB-003 | Library | Fine must be applied for overdue returns based on configured rules. | Medium | Overdue calculation. | Apply default fine policy. | Improve compliance. |
| BR-LB-004 | Library | Lost books must be marked and charged according to policy. | High | Lost item flag and charge rules. | Block further issue until resolved. | Protect assets. |
| BR-LB-005 | Library | Damaged books must be assessed and charged if required by policy. | Medium | Damage condition check. | Create repair or replacement charge. | Manage inventory quality. |
| BR-LB-006 | Library | Maximum outstanding books per borrower must be enforced. | Medium | Borrower limit check. | Reject additional issue. | Control borrowing. |
| BR-LB-007 | Library | Reserved books must be issued on a first-reserved-first-served basis. | Medium | Reservation queue logic. | Hold book for reserved user. | Improve fairness. |

---

# 11. Notification Rules

| Rule ID | Module | Description | Priority | Validation | Exception Handling | Impact |
|---|---|---|---|---|---|---|---|
| BR-NF-001 | Notification | SMS, email, WhatsApp, and push notifications must be sent only to opted-in or authorized recipients. | High | User preference and permission check. | Skip sending and log reason. | Protect communication privacy. |
| BR-NF-002 | Notification | Notification templates must be tenant-aware and versioned. | Medium | Template lookup must include tenant context. | Use default template if missing. | Maintain consistency. |
| BR-NF-003 | Notification | Failed notifications must be retried according to retry policy. | Medium | Retry count and delay validation. | Move to retry queue or error state. | Improve deliverability. |
| BR-NF-004 | Notification | Scheduled notifications must be sent only once unless repeated delivery is configured. | Medium | Schedule deduplication logic. | Prevent duplicate dispatch. | Avoid spam. |
| BR-NF-005 | Notification | Notification logs must capture status, delivery channel, timestamp, and recipient. | High | Audit logging requirement. | Store failed attempt with reason. | Improve traceability. |

---

# 12. User Rules

| Rule ID | Module | Description | Priority | Validation | Exception Handling | Impact |
|---|---|---|---|---|---|---|
| BR-US-001 | User | Every user must have a unique username or login identifier within a tenant. | High | Unique check across tenant scope. | Reject duplicate creation. | Preserve account integrity. |
| BR-US-002 | User | Email addresses must be valid and unique within the tenant. | High | Email format and uniqueness validation. | Reject invalid or duplicate email. | Prevent account conflicts. |
| BR-US-003 | User | Passwords must meet the configured complexity policy. | High | Password strength validation. | Reject weak password. | Improve security. |
| BR-US-004 | User | User profiles must support photo upload and profile data updates. | Medium | File and field validation. | Reject invalid image or format. | Improve identity management. |
| BR-US-005 | User | Soft delete must be used instead of hard delete for user accounts. | High | Soft-delete flag and history preservation. | Mark as inactive/deleted. | Preserve system integrity. |
| BR-US-006 | User | Inactive users must be prevented from logging into active workflows. | High | Status check. | Block login and notify admin. | Protect system access. |

---

# 13. Role and Permission Rules

| Rule ID | Module | Description | Priority | Validation | Exception Handling | Impact |
|---|---|---|---|---|---|---|
| BR-RP-001 | Roles | Super Admin has unrestricted access to platform-level operations. | High | Super Admin role check. | Deny if role mismatch. | Preserve platform governance. |
| BR-RP-002 | Roles | School Admin can manage institution-level users, settings, and operational modules. | High | Role permission matrix. | Deny unauthorized action. | Improve institutional control. |
| BR-RP-003 | Roles | Principal has access to academic oversight and reporting functions. | High | Permission scope check. | Restrict to academic data only. | Support school leadership. |
| BR-RP-004 | Roles | Teacher has access to assigned classes, attendance, homework, and student results. | High | Scope-based permission validation. | Block cross-class access. | Protect academic data. |
| BR-RP-005 | Roles | Reception can manage admissions and visitor-related operations where enabled. | Medium | Role-specific access. | Deny unsupported actions. | Support front-office operations. |
| BR-RP-006 | Roles | Accountant has access to fee payment, receipts, and financial reporting. | High | Permission check. | Restrict to finance modules. | Protect financial integrity. |
| BR-RP-007 | Roles | Librarian has access to library inventory and circulation. | Medium | Scoped role check. | Deny unrelated module access. | Protect library operations. |
| BR-RP-008 | Roles | Parent can view only their linked students’ approved information. | High | Student relation validation. | Deny unauthorized data access. | Safeguard privacy. |
| BR-RP-009 | Roles | Student can view their own profile, attendance, results, and assigned materials. | High | Student self-access validation. | Deny cross-student access. | Ensure personal data boundaries. |
| BR-RP-010 | Roles | Permission hierarchy must prevent lower roles from accessing higher-level actions. | High | Role hierarchy check. | Reject action and log event. | Enforce security boundaries. |

---

# 14. Website Rules

| Rule ID | Module | Description | Priority | Validation | Exception Handling | Impact |
|---|---|---|---|---|---|---|
| BR-WE-001 | Website | Admission forms must capture mandatory student and guardian information. | High | Required field validation. | Block submission until fields are complete. | Improve lead capture quality. |
| BR-WE-002 | Website | Contact forms must validate the email and phone format before submission. | High | Input validation. | Reject invalid submission. | Support lead management. |
| BR-WE-003 | Website | SEO metadata must be available for each page and blog post. | Medium | Metadata presence check. | Use default metadata if missing. | Improve discoverability. |
| BR-WE-004 | Website | Gallery and blog content must be visible only when published. | Medium | Publish status validation. | Hide unpublished content. | Prevent premature exposure. |
| BR-WE-005 | Website | Course visibility must be controlled by tenant configuration and publication status. | Medium | Visibility rules. | Hide course from public view if disabled. | Support marketing readiness. |
| BR-WE-006 | Website | Faculty visibility must respect privacy and publication settings. | Medium | Role and configuration check. | Hide faculty profile if not approved. | Protect staff privacy. |

---

# 15. Security Rules

| Rule ID | Module | Description | Priority | Validation | Exception Handling | Impact |
|---|---|---|---|---|---|---|---|
| BR-SC-001 | Security | Passwords must meet length, complexity, and history rules. | High | Password policy validation. | Reject weak password. | Improve account protection. |
| BR-SC-002 | Security | Accounts must be locked after repeated failed login attempts. | High | Login attempt threshold. | Lock account and notify admin. | Reduce brute-force risk. |
| BR-SC-003 | Security | JWT access tokens must expire within the configured time window. | High | Token expiry validation. | Reject expired tokens and require refresh. | Protect active sessions. |
| BR-SC-004 | Security | Sessions must time out after inactivity according to policy. | Medium | Inactivity threshold validation. | Log out user and require re-authentication. | Reduce unauthorized access. |
| BR-SC-005 | Security | Login attempts must be logged and monitored for suspicious activity. | High | Audit logging. | Trigger alert or lockout. | Improve security monitoring. |
| BR-SC-006 | Security | Audit logs must capture create, update, delete, restore, and login events. | High | Event logging requirement. | Store event and escalate if policy is violated. | Support compliance and traceability. |
| BR-SC-007 | Security | Sensitive data must be encrypted at rest and in transit. | High | Encryption policy validation. | Reject deployment without proper encryption. | Protect private data. |
| BR-SC-008 | Security | Backup and restore procedures must be tested and documented. | High | Backup validation. | Prevent production rollout until tested. | Ensure recovery readiness. |

---

# 16. SaaS Rules

| Rule ID | Module | Description | Priority | Validation | Exception Handling | Impact |
|---|---|---|---|---|---|---|
| BR-SA-001 | SaaS | Tenant data must be isolated and inaccessible across tenants. | High | Tenant context validation on every data access. | Reject cross-tenant access and log event. | Prevent data leakage. |
| BR-SA-002 | SaaS | Custom domains must be validated before tenant activation. | High | Domain ownership and DNS validation. | Keep tenant in pending state. | Protect branding and routing. |
| BR-SA-003 | SaaS | Subscription status must determine whether the tenant can access premium modules. | High | Subscription state check at feature access. | Restrict access and show renewal message. | Support billing compliance. |
| BR-SA-004 | SaaS | License validation must be enforced for enterprise or premium features. | High | License check before feature access. | Disable restricted feature. | Protect licensing. |
| BR-SA-005 | SaaS | Trial tenants must be limited to trial period and feature restrictions. | Medium | Trial expiry validation. | Restrict features or suspend tenant. | Support product-led growth. |
| BR-SA-006 | SaaS | Feature restrictions must be based on plan, tenant configuration, and subscription state. | High | Feature flag validation. | Hide or disable unsupported functionality. | Improve product governance. |
| BR-SA-007 | SaaS | White-label branding must be applied per tenant without affecting others. | High | Tenant-specific theme and configuration lookup. | Use default branding when tenant config is missing. | Support customer personalization. |

---

# 17. Reports Rules

| Rule ID | Module | Description | Priority | Validation | Exception Handling | Impact |
|---|---|---|---|---|---|---|
| BR-RP-001 | Reports | Attendance reports must reflect approved attendance records only. | High | Approval state check. | Exclude unapproved records. | Improve reporting reliability. |
| BR-RP-002 | Reports | Fee reports must include paid, pending, overdue, and refunded transactions. | High | Finance status validation. | Show incomplete report with warning. | Support financial visibility. |
| BR-RP-003 | Reports | Revenue reports must be based on finalized and reconciled payments. | High | Reconciliation status check. | Exclude pending transactions. | Improve accounting accuracy. |
| BR-RP-004 | Reports | Student reports must be limited to the current tenant and authorized role. | High | Tenant and permission validation. | Restrict access. | Protect privacy. |
| BR-RP-005 | Reports | Teacher reports must show only approved or active teacher records. | Medium | Active status validation. | Exclude inactive records. | Improve staff planning. |
| BR-RP-006 | Reports | Exam reports must be based on finalized results only. | High | Finalized result check. | Prevent incomplete report generation. | Maintain academic accuracy. |

---

# 18. Audit Rules

| Rule ID | Module | Description | Priority | Validation | Exception Handling | Impact |
|---|---|---|---|---|---|---|
| BR-AU-001 | Audit | Create events must be logged with actor, timestamp, tenant, and entity reference. | High | Audit event capture required. | Block action if logging fails. | Improve accountability. |
| BR-AU-002 | Audit | Update events must retain previous and new values where supported. | High | Change tracking requirement. | Record minimal change metadata if full diff unavailable. | Support traceability. |
| BR-AU-003 | Audit | Delete events must preserve a reference to the deleted record. | High | Soft delete or tombstone requirement. | Keep deletion event in audit log. | Protect historical integrity. |
| BR-AU-004 | Audit | Restore events must be logged with actor and restored record identifier. | High | Restore action logging. | Prevent restore without logging. | Track lifecycle events. |
| BR-AU-005 | Audit | Audit logs must be immutable once written. | High | Write protection policy. | Deny tampering and alert stakeholders. | Ensure compliance. |

---

# 19. Data Validation Rules

| Rule ID | Module | Description | Priority | Validation | Exception Handling | Impact |
|---|---|---|---|---|---|---|
| BR-DV-001 | Validation | Mandatory fields must be validated before save. | High | Required field check. | Show field-level error and block save. | Improve data integrity. |
| BR-DV-002 | Validation | Unique fields must be validated against existing records within the tenant. | High | Duplicate check. | Reject duplicate values. | Prevent duplicates. |
| BR-DV-003 | Validation | Format validation must enforce expected patterns such as phone, postal code, and ID formats. | High | Regex or schema validation. | Reject invalid input. | Reduce format errors. |
| BR-DV-004 | Validation | Length validation must enforce minimum and maximum field sizes. | Medium | Schema validation. | Reject input with clear error. | Maintain database consistency. |
| BR-DV-005 | Validation | Email addresses must follow standard format rules and be unique. | High | Email schema and uniqueness validation. | Reject invalid or duplicate emails. | Protect communication channels. |
| BR-DV-006 | Validation | Phone numbers must follow the configured country-specific pattern. | Medium | Phone validation. | Reject invalid entry. | Improve contact accuracy. |
| BR-DV-007 | Validation | Date values must be valid and cannot be in an impossible range. | High | Date parsing and range validation. | Reject invalid dates. | Maintain consistency. |

---

# 20. Global Business Rules

## 20.1 Global Rule Principles
The following global principles apply across all modules:
1. All data must be tenant-scoped.
2. All critical operations must be auditable.
3. All role-based actions must be permission-checked.
4. All financial transactions must be traceable.
5. All user-generated content must be versioned where appropriate.
6. All public-facing content must respect publication and visibility rules.

## 20.2 Global Business Rules Summary
| Rule ID | Module | Description | Priority | Validation | Exception Handling | Impact |
|---|---|---|---|---|---|---|
| BR-GL-001 | Global | Every business transaction must be associated with a tenant and actor. | High | Mandatory tenant and actor context. | Reject if context is missing. | Ensure accountability. |
| BR-GL-002 | Global | Every critical workflow must create an audit entry. | High | Event logging requirement. | Block or warn if logging fails. | Improve governance. |
| BR-GL-003 | Global | Every user action must be validated against role and permission rules. | High | Authorization middleware check. | Deny access and log event. | Improve security. |
| BR-GL-004 | Global | All financial transactions must be immutable after confirmation. | High | Transaction status check. | Reject unauthorized modification. | Maintain trust and compliance. |
| BR-GL-005 | Global | Every report must be generated from approved and validated data. | High | Validation and approval checks. | Return error or warning if data is incomplete. | Improve report accuracy. |
| BR-GL-006 | Global | Data deletion must use soft delete unless explicitly approved as permanent. | High | Soft-delete enforcement. | Block hard delete and require admin approval. | Preserve integrity and recovery. |
| BR-GL-007 | Global | All public-facing websites must support tenant branding and content isolation. | High | Tenant and theme validation. | Use fallback branding if missing. | Support white-label operations. |
| BR-GL-008 | Global | System configuration changes must be versioned and auditable. | Medium | Configuration history tracking. | Prevent untracked changes. | Reduce operational risk. |

---

# 21. Examples of Rule Usage

## Example 1: Student Admission
A new student cannot be admitted unless:
- The tenant is valid
- The admission number is unique
- The academic session is present
- The guardian details are present
- Required documents are uploaded
- The user has admission permission

## Example 2: Fee Payment
A fee payment can be processed only when:
- The student has an active fee structure
- The payment amount is valid
- The transaction reference is unique
- The payment is not duplicated
- The receipt is generated and logged

## Example 3: Attendance Lock
Attendance cannot be edited after the configured lock date, except by authorized staff with a valid override reason and an audit log entry.

---

# 22. Notes and Warnings

## Notes
- These rules should be reviewed quarterly for business fit and compliance updates.
- Rules may be overridden only through approved configuration or admin workflow.
- All exceptions must be recorded and explained in audit logs.

## Warnings
- Do not allow direct database edits to bypass business rules.
- Do not permit financial transactions without audit logging.
- Do not allow cross-tenant access under any circumstances.
- Do not suppress validation failures for convenience.

---

# 23. Recommended Governance Model

## 23.1 Rule Ownership
- Product Manager: Business rule prioritization and acceptance criteria
- Solution Architect: Rule feasibility and implementation design
- QA Lead: Rule validation and test cases
- Compliance/Operations: Policy review and risk management
- Developers: Implementation and enforcement

## 23.2 Rule Review Cadence
- Review rules during sprint planning
- Validate rules before each release
- Reassess rules after major customer onboarding or regulatory changes

---

# 24. Summary

This handbook defines a comprehensive set of production-ready business rules for the white-label education ERP and website SaaS platform. It covers student, parent, teacher, attendance, fee, examination, homework, study material, library, notification, users, roles, security, SaaS, reporting, audit, validation, and global operations.

These rules will serve as the foundation for:
- System design
- Workflow implementation
- Testing and QA
- Product roadmap execution
- AI-assisted business conversations
- Compliance and operational governance
