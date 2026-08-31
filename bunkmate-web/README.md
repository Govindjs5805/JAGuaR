# BunkMate Web

A modern web application for tracking attendance, assignments, and academic performance for KTU students.

## Features

- 📊 **Attendance Tracking**: Real-time attendance monitoring with smart bunk calculations
- 📝 **Assignment Manager**: View and track all your assignments and submissions
- 🎓 **Grade Cards**: Access KTU exam results and grade cards
- 📅 **Duty Leave**: Manage duty leave applications
- 📋 **Surveys**: Complete student feedback surveys
- 🔔 **Notifications**: Stay updated with important alerts
- 🌙 **Dark Green Theme**: Beautiful dark theme with green accents

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **PDF Generation**: jsPDF

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd bunkmate-web
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env.local` file based on `.env.example` and add your API credentials

4. Start the development server
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Environment Variables

Create a `.env.local` file with the following variables:

```env
VITE_API_URL=your-api-url
VITE_KTU_SCRAPER_BASE_URL=your-ktu-scraper-url
VITE_KLIPY_API_URL=your-chat-api-url
VITE_KLIPY_API_KEY=your-chat-api-key
VITE_INSIGHTS_URL=your-insights-url
VITE_OVERVIEW_URL=your-overview-url
```

## Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

## Project Structure

```
src/
├── api/              # API service files
├── components/       # Reusable UI components
│   ├── layout/      # Layout components (Header, Sidebar, etc.)
│   ├── ui/          # Basic UI components (Button, Card, etc.)
│   └── modals/      # Modal dialogs
├── constants/       # Configuration and constants
├── hooks/           # Custom React hooks
├── pages/           # Page components
├── state/           # Zustand stores
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── App.tsx          # Main app component
```

## License

MIT

## Author

Mahadevan Reji

## Credits

Original mobile app: [BunkMate](https://github.com/kichu12348/BunkMate)
