#!/usr/bin/env tsx
import { randomUUID } from "node:crypto";
import { pushTick } from "../src/lib/prices";

const loop = async () => {
  const base = 135 + Math.random() * 4;
  await pushTick({
    id: randomUUID(),
    open: base - Math.random(),
    high: base + Math.random() * 2,
    low: base - Math.random() * 2,
    close: base + Math.random(),
    volume: 100 + Math.random() * 50,
    timestamp: Date.now(),
  });
  console.log("tick pushed");
};

loop()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => process.exit(0));

