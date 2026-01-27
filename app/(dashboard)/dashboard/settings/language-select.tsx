import React, { useState, useEffect, useMemo } from "react";
import { Controller } from "react-hook-form";
import { Check, ChevronsUpDown, Globe, Monitor } from "lucide-react";
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

interface AutoDetectLanguageSelectProps {
  control: any;
  name?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  showBrowserDetection?: boolean;
}

export const AutoDetectLanguageSelect = ({
  control,
  name = "language",
  label = "Language",
  placeholder = "Select language...",
  required = false,
  showBrowserDetection = true,
}: AutoDetectLanguageSelectProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [browserLanguage, setBrowserLanguage] = useState<string | null>(null);

  // Detect browser language on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const getBrowserLanguage = async () => {
        const lang = await navigator.language;
        setBrowserLanguage(lang.split("-")[0]);
      };
      getBrowserLanguage();
    }
  }, []);

  const languageOptions = useMemo(
    () => [
      { value: "en", label: "English", flag: "🇺🇸" },
      { value: "es", label: "Spanish", flag: "🇪🇸" },
      { value: "fr", label: "French", flag: "🇫🇷" },
      { value: "de", label: "German", flag: "🇩🇪" },
      { value: "zh", label: "Chinese", flag: "🇨🇳" },
      { value: "ja", label: "Japanese", flag: "🇯🇵" },
      { value: "ko", label: "Korean", flag: "🇰🇷" },
      { value: "ar", label: "Arabic", flag: "🇸🇦" },
      { value: "pt", label: "Portuguese", flag: "🇵🇹" },
      { value: "ru", label: "Russian", flag: "🇷🇺" },
      { value: "hi", label: "Hindi", flag: "🇮🇳" },
      { value: "it", label: "Italian", flag: "🇮🇹" },
    ],
    [],
  );

  const filteredLanguages = useMemo(() => {
    if (!search.trim()) return languageOptions;

    const searchLower = search.toLowerCase();
    return languageOptions.filter(
      (lang) =>
        lang.label.toLowerCase().includes(searchLower) ||
        lang.value.toLowerCase().includes(searchLower),
    );
  }, [languageOptions, search]);

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={browserLanguage || "en"}
      rules={{
        required: required ? `${label} is required` : false,
      }}
      render={({ field, fieldState }) => {
        const selectedLang = languageOptions.find(
          (lang) => lang.value === field.value,
        );

        const browserLangOption = languageOptions.find(
          (lang) => lang.value === browserLanguage,
        );

        return (
          <Field data-invalid={fieldState.invalid}>
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
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{selectedLang?.flag}</span>
                      <span>{selectedLang?.label || field.value}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      {placeholder}
                    </div>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-full p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search language..."
                    value={search}
                    onValueChange={setSearch}
                  />
                  <CommandList>
                    <CommandEmpty>No language found.</CommandEmpty>

                    {/* Browser-detected language option */}
                    {showBrowserDetection && browserLangOption && (
                      <CommandGroup heading="Detected">
                        <CommandItem
                          value="browser-detect"
                          onSelect={() => {
                            field.onChange(browserLanguage);
                            setOpen(false);
                            setSearch("");
                          }}
                          className="flex items-center gap-3"
                        >
                          <Monitor className="h-4 w-4" />
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span>{browserLangOption.flag}</span>
                              <span className="font-medium">
                                {browserLangOption.label}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              Browser language
                            </span>
                          </div>
                        </CommandItem>
                      </CommandGroup>
                    )}

                    <CommandGroup heading="All Languages">
                      {filteredLanguages.map((lang) => (
                        <CommandItem
                          key={lang.value}
                          value={lang.value}
                          onSelect={() => {
                            field.onChange(lang.value);
                            setOpen(false);
                            setSearch("");
                          }}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <Check
                              className={cn(
                                "h-4 w-4 shrink-0",
                                field.value === lang.value
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            <span className="text-lg">{lang.flag}</span>
                            <span>{lang.label}</span>
                          </div>
                          <span className="text-xs text-gray-500 font-mono">
                            {lang.value}
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
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
