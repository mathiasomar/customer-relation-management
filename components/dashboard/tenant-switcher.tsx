"use client";

import Image from "next/image";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
// import { cn } from "@/lib/utils";

const TenantSwitcher = () => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  //   const handleTenantChange = () => {};
  return (
    <div className="flex items-center gap-2">
      <div className="relative size-8">
        <Image src="/side.svg" alt="Logo" fill className="object-cover" />
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-50 justify-between"
          >
            {value ? value : "Select product..."}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-50 p-0">
          <Command>
            <CommandInput placeholder="Search framework..." className="h-9" />
            <CommandList>
              <CommandEmpty>No tenant found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="Tenant1"
                  onSelect={(currentValue) => {
                    setValue(currentValue);
                    setOpen(false);
                  }}
                >
                  Tenant 1
                </CommandItem>
                <CommandItem
                  value="Tenant2"
                  onSelect={(currentValue) => {
                    setValue(currentValue);
                    setOpen(false);
                  }}
                >
                  Tenant 2
                </CommandItem>
                <CommandItem
                  value="Tenant3"
                  onSelect={(currentValue) => {
                    setValue(currentValue);
                    setOpen(false);
                  }}
                >
                  Tenant 3
                </CommandItem>
                <CommandItem
                  value="Tenant4"
                  onSelect={(currentValue) => {
                    setValue(currentValue);
                    setOpen(false);
                  }}
                >
                  Tenant 4
                </CommandItem>
                <CommandItem
                  value="Tenant5"
                  onSelect={(currentValue) => {
                    setValue(currentValue);
                    setOpen(false);
                  }}
                >
                  Tenant 5
                </CommandItem>
                {/* {isLoading
                  ? "Loading..."
                  : data?.products?.map((product) => (
                      <CommandItem
                        key={product.id}
                        value={product.name}
                        onSelect={(currentValue) => {
                          setValue(
                            currentValue === value ? "All" : currentValue
                          );
                          setOpen(false);
                          handleFilterByProduct(product.id);
                        }}
                      >
                        {product.name}
                        <Check
                          className={cn(
                            "ml-auto",
                            value === product.name ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))} */}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TenantSwitcher;
