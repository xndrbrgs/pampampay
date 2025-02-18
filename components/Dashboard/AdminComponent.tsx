import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "../ui/button";

const AdminComponent = () => {
  return (
    <section>
      <Card className="card-style">
        <CardHeader>
          <CardTitle>Welcome Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <Button>
            <Link href="/dashboard/transactions">
              <p className="text-lg transition duration-150">
                Click here to go to payments
              </p>
            </Link>
          </Button>
          <p className="pt-3">
            Any questions or concerns? Please reach out to our support team.
          </p>
        </CardContent>
      </Card>
    </section>
  );
};

export default AdminComponent;
