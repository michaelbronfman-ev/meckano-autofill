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
  return Array.from(nonRestDays).filter(tr => tr.querySelector('.missing').innerText === '+');
}

function getRandomTimeInRange(startHour, startMinute, endHour, endMinute) {
  const totalStartMinutes = startHour * 60 + startMinute;
  const totalEndMinutes = endHour * 60 + endMinute;
  const randomMinutes =
    Math.floor(Math.random() * (totalEndMinutes - totalStartMinutes + 1)) +
    totalStartMinutes;

  const hour = Math.floor(randomMinutes / 60);
  const minutes = randomMinutes % 60;
  return `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

async function submitHours(day) {
  day.querySelector('a.insert-row').click();
  const insertRow = await waitFor('tr.insert-row');

  // Generate random check-in and check-out times within the defined range
  const checkInTime = getRandomTimeInRange(7, 30, 8, 30); // 07:30–08:30
  const totalHours = Math.random() * (11.5 - 9) + 9; // Random total hours between 9–11:30
  const checkOutTime = getRandomTimeInRange(
    parseInt(checkInTime.split(':')[0], 10) + Math.floor(totalHours),
    parseInt(checkInTime.split(':')[1], 10),
    18,
    30
  );

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
