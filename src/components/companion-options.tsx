"use client";

import { Companion } from "@prisma/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { Edit, MoreVertical, Trash } from "lucide-react";
import axios from "axios";
import { useToast } from "./ui/use-toast";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

const CompanionOptions = ({ item }: { item: Companion }) => {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const onDelete = async () => {
    try {
      await axios.delete(`/api/companion/${item.id}`);
      toast({
        description: "Success",
      });
      router.refresh();
      router.push("/");
    } catch (error) {
      toast({
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      {item.userId === user?.id ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="bg-transparent">
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              onClick={() => router.push(`/companion/${item.id}`)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete}>
              <Trash className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default CompanionOptions;
