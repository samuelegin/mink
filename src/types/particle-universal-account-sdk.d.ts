// Workaround for @particle-network/universal-account-sdk's package.json
// "exports" map missing a "types" condition (declarations exist at
// dist/index.d.ts but aren't reachable through the exports field under
// "bundler"/"node16" module resolution). Remove this file if a future
// version of the package fixes its exports map.
declare module '@particle-network/universal-account-sdk'
