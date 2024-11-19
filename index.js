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
    const isHoliday = tr.innerText.includes('Holiday');
    return isMissing && !isHoliday; // Ignore holidays
  });
}

function getCheckInTime(isHolidayEve) {
  // 7:30 - 8:30 for all days
  return getRandomTime(7, 8, 30, 59);
}

function getCheckOutTime(isHolidayEve) {
  if (isHolidayEve) {
    // 13:30 - 14:30 for Holiday Eve
    return getRandomTime(13, 14, 30, 59);
  } else {
    // 17:00 - 18:30 for regular days
    return getRandomTime(17, 18, 0, 30);
  }
}

function getRandomTime(startHour, endHour, startMinutes = 0, endMinutes = 59) {
  const hour = Math.floor(Math.random() * (endHour - startHour + 1)) + startHour;
  const minutes =
    hour === startHour
      ? Math.floor(Math.random() * (60 - startMinutes) + startMinutes)
      : Math.floor(Math.random() * (endMinutes + 1));
  return `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

async function submitHours(day) {
  const isHolidayEve = day.innerText.includes('Holiday Eve');
  day.querySelector('a.insert-row').click();
  const insertRow = await waitFor('tr.insert-row');

  // Generate check-in and check-out times
  const checkInTime = getCheckInTime(isHolidayEve);
  const checkOutTime = getCheckOutTime(isHolidayEve);

  insertRow.querySelector('input.checkin-str').value = checkInTime;
  insertRow.querySelector('input.checkout-str').value = checkOutTime;
  insertRow.querySelector('button.inline-confirm').click();

  await sleep(1000); // Wait for UI update
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
