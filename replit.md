# The Sustainable Organic Farming - E-commerce Website

## Overview

This is a static e-commerce website for an organic farming business called "The Sustainable Organic Farming". The site showcases premium organic products with a focus on sustainable farming practices. It's built as a single-page application (SPA) with vanilla JavaScript for interactivity and client-side cart management.

## User Preferences

Preferred communication style: Simple, everyday language.
- Website should be called "The Sustainable Organic Farming"
- Featured products should be clickable and navigate to respective product categories
- Use provided logo design from user

## System Architecture

### Frontend Architecture
- **Technology Stack**: Pure HTML5, CSS3, and vanilla JavaScript
- **CSS Framework**: Tailwind CSS for rapid styling and responsive design
- **Icons**: Font Awesome for consistent iconography
- **Structure**: Single-page application with section-based navigation

### Design Philosophy
- Mobile-first responsive design
- Organic color scheme (greens, browns, cream) to reflect the farming theme
- Clean, minimalist interface focused on product showcase
- Accessibility considerations with semantic HTML

## Key Components

### 1. Navigation System
- Sticky navigation bar with brand logo and menu items
- Mobile-responsive hamburger menu for smaller screens
- Smooth section transitions using JavaScript
- Cart toggle button with item counter

### 2. Shopping Cart Management
- **ShoppingCart Class**: Centralized cart functionality
- Local storage persistence for cart items
- Real-time cart count updates
- Cart sidebar with item management
- No backend integration - purely client-side

### 3. Product Display
- Grid-based product layout
- Product cards with images, descriptions, and pricing
- Category-based organization
- Add to cart functionality

### 4. Content Sections
- Home/Hero section
- Products catalog
- About us information
- Contact details
- Each section is toggleable via navigation

## Data Flow

### Client-Side Only Architecture
1. **User Interaction**: User browses products and adds items to cart
2. **Local Storage**: Cart data is stored in browser's local storage
3. **State Management**: ShoppingCart class manages all cart operations
4. **UI Updates**: Real-time updates to cart count and cart sidebar
5. **Persistence**: Cart contents persist across browser sessions

### Cart Operations
- Add items to cart
- Update item quantities
- Remove items from cart
- Calculate totals
- Persist state in local storage

## External Dependencies

### CDN Resources
- **Tailwind CSS 2.2.19**: For styling and responsive design
- **Font Awesome 6.0.0**: For icons and visual elements
- **jQuery 3.6.0**: Used in some sections for DOM manipulation

### Assets
- Custom logo (SVG format)
- Product images
- Custom CSS for organic color scheme

## Deployment Strategy

### Static Hosting
- **Type**: Static website suitable for any web server
- **Requirements**: No server-side processing needed
- **Hosting Options**: Can be deployed on platforms like:
  - GitHub Pages
  - Netlify
  - Vercel
  - Traditional web hosting

### File Structure
- `index.html`: Main application entry point
- `styles.css`: Custom styling and color variables
- `script.js`: JavaScript functionality
- `assets/`: Directory for images and other static assets

### Browser Compatibility
- Modern browsers supporting ES6+ features
- Responsive design for mobile and desktop
- Local storage support required for cart functionality

## Technical Limitations

### Current Constraints
- **No Payment Processing**: Cart is for demonstration purposes
- **No User Accounts**: No authentication or user management
- **No Inventory Management**: No real-time stock tracking
- **No Order Processing**: No actual order fulfillment system

### Recent Changes (July 29, 2025)
- **Migration Completed**: Successfully migrated from Replit Agent to Replit environment
- **Backend Integration**: Added Node.js server with authentication capabilities
- **Email Integration**: SendGrid integration for OTP-based authentication
- **Enhanced UI**: Added cart button to hero section with organic color scheme matching
- **Layout Reorganization**: Moved Featured Products section to top of home page (after hero), followed by "Why Choose Our Organic Products" section
- **Filter Reset Fix**: Improved category filter reset functionality to prevent featured products from staying green after navigation
- **Hero Carousel**: Added auto-sliding image carousel to hero section featuring organic products (eggs, desi chicken, moringa tree, moringa powder) with smooth transitions and manual indicators

### Backend Architecture
- **Technology Stack**: Node.js HTTP server with vanilla JavaScript frontend
- **Authentication**: OTP-based email verification system using SendGrid
- **Admin System**: Credential-based admin login functionality
- **Session Management**: In-memory session storage for user/admin sessions
- **API Endpoints**: RESTful endpoints for authentication and cart management

### Future Enhancement Opportunities
- Database integration for persistent data storage
- Payment gateway integration
- Inventory management system
- Admin panel for product management
- Production-ready session storage (Redis)