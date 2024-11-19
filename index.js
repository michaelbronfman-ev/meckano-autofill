javascript:void(function() {
  /**
   * Meckano Auto-fill Script v1.4 (Enhanced Times and Error Handling)
   * - Regular days: Check-in 07:30 to 08:30, total hours between 9:15 and 11:30.
   * - Holiday Eve: Check-in 07:30 to 08:30, check-out 13:30 to 14:30 (6:00 to 6:30 total hours).
   * - Holidays: Skipped.
   */

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  const waitFor = async (selector, parent = document, maxAttempts = 10) => {
    for (let i = 0; i < maxAttempts; i++) {
      const element = parent.querySelector(selector);
      if (element) return element;
      await sleep(50);
    }
    throw new Error(`Could not find ${selector}`);
  };

  const getNonRestDays = () => 
    Array.from(document.querySelectorAll("table.employee-report > tbody > tr[data-report_data_id]:not(.highlightingRestDays)"));

  const getMissingDays = nonRestDays => 
    nonRestDays.filter(tr => tr.querySelector(".missing")?.innerText === "+");

  const getRandomTime = (startHour, endHour) => ({
    hour: Math.floor(Math.random() * (endHour - startHour + 1)) + startHour,
    minutes: Math.floor(Math.random() * 2) * 30
  });

  const formatTime = ({ hour, minutes }) => 
    `${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

  const calculateTotalMinutes = (checkIn, checkOut) => 
    (checkOut.hour * 60 + checkOut.minutes) - (checkIn.hour * 60 + checkIn.minutes);

  const adjustForHours = (checkIn, checkOut, minHours = 9.25, maxHours = 11.5) => {
    const totalMinutes = calculateTotalMinutes(checkIn, checkOut);
    const minMinutes = minHours * 60;
    const maxMinutes = maxHours * 60;

    if (totalMinutes < minMinutes || totalMinutes > maxMinutes) {
      const adjustedMinutes = checkIn.hour * 60 + checkIn.minutes + 
        (totalMinutes < minMinutes? minMinutes : maxMinutes);
      return {
        hour: Math.floor(adjustedMinutes / 60),
        minutes: adjustedMinutes % 60
      };
    }
    return checkOut;
  };

  const submitHours = async day => {
    try {
      const dayText = day.innerText.trim();
      if (/Holiday$/i.test(dayText)) return;

      const isHolidayEve = /Holiday Eve/i.test(dayText);

      day.querySelector("a.insert-row").click();
      const insertRow = await waitFor("tr.insert-row");

      const checkIn = getRandomTime(7, 8);
      let checkOut = isHolidayEve 
       ? getRandomTime(13, 14) 
        : adjustForHours(checkIn, getRandomTime(17, 18));

      insertRow.querySelector("input.checkin-str").value = formatTime(checkIn);
      insertRow.querySelector("input.checkout-str").value = formatTime(checkOut);
      insertRow.querySelector("button.inline-confirm").click();

      await sleep(1000); // Wait for UI to update
    } catch (error) {
      console.error(`Error processing day ${day.innerText.trim()}:`, error);
    }
  };

  const fillMonth = async () => {
    try {
      let nonRestDays, missingDays;
      do {
        nonRestDays = getNonRestDays();
        missingDays = getMissingDays(nonRestDays);
        if (missingDays.length) {
          await submitHours(missingDays[0]);
          // Ensure we don't overload the browser by processing one day at a time
          await sleep(2000); // Wait 2 seconds before processing the next day
        }
      } while (missingDays.length);
      console.log("All missing days have been filled.");
    } catch (error) {
      console.error("An error occurred while filling the month:", error);
    }
  };

  // Run the script
  fillMonth();
})();
