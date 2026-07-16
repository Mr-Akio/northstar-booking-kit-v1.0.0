const DEFAULT_API_URL = "http://localhost:8000";
const DEFAULT_TIMEOUT_MS = 30_000;
const POLL_INTERVAL_MS = 1_000;

function getApiUrl() {
  return (process.env.PLAYWRIGHT_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/$/, "");
}

async function waitForBackend(apiUrl: string) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < DEFAULT_TIMEOUT_MS) {
    try {
      const response = await fetch(`${apiUrl}/api/schema/`);
      if (response.ok) {
        return;
      }
    } catch {
      // Backend is still starting up.
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error(`Backend did not become ready within ${DEFAULT_TIMEOUT_MS / 1000} seconds at ${apiUrl}. Start Django before running Playwright.`);
}

async function verifyDemoLogin(apiUrl: string) {
  const response = await fetch(`${apiUrl}/api/v1/auth/login/`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "customer@northstar.local",
      password: "DemoPass123!",
    }),
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(
      `Playwright preflight could not sign in with the demo customer at ${apiUrl}. Run migrations and \`python manage.py seed_demo\` before \`npm run test:e2e\`.\nResponse: ${payload}`,
    );
  }
}

export default async function globalSetup() {
  const apiUrl = getApiUrl();
  await waitForBackend(apiUrl);
  await verifyDemoLogin(apiUrl);
}
