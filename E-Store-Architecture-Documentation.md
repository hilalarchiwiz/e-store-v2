# E-Store Architecture Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Database Architecture](#database-architecture)
5. [Authentication & Authorization](#authentication--authorization)
6. [State Management](#state-management)
7. [File Structure Details](#file-structure-details)
8. [Key Features](#key-features)
9. [Development Guidelines](#development-guidelines)
10. [Deployment & Configuration](#deployment--configuration)

---

## Project Overview

**E-Store** is a modern, full-featured e-commerce platform built with Next.js 16, TypeScript, and PostgreSQL. The application provides a complete online shopping experience with both customer-facing and administrative interfaces.

### Key Characteristics
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Better Auth
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **File Storage**: Azure Blob Storage

---

## Technology Stack

### Frontend Technologies
- **Next.js 16.0.10** - React framework with App Router
- **React 19.2.1** - UI library
- **TypeScript 5.9.3** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **Framer Motion 12.23.26** - Animation library
- **Lucide React 0.561.0** - Icon library

### Backend & Database
- **PostgreSQL** - Primary database
- **Prisma 7.2.0** - Database ORM
- **Better Auth 1.4.7** - Authentication solution
- **bcryptjs 3.0.3** - Password hashing

### State Management
- **Redux Toolkit 2.11.2** - State management
- **React Redux 9.2.0** - React bindings

### Additional Libraries
- **Azure Storage Blob 12.29.1** - Cloud storage
- **TipTap 3.15.1** - Rich text editor
- **React Hot Toast 2.6.0** - Notification system
- **Swiper 12.0.3** - Carousel/slider
- **Inngest 3.49.1** - Background jobs
- **Zod 4.2.1** - Schema validation

---

## Project Structure

```
e-store-archiwiz/
├── app/                          # Next.js App Router pages
│   ├── (admin)/                  # Admin dashboard routes
│   │   └── admin/                # Admin interface
│   ├── (site)/                   # Public site routes
│   │   ├── (auth)/               # Authentication pages
│   │   ├── pages/                # Static pages
│   │   ├── blogs/                # Blog functionality
│   │   └── [slug]/               # Dynamic routes
│   ├── api/                      # API routes
│   ├── context/                  # React contexts
│   └── css/                      # Global styles
├── components/                    # Reusable React components
│   ├── Admin/                    # Admin-specific components
│   ├── Auth/                     # Authentication components
│   ├── Blog/                     # Blog components
│   ├── Cart/                     # Shopping cart components
│   ├── Checkout/                 # Checkout process components
│   ├── Common/                   # Shared components
│   ├── Header/                   # Navigation components
│   ├── Home/                     # Homepage components
│   ├── Shop/                     # Product listing components
│   └── ...                       # Feature-specific components
├── lib/                          # Utility libraries
│   ├── action/                   # Server actions
│   ├── action-utils.ts           # Action utilities
│   ├── auth.ts                   # Authentication configuration
│   ├── prisma.ts                 # Database client
│   └── validation/               # Form validations
├── prisma/                       # Database schema & migrations
│   ├── schema.prisma             # Database model definitions
│   └── seed.ts                   # Database seeding
├── redux/                        # Redux store configuration
│   ├── features/                 # Redux slices
│   ├── provider.tsx              # Redux provider
│   └── store.ts                  # Store configuration
├── types/                        # TypeScript type definitions
├── public/                       # Static assets
└── testing-product-python/       # Testing utilities
```

---

## Database Architecture

### Core Entities

#### Product Management
- **Product**: Central entity with pricing, inventory, specifications
- **Category**: Product categorization with hierarchical support
- **Brand**: Product branding information
- **Slider**: Homepage promotional banners

#### User Management
- **User**: Customer accounts with roles and permissions
- **Role**: Role-based access control (RBAC)
- **Session**: User session management
- **Account**: OAuth provider integrations

#### E-commerce Operations
- **Cart**: Shopping cart functionality (supports guest users)
- **Order**: Order processing and management
- **OrderItem**: Individual order line items
- **Wishlist**: Product wishlists
- **Review**: Product reviews and ratings

#### Content Management
- **Blog**: Blog posts and articles
- **Page**: Static pages (About, Contact, etc.)
- **Faq**: Frequently asked questions
- **Banner**: Promotional banners

#### System Configuration
- **Setting**: Application configuration
- **Coupon**: Discount and promotion codes
- **Address**: User shipping/billing addresses
- **Contact**: Contact form submissions

### Key Features
- **Multi-tenant support** with role-based permissions
- **Guest user support** for carts and wishlists
- **Comprehensive audit logging** with `AuditLog` model
- **Flexible product specifications** using JSON fields
- **Multi-currency and payment method support**

---

## Authentication & Authorization

### Authentication System
- **Provider**: Better Auth
- **Methods**: Email/password, OAuth providers
- **Session Management**: Secure token-based sessions
- **Password Security**: bcryptjs hashing

### Authorization Model
- **Role-Based Access Control (RBAC)**
- **Permission-based module access**
- **Admin vs User role separation**
- **Session tracking and login logs**

### Key Components
- `lib/auth.ts` - Authentication configuration
- `lib/auth-client.ts` - Client-side auth setup
- `lib/auth-utils.ts` - Authentication utilities
- Components in `components/Auth/`

---

## State Management

### Redux Store Structure
```typescript
store = {
  quickViewReducer: Quick view modal state
  cartReducer: Shopping cart state
  wishlistReducer: Wishlist state
  productDetailsReducer: Product details state
  userReducer: User authentication state
}
```

### Context Providers
- **QuickViewModalContext**: Product quick view modal
- **CartSidebarModalContext**: Shopping cart sidebar
- **PreviewSliderContext**: Image preview slider

### Features
- **Persistent cart** across sessions
- **Real-time wishlist updates**
- **User session synchronization**
- **Optimistic UI updates**

---

## File Structure Details

### App Router Structure
- **(admin)/**: Protected admin routes
- **(site)/**: Public-facing routes
- **api/**: Backend API endpoints
- **context/**: React context providers

### Component Organization
- **Feature-based grouping** (Cart, Shop, Blog, etc.)
- **Shared components** in Common/
- **Admin-specific** components separated
- **Reusable UI patterns** throughout

### Library Structure
- **action/**: Server actions for database operations
- **validation/**: Form validation schemas
- **payments/**: Payment processing utilities

---

## Key Features

### Customer Features
- **Product browsing** with filters and search
- **Shopping cart** with guest support
- **Wishlist management**
- **User accounts** with order history
- **Product reviews** and ratings
- **Blog reading** and engagement
- **Contact forms** and support

### Admin Features
- **Product management** (CRUD operations)
- **Order processing** and tracking
- **Customer management**
- **Content management** (blogs, pages)
- **Banner and slider management**
- **Coupon and promotion system**
- **Analytics and reporting**
- **System configuration**

### Technical Features
- **Responsive design** for all devices
- **SEO optimization** with metadata generation
- **Performance optimization** with Next.js
- **Image optimization** with Sharp
- **File uploads** to Azure Blob Storage
- **Rich text editing** with TipTap
- **Real-time notifications** with hot toast

---

## Development Guidelines

### Code Organization
- **TypeScript strict mode** for type safety
- **Component-based architecture** with separation of concerns
- **Server actions** for data mutations
- **Environment variables** for configuration

### Best Practices
- **Prisma migrations** for database changes
- **Form validation** with Zod schemas
- **Error boundaries** for graceful error handling
- **Loading states** and skeleton screens
- **Accessibility** considerations

### Development Workflow
```bash
# Development
npm run dev

# Build
npm run build

# Database operations
npx prisma migrate dev
npx prisma generate
npx prisma db seed
```

---

## Deployment & Configuration

### Environment Variables
- Database connection strings
- Azure Blob Storage credentials
- Authentication secrets
- Payment gateway configurations

### Build Configuration
- **Next.js configuration** in `next.config.ts`
- **Image optimization** settings
- **Security headers** and CSP
- **Domain whitelisting** for images

### Production Considerations
- **PostgreSQL database** setup
- **Azure Blob Storage** configuration
- **SSL certificates** and HTTPS
- **Performance monitoring** and logging

---

## Security Features

### Authentication Security
- **Secure session management**
- **Password hashing** with bcrypt
- **CSRF protection**
- **Rate limiting** considerations

### Data Protection
- **Input validation** with Zod
- **SQL injection prevention** via Prisma
- **XSS protection** with proper sanitization
- **File upload security** validation

### Access Control
- **Role-based permissions**
- **Route protection** with middleware
- **API endpoint security**
- **Admin panel access control**

---

## Performance Optimizations

### Frontend Optimizations
- **Next.js automatic code splitting**
- **Image optimization** with Next.js Image
- **Lazy loading** for components
- **Bundle size optimization**

### Backend Optimizations
- **Database indexing** on frequently queried fields
- **Connection pooling** with Prisma
- **Caching strategies** for static data
- **API response optimization**

### Monitoring & Analytics
- **Error tracking** and logging
- **Performance metrics** collection
- **User behavior analytics**
- **System health monitoring**

---

## Conclusion

This e-commerce platform represents a modern, scalable solution built with industry best practices. The architecture supports both current requirements and future growth, with modular design patterns that facilitate maintenance and feature expansion.

The combination of Next.js, TypeScript, PostgreSQL, and modern React patterns provides a robust foundation for a production-ready e-commerce application with comprehensive admin capabilities and excellent user experience.
