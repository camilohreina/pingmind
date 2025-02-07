"use client";

import React, {useState} from "react";

export default function Chat() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/test/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          phone: "+57 3224354004",
          timezone: "America/Bogota",
        }),
      });
      const data = await res.json();

      console.log(data);
      setResponse(data.message);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="stretch mx-auto flex w-full max-w-md flex-col py-24">
      <form onSubmit={handleSubmit}>
        <input
          className="mb-8 w-full max-w-md rounded border border-gray-300 p-2 shadow-xl"
          placeholder="Say something..."
          value={input}
          onChange={handleInputChange}
        />
      </form>
      {response && (
        <div className="mt-4 rounded border border-gray-300 p-4 shadow-xl">{response}</div>
      )}
    </div>
  );
}
