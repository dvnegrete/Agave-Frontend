# Agave Frontend

A modern React 19 application for bank reconciliation and financial voucher management.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## Requirements

- Node.js v18+
- Backend API running on `http://localhost:3000`
- Environment: `.env` file with `VITE_API_BASE_URL=http://localhost:3000`

## Documentation

For detailed information about the project, please see the documentation in the `@docs/` directory:

- **[Getting Started](@docs/SETUP.md)** - Setup and development environment
- **[Architecture](@docs/ARCHITECTURE.md)** - Project structure and design patterns
- **[Components](@docs/COMPONENTS.md)** - React component overview
- **[Hooks](@docs/HOOKS.md)** - Custom hooks and TanStack Query patterns
- **[API Integration](@docs/API_INTEGRATION.md)** - REST API endpoints and integration
- **[TanStack Query](@docs/TANSTACK_QUERY.md)** - Server state management

## Tech Stack

- React 19.1.1
- TypeScript 5.5.3
- TanStack Query v5
- Vite 5.4.0
- Tailwind CSS 3.4.1
- Axios 1.7.2

## Available Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run type-check` | Check TypeScript types |
| `npm install` | Install dependencies |

## Features

- ✨ Voucher management (create, view, approve, delete)
- 📤 Bank transaction file uploads (CSV/Excel)
- 🔄 Automated and manual bank reconciliation
- 📊 Comprehensive UI with tabbed interface
- 🚀 Real-time API status monitoring
- 💾 TanStack Query for smart caching and synchronization

## Development

1. Ensure backend API is running on `http://localhost:3000`
2. Run `npm run dev`
3. Open `http://localhost:5173`

For more detailed setup instructions, see [Getting Started](@docs/SETUP.md).

---

**Need help?** Check the documentation in `@docs/` for comprehensive guides on all aspects of the project.
