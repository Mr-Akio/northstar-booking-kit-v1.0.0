# Commercial Release Checklist

Use this checklist before listing Northstar Booking Kit for sale.

## Product quality

- [ ] Backend migrations apply from a clean database.
- [ ] `python manage.py seed_demo` runs without creating uncontrolled duplicates.
- [ ] Frontend, backend, and booking flow tests pass on the release branch.
- [ ] Demo accounts still match the README.
- [ ] Branding presets render cleanly across mobile and desktop.
- [ ] No placeholder, broken, or malformed UI copy remains.

## Buyer experience

- [ ] `.env.example` is complete and has no real secrets.
- [ ] Quick start steps in [README.md](D:/booking-starter-kit/README.md) work from a clean clone.
- [ ] Clean-install notes in `docs/` match the actual current setup.
- [ ] Deployment notes are current for frontend, backend, and database.
- [ ] Demo screenshots match the current UI.

## Commercial packaging

- [ ] Cover image is updated.
- [ ] Screenshot set includes home, catalog, detail, checkout, customer workspace, and admin workspace.
- [ ] Demo preset story is clear: default, clinic, meeting, rental.
- [ ] Feature matrix matches the shipped code.
- [ ] Known limitations are clearly stated.

## Compliance and hygiene

- [ ] Review [LICENSE.md](D:/booking-starter-kit/LICENSE.md) and replace the placeholder if needed.
- [ ] Review [third-party-notices.md](D:/booking-starter-kit/docs/third-party-notices.md).
- [ ] Remove any stray local files, secrets, test artifacts, or private notes from the release package.
- [ ] Confirm no real customer data, logos, or proprietary media are included.

## Suggested final command set

Backend:

```bash
cd backend
python manage.py migrate
python manage.py seed_demo
python -m pytest
python -m ruff check .
python manage.py check
python manage.py spectacular --validate --file schema-check.yml
```

Frontend:

```bash
cd frontend
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

Optional sales assets:

```bash
cd frontend
npm run capture:screenshots
```
