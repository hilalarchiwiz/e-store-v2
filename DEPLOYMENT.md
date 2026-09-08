# Deploying without stale Server Actions

Build once with `npm ci` and `npm run build`, then deploy that same build output to every instance. Start it with `npm start`; do not rebuild each instance separately. Replace old instances together or route traffic by deployment.

Set `NEXT_DEPLOYMENT_ID` to a unique release/build ID at build time. The app also recognizes Azure Pipelines `BUILD_BUILDID`, GitHub Actions `GITHUB_RUN_ID`, and falls back to the Git commit when available. All instances serving that build must share the same ID. This lets Next.js detect stale client navigation and fetch the current release.

For multiple instances, configure the same secret `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` at build time. Generate it once with `openssl rand -base64 32` and store it in the hosting/build secret settings, never in Git. A stable key does not keep removed actions available; identical build output is still required.

After deploying this fix, reload existing admin tabs before editing. Older tabs still contain the previous action IDs, including the old polling and image-removal code. Clear any CDN cache of HTML if it serves an older release. Future pending-order polling uses a permission-protected GET endpoint instead of a build-specific Server Action.

Image removal now changes only the edit draft. A successful product save removes the DB URL before storage cleanup; cancelling or failing validation preserves the live blob. Shared product image URLs are retained while another product references them. Previously deleted blobs must be restored from storage recovery (if available) or re-uploaded; this code cannot recreate them. Newly uploaded images from abandoned drafts may remain in storage.

References:
- https://nextjs.org/docs/messages/failed-to-find-server-action
- https://nextjs.org/docs/app/api-reference/config/next-config-js/deploymentId
