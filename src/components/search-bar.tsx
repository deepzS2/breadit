"use client";

import axios from "axios";
import debounce from "lodash.debounce";
import { Users } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Prisma, Subreddit } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

import { useOnClickOutside } from "@/hooks/use-on-click-outside";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";

export const SearchBar = () => {
  const commandRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [input, setInput] = useState("");

  const {
    data: queryResults,
    refetch,
    isFetched,
    isFetching,
  } = useQuery({
    queryFn: async () => {
      if (!input) return [];

      const { data } = await axios.get(`/api/search?q=${input}`);

      return data as (Subreddit & {
        _count: Prisma.SubredditCountOutputType;
      })[];
    },
    queryKey: ["search-query"],
    enabled: false,
  });

  const request = debounce(refetch, 300);

  const debounceRequest = useCallback(() => {
    request();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useOnClickOutside(commandRef, () => {
    setInput("");
  });

  useEffect(() => {
    setInput("");
  }, [pathname]);

  return (
    <Command
      ref={commandRef}
      className="overflow-visible relative z-50 max-w-lg rounded-lg border"
    >
      <CommandInput
        isLoading={isFetching}
        value={input}
        onValueChange={(text) => {
          setInput(text);
          debounceRequest();
        }}
        className="border-none ring-0 outline-none focus:border-none focus:outline-none"
        placeholder="Search communities..."
      />

      {input.length > 0 ? (
        <CommandList className="absolute inset-x-0 top-full bg-white rounded-b-md shadow">
          {isFetched && <CommandEmpty>No results found.</CommandEmpty>}
          {(queryResults?.length ?? 0) > 0 ? (
            <CommandGroup heading="Communities">
              {queryResults?.map((subreddit) => (
                <CommandItem
                  onSelect={(e) => {
                    router.push(`/r/${e}`);
                    router.refresh();
                  }}
                  key={subreddit.id}
                  value={subreddit.name}
                >
                  <Users className="mr-2 w-4 h-4" />
                  <a href={`/r/${subreddit.name}`}>r/{subreddit.name}</a>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
        </CommandList>
      ) : null}
    </Command>
  );
};
