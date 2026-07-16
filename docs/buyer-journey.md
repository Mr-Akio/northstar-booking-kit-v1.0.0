# Buyer Journey

This document explains how a buyer is expected to use Northstar Booking Kit after purchase.

## What a buyer is actually buying

They are not buying a finished “Northstar” product. They are buying:

- a working booking engine
- a reusable frontend shell
- authentication and role handling
- availability and blackout logic
- booking management and admin surfaces
- documentation, tests, and deployment scaffolding

## Typical buyer workflow

### Day 1

- Clone the repository.
- Run the local setup.
- Sign in with demo accounts.
- Review the frontend presets and the booking flow.

### Day 2

- Change brand name, accent color, terminology, and contact info through the theme config.
- Replace demo copy and screenshots.

### Day 3

- Rename generic terms to match the target business.
- Example: `resource` becomes `room`, `doctor`, `vehicle`, or `table`.

### Day 4-5

- Extend the resource model with business-specific fields.
- Extend admin forms and frontend details pages to surface those fields.

### Day 6

- Add business-specific rules such as cancellation windows, notifications, or payment hooks.

### Day 7

- Prepare deployment, finalize branding, and begin user acceptance testing for the target business.

## Why this matters for sale

The more clearly the buyer can see this path, the easier it is to sell the kit as a serious accelerator instead of a generic code template.
