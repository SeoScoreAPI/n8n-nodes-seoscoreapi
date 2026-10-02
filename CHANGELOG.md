# Changelog

## 1.5.0 (2026-10-02)

- Deep Audit calls go to the main host, `https://seoscoreapi.com`
  (`POST /site-audit`, `GET /site-audit/{job_id}`, `GET /deep-audit/usage`), instead of
  `engine.seoscoreapi.com`. The old host still works.
- New credential field **Deep Audit Base URL** (default `https://seoscoreapi.com`) to
  override the Deep Audit host.
- New operations: **Start Deep Audit** (returns the job, optional webhook), **Get Deep
  Audit** (poll a job), **Deep Audit Usage**.
- **Deep Audit** (wait for result) gets a configurable timeout (default 600 s, was a fixed
  5 minutes).
- Tests (`npm test`, Node's built-in runner, no n8n install needed).

## 1.4.0

- Deep Audit operation (engine host, waits for the result).

Earlier releases: see the git history of `sdks/n8n`.
