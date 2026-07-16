# Third-Party Notices

This file is a practical starting point for commercial packaging review. It is not legal advice and it is not a substitute for your own review before selling the project.

## How to use this file

1. Review the dependencies listed below against the exact lockfiles and installed package metadata in your release branch.
2. Confirm the current license for every dependency version you ship.
3. Keep a copy of the final reviewed notices file in any commercial distribution package.
4. Re-run the review whenever you add, remove, or upgrade dependencies.

## Frontend dependencies to review

Runtime packages declared in [frontend/package.json](D:/booking-starter-kit/frontend/package.json):

- `next`
- `react`
- `react-dom`
- `@hookform/resolvers`
- `react-hook-form`
- `zod`
- `@tanstack/react-query`
- `lucide-react`
- `framer-motion`
- `date-fns`
- `clsx`

Development and tooling packages declared in [frontend/package.json](D:/booking-starter-kit/frontend/package.json):

- `typescript`
- `eslint`
- `eslint-config-next`
- `prettier`
- `prettier-plugin-tailwindcss`
- `tailwindcss`
- `@tailwindcss/postcss`
- `vitest`
- `jsdom`
- `@testing-library/react`
- `@testing-library/user-event`
- `@testing-library/jest-dom`
- `@playwright/test`
- `@types/node`
- `@types/react`
- `@types/react-dom`

## Backend dependencies to review

Packages declared in [backend/requirements.txt](D:/booking-starter-kit/backend/requirements.txt):

- `Django`
- `djangorestframework`
- `djangorestframework-simplejwt`
- `drf-spectacular`
- `django-filter`
- `django-cors-headers`
- `dj-database-url`
- `psycopg[binary]`
- `gunicorn`
- `ruff`
- `pytest`
- `pytest-django`

## Fonts and visual assets

- The current UI relies on system font stacks and does not bundle proprietary font files.
- Demo imagery is URL-based and should be replaced or re-reviewed before commercial redistribution.
- Do not include third-party logos, client names, or unlicensed media in your final product package.

## Suggested release review steps

- `npm ls --depth=0` inside `frontend/`
- `pip freeze` or an equivalent reviewed export inside `backend/`
- manual license verification for every shipped dependency version
- visual asset audit for screenshots, README imagery, logos, and demo content

## Current posture

This repository now includes the structure needed to prepare a commercial sale, but the final legal sign-off still belongs to the seller.
