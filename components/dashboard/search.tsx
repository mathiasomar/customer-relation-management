"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../ui/input-group";
import { useState } from "react";
import { Button } from "../ui/button";

const Search = () => {
  const [searchValue, setSearchValue] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleSearch = (value: string | null) => {
    const params = new URLSearchParams(searchParams);
    params.set("search", value || "");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleClearSearch = () => {
    setSearchValue("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    router.refresh();
  };
  return (
    <div className="flex items-center gap-4">
      <div className="max-w-sm">
        <InputGroup>
          <InputGroupInput
            className="text-xs md:text-sm"
            placeholder="Type to search..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              className="text-xs md:text-sm"
              variant="secondary"
              onClick={() => handleSearch(searchValue)}
            >
              Search
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
      <Button
        className="text-xs md:text-sm"
        variant={"outline"}
        onClick={handleClearSearch}
      >
        All
      </Button>
    </div>
  );
};

export default Search;
