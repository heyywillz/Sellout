# PROJECT PROPOSAL

**Project Title:** Design and Implementation of "Sellout" – A Hyper-Local Campus E-Commerce Ecosystem
**Project Type:** Semester Project / Software Engineering Capstone
**Domain:** Web Technology / E-Business Systems

---

## 1.0 Executive Summary

The "Sellout" project proposes the development of a specialized, trust-centric peer-to-peer (P2P) marketplace tailored specifically for the university ecosystem. By leveraging modern web technologies and secure authentication standards, this system addresses the critical inefficiencies of current campus commerce—namely, the fragmentation of sales channels (e.g., informal WhatsApp groups), lack of seller verification, and high transaction friction.

This proposal outlines a robust, scalable web application that facilitates secure, localized trading of textbooks, electronics, fashion items, furniture, and other resale goods. The project is technically feasible, economically viable, and directly enhances the student experience by creating a sustainable circular economy within the campus. By integrating enterprise-grade security features like **Google OAuth 2.0** and a **Student Verification System**, Sellout ensures a higher level of trust and user accountability than existing informal solutions.

---

## 2.0 Background and Problem Statement

### 2.1 The Problem Context
Commerce within university campuses is currently driven by informal, high-friction channels. Students rely heavily on dispersed WhatsApp/Telegram groups and physical notice boards. This structure presents significant challenges:

1.  **Information Volatility**: Listings in chat groups are ephemeral; they are buried under hundreds of messages within minutes, leading to poor visibility and lost sales.
2.  **Trust Deficit**: Transactions on generic platforms (e.g., Jiji, Facebook Marketplace) or anonymous groups expose students to unverified strangers, increasing the risk of fraud or physical insecurity.
3.  **Search Inefficiency**: There is no centralized database to search for specific items (e.g., "MTH 101 Textbook"), forcing buyers to manually query multiple groups.
4.  **Economic Loss**: Due to these friction points, many usable items are discarded rather than resold, and students are forced to purchase new items at premium prices.

### 2.2 Proposed Solution
"Sellout" introduces a **centralized, searchable, and persistent marketplace**. Unlike chat groups, listings on Sellout remain visible until sold. Unlike general classifieds, Sellout is strictly localized to the campus, ensuring that all logistics are handled within a safe, simplified environment (e.g., meeting at the Faculty Building or Student Union).

---

## 3.0 Project Objectives

The primary goal is to deploy a functional, responsive web application that bridges the gap between student buyers and sellers with a focus on usability and security.

### 3.1 Specific Objectives
1.  **To develop a secure, multi-method authentication module** that supports both traditional email/password and **Google OAuth 2.0**, ensuring verified user identities and simplifying the onboarding process.
2.  **To design a persistent inventory system** that allows sellers to Create, Read, Update, and Delete (CRUD) product listings with rich media support.
3.  **To implement an intelligent search algorithm** allowing users to filter items by Category, Price Range, Condition, and Campus Location, with full-text search capability.
4.  **To facilitate secure communication** by integrating a direct-to-WhatsApp API bridge, removing the need for an in-app messaging server while maintaining user convenience.
5.  **To build a comprehensive trust system** incorporating seller ratings, reviews, and a **Student Verification module** where users can submit student ID documentation for admin review.
6.  **To enhance user engagement** through a "Favorites/Wishlist" feature, allowing students to save items for future purchase.
7.  **To support rich media** by enabling multi-image uploads (gallery view) via cloud storage (Cloudinary) for detailed product inspection.
8.  **To optimize system performance** using a non-blocking I/O model (Node.js) to handle concurrent user requests efficiently.
9.  **To implement a comprehensive administrative dashboard** that allows platform administrators to review student verifications, moderate product listings, view detailed user profiles, monitor platform health metrics (sell-through rate, verification rate, engagement), export data to CSV, and manage users — all within a responsive, dark-mode-aware interface.
10. **To implement a dark mode theme** using CSS custom properties and JavaScript, providing a polished, eye-friendly alternative UI with localStorage persistence and adaptive Chart.js chart rendering.

---

## 4.0 Significance and Justification

### 4.1 Technical Justification
This project demonstrates the application of industry-standard **MVC (Model-View-Controller)** architecture. It utilizes a **RESTful API** backend, ensuring the system can be scaled or extended (e.g., to a mobile app) in the future without rewriting server logic. The integration of **OAuth 2.0** demonstrates modern security practices essential for professional software engineering.

### 4.2 Economic & Social Impact
*   **Cost Reduction**: Directly lowers the cost of education tools by making used textbooks and equipment easily accessible.
*   **Waste Reduction**: Promotes a sustainable campus culture by extending the lifecycle of consumer goods (Circular Economy).
*   **Safety**: Localizes transactions to the campus environment and verifies users via Google and student ID verification, significantly reducing the risks associated with off-campus meetups and anonymous trading.

---

## 5.0 Methodology and Technology Stack

The project follows the **Agile Development Methodology**, allowing for iterative development, continuous testing, and rapid deployment of features.

### 5.1 System Architecture
*   **Frontend (Client-Side)**:
    *   **HTML5 & Tailwind CSS**: For a modern, lightweight, and fully responsive User Interface (UI) with a clean white-dominant aesthetic.
    *   **Vanilla JavaScript (ES6+)**: To manage client-side logic, API consumption, and DOM manipulation without the overhead of heavy frameworks.
    *   **Google Fonts (Inter)**: For premium typography.
*   **Backend (Server-Side)**:
    *   **Node.js & Express.js**: Chosen for their high performance and non-blocking architecture, suitable for real-time marketplace activity.
    *   **Google OAuth 2.0**: For secure, password-less authentication.
    *   **Express Rate Limiting**: For API abuse prevention.
*   **Database**:
    *   **MySQL 8.0**: A Relational Database Management System (RDBMS) chosen for its strict data integrity and structured relationships (e.g., linking Products to specific User IDs). All schema definitions are consolidated in a single `schema.sql` file for easy deployment.
*   **Cloud Infrastructure**:
    *   **Cloudinary**: For optimizing and serving product images via Content Delivery Network (CDN).

---

## 6.0 Key Features Summary

| Feature | Description |
|---------|-------------|
| User Authentication | Local email/password + Google OAuth 2.0 |
| Product Management | Full CRUD with multi-image support |
| Search & Filtering | Full-text search, category, condition, campus, price range filters |
| Favorites/Wishlist | Save and manage favorite items |
| Seller Reviews | Star ratings (1-5) with text reviews |
| Student Verification | Submit student ID for admin-reviewed verification |
| Admin Dashboard | 5-tab panel: Overview, Users, Products, Verifications, Campus Analytics |
| Admin Product Moderation | Search, filter, and delete inappropriate product listings |
| Admin User Detail Drawer | Slide-out panel with full user profile, listings, and reviews |
| Platform Health Metrics | Sell-through rate, verification rate, engagement rate, listings/user |
| CSV Data Export | Export users and products data to CSV files |
| Dark Mode | Full dark/light theme toggle with localStorage persistence |
| WhatsApp Integration | Direct buyer-seller communication |
| Responsive Design | Mobile-first, optimized for all screen sizes |

---

## 7.0 Conclusion

The "Sellout" project represents a crucial digital intervention for the university community. It converts a chaotic, informal process into a structured, professional system. By executing this project, we not only solve a tangible problem for thousands of students but also demonstrate high-level competency in modern full-stack software engineering, security implementation, and user experience design.
