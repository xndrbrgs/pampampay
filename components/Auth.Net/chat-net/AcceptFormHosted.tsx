import { useEffect, useState } from "react";
import { AcceptHosted } from "react-authorize-net";

export default function AcceptFormHosted() {
  const [formToken, setFormToken] = useState<string | null>(null);
  const [responseData, setResponseData] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const res = await fetch("/api/charge/generate-token", {
          method: "POST",
        });
        const data = await res.json();
        console.log("🎟️ Received form token:", data.token);
        setFormToken(data.token);
      } catch (error) {
        console.error("❌ Failed to get form token:", error);
      }
    };

    fetchToken();
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-black">
        Accept Hosted Payment
      </h1>

      {formToken ? (
        <AcceptHosted
          formToken={formToken}
          mode="production"
          type="iframe"
          onTransact={(response) => {
            console.log("✅ Transaction complete:", response);
            setResponseData(response);
          }}
          onCancel={() => console.log("❎ User cancelled payment")}
          onMessage={(msg) => console.log("💬 Message received:", msg)}
        >
          <button className="bg-blue-600 text-white p-2 rounded">
            Pay Now
          </button>
        </AcceptHosted>
      ) : (
        <p>Loading payment form...</p>
      )}

      {responseData && (
        <div className="mt-6 bg-green-100 p-4 rounded">
          <h2 className="font-bold">Payment Success</h2>
          <pre>{JSON.stringify(responseData, null, 2)}</pre>
        </div>
      )}
    </main>
  );
}
