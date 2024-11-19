/**
1. Go to your current monthly report: https://app.meckano.co.il/#report/21-06-2022/20-07-2022
2. Inject this script into the page
3. Run `await fillMonth()`
4. Watch the script filling your entire missing non-rest days with randomized values
*/

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
    const statusText = tr.querySelector('.status').innerText.toLowerCase();
    const isHoliday = statusText.includes('holiday') || statusText.includes('eve');
    const isMissing = tr.querySelector('.missing')?.innerText === '+';
    return isMissing && !isHoliday;
  });
}

function getRandomTime(startHour, endHour) {
  const hour = Math.floor(Math.random() * (endHour - startHour + 1)) + startHour;
  const minutes = Math.random() < 0.5 ? 0 : 30; // Randomly pick 0 or 30 minutes
  return `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

async function submitHours(day) {
  day.querySelector('a.insert-row').click();
  const insertRow = await waitFor('tr.insert-row');

  // Generate random check-in and check-out times
  const checkInTime = getRandomTime(7, 8); // Random time between 07:30-08:30
  const checkOutTime = getRandomTime(17, 18); // Random time between 17:00-18:00

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
