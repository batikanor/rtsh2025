/* eslint-disable react/no-unescaped-entities */

"use client";

import React from "react";
import dynamic from "next/dynamic";

export default function Home() {


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

        {/* <Projects /> */}
        <hr className="w-full border-t border-gray-300 my-8" />

        {/* <CV /> */}

        <br />
        <br />
        <br />
        <br />
      </main>
    </div>
  );
}
