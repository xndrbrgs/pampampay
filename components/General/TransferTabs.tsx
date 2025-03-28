import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TransferForm } from "./TransferForm";
import { getConnections } from "@/lib/actions/user.actions";
import AuthNetForm from "./AuthNetForm";
import { PaypalForm } from "../Paypal/PaypalForm";

const TransferTabs = async () => {
  const connections = await getConnections();
  return (
    <Card
      className="bg-white/10 backdrop-blur-md border border-white/20 shadow-md"
      id="transactions"
    >
      <CardHeader>
        <CardTitle>Initiate Transfer</CardTitle>
        <CardDescription>Transfer money to a connection.</CardDescription>
      </CardHeader>
      <CardContent className="w-full">
        <Tabs defaultValue="stripe">
          <TabsList className="">
            <TabsTrigger value="stripe">Cash App, Apple Pay</TabsTrigger>
            <TabsTrigger value="paypal">Paypal, Venmo</TabsTrigger>
            {/* <TabsTrigger value="auth">Android Pay</TabsTrigger> */}
          </TabsList>
          <TabsContent value="stripe" className="pt-2">
            <TransferForm connections={connections} />
          </TabsContent>
          {/* <TabsContent value="paypal" className="pt-2">
            <PaypalForm connections={connections} />
          </TabsContent> */}
          {/* <TabsContent value="auth" className="pt-2">
            <AuthNetForm />
          </TabsContent> */}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TransferTabs;
