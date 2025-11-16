## ZRC Custodial Market

Next.js 16 + AWS Amplify implementation of the Zerdinals ZRC-20 market. The stack couples:

- Next.js App Router + Tailwind CSS v4 for the DeFi-inspired UI
- WalletConnect (Solana + custom Zcash namespace) for sign-in
- AWS Amplify (API Gateway + Lambda) as the custodial orchestration layer
- Upstash Redis for balances, orderbooks, and pub/sub fan-out
- Native WebSocket route for live price + orderbook streaming

### Requirements

1. Copy `docs/env.sample` to `.env.local` and provide:

```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
SOLANA_RPC_URL=
ZCASH_RPC_URL=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
AMPLIFY_API_BASE_URL=
AMPLIFY_API_KEY=
```

2. Install deps and start the dev server:

```
npm install
npm run dev
```

3. (Optional) push mock ticks into Redis for richer charts:

```
npm run mock:prices
```

### Amplify deployment

1. `npm install -g @aws-amplify/cli` and run `amplify init`.
2. `amplify add api` + `amplify add function` are already scaffolded inside `amplify/backend/*` - run `amplify push` to create:
   - `custodyGateway` API Gateway
   - Lambda trio `custodyBalances`, `custodyOrders`, `matchingEngine`
3. Export the REST endpoint + API key and place them inside `.env.local` for the Next.js app.
4. Configure Amplify Hosting or your CI (GitHub Actions/AWS CodeBuild) to run:

```
npm ci
npm run lint
npm run test
npm run build
```

### Testing

- `npm run test:unit` - Vitest coverage over the orderbook helpers
- `npm run test:e2e` - Playwright journey covering wallet connect mocks and order placement (relies on `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` test value)

### Scripts

| Command             | Purpose                                               |
|---------------------|-------------------------------------------------------|
| `npm run dev`       | Start Next.js locally                                 |
| `npm run lint`      | ESLint + Next linting                                 |
| `npm run build`     | Production build                                      |
| `npm run preview`   | Launch compiled app                                   |
| `npm run mock:prices` | Publish a synthetic candle into Upstash             |
| `npm run test`      | Combined unit + e2e tests                             |

### Architecture summary

- `src/app/(trade)/zcash` - main trading surface (chart, book, order form, funds modals)
- `src/app/api/*` - WebSocket, order, balance, orderbook, and price endpoints
- `src/lib/*` - shared env parsing, Upstash accessors, Amplify proxy helpers, custody simulator
- `amplify/backend/*` - Infrastructure-as-code skeleton ready for `amplify push`
- `scripts/mock-price-feed.ts` - feed generator for demos and local dev
