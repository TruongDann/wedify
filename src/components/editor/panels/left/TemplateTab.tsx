"use client";

import React from "react";
import { Section } from "../../shared";

export const TemplateTab: React.FC = () => {
  const templates = [
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=200&h=280&fit=crop",
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=200&h=280&fit=crop",
    "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=200&h=280&fit=crop",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=200&h=280&fit=crop",
  ];

  return (
    <Section title="Mẫu thiệp cưới">
      <div className="grid grid-cols-2 gap-2">
        {templates.map((src, index) => (
          <div
            key={index}
            className="aspect-3/4 rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary transition-colors"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`Template ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </Section>
  );
};
