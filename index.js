/**
 * 1. Inject this script into the page or use a bookmarklet.
 * 2. Run `await fillMonth()` in the console.
 * 3. It will fill all missing non-rest days with randomized times based on the logic provided.
 */

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitFor(selector, parent = document) {
  let attempts = 10;
  while (attempts > 0) {
    const element = parent.querySelector(selector);
    if (element) {
      return element;
    }
    await sleep(50);
    attempts--;
  }
  throw new Error(`Could not find ${selector}`);
}

function getNonRestDays() {
  return document.querySelectorAll(
    "table.employee-report > tbody > tr[data-report_data_id]:not(.highlightingRestDays)"
  );
}

function getMissingDays(nonRestDays) {
  return Array.from(nonRestDays).filter(
    (tr) =>
      tr.querySelector(".missing") &&
      tr.querySelector(".missing").innerText === "+"
  );
}

function getRandomTime(startHour, endHour) {
  const hour = Math.floor(Math.random() * (endHour - startHour + 1)) + startHour;
  const minutes = Math.floor(Math.random() * 2) * 30; // Randomize 0 or 30 minutes
  return `${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

async function submitHours(day) {
  const isHolidayEve = day.innerText.includes("Holiday Eve"); // Check if it's Holiday Eve
  const isHoliday = day.innerText.includes("Holiday"); // Ignore holidays

  if (isHoliday) {
    console.log("Skipping holiday:", day.innerText.trim());
    return;
  }

  day.querySelector("a.insert-row").click();
  const insertRow = await waitFor("tr.insert-row");

  // Generate check-in and check-out times
  const checkInTime = getRandomTime(7, 8); // Check-in: 7:30 to 8:30
  let checkOutTime;

  if (isHolidayEve) {
    // Holiday Eve: Check-out 13:30 to 14:30
    checkOutTime = getRandomTime(13, 14);
  } else {
    // Regular Days: Check-out 17:00 to 18:30
    checkOutTime = getRandomTime(17, 18);
  }

  // Update the fields
  insertRow.querySelector("input.checkin-str").value = checkInTime;
  insertRow.querySelector("input.checkout-str").value = checkOutTime;
  insertRow.querySelector("button.inline-confirm").click();

  await sleep(1000); // Wait for UI to update
}

async function fillMonth() {
  let nonRestDays = getNonRestDays();
  let missingDays = getMissingDays(nonRestDays);

  while (missingDays.length > 0) {
    await submitHours(missingDays[0]);
    nonRestDays = getNonRestDays();
    missingDays = getMissingDays(nonRestDays);
  }

  console.log("All missing days have been filled.");
}

// To use the script, run:
// await fillMonth();
