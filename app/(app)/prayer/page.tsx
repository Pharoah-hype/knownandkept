"use client";

import PrayerBoard from "@/components/prayer/PrayerBoard";

export default function PrayerPage() {
  return (
    <div className="flex-1 px-4 pt-16">
      <h1 className="font-serif text-2xl mb-6 px-2">Prayer Wall</h1>
      <PrayerBoard />
    </div>
  );
}
