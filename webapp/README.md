# Tasvir AI - Telegram WebApp

Modern Next.js web application for Tasvir AI image generator bot with Telegram WebApp integration.

## Features

- 🎨 **Modern UI/UX** - Beautiful dark/light theme with smooth animations
- ⚡ **Fast Performance** - Built with Next.js 14 and optimized for speed
- 🔄 **Redux State Management** - Centralized state with Redux Toolkit
- 📱 **Telegram WebApp** - Full integration with Telegram WebApp SDK
- 🖼️ **Image Processing** - Upload multiple images and generate AI artwork
- 🔒 **Secure** - Type-safe with TypeScript
- 📊 **Pagination** - Efficient template browsing
- 🎯 **Subscription Check** - Telegram channel subscription verification

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **API Client**: Axios
- **Fonts**: DM Sans, Space Mono

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- FastAPI backend running (default: http://localhost:8000)

### Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Configure environment variables:
```bash
# Copy .env.local and update with your settings
cp .env.local .env.local.example
```

Update `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_BOT_USERNAME=your_bot_username
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
webapp/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── providers.tsx      # Redux provider
│   ├── components/            # React components
│   │   ├── modals/           # Modal components
│   │   ├── Alert.tsx
│   │   ├── Modal.tsx
│   │   ├── Navbar.tsx
│   │   ├── Pagination.tsx
│   │   └── TemplateCard.tsx
│   ├── services/             # API services
│   │   └── api.ts
│   ├── store/                # Redux store
│   │   ├── slices/          # Redux slices
│   │   └── index.ts
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   └── utils/               # Utility functions
│       ├── helpers.ts
│       └── telegram.ts
├── public/                  # Static files
├── .env.local              # Environment variables
├── next.config.mjs         # Next.js config
├── tailwind.config.ts      # Tailwind config
├── tsconfig.json          # TypeScript config
└── package.json           # Dependencies
```

## API Endpoints

The webapp communicates with these FastAPI endpoints:

- `GET /api/v1/templates` - Fetch paginated templates
- `POST /api/v1/check-subscription` - Check user subscription status
- `POST /api/v1/generate` - Start image generation
- `GET /api/v1/generation/{request_id}` - Poll generation status

## Redux Store

### Slices

- **templates** - Template list, pagination, loading states
- **generation** - Image upload, generation process, results
- **subscription** - Channel subscription checking
- **theme** - Dark/light mode toggle

### Usage Example

```typescript
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchTemplates } from '@/store/slices/templatesSlice';

const dispatch = useAppDispatch();
const templates = useAppSelector((state) => state.templates.templates);

dispatch(fetchTemplates({ page: 1, limit: 6 }));
```

## Telegram WebApp Integration

The app uses Telegram WebApp SDK for:

- User authentication
- Theme detection
- Haptic feedback
- Native alerts and popups
- Viewport expansion

Example:

```typescript
import { getTelegramUser, hapticFeedback } from '@/utils/telegram';

const user = getTelegramUser();
hapticFeedback('impact', 'medium');
```

## Styling

The app uses CSS variables for theming:

```css
:root {
  --bg-primary: #0a0a0a;
  --bg-secondary: #151515;
  --bg-card: #1a1a1a;
  --text-primary: #ffffff;
  --text-secondary: #a0a0a0;
  --accent: #00ff88;
  --border: #2a2a2a;
}
```

Toggle between dark/light themes with the theme button in the navbar.

## Development

### Type Safety

All components are fully typed with TypeScript. The `src/types/index.ts` file contains all type definitions.

### Adding New Features

1. Create Redux slice in `src/store/slices/`
2. Add types in `src/types/index.ts`
3. Create components in `src/components/`
4. Add API methods in `src/services/api.ts`

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Docker

```bash
# Build
docker build -t ai-image-generator-webapp .

# Run
docker run -p 3000:3000 ai-image-generator-webapp
```

## Security

- All API calls are proxied through Next.js
- File uploads are validated (type, size)
- TypeScript ensures type safety
- Environment variables for sensitive data

## Performance

- Image lazy loading
- Component code splitting
- Redux state optimization
- Efficient re-renders with React.memo

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Telegram WebApp (all platforms)

## License

MIT License

## Support

For issues or questions, please open an issue on GitHub.
