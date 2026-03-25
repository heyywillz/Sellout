# Sellout Application Flow

This flowchart illustrates the high-level business logic and user journey of the Sellout platform. It is designed to give stakeholders, investors, and supervisors a clear understanding of how users interact with the marketplace and how the platform is moderated.

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

1. **Frictionless Onboarding**: Guests can immediately begin browsing products, creating a "hook" before they are asked to create an account. Google OAuth speeds up registration.
2. **Dual-Sided Marketplace**: Every authenticated student acts as both a potential buyer and a potential seller within their specific campus.
3. **Decentralized Transactions**: By pushing communication directly to WhatsApp, the platform avoids the heavy infrastructure costs of real-time chat while using a tool students already heavily rely on.
4. **Trust & Safety Mechanics**: 
   - A built-in 5-star rating system holds sellers accountable.
   - The Student ID Verification pipeline explicitly builds trust in the seller's legitimacy.
   - Community reporting features allow students to flag bad actors directly to the Admin Dashboard.
5. **Supervisor Control**: The integrated Admin panel provides full oversight over the health of the platform, the validity of its users, and the appropriateness of the marketplace listings.
