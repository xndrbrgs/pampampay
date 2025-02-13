import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Construction } from "lucide-react";

const AuthNetForm = () => {
  return (
    <Card className="bg-transparent backdrop-blur-md border border-white/20 shadow-md mt-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-x-3">
          Under Contruction
          <Construction />
        </CardTitle>
        <CardDescription>
          This feature is currently under construction.
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

export default AuthNetForm;
