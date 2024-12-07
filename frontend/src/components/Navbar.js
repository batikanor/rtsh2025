"use client";

import { useState } from "react";
import Link from "next/link";
import { Bars3Icon as MenuIcon, XMarkIcon as XIcon } from "@heroicons/react/24/solid";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 shadow-lg bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 border-b border-stone-200 dark:border-stone-700 transition-colors duration-300">
      <div className="container mx-auto flex justify-between items-center py-4 px-6 md:px-12 lg:px-16">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <span className="text-2xl md:text-3xl font-bold tracking-wide cursor-pointer hover:text-stone-600 dark:hover:text-stone-300 transition duration-200">
            JiWizz
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8 text-lg font-medium">
          <Link href="/">
            <span className="hover:text-stone-600 dark:hover:text-stone-300 transition duration-200 cursor-pointer">
              Home
            </span>
          </Link>
          <Link href="/map">
            <span className="hover:text-stone-600 dark:hover:text-stone-300 transition duration-200 cursor-pointer">
              Roadmap
            </span>
          </Link>
          <Link href="/about">
            <span className="hover:text-stone-600 dark:hover:text-stone-300 transition duration-200 cursor-pointer">
              About Us
            </span>
          </Link>
          <ThemeToggle />
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setNavOpen(!navOpen)}
            aria-label="Toggle menu"
            className="p-2 rounded hover:bg-stone-100 dark:hover:bg-stone-800 transition duration-200"
          >
            {navOpen ? <XIcon className="h-7 w-7" /> : <MenuIcon className="h-7 w-7" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {navOpen && (
        <div className="md:hidden bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 border-t border-stone-200 dark:border-stone-700 shadow-lg transition-colors duration-300">
          <div className="container mx-auto flex flex-col gap-6 py-6 px-8 text-lg font-medium">
            <Link href="/">
              <span
                onClick={() => setNavOpen(false)}
                className="hover:text-stone-600 dark:hover:text-stone-300 transition duration-300 cursor-pointer"
              >
                Home
              </span>
            </Link>
            <Link href="/map">
              <span
                onClick={() => setNavOpen(false)}
                className="hover:text-stone-600 dark:hover:text-stone-300 transition duration-300 cursor-pointer"
              >
                Map
              </span>
            </Link>
            <Link href="/about">
              <span
                onClick={() => setNavOpen(false)}
                className="hover:text-stone-600 dark:hover:text-stone-300 transition duration-300 cursor-pointer"
              >
                About Us
              </span>
            </Link>
            <div className="pt-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
