"use client";
import { FC, useCallback, useState } from "react";
import { Command, CommandInput } from "../ui/Command";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Company, Prisma } from "@prisma/client";
import debounce from "lodash.debounce";

interface SearchBarProps {}

const SearchBar: FC<SearchBarProps> = ({}) => {
  const [input, setInput] = useState<string>("");

  const request = debounce(async () => {
    refetch();
  }, 300);

  const debounceRequest = useCallback(() => {
    request();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    data: queryResults,
    refetch,
    isFetched,
    isFetching,
  } = useQuery({
    queryFn: async () => {
      if (!input) return [];
      const { data } = await axios.get(`/api/search?q=${input}`);
      return data as Company & {
        _count: Prisma.CompanyCountOutputType;
      };
    },
    queryKey: ["search-query"],
    enabled: false,
  });
  return (
    <Command className="relative rounded-lg border max-w-lg z-50 overflow-visible">
      <CommandInput
        value={input}
        onValueChange={(text) => {
          setInput(text), debounceRequest();
        }}
        className="outline-none border-none focus:border-none focus:outline-none ring-0"
        placeholder="Search by company"
      ></CommandInput>
    </Command>
  );
};

export default SearchBar;
