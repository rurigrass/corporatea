"use client";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { Command, CommandInput, CommandItem } from "../ui/Command";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Company, Prisma } from "@prisma/client";
import debounce from "lodash.debounce";
import { CommandEmpty, CommandGroup, CommandList } from "cmdk";
import { usePathname, useRouter } from "next/navigation";
import { useOnClickOutside } from "@/hooks/use-on-click-outside";
import Image from "next/image";

interface SearchBarProps {}

const SearchBar: FC<SearchBarProps> = ({}) => {
  const router = useRouter();
  const [input, setInput] = useState<string>("");
  const pathname = usePathname();

  const {
    data: queryResults,
    refetch,
    isFetched,
    isFetching,
  } = useQuery({
    queryFn: async () => {
      if (!input) return [];
      const { data } = await axios.get(`/api/search?q=${input}`);
      return data as (Company & {
        _count: Prisma.CompanyCountOutputType;
      })[];
    },
    queryKey: ["search-query"],
    enabled: false,
  });

  //refetches after 300 miliseconds from clicking.
  const request = debounce(async () => {
    refetch();
  }, 300);

  const debounceRequest = useCallback(() => {
    request();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //close searchbar on click outside
  const commandRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(commandRef, () => {
    setInput("");
  });

  //close searchbar when page changes
  useEffect(() => {
    setInput("");
  }, [pathname]);

  return (
    <Command
      ref={commandRef}
      className="relative rounded-lg border max-w-lg z-50 overflow-visible"
    >
      <CommandInput
        value={input}
        onValueChange={(text) => {
          setInput(text), debounceRequest();
        }}
        className=" outline-none border-none focus:border-none focus:outline-none ring-0"
        placeholder="Search by company"
      ></CommandInput>

      {input.length > 0 ? (
        <CommandList className="absolute bg-white top-full inset-x-0 shadow rounded-b-md">
          {isFetched && <CommandEmpty>No results found</CommandEmpty>}
          {(queryResults?.length ?? 0) > 0 ? (
            <CommandGroup>
              {queryResults?.map((company) => (
                <CommandItem
                  className="hover:cursor-pointer"
                  key={company.id}
                  value={company.name}
                  onSelect={(e) => {
                    router.push(`/company/${company.name}`);
                  }}
                >
                  {/* <Users className="mr-2 h-4 w-4" /> */}
                  {company.imageUrl && company.creatorId ? (
                    <div className="relative mr-2 h-4 w-4 overflow-hidden rounded-sm">
                      <Image
                        fill
                        className="relative"
                        src={company.imageUrl}
                        alt={company.creatorId}
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  ) : (
                    <div>No Image Available</div>
                  )}
                  {/* <a href={`/company/${company.name}`}> */}
                  {company.name}
                  {/* </a> */}
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
        </CommandList>
      ) : null}
    </Command>
  );
};

export default SearchBar;
