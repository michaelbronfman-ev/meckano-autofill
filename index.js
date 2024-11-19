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
  // Selector adjusted to ensure compatibility with the page's DOM structure
  return document.querySelectorAll(
    'table.employee-report > tbody > tr[data-report_data_id]:not(.highlightingRestDays)'
  );
}

function getHolidays(nonRestDays) {
  // Identify rows marked as holidays
  return Array.from(nonRestDays).filter(tr => tr.innerText.includes('Holiday') && !tr.innerText.includes('Holiday Eve'));
}

function getHolidayEves(nonRestDays) {
  // Identify rows specifically marked as "Holiday Eve"
  return Array.from(nonRestDays).filter(tr => tr.innerText.includes('Holiday Eve'));
}

function getMissingDays(nonRestDays) {
  // Exclude holidays but include "Holiday Eve" rows
  const holidays = getHolidays(nonRestDays);
  return Array.from(nonRestDays).filter(
    tr => tr.querySelector('.missing').innerText === '+' && !holidays.includes(tr)
  );
}

function getRandomTime(startHour, endHour) {
  const hour = Math.floor(Math.random() * (endHour - startHour + 1)) + startHour;
  const minutes = Math.floor(Math.random() * 2) * 30; // 0 or 30 minutes for simplicity
  return `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

async function submitHours(day) {
  day.querySelector('a.insert-row').click();
  const insertRow = await waitFor('tr.insert-row');

  // Generate random check-in and check-out times
  const checkInTime = getRandomTime(7, 8); // Random time between 07:00-08:00
  const checkOutTime = day.innerText.includes('Holiday Eve')
    ? getRandomTime(13, 14) // Holiday Eve: 13:00-14:30
    : getRandomTime(17, 18); // Regular day: 17:00-18:00

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
  console.log('All missing days have been filled, excluding holidays, and including Holiday Eve.');
}

// To use the script, run:
// await fillMonth();
