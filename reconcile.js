const fs = require("fs");

let total = 0;
let count = 0;

const lines = fs.readFileSync("payments.jsonl", "utf8").split("\n").filter((l) => l.length > 0);
const latestEvents = {};

for (const line of lines) {
  let event;
  
  try {
    event = JSON.parse(line);
  } catch (e) {
    continue; 
  }

  if (!event.txn_id) {
    continue;
  }

  if (!latestEvents[event.txn_id]) {
    latestEvents[event.txn_id] = event;
  } else {
    const currentTs = new Date(event.ts).getTime();
    const storedTs = new Date(latestEvents[event.txn_id].ts).getTime();
    
    if (currentTs > storedTs) {
      latestEvents[event.txn_id] = event;
    }
  }
}

for (const event of Object.values(latestEvents)) {
  if (event.status === "success") {
    // Convert to string, remove commas, and parse as a float to prevent NaN errors
    const cleanAmount = parseFloat(String(event.amount).replace(/,/g, ""));
    if (!isNaN(cleanAmount)) {
      total += cleanAmount;
    }
    count += 1;
  }
}

const expected = parseInt(fs.readFileSync("expected.txt", "utf8").trim(), 10);

if (count !== expected) {
  console.log(`Check failed: counted ${count} successful payments, expected ${expected}.`);
  console.log("Something in the data isn't being handled the way the README describes.");
} else {
  console.log(`Check passed: ${count} successful payments.`);
  console.log(`Your code: KOYA-${Math.round(total)}`);
}
