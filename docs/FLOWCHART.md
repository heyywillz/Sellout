# Sellout — System Flowchart

## 1. High-Level Business Flow (For Investors & Supervisors)

This flowchart illustrates the core business logic and user journey of the Sellout platform, designed to give stakeholders a clear understanding of exactly how value is exchanged and how the platform is moderated.

```mermaid
flowchart TD
    %% Define Styles
    classDef default fill:#f9f9f9,stroke:#333,stroke-width:1px,color:#000;
    classDef startNode fill:#e2f0d9,stroke:#548235,stroke-width:2px,color:#000,font-weight:bold;
    classDef actionNode fill:#dae8fc,stroke:#6c8ebf,stroke-width:1px,color:#000;
    classDef adminNode fill:#f8cecc,stroke:#b85450,stroke-width:2px,color:#000,font-weight:bold;
    classDef decisionNode fill:#fff2cc,stroke:#d6b656,stroke-width:1px,color:#000;
    classDef dataNode fill:#e1d5e7,stroke:#9673a6,stroke-width:1px,color:#000;
    
    %% Entry Points
    Guest["Guest Visitor"]:::startNode
    AuthUser["Authenticated Student"]:::startNode
    Supervisor["Platform Admin / Supervisor"]:::adminNode

    %% Initial Interaction
    Guest -->|"Visits Site"| Browse["Homepage: Browse & Filter Products"]:::actionNode
    Browse -->|"Attempts to interact (Buy/Sell)"| CheckLogin{"Is User Logged In?"}:::decisionNode
    CheckLogin -->|"No"| Login["Login / Register (Email or Google)"]:::actionNode
    CheckLogin -->|"Yes"| AuthUser
    Login --> AuthUser
    
    %% Main Dual-Flow for Users
    AuthUser -->|"Wants to Buy"| BuyerJourney
    AuthUser -->|"Wants to Sell"| SellerJourney
    
    %% Buyer Journey Subgraph
    subgraph BuyerJourney ["Buyer Journey (Purchasing Flow)"]
        Search["Search & View Product Details"]:::actionNode
        Contact["Click 'Contact Seller'"]:::actionNode
        WhatsApp["Redirected to WhatsApp for Negotiation"]:::actionNode
        Transaction["Real-World Transaction on Campus"]:::actionNode
        Review["Leave Rating & Review for Seller"]:::actionNode
        
        Search --> Contact
        Search -.->|"Optional"| Favorite["Save Item to Wishlist"]:::actionNode
        Contact --> WhatsApp
        WhatsApp --> Transaction
        Transaction --> Review
    end
    
    %% Seller Journey Subgraph
    subgraph SellerJourney ["Seller Journey (Vendor Flow)"]
        Profile["Complete Profile"]:::actionNode
        Verify["Submit Student ID for Verification"]:::actionNode
        UploadProduct["Create New Listing (Price, Category, Images)"]:::actionNode
        ManageListings["Manage Listings (Edit / Mark as Sold)"]:::actionNode
        
        Profile --> UploadProduct
        Profile -.->|"Optional but encouraged"| Verify
        UploadProduct --> ManageListings
    end
    
    %% Data Storage Indicators
    UploadProduct -.->|"Images saved to"| Cloudinary[("Cloudinary API")]:::dataNode
    UploadProduct -.->|"Data saved to"| DB[("Aiven MySQL Database")]:::dataNode
    
    %% Admin Workflow Subgraph
    subgraph AdminOversight ["Admin Oversight & Moderation"]
        Dashboard["Admin Dashboard Overview"]:::adminNode
        VerifyIDs["Review & Approve Student IDs"]:::adminNode
        ModProducts["Moderate & Remove Flagged Products"]:::adminNode
        Analytics["Monitor Campus Analytics & Growth Metrics"]:::adminNode
        
        Dashboard --> VerifyIDs
        Dashboard --> ModProducts
        Dashboard --> Analytics
    end
    
    %% Connect User actions to Admin oversight
    Supervisor --> Dashboard
    Verify -.->|"Pending Approval"| VerifyIDs
    Review -.->|"Builds Platform Trust"| Analytics
    Search -.->|"User Flags Inappropriate Item"| ModProducts
```

### Key Takeaways for Investors & Supervisors:

1. **Frictionless Onboarding**: Guests can immediately begin browsing products, creating a "hook" before they are asked to create an account.
2. **Dual-Sided Marketplace**: Every authenticated student acts as both a potential buyer and a potential seller within their specific campus.
3. **Decentralized Transactions**: By pushing communication directly to WhatsApp, the platform avoids the heavy infrastructure costs of real-time chat while using a tool students already heavily rely on.
4. **Trust & Safety Mechanics**: A built-in 5-star rating system holds sellers accountable, and the Student ID Verification pipeline explicitly builds trust in the seller's legitimacy.
5. **Supervisor Control**: The integrated Admin panel provides full oversight over the health of the platform, the validity of its users, and the appropriateness of the marketplace listings.

---

## 2. Overall System Architecture

```mermaid
graph TB
    subgraph Client[" Frontend (Port 3000)"]
        HTML["HTML Pages"]
        CSS["Tailwind CSS + Custom CSS"]
        JS["Vanilla JavaScript Modules"]
    end

    subgraph Server[" Backend (Port 5000)"]
        Express["Express.js Server"]
        MW["Middleware Layer"]
        Controllers["Controllers"]
        Routes["API Routes"]
    end

    subgraph DB[" Database"]
        MySQL["MySQL 8.0"]
    end

    subgraph Cloud[" Cloud Services"]
        Cloudinary["Cloudinary CDN"]
        Google["Google OAuth 2.0"]
    end

    HTML --> JS
    JS -->|"fetch API"| Routes
    Routes --> MW
    MW --> Controllers
    Controllers --> MySQL
    Controllers --> Cloudinary
    JS -->|"Google Sign-In"| Google
    Google -->|"ID Token"| Controllers
```

## 2. User Authentication Flow

```mermaid
flowchart TD
    Start([User visits Sellout]) --> HasAccount{Has an account?}

    HasAccount -->|No| Register["Go to Register Page"]
    HasAccount -->|Yes| Login["Go to Login Page"]

    Register --> RegMethod{Registration method?}
    RegMethod -->|Email/Password| RegForm["Fill registration form\n(Name, Email, Password, Campus, WhatsApp)"]
    RegMethod -->|Google| GoogleReg["Click Google Sign-In"]

    RegForm --> Validate["Backend validates input\n(express-validator)"]
    Validate -->|Invalid| RegError["Show validation errors"]
    RegError --> RegForm

    Validate -->|Valid| HashPW["Hash password\n(bcryptjs)"]
    HashPW --> SaveUser["Save user to MySQL"]
    SaveUser --> GenToken["Generate JWT token"]

    GoogleReg --> VerifyGoogle["Backend verifies\nGoogle ID token"]
    VerifyGoogle --> CheckExists{User exists?}
    CheckExists -->|No| CreateGoogle["Create new user\n(auth_provider = google)"]
    CheckExists -->|Yes| FetchUser["Fetch existing user"]
    CreateGoogle --> GenToken
    FetchUser --> GenToken

    Login --> LoginMethod{Login method?}
    LoginMethod -->|Email/Password| LoginForm["Enter email & password"]
    LoginMethod -->|Google| GoogleLogin["Click Google Sign-In"]

    LoginForm --> FindUser["Query user by email"]
    FindUser --> CompPW["Compare password hash\n(bcryptjs)"]
    CompPW -->|Mismatch| LoginErr["Show error:\nInvalid credentials"]
    LoginErr --> LoginForm
    CompPW -->|Match| GenToken

    GoogleLogin --> VerifyGoogle

    GenToken --> StoreToken["Store JWT in localStorage"]
    StoreToken --> Dashboard([Redirect to Homepage ])
```

## 3. Product Listing Flow

```mermaid
flowchart TD
    Browse([User browses homepage]) --> LoadProducts["Fetch products from API\nGET /api/products"]

    LoadProducts --> Filters{Apply filters?}
    Filters -->|Yes| SetFilters["Set query params:\n• category\n• campus\n• condition\n• price range\n• search keyword\n• sort order"]
    SetFilters --> LoadProducts

    Filters -->|No| RenderGrid["Render product cards\nin responsive grid"]

    RenderGrid --> UserAction{User action?}

    UserAction -->|Click product| ViewProduct["Navigate to\nproduct-details.html"]
    UserAction -->|Click | ToggleFav["POST /api/favorites/:id\nToggle favorite"]
    UserAction -->|Click category| FilterCat["Filter by category"]
    UserAction -->|Type in search| SearchProducts["Full-text search\nGET /api/products?search=..."]
    UserAction -->|Next page| Paginate["Load next page\nGET /api/products?page=2"]

    FilterCat --> LoadProducts
    SearchProducts --> RenderGrid
    Paginate --> RenderGrid
    ToggleFav --> HeartAnim["Animate heart icon"]

    ViewProduct --> ProductPage["Show product details:\n• Image gallery\n• Title, description, price\n• Seller info\n• Reviews"]

    ProductPage --> BuyerAction{Buyer action?}
    BuyerAction -->|Contact Seller| WhatsApp["Open WhatsApp with\npre-filled message"]
    BuyerAction -->|Favorite| ToggleFav
    BuyerAction -->|Leave Review| ReviewFlow["Open review form"]
    BuyerAction -->|View Seller| SellerPage["Navigate to\nseller.html"]
```

## 4. Product Upload Flow

```mermaid
flowchart TD
    Start([Seller clicks 'Sell']) --> AuthCheck{Logged in?}

    AuthCheck -->|No| Redirect["Redirect to login page"]
    AuthCheck -->|Yes| UploadForm["Show upload form"]

    UploadForm --> FillForm["Seller fills:\n• Title\n• Description\n• Category\n• Condition\n• Price\n• Campus"]

    FillForm --> AddImages["Upload images\n(drag & drop or browse)\nUp to 5 images"]

    AddImages --> Submit["Click 'List Item'"]

    Submit --> ValidateInput["Backend validates\nall fields"]
    ValidateInput -->|Invalid| ShowErrors["Show validation errors"]
    ShowErrors --> FillForm

    ValidateInput -->|Valid| UploadCloud["Upload images to\nCloudinary CDN"]
    UploadCloud --> SaveDB["Save product to MySQL\n(title, description, price,\ncategory, campus, image_url)"]
    SaveDB --> SaveExtra["Save additional images\nto product_images table"]
    SaveExtra --> Success["Show success toast\nRedirect to product page"]
    Success --> ProductPage([View new listing ])
```

## 5. Seller Review Flow

```mermaid
flowchart TD
    Start([Buyer views product]) --> ViewSeller["See seller info\n& rating summary"]

    ViewSeller --> HasBought{Wants to leave review?}

    HasBought -->|Yes| AuthCheck{Logged in?}
    AuthCheck -->|No| LoginFirst["Redirect to login"]
    AuthCheck -->|Yes| CheckReview{Already reviewed\nthis product?}

    CheckReview -->|Yes| ShowExisting["Show existing review\nwith delete option"]
    CheckReview -->|No| ReviewForm["Show review form:\n• Star rating (1-5)\n• Comment text"]

    ReviewForm --> SubmitReview["POST /api/reviews\n{product_id, rating, comment}"]

    SubmitReview --> SaveReview["Save to reviews table\nwith reviewer_id & seller_id"]
    SaveReview --> UpdateDisplay["Update seller rating\nsummary display"]
    UpdateDisplay --> Done([Review posted ])

    ShowExisting --> DeleteReview["Click delete"]
    DeleteReview --> ConfirmDelete{Confirm?}
    ConfirmDelete -->|Yes| RemoveReview["DELETE /api/reviews/:id"]
    RemoveReview --> UpdateDisplay
    ConfirmDelete -->|No| ShowExisting
```

## 6. Student Verification Flow

```mermaid
flowchart TD
    Start([User wants verification]) --> GoProfile["Go to Profile page"]
    GoProfile --> ClickVerify["Click 'Verify Student Status'"]

    ClickVerify --> VerifyForm["Fill verification form:\n• University name\n• Student ID number\n• Upload student ID image"]

    VerifyForm --> SubmitVerify["POST /api/verification/submit\n(multipart/form-data)"]

    SubmitVerify --> UploadID["Upload ID image\nto Cloudinary"]
    UploadID --> SaveVerification["Save to\nstudent_verifications table\nstatus = 'pending'"]
    SaveVerification --> Pending["Show status:\n Pending Review"]

    Pending --> AdminReview["Admin reviews in\nadmin.html dashboard"]

    AdminReview --> Decision{Admin decision?}
    Decision -->|Approve| Approve["PUT /api/admin/verifications/:id\nstatus = 'approved'"]
    Decision -->|Reject| Reject["PUT /api/admin/verifications/:id\nstatus = 'rejected'\n+ rejection_reason"]

    Approve --> UpdateUser["Set user.is_verified\n= 'verified'"]
    UpdateUser --> Badge[" Verified badge\nshown on profile"]

    Reject --> NotifyUser["User sees rejection\nreason on profile"]
    NotifyUser --> CanResubmit["User can resubmit\nwith new documents"]
    CanResubmit --> VerifyForm
```

## 7. Admin Dashboard Flow

```mermaid
flowchart TD
    Start([Admin logs in]) --> CheckAdmin{is_admin = 1?}

    CheckAdmin -->|No| Denied["Access denied\nRedirect to homepage"]
    CheckAdmin -->|Yes| Dashboard["Load Admin Dashboard\n5 Tabs"]

    Dashboard --> LoadStats["GET /api/admin/stats\n+ health metrics"]
    LoadStats --> PendingBadge["Update pending badge\non Verifications tab"]

    LoadStats --> ShowOverview["OVERVIEW TAB:\n• 8 stat cards\n• Health metrics row\n (sell-through, listings/user,\n verification rate, engagement)\n• Category doughnut chart\n• Auth methods pie chart\n• Product status bar chart\n• Growth numbers\n• Animated counters"]

    Dashboard --> TabAction{Switch tab?}
    TabAction -->|Users| UsersTab["USERS TAB:\nGET /api/admin/users\n• Search by name/email\n• Filter: All/Verified/Unverified/Admin\n• Sort: Newest/Oldest/Name/Listings\n• Export CSV button"]
    TabAction -->|Products| ProductsTab["PRODUCTS TAB:\nGET /api/admin/products\n• Search products/sellers\n• Filter: Category/Status\n• Sort: Date/Price/Title\n• Pagination\n• Export CSV"]
    TabAction -->|Verifications| VerifyTab["VERIFICATIONS TAB:\nGET /api/admin/verifications\n• Pending/Approved/Rejected filter\n• Approve/Reject workflow\n• Image preview"]
    TabAction -->|Campus| CampusTab["CAMPUS TAB:\nGET /api/admin/campus-analytics\n• Users by campus bar chart\n• Products by campus stacked bar\n• Campus details table"]

    UsersTab --> ClickUser["Click user name"]
    ClickUser --> UserDrawer["USER DETAIL DRAWER:\nGET /api/admin/users/:id/details\n• Profile photo, name, email\n• Stats: listings, sold, rating, earned\n• Campus, WhatsApp, join date\n• Recent listings with thumbnails\n• Recent reviews with stars\n• Verification info"]

    ProductsTab --> ProductAction{Action?}
    ProductAction -->|View| ViewProduct["Open product-details.html\nin new tab"]
    ProductAction -->|Delete| ConfirmDelete{Confirm delete?}
    ConfirmDelete -->|Yes| DeleteProduct["DELETE /api/admin/products/:id\n• Remove from DB\n• Cleanup Cloudinary images\n• Remove favorites & reviews"]
    DeleteProduct --> RefreshProducts["Refresh product list"]

    VerifyTab --> Decision{Decision?}
    Decision -->|Approve| ApproveUser["Mark as verified\nUpdate user status\nUpdate badge count"]
    Decision -->|Reject| RejectForm["Enter rejection reason"]
    RejectForm --> RejectUser["Mark as rejected\nSave reason"]
    ApproveUser --> RefreshList["Refresh pending list"]
    RejectUser --> RefreshList
```

## 8. Database Entity Relationship

```mermaid
erDiagram
    USERS ||--o{ PRODUCTS : "sells"
    USERS ||--o{ FAVORITES : "saves"
    USERS ||--o{ REVIEWS : "writes"
    USERS ||--o{ REVIEWS : "receives"
    USERS ||--o{ STUDENT_VERIFICATIONS : "submits"
    PRODUCTS ||--o{ FAVORITES : "saved by"
    PRODUCTS ||--o{ REVIEWS : "reviewed on"
    PRODUCTS ||--o{ PRODUCT_IMAGES : "has"

    USERS {
        int id PK
        varchar name
        varchar email UK
        varchar google_id
        enum auth_provider
        varchar password
        varchar campus
        varchar whatsapp
        varchar profile_image
        varchar is_verified
        tinyint is_admin
        timestamp created_at
    }

    PRODUCTS {
        int id PK
        int user_id FK
        varchar title
        text description
        enum category
        enum product_condition
        decimal price
        varchar campus
        varchar image_url
        enum status
        timestamp created_at
    }

    FAVORITES {
        int id PK
        int user_id FK
        int product_id FK
        timestamp created_at
    }

    REVIEWS {
        int id PK
        int reviewer_id FK
        int seller_id FK
        int product_id FK
        tinyint rating
        text comment
        timestamp created_at
    }

    PRODUCT_IMAGES {
        int id PK
        int product_id FK
        varchar image_url
        int display_order
    }

    STUDENT_VERIFICATIONS {
        int id PK
        int user_id FK
        varchar student_id_image_url
        varchar university_name
        varchar student_id_number
        varchar status
        text rejection_reason
        timestamp submitted_at
        timestamp reviewed_at
    }
```
