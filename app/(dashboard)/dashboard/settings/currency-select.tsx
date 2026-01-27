import React, { useState, useMemo } from "react";
import { Controller } from "react-hook-form";
import { Check, ChevronsUpDown, DollarSign } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Currency data with code, name, symbol, and flag
interface CurrencyOption {
  value: string; // Currency code (USD, EUR, GBP, etc.)
  label: string; // Currency name
  symbol: string; // Currency symbol ($, €, £, etc.)
  code: string; // ISO code
  flag?: string; // Country flag emoji
  countries: string[]; // Countries using this currency
}

interface CurrencySelectProps {
  control: any;
  name?: string;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  showSymbol?: boolean;
  showFlag?: boolean;
  className?: string;
}

export const CurrencySelect = ({
  control,
  name = "currency",
  label = "Currency",
  placeholder = "Select currency...",
  defaultValue = "USD",
  required = false,
  showSymbol = true,
  showFlag = true,
  className = "",
}: CurrencySelectProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Common currencies with their data
  const currencyOptions = useMemo<CurrencyOption[]>(
    () => [
      // Major currencies
      {
        value: "USD",
        label: "US Dollar",
        symbol: "$",
        code: "USD",
        flag: "🇺🇸",
        countries: ["United States"],
      },
      {
        value: "EUR",
        label: "Euro",
        symbol: "€",
        code: "EUR",
        flag: "🇪🇺",
        countries: ["Eurozone"],
      },
      {
        value: "KES",
        label: "Ksh",
        symbol: "KSH",
        code: "KSH",
        flag: "KE",
        countries: ["Kenya"],
      },
      {
        value: "GBP",
        label: "British Pound",
        symbol: "£",
        code: "GBP",
        flag: "🇬🇧",
        countries: ["United Kingdom"],
      },
      {
        value: "JPY",
        label: "Japanese Yen",
        symbol: "¥",
        code: "JPY",
        flag: "🇯🇵",
        countries: ["Japan"],
      },
      {
        value: "AUD",
        label: "Australian Dollar",
        symbol: "A$",
        code: "AUD",
        flag: "🇦🇺",
        countries: ["Australia"],
      },
      {
        value: "CAD",
        label: "Canadian Dollar",
        symbol: "C$",
        code: "CAD",
        flag: "🇨🇦",
        countries: ["Canada"],
      },
      {
        value: "CHF",
        label: "Swiss Franc",
        symbol: "CHF",
        code: "CHF",
        flag: "🇨🇭",
        countries: ["Switzerland"],
      },
      {
        value: "CNY",
        label: "Chinese Yuan",
        symbol: "¥",
        code: "CNY",
        flag: "🇨🇳",
        countries: ["China"],
      },
      {
        value: "INR",
        label: "Indian Rupee",
        symbol: "₹",
        code: "INR",
        flag: "🇮🇳",
        countries: ["India"],
      },

      // Other common currencies
      {
        value: "SGD",
        label: "Singapore Dollar",
        symbol: "S$",
        code: "SGD",
        flag: "🇸🇬",
        countries: ["Singapore"],
      },
      {
        value: "HKD",
        label: "Hong Kong Dollar",
        symbol: "HK$",
        code: "HKD",
        flag: "🇭🇰",
        countries: ["Hong Kong"],
      },
      {
        value: "KRW",
        label: "South Korean Won",
        symbol: "₩",
        code: "KRW",
        flag: "🇰🇷",
        countries: ["South Korea"],
      },
      {
        value: "MXN",
        label: "Mexican Peso",
        symbol: "MX$",
        code: "MXN",
        flag: "🇲🇽",
        countries: ["Mexico"],
      },
      {
        value: "BRL",
        label: "Brazilian Real",
        symbol: "R$",
        code: "BRL",
        flag: "🇧🇷",
        countries: ["Brazil"],
      },
      {
        value: "RUB",
        label: "Russian Ruble",
        symbol: "₽",
        code: "RUB",
        flag: "🇷🇺",
        countries: ["Russia"],
      },
      {
        value: "ZAR",
        label: "South African Rand",
        symbol: "R",
        code: "ZAR",
        flag: "🇿🇦",
        countries: ["South Africa"],
      },
      {
        value: "TRY",
        label: "Turkish Lira",
        symbol: "₺",
        code: "TRY",
        flag: "🇹🇷",
        countries: ["Turkey"],
      },
      {
        value: "AED",
        label: "UAE Dirham",
        symbol: "د.إ",
        code: "AED",
        flag: "🇦🇪",
        countries: ["United Arab Emirates"],
      },
      {
        value: "SAR",
        label: "Saudi Riyal",
        symbol: "﷼",
        code: "SAR",
        flag: "🇸🇦",
        countries: ["Saudi Arabia"],
      },

      // European currencies
      {
        value: "NOK",
        label: "Norwegian Krone",
        symbol: "kr",
        code: "NOK",
        flag: "🇳🇴",
        countries: ["Norway"],
      },
      {
        value: "SEK",
        label: "Swedish Krona",
        symbol: "kr",
        code: "SEK",
        flag: "🇸🇪",
        countries: ["Sweden"],
      },
      {
        value: "DKK",
        label: "Danish Krone",
        symbol: "kr",
        code: "DKK",
        flag: "🇩🇰",
        countries: ["Denmark"],
      },
      {
        value: "PLN",
        label: "Polish Złoty",
        symbol: "zł",
        code: "PLN",
        flag: "🇵🇱",
        countries: ["Poland"],
      },
      {
        value: "CZK",
        label: "Czech Koruna",
        symbol: "Kč",
        code: "CZK",
        flag: "🇨🇿",
        countries: ["Czech Republic"],
      },
      {
        value: "HUF",
        label: "Hungarian Forint",
        symbol: "Ft",
        code: "HUF",
        flag: "🇭🇺",
        countries: ["Hungary"],
      },

      // Asian currencies
      {
        value: "THB",
        label: "Thai Baht",
        symbol: "฿",
        code: "THB",
        flag: "🇹🇭",
        countries: ["Thailand"],
      },
      {
        value: "IDR",
        label: "Indonesian Rupiah",
        symbol: "Rp",
        code: "IDR",
        flag: "🇮🇩",
        countries: ["Indonesia"],
      },
      {
        value: "MYR",
        label: "Malaysian Ringgit",
        symbol: "RM",
        code: "MYR",
        flag: "🇲🇾",
        countries: ["Malaysia"],
      },
      {
        value: "PHP",
        label: "Philippine Peso",
        symbol: "₱",
        code: "PHP",
        flag: "🇵🇭",
        countries: ["Philippines"],
      },
      {
        value: "VND",
        label: "Vietnamese Dong",
        symbol: "₫",
        code: "VND",
        flag: "🇻🇳",
        countries: ["Vietnam"],
      },

      // Middle East
      {
        value: "ILS",
        label: "Israeli Shekel",
        symbol: "₪",
        code: "ILS",
        flag: "🇮🇱",
        countries: ["Israel"],
      },
      {
        value: "EGP",
        label: "Egyptian Pound",
        symbol: "E£",
        code: "EGP",
        flag: "🇪🇬",
        countries: ["Egypt"],
      },
    ],
    [],
  );

  // Group currencies by region/type
  const groupedCurrencies = useMemo(() => {
    const groups: Record<string, CurrencyOption[]> = {
      "Major Currencies": [],
      Americas: [],
      Europe: [],
      "Asia & Pacific": [],
      "Middle East & Africa": [],
    };

    // Define currency groups
    const majorCodes = [
      "USD",
      "EUR",
      "GBP",
      "JPY",
      "AUD",
      "CAD",
      "CHF",
      "CNY",
      "INR",
    ];
    const americasCodes = ["MXN", "BRL", "CLP", "COP", "PEN", "ARS"];
    const europeCodes = [
      "NOK",
      "SEK",
      "DKK",
      "PLN",
      "CZK",
      "HUF",
      "RON",
      "BGN",
      "HRK",
    ];
    const asiaCodes = [
      "SGD",
      "HKD",
      "KRW",
      "THB",
      "IDR",
      "MYR",
      "PHP",
      "VND",
      "NZD",
      "PKR",
      "BDT",
    ];
    const meaCodes = [
      "AED",
      "SAR",
      "TRY",
      "ZAR",
      "ILS",
      "EGP",
      "QAR",
      "OMR",
      "KWD",
    ];

    currencyOptions.forEach((currency) => {
      if (majorCodes.includes(currency.value)) {
        groups["Major Currencies"].push(currency);
      } else if (americasCodes.includes(currency.value)) {
        groups["Americas"].push(currency);
      } else if (europeCodes.includes(currency.value)) {
        groups["Europe"].push(currency);
      } else if (asiaCodes.includes(currency.value)) {
        groups["Asia & Pacific"].push(currency);
      } else if (meaCodes.includes(currency.value)) {
        groups["Middle East & Africa"].push(currency);
      } else {
        groups["Middle East & Africa"].push(currency);
      }
    });

    // Sort each group alphabetically by label
    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => a.label.localeCompare(b.label));
    });

    return groups;
  }, [currencyOptions]);

  // Filter currencies based on search
  const filteredGroups = useMemo(() => {
    if (!search.trim()) return groupedCurrencies;

    const searchLower = search.toLowerCase();
    const filtered: Record<string, CurrencyOption[]> = {};

    Object.entries(groupedCurrencies).forEach(([group, currencies]) => {
      const filteredCurrencies = currencies.filter(
        (currency) =>
          currency.label.toLowerCase().includes(searchLower) ||
          currency.code.toLowerCase().includes(searchLower) ||
          currency.symbol.toLowerCase().includes(searchLower) ||
          currency.countries.some((country) =>
            country.toLowerCase().includes(searchLower),
          ),
      );

      if (filteredCurrencies.length > 0) {
        filtered[group] = filteredCurrencies;
      }
    });

    return filtered;
  }, [groupedCurrencies, search]);

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      rules={{
        required: required ? `${label} is required` : false,
      }}
      render={({ field, fieldState }) => {
        const selectedCurrency = currencyOptions.find(
          (currency) => currency.value === field.value,
        );

        return (
          <Field className={className} data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={name}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </FieldLabel>

            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  aria-invalid={fieldState.invalid}
                  className={cn(
                    "w-full justify-between font-normal",
                    !field.value && "text-muted-foreground",
                    fieldState.invalid && "border-red-500",
                  )}
                >
                  {field.value ? (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        {showFlag && selectedCurrency?.flag && (
                          <span className="text-lg">
                            {selectedCurrency.flag}
                          </span>
                        )}
                        <div className="flex flex-col items-start">
                          <div className="flex items-center gap-2">
                            {showSymbol && (
                              <span className="font-semibold">
                                {selectedCurrency?.symbol}
                              </span>
                            )}
                            <span className="font-medium">
                              {selectedCurrency?.label || field.value}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {selectedCurrency?.code}
                          </span>
                        </div>
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        {placeholder}
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </>
                  )}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-full p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search currency..."
                    value={search}
                    onValueChange={setSearch}
                  />
                  <CommandList className="max-h-100">
                    <CommandEmpty>No currency found.</CommandEmpty>

                    {Object.entries(filteredGroups).map(
                      ([groupName, currencies]) => (
                        <CommandGroup key={groupName} heading={groupName}>
                          {currencies.map((currency) => (
                            <CommandItem
                              key={currency.value}
                              value={currency.value}
                              onSelect={() => {
                                field.onChange(currency.value);
                                setOpen(false);
                                setSearch("");
                              }}
                              className="flex items-center justify-between py-2"
                            >
                              <div className="flex items-center gap-3">
                                <Check
                                  className={cn(
                                    "h-4 w-4 shrink-0",
                                    field.value === currency.value
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                <div className="flex items-center gap-3">
                                  {showFlag && currency.flag && (
                                    <span className="text-lg">
                                      {currency.flag}
                                    </span>
                                  )}
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold">
                                        {currency.symbol}
                                      </span>
                                      <span className="font-medium">
                                        {currency.label}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-gray-500 font-mono">
                                        {currency.code}
                                      </span>
                                      <span className="text-xs text-gray-500 truncate max-w-37.5">
                                        {currency.countries[0]}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ),
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
};
