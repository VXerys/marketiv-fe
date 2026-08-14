"use client";

import "../../../sentry.client.config";
import * as Sentry from "@sentry/nextjs";

export default function SentryExamplePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <h1 className="mb-4 text-2xl font-bold">Sentry Staging Test Page</h1>
      <p className="mb-6 text-gray-600">
        Klik tombol di bawah untuk memicu error dan memverifikasi integrasi Sentry.
      </p>
      <button
        type="button"
        className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 transition-colors"
        onClick={() => {
          console.log("[Sentry Test] DSN:", process.env.NEXT_PUBLIC_SENTRY_DSN);
          const eventId = Sentry.captureException(new Error("Marketiv Staging Test Error"));
          console.log("[Sentry Test] Event ID captured:", eventId);
          // @ts-expect-error test error for sentry verify
          myUndefinedFunction();
        }}
      >
        Trigger Test Error
      </button>
    </div>
  );
}

