import { Companion } from "@prisma/client";
import { AlertTriangle } from "lucide-react";
import { Card, CardFooter, CardHeader } from "./ui/card";
import Link from "next/link";

import { Plus } from "lucide-react";
import CompanionOptions from "./companion-options";

interface CompanionsProps {
  data: Companion[];
}

const Companions = ({ data }: CompanionsProps) => {
  if (data.length === 0) {
    return (
      <div className="pt-10 flex flex-col space-y-3 items-center justify-center">
        <AlertTriangle className="text-muted-foreground h-8 w-8" />
        <p className="text-sm text-muted-foreground">No Companions Found</p>

        <Link href="/companion/new">
          <div className="text-muted-foreground text-xs group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition border-primary border">
            <div className="flex flex-col gap-y-2 items-center flex-1">
              <Plus className="h-5 w-5" />
              {"Create Companion"}
            </div>
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 pb-10">
      {data.map((item) => {
        return (
          <Card
            key={item.id}
            className="bg-primary/10 rounded-xl cursor-pointer hover:opacity-75 transition border-0 relative"
          >
            <div className="absolute top-0 right-0">
              <CompanionOptions item={item} />
            </div>

            <Link href={`/chat/${item.id}`}>
              <CardHeader className="flex items-center justify-center text-muted-foreground">
                <div className="relative w-32 h-32">
                  <img
                    src={item.src}
                    alt={item.name}
                    className="rounded-xl object-fill h-full w-full"
                  />
                </div>
                <p className="font-bold">{item.name}</p>
                <p className="text-xs">{item.description}</p>
              </CardHeader>
              <CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
                <p>@{item.userName}</p>
              </CardFooter>
            </Link>
          </Card>
        );
      })}
    </div>
  );
};

export default Companions;
