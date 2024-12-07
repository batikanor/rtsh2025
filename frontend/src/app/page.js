/* eslint-disable react/no-unescaped-entities */

"use client";

import React, { useState } from "react";
import axios from "axios";

export default function Home() {
  const [helloMessage, setHelloMessage] = useState("");
  const [newItem, setNewItem] = useState({});
  const [itemInput, setItemInput] = useState("");

  // Fetch hello message from the backend
  const fetchHello = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/hello", {
        params: { name: "Next.js User" },
      });
      setHelloMessage(response.data.message);
    } catch (error) {
      console.error("Error fetching hello message:", error);
    }
  };

  // Send a new item to the backend
  const sendItem = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:8000/items", {
        item: { name: itemInput },
      });
      setNewItem(response.data.item);
    } catch (error) {
      console.error("Error sending item:", error);
    }
  };

  return (
    <div>
      <main className="flex flex-col items-center justify-center">
        {/* Header and Menu */}
        <header className="text-center">
          <br />
          <h1 className="flex items-center justify-center space-x-2">
            <span>🌍</span>
            <span>Nice Project</span>
          </h1>
        </header>

        {/* Divider */}
        <hr className="w-full border-t border-gray-300 my-8" />

        {/* Description Content */}
        <p className="text-center max-w-lg text-base sm:text-lg leading-relaxed">
          We will try to win!
        </p>
        <hr className="w-full border-t border-gray-300 my-8" />

        {/* Axios GET Example */}
        <div>
          <button
            onClick={fetchHello}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Fetch Hello Message
          </button>
          {helloMessage && <p className="mt-4">Message: {helloMessage}</p>}
        </div>

        {/* Axios POST Example */}
        <div className="mt-8">
          <input
            type="text"
            value={itemInput}
            onChange={(e) => setItemInput(e.target.value)}
            placeholder="Enter item name"
            className="border border-gray-300 px-4 py-2 rounded"
          />
          <button
            onClick={sendItem}
            className="bg-green-500 text-white px-4 py-2 rounded ml-2"
          >
            Send Item
          </button>
          {newItem.name && (
            <p className="mt-4">New Item Created: {newItem.name}</p>
          )}
        </div>

        <hr className="w-full border-t border-gray-300 my-8" />
        <br />
        <br />
        <br />
        <br />
      </main>
    </div>
  );
}
