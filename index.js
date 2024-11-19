/**
1. Go to your current monthly report page on Meckano.
2. Inject this script into the browser's console.
3. Run `await fillMonth()` to autofill missing non-rest days.
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
    'table.employee-report > tbody > tr[data-report_data_id]:not(.highlightingRestDays)'
  );
}

function getMissingDays(nonRestDays) {
  return Array.from(nonRestDays).filter(
    (tr) =>
      tr.querySelector('.missing') &&
      tr.querySelector('.missing').innerText === '+' &&
      !tr.innerText.includes('Holiday') // Skip Holidays
  );
}

function getRandomTimeWithMinutes(startHour, endHour, fixedMinutes = [0, 30], allowHalfExtra = false) {
  let hour = Math.floor(Math.random() * (endHour - startHour + 1)) + startHour;

  // Add logic for extending to 30 minutes into the next hour
  if (allowHalfExtra && hour === endHour) {
    const extraMinutes = Math.random() < 0.5 ? 30 : 0;
    return `${String(hour).padStart(2, '0')}:${String(extraMinutes).padStart(2, '0')}`;
  }

  const minutes = fixedMinutes[Math.floor(Math.random() * fixedMinutes.length)];
  return `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

async function submitHours(day) {
  const isHolidayEve = day.innerText.includes('Holiday Eve'); // Check if the row is a "Holiday Eve"

  day.querySelector('a.insert-row').click();
  const insertRow = await waitFor('tr.insert-row');

  // Randomize check-in and check-out times
  const checkInTime = getRandomTimeWithMinutes(7, 8, [30, 0]); // Check-in between 7:30 and 8:30

  let checkOutTime;
  if (isHolidayEve) {
    // Special handling for Holiday Eve: Check-out between 13:30 and 14:30
    checkOutTime = getRandomTimeWithMinutes(13, 14, [0, 30]);
  } else {
    // Regular days: Check-out between 17:00 and 18:30
    checkOutTime = getRandomTimeWithMinutes(17, 18, [0, 30], true);
  }

  insertRow.querySelector('input.checkin-str').value = checkInTime;
  insertRow.querySelector('input.checkout-str').value = checkOutTime;
  insertRow.querySelector('button.inline-confirm').click();

  await sleep(1000); // Wait for the UI to update
}

async function fillMonth() {
  let nonRestDays = getNonRestDays();
  let missingDays = getMissingDays(nonRestDays);

  while (missingDays.length > 0) {
    await submitHours(missingDays[0]);
    nonRestDays = getNonRestDays();
    missingDays = getMissingDays(nonRestDays);
  }

  console.log('All missing days have been filled.');
}

// To use the script, run:
// await fillMonth();
