// TEST FILE - Check if Firebase is configured correctly
// Access this at: http://localhost:3000/login/test-firebase

"use client";
import { useEffect, useState } from "react";
import { auth } from "@/config/firebase";

export default function TestFirebase() {
  const [status, setStatus] = useState<any>({});

  useEffect(() => {
    const config = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    setStatus({
      config,
      authInitialized: !!auth,
      appName: auth?.app?.name || "Not initialized",
    });
  }, []);

  return (
    <div style={{ padding: "40px", fontFamily: "monospace" }}>
      <h1>🔥 Firebase Configuration Test</h1>
      
      <div style={{ marginTop: "20px" }}>
        <h2>Environment Variables:</h2>
        <pre style={{ background: "#f5f5f5", padding: "15px", borderRadius: "5px" }}>
          {JSON.stringify(status.config, null, 2)}
        </pre>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h2>Firebase Status:</h2>
        <p>
          <strong>Auth Initialized:</strong>{" "}
          {status.authInitialized ? "✅ YES" : "❌ NO"}
        </p>
        <p>
          <strong>App Name:</strong> {status.appName}
        </p>
      </div>

      <div style={{ marginTop: "20px", padding: "15px", background: "#fff3cd", borderRadius: "5px" }}>
        <h3>⚠️ Checklist:</h3>
        <ul>
          <li>All environment variables should have values (not "undefined")</li>
          <li>Auth Initialized should be "YES"</li>
          <li>Go to Firebase Console and enable Google Sign-In</li>
          <li>Make sure "localhost" is in Authorized Domains</li>
          <li>Restart frontend server after adding .env.local</li>
        </ul>
      </div>

      <div style={{ marginTop: "20px" }}>
        <a href="/login" style={{ color: "blue", textDecoration: "underline" }}>
          ← Back to Login Page
        </a>
      </div>
    </div>
  );
}
