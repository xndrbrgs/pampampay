"use client";

import { useState } from "react";
import { FormContainer, FormComponent } from "react-authorize-net";

type StyledAuthorizeFormProps = {
  amount: number;
  environment?: "sandbox" | "production";
};

const apiLoginID = process.env.NEXT_PUBLIC_AUTHORIZE_NET_API_LOGIN_ID!;
const clientKey = process.env.NEXT_PUBLIC_AUTHORIZE_NET_CLIENT_KEY!;

const ReactAuthNetForm = ({
  amount,
  environment = "production",
}: StyledAuthorizeFormProps) => {
  const [isPaid, setIsPaid] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const onSuccessHandler = () => {
    setIsPaid(true);
    setErrors([]);
  };

  const onErrorHandler = (response: any) => {
    const errorMessages = response?.messages?.message?.map(
      (err: any) => err.text
    ) || ["An unexpected error occurred."];
    setErrors(errorMessages);
    setIsPaid(false);
  };

  if (errors.length > 0) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-4">
          Payment Failed
        </h2>
        <ul className="text-left space-y-2 text-red-500">
          {errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
        <button
          onClick={() => setErrors([])}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (isPaid) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg text-center">
        <h2 className="text-xl font-semibold text-green-600 mb-2">
          Payment Received
        </h2>
        <p className="text-gray-700">
          Thank you! Your transaction was successful.
        </p>
      </div>
    );
  }

  return (
    <div>
      <FormContainer
        environment={environment}
        onError={onErrorHandler}
        onSuccess={onSuccessHandler}
        amount={amount}
        clientKey={clientKey}
        apiLoginId={apiLoginID}
        component={(props) => (
          <FormComponent
            {...props}
            className="w-[20rem] sm:w-[40rem] mx-auto"
            style={{
              form: {
                padding: "2rem",
                backgroundColor: "rgba(0,0,0,0.5)",
                borderRadius: "1rem",
                boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
              },
              input: {
                border: "1px solid #ddd",
                backgroundColor: "#f9f9f9",
                color: "#333",
              },
              button: {
                backgroundColor: "#00cf45",
                color: "#fff",
                border: "none",
                borderRadius: "99rem",
                fontWeight: "600",
                fontSize: "1rem",
                cursor: "pointer",
                transition: "background-color 0.3s ease",
              },
            }}
          />
        )}
      />
    </div>
  );
};

export default ReactAuthNetForm;
