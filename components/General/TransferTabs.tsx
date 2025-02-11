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

const TransferTabs = async () => {
  const connections = await getConnections();
  return (
    <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-md">
      <CardHeader>
        <CardTitle>Initiate Transfer</CardTitle>
        <CardDescription>Transfer money to a connection.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="stripe">
          <TabsList>
            <TabsTrigger value="stripe">Stripe</TabsTrigger>
            <TabsTrigger value="auth">Authorize.NET</TabsTrigger>
          </TabsList>
          <TabsContent value="stripe" className="pt-2">
            <TransferForm connections={connections} />
          </TabsContent>
          <TabsContent value="auth" className="pt-2">
            Under Construction
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TransferTabs;
