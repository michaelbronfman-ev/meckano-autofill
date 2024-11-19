function getNonRestDays() {
  return document.querySelectorAll(
    'table.employee-report > tbody > tr[data-report_data_id]:not(.highlightingRestDays)'
  );
}

function getMissingDays(nonRestDays) {
  return Array.from(nonRestDays).filter(tr => tr.querySelector('.missing').innerText === '+');
}

function getRandomTime(startHour, endHour) {
  const hour = Math.floor(Math.random() * (endHour - startHour + 1)) + startHour;
  const minutes = Math.floor(Math.random() * 2) * 30; // 0 or 30 minutes for simplicity
  return `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

async function submitHours(day) {
  const isHolidayEve = day.innerText.includes("Holiday Eve");
  const checkInTime = getRandomTime(7, 8); // Check-in: 7:30 to 8:30
  let checkOutTime;

  if (isHolidayEve) {
    // Holiday Eve: Check-out 13:30 to 14:30
    checkOutTime = getRandomTime(13, 14);
  } else {
    // Regular Day: Check-out 17:00 to 18:30
    checkOutTime = getRandomTime(17, 18);
  }

  day.querySelector('a.insert-row').click();
  const insertRow = await waitFor('tr.insert-row');

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

// Inject this script and run `fillMonth()` to execute the autofill logic.
