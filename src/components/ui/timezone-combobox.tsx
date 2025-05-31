"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn, getTimezonesFromCountry, searchTimezones } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

interface TimezoneComboboxProps {
  value?: string;
  onValueChange: (value: string) => void;
  countryCode?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function TimezoneCombobox({
  value,
  onValueChange,
  countryCode = "",
  placeholder = "Seleccionar timezone...",
  disabled = false,
}: TimezoneComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const previousCountryCode = React.useRef<string>("");

  // Obtener timezones basados en el código de país
  const countryTimezones = React.useMemo(() => {
    if (!countryCode) return [];
    return getTimezonesFromCountry(countryCode);
  }, [countryCode]);

  // Obtener timezones de búsqueda
  const searchResults = React.useMemo(() => {
    if (!searchQuery) return [];
    return searchTimezones(searchQuery);
  }, [searchQuery]);

  // Combinar timezones (prioridad a los del país)
  const allTimezones = React.useMemo(() => {
    const countrySet = new Set(countryTimezones.map((tz) => tz.value));
    const combined = [...countryTimezones];

    // Solo agregar resultados de búsqueda si hay una query
    if (searchQuery) {
      searchResults.forEach((tz) => {
        if (!countrySet.has(tz.value)) {
          combined.push(tz);
        }
      });
    }

    // Asegurar que el timezone seleccionado esté incluido, incluso si no está en los resultados actuales
    if (value && !combined.some((tz) => tz.value === value)) {
      // Buscar el timezone seleccionado en todas las opciones posibles
      const selectedTimezone = searchTimezones(value).find(
        (tz) => tz.value === value,
      );
      if (selectedTimezone) {
        combined.push(selectedTimezone);
      } else {
        // Si no se encuentra en la búsqueda, crear una entrada básica
        combined.push({
          value: value,
          label: value,
          country: "Unknown",
          id: `${value}-unknown`,
        });
      }
    }

    return combined;
  }, [countryTimezones, searchResults, searchQuery, value]);

  // Manejar cambios de país y auto-selección
  React.useEffect(() => {
    console.log("Country effect triggered:", {
      countryCode,
      previousCountry: previousCountryCode.current,
      countryTimezones: countryTimezones.length,
      value,
    });

    // Verificar si realmente cambió el país
    const countryChanged = previousCountryCode.current !== countryCode;

    if (!countryCode) {
      previousCountryCode.current = countryCode;
      return;
    }

    if (countryTimezones.length === 0) {
      // Si el país no tiene timezones (cargando), no hacer nada
      return;
    }

    // Solo procesar si el país realmente cambió
    if (countryChanged) {
      console.log(
        "Country actually changed from",
        previousCountryCode.current,
        "to",
        countryCode,
      );

      // Si hay un timezone seleccionado, verificar si pertenece al nuevo país
      if (value) {
        const belongsToCountry = countryTimezones.some(
          (tz) => tz.value === value,
        );
        if (!belongsToCountry) {
          // El timezone actual no pertenece al nuevo país
          // Si el nuevo país tiene solo un timezone, seleccionarlo
          if (countryTimezones.length === 1) {
            console.log(
              "Auto-selecting single timezone for new country:",
              countryTimezones[0].value,
            );
            onValueChange(countryTimezones[0].value);
          } else {
            // Si tiene múltiples timezones, resetear para que el usuario elija
            console.log(
              "Resetting timezone for country with multiple timezones",
            );
            onValueChange("");
          }
        }
        // Si el timezone actual pertenece al país, mantenerlo
      } else {
        // Si no hay timezone seleccionado, auto-seleccionar si solo hay uno disponible
        if (countryTimezones.length === 1) {
          console.log(
            "Auto-selecting timezone for country with single timezone:",
            countryTimezones[0].value,
          );
          onValueChange(countryTimezones[0].value);
        }
      }

      // Actualizar la referencia del país anterior
      previousCountryCode.current = countryCode;
    }
  }, [countryCode, countryTimezones, value, onValueChange]);

  const selectedTimezone = allTimezones.find((tz) => tz.value === value);

  // Limpiar búsqueda cuando se cierra el popover
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchQuery("");
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedTimezone ? selectedTimezone.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar timezone..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              {searchQuery
                ? "No se encontraron timezones."
                : "Escribe para buscar timezones..."}
            </CommandEmpty>
            {/* Mostrar otros timezones solo cuando hay búsqueda */}
            {searchQuery && searchResults.length > 0 && (
              <CommandGroup heading="Otros timezones">
                {searchResults
                  .filter(
                    (tz) =>
                      !countryTimezones.some((ctz) => ctz.value === tz.value),
                  )
                  .map((timezone) => (
                    <CommandItem
                      key={timezone.id}
                      value={timezone.value}
                      onSelect={() => {
                        onValueChange(timezone.value);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === timezone.value
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      {timezone.label}
                    </CommandItem>
                  ))}
              </CommandGroup>
            )}

            {/* Mostrar timezones del país cuando no hay búsqueda o cuando hay búsqueda pero también coinciden */}
            {countryTimezones.length > 0 && (
              <CommandGroup
                heading={searchQuery ? "De tu país" : "Basado en tu país"}
              >
                {countryTimezones.map((timezone) => (
                  <CommandItem
                    key={timezone.id}
                    value={timezone.value}
                    onSelect={() => {
                      onValueChange(timezone.value);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === timezone.value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {timezone.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
