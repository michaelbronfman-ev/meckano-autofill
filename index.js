function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
  return Array.from(nonRestDays).filter(tr => {
    const isMissing = tr.querySelector('.missing')?.innerText === '+';
    const isHolidayEve = tr.innerText.includes('Holiday Eve'); // Check if the row is a Holiday Eve
    return isMissing || isHolidayEve;
  });
}

function getRandomTime(startHour, endHour, startMinutes, endMinutes) {
  const hour = Math.floor(Math.random() * (endHour - startHour + 1)) + startHour;

  // Ensure the time falls within the specified range
  if (hour === startHour) {
    return `${String(hour).padStart(2, '0')}:${startMinutes}`;
  }

  const minutes = Math.floor(Math.random() * (endMinutes - startMinutes + 1)) + startMinutes;
  return `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function getCheckInTime(isHolidayEve) {
  return isHolidayEve ? getRandomTime(7, 8, 30, 0) : getRandomTime(7, 8, 30, 0); // Holiday Eve also 7:30 - 8:30
}

function getCheckOutTime(isHolidayEve) {
  return isHolidayEve ? getRandomTime(13, 14, 30, 0) : getRandomTime(17, 18, 0, 30); // Holiday Eve 13:30 - 14:30, otherwise 17:00 - 18:30
}

async function submitHours(day) {
  const isHolidayEve = day.innerText.includes('Holiday Eve'); // Identify Holiday Eve rows
  day.querySelector('a.insert-row').click();
  const insertRow = await waitFor('tr.insert-row');

  // Generate random check-in and check-out times
  const checkInTime = getCheckInTime(isHolidayEve);
  const checkOutTime = getCheckOutTime(isHolidayEve);

  insertRow.querySelector('input.checkin-str').value = checkInTime;
  insertRow.querySelector('input.checkout-str').value = checkOutTime;
  insertRow.querySelector('button.inline-confirm').click();

  await sleep(1000); // Wait for a second to let the UI update
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
