import React from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

const LinkedCard = () => {
  return (
    <Card className="card-style mb-3">
      <CardHeader>
        <CardTitle>Your Account Can Accept Payments</CardTitle>
        <CardDescription>
          Your account has connected to Stripe and is ready to begin receiving
          payments.
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

export default LinkedCard;
