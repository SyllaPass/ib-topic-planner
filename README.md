# SyllaPass IB Topic Planner

A web tool for planning research questions for the IB Internal Assessment (IA) and Extended Essay (EE). Explore possible topics or refine a question you already have. Each report gives a possible approach, evidence to look for, and a next step to discuss with your supervisor.

[Visit SyllaPass](https://syllapass.com/?utm_source=github&utm_medium=referral&utm_campaign=ib_topic_planner)

## Try it locally

```sh
npm ci
npm run dev
```

The demo includes sample reports, a preview of report history and daily limits, and browser PDF export. You can try it without a SyllaPass account or API key. The production platform integrations are configured separately.

Run npm run build to check types and create the production bundle. To embed the planner, mount App in the platform frontend. Styles are scoped under .sp-topic-planner.

## Contributing

Open an issue with the assessment type, subject, and a short example. For code changes, run npm run build before submitting a pull request.

## License

The planner source is available under the [MIT License](LICENSE).

## Backend handoff

Set VITE_PLANNER_API to the base path for these endpoints, e.g. /api/topic-planner. Configure VITE_ACCOUNT_URL for the existing SyllaPass login and registration entry. The frontend passes intent (login or register) and a same-app returnTo path. Validate returnTo on the auth server. Set VITE_MEMBERSHIP_URL to the existing subscription page. Use same-origin endpoints where possible and enforce session ownership and CSRF protection on the server.

- GET /session returns Account or JSON null for visitors.
- GET /reports returns Report[] for the signed-in user, excluding expired reports.
- POST /reports accepts Draft and returns { report: Report, account: Account }. Return actionable JSON errors as { message: string } with appropriate HTTP statuses. See src/content.ts for the exact types. The backend owns subject rules, validation, AI calls, idempotency, quota and report expiration.
- Explore returns three directions. Refine returns one proposed direction. Both use the two topic-plan allowance. Whole-draft review is a separate future endpoint and has no entitlement advertised here.
- Reports stay available for 15 days. The browser provides the PDF option via a print stylesheet. API mode uses server timestamps and history. No API secrets belong in Vite variables.

Without a configured API, the app runs an explicitly labeled browser demo. It uses fictional reports and per-browser daily limits and history. Its storage and expiry behavior are for preview only. Demo mode never stores the text the user enters. Configure the API and real auth routes before platform release.

