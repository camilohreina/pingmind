"use client";

import { useState } from "react";
import { TimezoneCombobox } from "@/components/ui/timezone-combobox";
import MaxWidthWrapper from "@/components/max-width-wrapper";

export default function TestTimezonePage() {
  const [timezone, setTimezone] = useState("");
  const [countryCode, setCountryCode] = useState("");

  return (
    <MaxWidthWrapper className="py-20">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Test Timezone Combobox</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Country Code (e.g., US, MX, CO)
            </label>
            <input
              type="text"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
              className="w-full p-2 border rounded"
              placeholder="Enter country code"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Selected Timezone
            </label>
            <TimezoneCombobox
              value={timezone}
              onValueChange={setTimezone}
              countryCode={countryCode}
              placeholder="Select your timezone..."
            />
          </div>
          
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h3 className="font-medium">Debug Info:</h3>
            <p><strong>Country Code:</strong> {countryCode || "None"}</p>
            <p><strong>Selected Timezone:</strong> {timezone || "None"}</p>
          </div>
        </div>
      </div>
    </MaxWidthWrapper>
  );
}
