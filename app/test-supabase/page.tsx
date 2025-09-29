"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function TestSupabasePage() {
  const [status, setStatus] = useState<string>("Testing...");
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    const test = async () => {
      try {
        const supabase = createClient();
        
        // Check if client was created
        setStatus("Supabase client created ✓");
        
        // Try to get session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setStatus(`Error: ${error.message}`);
          setDetails(error);
        } else {
          setStatus("Session check successful ✓");
          setDetails({
            hasSession: !!data.session,
            session: data.session ? {
              user: data.session.user?.email,
              expiresAt: data.session.expires_at,
            } : null,
          });
        }
      } catch (e) {
        setStatus(`Exception: ${e instanceof Error ? e.message : String(e)}`);
        setDetails(e);
      }
    };
    
    test();
  }, []);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
        
        <div className="bg-gray-100 p-4 rounded mb-4">
          <h2 className="font-semibold mb-2">Environment Variables:</h2>
          <p className="text-sm font-mono break-all">
            URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT SET"}
          </p>
          <p className="text-sm font-mono break-all">
            ANON KEY: {process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY 
              ? `${process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY.substring(0, 20)}... (${process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY.length} chars)` 
              : "NOT SET"}
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded mb-4">
          <h2 className="font-semibold mb-2">Status:</h2>
          <p className="text-sm">{status}</p>
        </div>

        {details && (
          <div className="bg-gray-50 p-4 rounded">
            <h2 className="font-semibold mb-2">Details:</h2>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(details, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
