# Blockchain-Based Decentralized Storage System with Role-Based Access Control for Legal Documentation

## 1. Problem Statement

### 1.1 Background

In today's digital era, organizations, especially government institutions and legal entities, face significant challenges in managing sensitive documents while ensuring security, authenticity, and non-repudiation. Traditional centralized storage systems present several critical issues:

- **Single Point of Failure**: Centralized servers are vulnerable to attacks, data breaches, and system failures
- **Lack of Transparency**: No immutable audit trail for document access and modifications
- **Access Control Limitations**: Binary public/private access models don't support complex organizational hierarchies
- **Non-Repudiation Issues**: Parties can deny receiving or accessing documents, leading to legal disputes
- **Data Integrity Concerns**: No tamper-proof mechanism to verify document authenticity
- **Censorship Risks**: Centralized authorities can restrict or modify access to documents

### 1.2 Problem Definition

Government institutions and legal organizations require a secure, decentralized document storage and sharing system that:

1. **Ensures Non-Repudiation**: Provides cryptographic proof that documents were received and accessed, preventing parties from denying receipt or access
2. **Implements Granular Access Control**: Supports role-based permissions where different departments (e.g., Income Tax Department, Finance Ministry) can have different access levels to the same document
3. **Maintains Document Integrity**: Uses blockchain-stored hashes to detect any tampering or modifications to documents
4. **Provides Complete Audit Trail**: Logs all access attempts (successful and failed) with timestamps, user identities, and file hashes for legal compliance
5. **Enables Selective Transparency**: Allows documents to be public (visible to all), private (owner/receiver only), or role-based (specific departments only)
6. **Prevents Unauthorized Access**: Ensures that only authorized personnel with appropriate roles can access sensitive documents

### 1.3 Specific Use Case Scenario

Consider a government tender process:

- **Tender Announcement**: Should be public (visible to all citizens and businesses)
- **Transaction Details**: Should be accessible only to Income Tax Department and Finance Ministry (role-based)
- **Internal Communications**: Should be private (only sender and receiver)
- **Verification Requirement**: Any party must be able to verify document authenticity using blockchain-stored hashes
- **Audit Requirement**: Complete log of who accessed what document and when, for legal compliance

### 1.4 Research Gap

Existing solutions either:
- Lack role-based access control (only public/private)
- Don't provide non-repudiation mechanisms
- Rely on centralized storage (vulnerable to attacks)
- Don't integrate blockchain for immutable audit trails
- Lack document integrity verification

### 1.5 Objectives

1. Develop a decentralized file storage system using blockchain technology
2. Implement role-based access control (RBAC) for granular permissions
3. Ensure non-repudiation through cryptographic hashing and access logging
4. Provide document integrity verification using blockchain-stored hashes
5. Create an immutable audit trail for all document access attempts
6. Support multiple access types: public, private, and role-based
7. Enable authorities to create and manage roles dynamically

---

## 2. Technology Stack

### 2.1 Frontend Technologies

#### 2.1.1 Core Framework
- **React 18.3.1**: Modern JavaScript library for building user interfaces
  - Component-based architecture
  - Virtual DOM for efficient rendering
  - Hooks for state management

#### 2.1.2 Build Tools
- **Vite 5.4.1**: Next-generation frontend build tool
  - Fast Hot Module Replacement (HMR)
  - Optimized production builds
  - ES modules support

#### 2.1.3 Routing
- **React Router DOM 6.26.2**: Client-side routing
  - BrowserRouter for navigation
  - Protected routes for authenticated pages
  - Dynamic route parameters

#### 2.1.4 UI Components
- **shadcn/ui**: High-quality React component library
  - Accessible components
  - Customizable with Tailwind CSS
  - Components: Button, Input, Label, Form

#### 2.1.5 Styling
- **Tailwind CSS 3.4.17**: Utility-first CSS framework
  - Responsive design
  - Custom color schemes
  - Dark mode support (if needed)

#### 2.1.6 Blockchain Integration
- **MetaMask**: Browser extension for Ethereum wallet
  - Wallet connection
  - Account management
  - Transaction signing
- **Ethers.js**: Ethereum JavaScript library
  - Smart contract interaction
  - Wallet operations
  - Blockchain queries

#### 2.1.7 Form Handling
- **React Hook Form 7.55.0**: Performant form library
  - Minimal re-renders
  - Built-in validation
- **Zod 3.24.2**: TypeScript-first schema validation
  - Runtime type checking
  - Form validation

### 2.2 Backend Technologies

#### 2.2.1 Storage Service
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
  - RESTful API endpoints
  - Middleware support
  - File upload handling

#### 2.2.2 File Processing
- **Multer**: Middleware for handling multipart/form-data
  - Memory storage for file uploads
  - File size limits
  - MIME type validation

#### 2.2.3 Encryption
- **Node.js Crypto Module**: Built-in cryptographic functionality
  - AES-256-CBC encryption
  - Initialization Vector (IV) generation
  - SHA-256 hashing for integrity

#### 2.2.4 HTTP Client
- **Axios**: Promise-based HTTP client
  - Inter-service communication
  - Error handling
  - Request/response interceptors

#### 2.2.5 IPFS Support (Optional)
- **ipfs-http-client**: InterPlanetary File System client
  - Distributed file storage
  - Content addressing
  - Decentralized storage option

### 2.3 Metadata Service

#### 2.3.1 Database
- **MongoDB**: NoSQL document database
  - Flexible schema
  - Horizontal scaling
  - Rich query language

#### 2.3.2 ODM (Object Document Mapper)
- **Mongoose 8.13.2**: MongoDB object modeling
  - Schema definition
  - Data validation
  - Middleware support

#### 2.3.3 Models
- **FileMetadata**: Stores file information and access control
- **FileLedger**: Immutable ledger of all file transactions
- **Role**: Defines roles (e.g., IncomeTaxDept, FinanceMinistry)
- **Authority**: Manages who can create roles
- **UserRole**: Maps users to roles
- **AccessLog**: Tracks all file access for non-repudiation

### 2.4 Blockchain Technologies

#### 2.4.1 Blockchain Network
- **Ganache**: Local Ethereum blockchain
  - Fast development
  - Pre-funded accounts
  - Transaction mining

#### 2.4.2 Smart Contract Development
- **Solidity 0.8.20**: Smart contract programming language
  - FileRegistry contract
  - On-chain metadata storage
  - Event emission

#### 2.4.3 Deployment Tools
- **Truffle**: Development framework
  - Contract compilation
  - Migration scripts
  - Testing framework

#### 2.4.4 Blockchain Interaction
- **Ethers.js**: Ethereum library for Node.js
  - Contract interaction
  - Transaction signing
  - Event listening

### 2.5 Development Tools

#### 2.5.1 Version Control
- **Git**: Distributed version control system

#### 2.5.2 Package Management
- **npm**: Node Package Manager
  - Dependency management
  - Script execution

#### 2.5.3 Code Quality
- **ESLint**: JavaScript linter
  - Code style enforcement
  - Error detection

#### 2.5.4 Environment
- **Node.js**: Runtime environment
- **MongoDB**: Database server
- **Ganache**: Blockchain network

---

## 3. System Architecture & Working Overview

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   React      │  │   MetaMask   │  │   Browser    │         │
│  │   Frontend   │  │   Wallet     │  │   Storage    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                           │
│  ┌──────────────────┐         ┌──────────────────┐             │
│  │  Storage Service │         │ Metadata Service │             │
│  │  (Port 3000)     │◄───────►│  (Port 4000)     │             │
│  │                  │         │                  │             │
│  │  - File Upload   │         │  - Role Mgmt     │             │
│  │  - Encryption    │         │  - Access Ctrl   │             │
│  │  - Decryption    │         │  - File Metadata │             │
│  │  - Hash Calc     │         │  - Access Logs   │             │
│  └──────────────────┘         └──────────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   MongoDB    │  │   Ganache    │  │  File System  │         │
│  │   Database   │  │  Blockchain  │  │  (Encrypted)  │         │
│  │              │  │              │  │              │         │
│  │  - Metadata  │  │  - File Hash │  │  - .enc files│         │
│  │  - Ledger    │  │  - Image Hash│  │  - .iv files │         │
│  │  - Roles     │  │  - Timestamp │  │              │         │
│  │  - Logs      │  │  - Owner     │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Detailed Workflow

#### 3.2.1 User Authentication Flow

```
1. User opens application
2. Frontend checks for MetaMask extension
3. User clicks "Connect MetaMask"
4. MetaMask prompts for account selection
5. User selects account
6. Frontend stores wallet address in context
7. User is authenticated and can access protected pages
```

#### 3.2.2 File Upload Flow

```
Step 1: User Selection
├── User navigates to Upload page
├── Selects file from local system
├── Enters metadata (label, document type, description)
├── Sets access type (Public/Private/Role-Based)
└── If Role-Based: Selects allowed roles

Step 2: Frontend Processing
├── Validates file selection
├── Validates sender address
├── Prepares FormData with file and metadata
└── Sends POST request to Storage Service

Step 3: Storage Service Processing
├── Receives file and metadata
├── Calculates SHA-256 hash of file (BEFORE encryption)
├── Encrypts file using AES-256-CBC
│   ├── Generates random IV (Initialization Vector)
│   ├── Encrypts file buffer
│   └── Returns encrypted data + IV
├── Generates unique fileId (timestamp_filename)
├── Stores encrypted file (.enc) and IV (.iv) locally
└── Sends metadata to Metadata Service

Step 4: Metadata Service Processing
├── Receives file metadata
├── Creates/Updates FileMetadata document
│   ├── fileId, dataLocation, ownerAddress
│   ├── receiverAddress (if provided)
│   ├── accessType, allowedRoles
│   ├── fileHash, imageHash
│   ├── documentType, description
│   └── timestamps
├── Creates/Updates FileLedger entry
│   └── Immutable record of transaction
└── Returns success response

Step 5: Blockchain Storage
├── Storage Service calls Smart Contract
├── Stores minimal metadata on-chain
│   ├── fileId
│   ├── fileHash (for integrity verification)
│   ├── imageHash (if provided)
│   ├── timestamp
│   └── owner address
└── Transaction mined and confirmed

Step 6: Response
├── Storage Service returns success
├── Frontend displays success message
└── User redirected to Dashboard
```

#### 3.2.3 File Access Flow

```
Step 1: User Requests File
├── User clicks Download button
├── Frontend checks canDownloadFile()
│   ├── Checks if user is owner/receiver
│   ├── Checks if file is public
│   └── If role-based: Checks if user has required role
└── If allowed: Sends GET request with user address

Step 2: Storage Service Validation
├── Receives fileId and requester address
├── Fetches file metadata from Metadata Service
├── Validates access permissions
│   ├── Owner: Always allowed
│   ├── Receiver: Always allowed
│   ├── Public: Anyone allowed
│   └── Role-Based: Checks user roles
├── If denied: Returns 403 with error message
└── If allowed: Proceeds to retrieval

Step 3: File Retrieval
├── Reads encrypted file (.enc) from disk
├── Reads IV (.iv) from disk
├── Decrypts file using AES-256-CBC
└── Calculates hash of decrypted file (for verification)

Step 4: Access Logging
├── Logs access attempt to AccessLog collection
│   ├── fileId
│   ├── accessedBy (wallet address)
│   ├── accessType (download/view/verify)
│   ├── fileHash (at time of access)
│   ├── timestamp
│   └── success status
└── Returns file to user

Step 5: File Delivery
├── Sets appropriate HTTP headers
│   ├── Content-Type (based on file extension)
│   ├── Content-Disposition (with original filename)
│   └── Content-Length
├── Sends decrypted file to frontend
└── Frontend triggers browser download
```

#### 3.2.4 Role-Based Access Control Flow

```
Step 1: Authority Registration
├── User (government/authority) connects wallet
├── Navigates to Admin page
├── Registers as Authority
│   ├── Provides authority name
│   ├── Provides authority type
│   └── Wallet address stored as Authority
└── Authority can now create roles

Step 2: Role Creation
├── Authority navigates to Admin page
├── Creates new role
│   ├── Role name (e.g., "IncomeTaxDept")
│   ├── Description
│   └── Created by (authority address)
└── Role stored in Role collection

Step 3: Role Assignment
├── Authority selects user wallet address
├── Selects role to assign
├── Submits assignment
└── UserRole document created
    ├── walletAddress
    ├── roleName
    ├── assignedBy (authority address)
    └── assignedAt timestamp

Step 4: File Upload with Role-Based Access
├── User uploads file
├── Selects "Role-Based" access type
├── Selects allowed roles (e.g., ["IncomeTaxDept", "FinanceMinistry"])
└── File stored with role restrictions

Step 5: Access Control Enforcement
├── User attempts to download file
├── System checks user's roles
├── Compares user roles with file's allowedRoles
└── Grants/Denies access based on match
```

#### 3.2.5 Document Verification Flow

```
Step 1: User Initiates Verification
├── User navigates to Verify page
├── Selects file from accessible files OR enters fileId manually
├── Uploads the actual document file
└── Frontend calculates SHA-256 hash of uploaded file

Step 2: Hash Comparison
├── Frontend sends fileId and calculated hash to backend
├── Backend fetches stored hash from metadata
├── Compares calculated hash with stored hash
└── Returns verification result

Step 3: Verification Result
├── If hashes match:
│   ├── Document is authentic
│   ├── No tampering detected
│   └── Non-repudiation proof provided
└── If hashes don't match:
    ├── Document may have been tampered with
    ├── Or different file uploaded
    └── Integrity compromised
```

### 3.3 Data Flow Diagrams

#### 3.3.1 Upload Data Flow
```
User → Frontend → Storage Service → Encryption → File System
                              ↓
                         Metadata Service → MongoDB
                              ↓
                         Blockchain → Ganache
```

#### 3.3.2 Download Data Flow
```
User → Frontend → Storage Service → Access Check → Metadata Service
                                                      ↓
                                              Role Verification
                                                      ↓
                                              File System → Decryption
                                                      ↓
                                              Access Logging → MongoDB
                                                      ↓
                                              File → Frontend → User
```

#### 3.3.3 Role-Based Access Flow
```
User Request → Storage Service → Metadata Service → Get User Roles
                                                      ↓
                                              Compare with Allowed Roles
                                                      ↓
                                              Grant/Deny Access
```

---

## 4. Features

### 4.1 Authentication & Authorization

#### 4.1.1 MetaMask Wallet Integration
- **Wallet Connection**: Seamless connection to MetaMask browser extension
- **Account Selection**: Users can switch between multiple accounts
- **Auto-Reconnect**: Automatically reconnects on page reload if previously connected
- **Account Change Detection**: Listens for account changes and updates UI accordingly
- **Chain Change Detection**: Handles network switches gracefully

#### 4.1.2 Authority Management
- **Authority Registration**: Government entities can register as authorities
- **Authority Verification**: System verifies authority status before allowing role creation
- **Authority List**: View all registered authorities in the system

### 4.2 Role-Based Access Control (RBAC)

#### 4.2.1 Role Management
- **Role Creation**: Authorities can create custom roles (e.g., "IncomeTaxDept", "FinanceMinistry")
- **Role Description**: Each role can have a descriptive name and description
- **Role Activation/Deactivation**: Roles can be activated or deactivated as needed
- **Role Listing**: View all active roles in the system

#### 4.2.2 User Role Assignment
- **Role Assignment**: Authorities assign roles to specific wallet addresses
- **Role Revocation**: Authorities can remove roles from users
- **User Role Query**: View all roles assigned to a specific user
- **Role User Query**: View all users with a specific role

#### 4.2.3 Access Control Types
- **Public Access**: Files visible and downloadable by anyone
- **Private Access**: Files accessible only to owner and receiver
- **Role-Based Access**: Files accessible only to users with specific roles
- **Hybrid Access**: Support for complex access scenarios

### 4.3 File Management

#### 4.3.1 File Upload
- **Multiple File Types**: Supports all file types (PDF, images, documents, etc.)
- **File Encryption**: Automatic AES-256-CBC encryption before storage
- **Hash Calculation**: SHA-256 hash calculated for integrity verification
- **Metadata Capture**: Stores file name, size, MIME type, upload date
- **Document Classification**: Optional document type and description fields

#### 4.3.2 File Storage
- **Local Storage**: Encrypted files stored on server filesystem
- **IPFS Support**: Optional integration with IPFS for distributed storage
- **Encryption**: Files encrypted with unique IV for each file
- **Secure Storage**: Separate storage for encrypted files (.enc) and IVs (.iv)

#### 4.3.3 File Retrieval
- **Access Control Enforcement**: Validates permissions before allowing download
- **Automatic Decryption**: Files decrypted on-the-fly during download
- **Original Filename Preservation**: Downloads use original filename
- **Content-Type Detection**: Proper MIME types set for browser handling

#### 4.3.4 File Listing
- **User Files Dashboard**: Shows all files user has access to
  - Files user uploaded (as sender)
  - Files sent to user (as receiver)
  - Files accessible via roles
  - Public files
- **Public Files Browser**: Browse all publicly available files
- **File Filtering**: Filter by access type, document type, date
- **File Search**: Search files by name, label, or document type

### 4.4 Document Integrity & Non-Repudiation

#### 4.4.1 Hash-Based Verification
- **File Hash Storage**: SHA-256 hash stored on blockchain and in database
- **Image Hash Support**: Separate hash for image previews/thumbnails
- **Hash Verification**: Compare uploaded file hash with stored hash
- **Tamper Detection**: Any modification to file changes hash, detected immediately

#### 4.4.2 Blockchain Integration
- **On-Chain Metadata**: Minimal metadata stored on blockchain
  - File ID
  - File hash
  - Image hash (if applicable)
  - Timestamp
  - Owner address
- **Immutable Records**: Blockchain provides tamper-proof record
- **Transaction Tracking**: All file uploads create blockchain transactions

#### 4.4.3 Access Logging
- **Comprehensive Logging**: Every access attempt logged
  - File ID
  - User wallet address
  - Access type (view/download/verify)
  - Timestamp
  - IP address
  - User agent
  - File hash at time of access
  - Success/failure status
- **Audit Trail**: Complete history of who accessed what and when
- **Non-Repudiation Proof**: Cryptographic proof of document receipt and access

### 4.5 User Interface Features

#### 4.5.1 Dashboard
- **File List View**: Table view of all accessible files
- **File Details**: Shows filename, role, label, privacy, upload date
- **Download Control**: Download button only shown if user has access
- **Role Display**: Shows user's role for each file (Sender/Receiver/Role-based)
- **Address Display**: Shows sender/receiver addresses for shared files

#### 4.5.2 Upload Interface
- **File Selection**: Standard file picker
- **Metadata Input**: Label, document type, description fields
- **Access Type Selection**: Radio buttons for Public/Private/Role-Based
- **Role Selection**: Multi-select checkboxes for role-based files
- **Sender Address**: Auto-filled with connected wallet address
- **Receiver Address**: Optional field for sending files to specific users
- **Upload Progress**: Visual feedback during upload

#### 4.5.3 Public Files Browser
- **All Public Files**: Automatically loads all public files
- **File Information**: Shows sender address, receiver address (if any), document type
- **Download Access**: Download button for accessible files
- **Refresh Functionality**: Manual refresh to reload file list

#### 4.5.4 Document Verification
- **File Selection**: Dropdown of accessible files OR manual fileId entry
- **File Upload**: Upload actual document for hash comparison
- **Hash Calculation**: Automatic SHA-256 hash calculation
- **Verification Result**: Clear indication of authenticity
- **Access Log Viewer**: View access history for files

#### 4.5.5 Admin Panel
- **Authority Registration**: Register as authority
- **Role Creation**: Create new roles with descriptions
- **Role Assignment**: Assign roles to wallet addresses
- **Role Management**: View and manage existing roles
- **User Management**: View users with specific roles

### 4.6 Security Features

#### 4.6.1 Encryption
- **AES-256-CBC**: Industry-standard encryption algorithm
- **Unique IV**: Each file encrypted with unique initialization vector
- **Key Management**: Encryption key stored securely (should be in environment variable in production)

#### 4.6.2 Access Control
- **Multi-Level Security**: Public, Private, and Role-Based access
- **Permission Validation**: Server-side validation of all access requests
- **Role Verification**: Real-time role checking for role-based files
- **Address Verification**: Wallet address verified for all operations

#### 4.6.3 Audit & Compliance
- **Complete Audit Trail**: All operations logged
- **Access History**: Track who accessed what and when
- **Failed Attempt Logging**: Log failed access attempts for security monitoring
- **Non-Repudiation**: Cryptographic proof of all transactions

---

## 5. Use Cases

### 5.1 Government Tender Management

#### Scenario
A government department initiates a public tender process and needs to manage documents with different access levels.

#### Actors
- Government Authority (Tender Initiator)
- Income Tax Department Officials
- Finance Ministry Officials
- General Public
- Businesses (Tender Applicants)

#### Flow
1. **Authority Setup**
   - Government registers as Authority
   - Creates roles: "IncomeTaxDept", "FinanceMinistry", "TenderCommittee"

2. **Role Assignment**
   - Assigns "IncomeTaxDept" role to tax department officials
   - Assigns "FinanceMinistry" role to finance ministry officials
   - Assigns "TenderCommittee" role to committee members

3. **Document Upload**
   - **Tender Announcement**: Uploaded as Public (visible to all)
   - **Transaction Details**: Uploaded as Role-Based (only IncomeTaxDept and FinanceMinistry)
   - **Internal Notes**: Uploaded as Private (only sender and receiver)

4. **Access Scenarios**
   - **Public**: Anyone can view and download tender announcement
   - **Role-Based**: Only officials with IncomeTaxDept or FinanceMinistry roles can access transaction details
   - **Private**: Only sender and receiver can access internal notes

5. **Verification**
   - Any party can verify tender announcement authenticity
   - Officials can verify transaction details haven't been tampered with

6. **Audit**
   - Complete log of who accessed transaction details
   - Non-repudiation proof for all document access

### 5.2 Legal Document Sharing

#### Scenario
A law firm needs to share confidential documents with clients and other parties while maintaining strict access control.

#### Actors
- Law Firm (Authority)
- Clients
- Opposing Counsel
- Court Officials

#### Flow
1. **Authority Setup**
   - Law firm registers as Authority
   - Creates roles: "Client", "OpposingCounsel", "CourtOfficial"

2. **Document Classification**
   - **Public Filings**: Court documents marked as Public
   - **Client Communications**: Marked as Private (only law firm and client)
   - **Sensitive Evidence**: Marked as Role-Based (only specific roles)

3. **Secure Sharing**
   - Documents encrypted before storage
   - Access controlled by roles
   - All access logged for legal compliance

4. **Verification**
   - Parties can verify document integrity
   - Non-repudiation proof for document receipt

### 5.3 Corporate Contract Management

#### Scenario
A corporation manages contracts with different departments having different access levels.

#### Actors
- HR Department
- Finance Department
- Legal Department
- External Partners

#### Flow
1. **Role Creation**
   - Creates roles: "HRDept", "FinanceDept", "LegalDept", "ExternalPartner"

2. **Contract Storage**
   - **Employment Contracts**: Role-Based (HRDept, LegalDept)
   - **Financial Agreements**: Role-Based (FinanceDept, LegalDept)
   - **Partnership Agreements**: Role-Based (LegalDept, ExternalPartner)

3. **Access Management**
   - Each department sees only relevant contracts
   - Legal department has access to all contracts
   - External partners see only their agreements

4. **Audit Compliance**
   - Complete audit trail for compliance
   - Document integrity verification
   - Non-repudiation for all parties

### 5.4 Healthcare Record Management

#### Scenario
A hospital system manages patient records with role-based access for different medical staff.

#### Actors
- Hospital Administration (Authority)
- Doctors
- Nurses
- Lab Technicians
- Patients

#### Flow
1. **Role Setup**
   - Creates roles: "Doctor", "Nurse", "LabTech", "Patient"

2. **Record Classification**
   - **General Records**: Role-Based (Doctor, Nurse)
   - **Lab Results**: Role-Based (Doctor, LabTech)
   - **Patient Information**: Role-Based (Doctor, Patient)

3. **Secure Access**
   - Medical staff access based on roles
   - Patients access their own records
   - All access logged for HIPAA compliance

4. **Integrity Verification**
   - Verify records haven't been tampered with
   - Non-repudiation for medical decisions

### 5.5 Educational Institution Document Management

#### Scenario
A university manages academic records, research documents, and administrative files.

#### Actors
- University Administration (Authority)
- Faculty
- Students
- Research Staff
- External Reviewers

#### Flow
1. **Role Creation**
   - Creates roles: "Faculty", "Student", "ResearchStaff", "ExternalReviewer"

2. **Document Types**
   - **Academic Records**: Role-Based (Faculty, Student)
   - **Research Papers**: Role-Based (Faculty, ResearchStaff, ExternalReviewer)
   - **Administrative Documents**: Role-Based (Faculty, Administration)

3. **Access Control**
   - Students access their own records
   - Faculty access relevant academic records
   - Research staff access research documents
   - External reviewers access only assigned papers

4. **Verification & Audit**
   - Verify academic record integrity
   - Audit trail for grade changes
   - Non-repudiation for academic decisions

---

## 6. Software Requirements

### 6.1 Development Environment

#### 6.1.1 Operating System
- **Windows 10/11** (Current development environment)
- **macOS 10.15+** (Alternative)
- **Linux (Ubuntu 20.04+)** (Alternative)

#### 6.1.2 Node.js
- **Version**: 18.x or higher
- **Purpose**: Runtime for backend services
- **Installation**: Download from nodejs.org
- **Verification**: `node --version`

#### 6.1.3 Package Manager
- **npm**: Comes with Node.js
- **Version**: 9.x or higher
- **Verification**: `npm --version`

### 6.2 Database

#### 6.2.1 MongoDB
- **Version**: 6.0 or higher
- **Purpose**: Store file metadata, roles, access logs
- **Installation Options**:
  - **MongoDB Community Server**: Local installation
  - **MongoDB Atlas**: Cloud-hosted (alternative)
- **Default Port**: 27017
- **Connection String**: `mongodb://127.0.0.1:27017/metadata_db`

### 6.3 Blockchain

#### 6.3.1 Ganache
- **Version**: Latest stable
- **Purpose**: Local Ethereum blockchain for development
- **Installation Options**:
  - **Ganache CLI**: `npm install -g ganache`
  - **Ganache Desktop**: GUI application
- **Default Port**: 8545
- **Default URL**: `http://127.0.0.1:8545`

#### 6.3.2 Truffle (Optional)
- **Version**: 5.x or higher
- **Purpose**: Smart contract compilation and deployment
- **Installation**: `npm install -g truffle`
- **Usage**: Contract development and testing

### 6.4 Browser Requirements

#### 6.4.1 Supported Browsers
- **Google Chrome**: Version 90+
- **Mozilla Firefox**: Version 88+
- **Microsoft Edge**: Version 90+
- **Brave Browser**: Version 1.20+

#### 6.4.2 Browser Extensions
- **MetaMask**: Required for wallet connection
  - Version: 10.0 or higher
  - Installation: Chrome Web Store / Firefox Add-ons
  - Configuration: Connect to local Ganache network

### 6.5 Development Tools

#### 6.5.1 Code Editor
- **Visual Studio Code**: Recommended
- **Extensions**:
  - ESLint
  - Prettier
  - Solidity (for smart contracts)
  - MongoDB for VS Code

#### 6.5.2 Version Control
- **Git**: Version 2.30 or higher
- **GitHub/GitLab**: For repository hosting

#### 6.5.3 API Testing
- **Postman**: For API endpoint testing
- **cURL**: Command-line alternative
- **Browser DevTools**: For frontend debugging

### 6.6 Runtime Dependencies

#### 6.6.1 Frontend Dependencies
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.26.2",
  "ethers": "^6.0.0",
  "@radix-ui/react-label": "^2.1.3",
  "@radix-ui/react-slot": "^1.2.0",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "lucide-react": "^0.488.0",
  "react-hook-form": "^7.55.0",
  "tailwind-merge": "^3.2.0",
  "tailwindcss-animate": "^1.0.7",
  "zod": "^3.24.2"
}
```

#### 6.6.2 Storage Service Dependencies
```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "multer": "^1.4.5-lts.1",
  "axios": "^1.6.0",
  "ethers": "^6.0.0",
  "ipfs-http-client": "^60.0.1"
}
```

#### 6.6.3 Metadata Service Dependencies
```json
{
  "express": "^5.1.0",
  "cors": "^2.8.5",
  "mongoose": "^8.13.2"
}
```

### 6.7 Environment Variables

#### 6.7.1 Storage Service
```env
PORT=3000
METADATA_SERVICE_URL=http://localhost:4000
IPFS_ENABLED=false
GANACHE_URL=http://127.0.0.1:8545
PRIVATE_KEY=<Ganache account private key>
CONTRACT_ADDRESS=<Deployed contract address>
ENCRYPTION_KEY=<32-byte encryption key>
```

#### 6.7.2 Metadata Service
```env
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/metadata_db
```

#### 6.7.3 Frontend
```env
VITE_STORAGE_SERVICE_URL=http://localhost:3000
VITE_METADATA_SERVICE_URL=http://localhost:4000
```

---

## 7. Hardware Requirements

### 7.1 Minimum Requirements

#### 7.1.1 Development Machine
- **Processor**: Intel Core i5 (4th generation) or AMD equivalent
- **RAM**: 8 GB
- **Storage**: 20 GB free space
  - Node.js and dependencies: ~2 GB
  - MongoDB: ~3 GB
  - Project files: ~1 GB
  - Encrypted file storage: Variable (depends on usage)
- **Network**: Internet connection for package installation

#### 7.1.2 Server (Production)
- **Processor**: 4 CPU cores
- **RAM**: 16 GB
- **Storage**: 100 GB SSD
  - Application: ~5 GB
  - Database: ~20 GB
  - File storage: ~75 GB (scalable)
- **Network**: 100 Mbps connection

### 7.2 Recommended Requirements

#### 7.2.1 Development Machine
- **Processor**: Intel Core i7 or AMD Ryzen 7
- **RAM**: 16 GB
- **Storage**: 50 GB free space (SSD recommended)
- **Network**: High-speed internet

#### 7.2.2 Server (Production)
- **Processor**: 8 CPU cores
- **RAM**: 32 GB
- **Storage**: 500 GB SSD with backup
- **Network**: 1 Gbps connection
- **Backup**: Automated daily backups

### 7.3 Blockchain Node Requirements

#### 7.3.1 Ganache (Development)
- **RAM**: 2 GB
- **Storage**: 1 GB
- **CPU**: Minimal (single core sufficient)

#### 7.3.2 Ethereum Node (Production)
- **RAM**: 8 GB minimum
- **Storage**: 500 GB SSD (grows with blockchain size)
- **CPU**: 4 cores
- **Network**: High bandwidth for syncing

### 7.4 Database Requirements

#### 7.4.1 MongoDB (Development)
- **RAM**: 2 GB
- **Storage**: 10 GB
- **CPU**: 2 cores

#### 7.4.2 MongoDB (Production)
- **RAM**: 16 GB
- **Storage**: 100 GB+ (depends on data volume)
- **CPU**: 4 cores
- **Replication**: Recommended for high availability

### 7.5 Network Requirements

#### 7.5.1 Development
- **Local Network**: All services run on localhost
- **Ports Required**:
  - 3000: Storage Service
  - 4000: Metadata Service
  - 5173: Frontend (Vite dev server)
  - 8545: Ganache
  - 27017: MongoDB

#### 7.5.2 Production
- **Public IP**: Required for external access
- **SSL/TLS**: HTTPS certificates (Let's Encrypt recommended)
- **Firewall**: Configure to allow only necessary ports
- **Load Balancer**: Recommended for high traffic

---

## 8. System Requirements Summary

### 8.1 Quick Setup Checklist

- [ ] Node.js 18+ installed
- [ ] MongoDB installed and running
- [ ] Ganache installed and running
- [ ] MetaMask browser extension installed
- [ ] Git installed (for version control)
- [ ] Code editor (VS Code recommended)
- [ ] All npm packages installed in each service directory
- [ ] Smart contract deployed to Ganache
- [ ] Environment variables configured
- [ ] All services running on correct ports

### 8.2 Service Ports

| Service | Port | Protocol |
|---------|------|----------|
| Frontend | 5173 | HTTP |
| Storage Service | 3000 | HTTP |
| Metadata Service | 4000 | HTTP |
| Ganache | 8545 | HTTP |
| MongoDB | 27017 | TCP |

### 8.3 File Structure

```
BlockStore/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   ├── provider/      # Context providers
│   │   └── configs/       # Configuration files
│   └── package.json
├── storage-service/       # File storage and encryption service
│   ├── app.js            # Main server file
│   ├── blockchain.js     # Blockchain interaction
│   ├── uploads/          # Encrypted file storage
│   └── package.json
├── metadata-service/     # Metadata and access control service
│   ├── app.js            # Main server file
│   ├── models/           # MongoDB models
│   │   ├── FileMetadata.js
│   │   ├── FileLedger.js
│   │   ├── Role.js
│   │   ├── Authority.js
│   │   ├── UserRole.js
│   │   └── AccessLog.js
│   └── package.json
├── file-metadata-chain/  # Smart contract
│   ├── contracts/        # Solidity contracts
│   ├── migrations/       # Deployment scripts
│   └── truffle-config.js
└── README.md
```

---

## 9. Conclusion

This blockchain-based decentralized storage system provides a comprehensive solution for secure document management with role-based access control and non-repudiation features. It addresses critical needs in government, legal, and corporate environments where document security, access control, and audit trails are paramount.

The system successfully combines:
- **Decentralization** through blockchain technology
- **Security** through encryption and access control
- **Transparency** through immutable audit trails
- **Flexibility** through role-based permissions
- **Integrity** through cryptographic hashing
- **Non-Repudiation** through comprehensive logging

This makes it suitable for legal documentation, government processes, corporate contracts, and any scenario requiring secure, auditable document management.

