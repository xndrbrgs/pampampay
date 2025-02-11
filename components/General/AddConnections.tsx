"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { getAllUsers } from "@/lib/actions/user.actions";
import ConnectUserProfile from "./ConnectUserProfile";

type User = {
  id: string;
  customId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  profileImage: string | null;
};

type AddConnectionProps = {
  onAddConnection: (userId: string) => Promise<void>;
};

export function AddConnection({ onAddConnection }: AddConnectionProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await getAllUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast({
          title: "Error",
          description: "Failed to load users. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchUsers();
  }, []);

  const handleAddConnection = async () => {
    if (!selectedUserId) {
      toast({
        title: "Error",
        description: "Please select a user to connect with.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onAddConnection(selectedUserId);
      toast({
        title: "Connection Added",
        description: "The new connection has been added successfully.",
      });
      setSelectedUserId(null);
    } catch (error) {
      console.error("Failed to add connection:", error);
      toast({
        title: "Error",
        description: "Failed to add connection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-md">
      <CardHeader>
        <CardTitle>Add Connection </CardTitle>
        <CardDescription>
          Add a connection to start sharing expenses.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          <Select
            onValueChange={setSelectedUserId}
            value={selectedUserId || undefined}
          >
            <SelectTrigger className="w-full py-7">
              <SelectValue placeholder="Select a user to connect with" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  <div className="flex items-center space-x-2">
                    {user.username ? (
                      <ConnectUserProfile
                        username={user.username || ""}
                        img={user.profileImage}
                        customId={user.customId}
                      />
                    ) : user.username ? (
                      <ConnectUserProfile
                        username={user.username}
                        img={user.profileImage}
                        customId={user.customId}
                      />
                    ) : (
                      user.email
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="mt-5">
            <Button
              onClick={handleAddConnection}
              disabled={isLoading || !selectedUserId}
            >
              {isLoading ? "Adding..." : "Add Connection"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}