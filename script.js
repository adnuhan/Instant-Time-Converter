document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const sourceTimeInput = document.getElementById("sourceTime");
  const targetTimeInput = document.getElementById("targetTime");
  const swapBtn = document.getElementById("swap-btn");
  const fromModeElement = document.getElementById("from-mode");
  const toModeElement = document.getElementById("to-mode");
  const sourceHint = document.getElementById("sourceHint");
  const targetHint = document.getElementById("targetHint");
  const ampmToggleContainer = document.getElementById("ampm-toggle");
  const ampmSwitch = document.getElementById("ampm-switch");
  const copyBtn = document.getElementById("copy-btn");
  const clearBtn = document.getElementById("clear-btn");
  const ampmIndicator = document.getElementById("ampm-indicator");

  // App State
  let is24to12Mode = true; // Default mode is 24-hour to 12-hour

  // Initialize the app
  function init() {
    updateModeDisplay();
    setupEventListeners();
    // Set a default example
    sourceTimeInput.value = "14:30";
    convertTime();
    updateAmPmIndicator();
  }

  // Set up event listeners
  function setupEventListeners() {
    // Input event for instant conversion with validation
    sourceTimeInput.addEventListener("input", function (e) {
      formatTimeInput(e.target);
      convertTime();
    });

    // Swap button
    swapBtn.addEventListener("click", toggleConversionMode);

    // AM/PM toggle switch
    ampmSwitch.addEventListener("change", function () {
      updateAmPmIndicator();
      convertTime();
    });

    // Copy button
    copyBtn.addEventListener("click", copyToClipboard);

    // Clear button
    clearBtn.addEventListener("click", clearInputs);

    // Quick example buttons
    document.querySelectorAll(".example-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        sourceTimeInput.value = this.getAttribute("data-time");
        convertTime();
      });
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", handleKeyboardShortcuts);
  }

  // Feature 1: Copy to Clipboard
  function copyToClipboard() {
    const result = targetTimeInput.value;
    if (!result || result.includes("Invalid")) {
      return;
    }

    navigator.clipboard
      .writeText(result)
      .then(() => {
        // Visual feedback
        const originalIcon = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        copyBtn.classList.add("success");

        setTimeout(() => {
          copyBtn.innerHTML = originalIcon;
          copyBtn.classList.remove("success");
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  }

  // Feature 2: Input Validation & Formatting
  function formatTimeInput(input) {
    let value = input.value;

    // Remove all non-digit and non-colon characters
    value = value.replace(/[^0-9:]/g, "");

    // If input contains a colon, format as HH:MM
    if (value.includes(":")) {
      const parts = value.split(":");

      // Handle hours part (max 2 digits)
      if (parts[0].length > 2) {
        parts[0] = parts[0].substring(0, 2);
      }

      // Handle minutes part (max 2 digits)
      if (parts[1] && parts[1].length > 2) {
        parts[1] = parts[1].substring(0, 2);
      }

      value = parts.join(":");

      // Set max length to 5 (HH:MM)
      if (value.length > 5) {
        value = value.substring(0, 5);
      }
    } else {
      // No colon - just hours, limit to 2 digits
      if (value.length > 2) {
        value = value.substring(0, 2);
      }
    }

    input.value = value;
  }

  // Feature 3: Keyboard Shortcuts
  function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + S to swap modes
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      toggleConversionMode();
    }

    // Ctrl/Cmd + C to copy result when target has focus
    if ((e.ctrlKey || e.metaKey) && e.key === "c") {
      // Check if target input has value and we're not in the middle of editing source
      if (targetTimeInput.value && !targetTimeInput.value.includes("Invalid")) {
        e.preventDefault();
        copyToClipboard();
      }
    }

    // Escape to clear both fields
    if (e.key === "Escape") {
      e.preventDefault();
      clearInputs();
    }

    // Tab to toggle AM/PM when in 12-to-24 mode and source has focus
    if (
      e.key === "Tab" &&
      !is24to12Mode &&
      document.activeElement === sourceTimeInput
    ) {
      e.preventDefault();
      ampmSwitch.checked = !ampmSwitch.checked;
      ampmSwitch.dispatchEvent(new Event("change"));
    }
  }

  // Helper function: Clear inputs
  function clearInputs() {
    sourceTimeInput.value = "";
    targetTimeInput.value = "";
    sourceTimeInput.focus();
  }

  // Update AM/PM indicator
  function updateAmPmIndicator() {
    ampmIndicator.textContent = ampmSwitch.checked ? "PM" : "AM";
  }

  // Toggle between 24h-to-12h and 12h-to-24h modes
  function toggleConversionMode() {
    is24to12Mode = !is24to12Mode;
    updateModeDisplay();

    // Swap the values between source and target
    const temp = sourceTimeInput.value;
    sourceTimeInput.value = targetTimeInput.value;
    targetTimeInput.value = temp;

    // Trigger conversion with new source value
    convertTime();
  }

  // Update mode display
  function updateModeDisplay() {
    if (is24to12Mode) {
      // 24h to 12h mode
      fromModeElement.textContent = "24-Hour";
      toModeElement.textContent = "12-Hour";
      ampmToggleContainer.style.display = "none";
      sourceTimeInput.placeholder = "e.g., 14:30 or 14";
      targetTimeInput.placeholder = "e.g., 2:30 PM";
      sourceHint.textContent = "Format: HH:MM or HH (00-24)";
      targetHint.textContent = "Converted time with AM/PM";
    } else {
      // 12h to 24h mode
      fromModeElement.textContent = "12-Hour";
      toModeElement.textContent = "24-Hour";
      ampmToggleContainer.style.display = "flex";
      sourceTimeInput.placeholder = "e.g., 2:30 or 2";
      targetTimeInput.placeholder = "e.g., 14:30";
      sourceHint.textContent = "Format: HH:MM or HH (1-12)";
      targetHint.textContent = "Converted time (00-24)";
      updateAmPmIndicator();
    }

    // Update the input field with current formatting rules
    formatTimeInput(sourceTimeInput);
  }

  // Main conversion function
  function convertTime() {
    const sourceValue = sourceTimeInput.value.trim();

    if (!sourceValue) {
      targetTimeInput.value = "";
      return;
    }

    try {
      let result;

      if (is24to12Mode) {
        result = convert24to12(sourceValue);
      } else {
        result = convert12to24(sourceValue, !ampmSwitch.checked); // Note: checkbox checked means PM
      }

      targetTimeInput.value = result;
    } catch (error) {
      // Don't show errors while user is typing
      // Only show error if input is clearly invalid
      if (
        sourceValue.length > 1 &&
        !isValidPartialInput(sourceValue, is24to12Mode)
      ) {
        targetTimeInput.value = "Invalid format";
      } else {
        targetTimeInput.value = "";
      }
    }
  }

  // Convert 24-hour format to 12-hour format
  function convert24to12(timeStr) {
    // Handle partial inputs gracefully
    if (!timeStr || timeStr === ":") return "";

    // Normalize input: remove spaces, handle different separators
    timeStr = timeStr.replace(/\s/g, "").replace(/\./g, ":");

    // If no colon is present, assume it's just hours and add :00
    if (!timeStr.includes(":")) {
      const hours = parseInt(timeStr, 10);

      // Handle special cases
      if (hours === 0) return "12:00 AM";
      if (hours === 12) return "12:00 PM";

      if (hours >= 0 && hours <= 24) {
        const period = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 || 12;
        return `${displayHours}:00 ${period}`;
      }

      return "Invalid hour";
    }

    // Split into hours and minutes
    const parts = timeStr.split(":");
    if (parts.length !== 2) return "Invalid format";

    let hours = parseInt(parts[0], 10);
    let minutes = parseInt(parts[1], 10);

    // If minutes are NaN or empty, default to 00
    if (isNaN(minutes) || parts[1] === "") {
      minutes = 0;
    }

    // Validate hours and minutes
    if (isNaN(hours) || hours < 0 || hours > 24) return "Invalid hour";
    if (minutes < 0 || minutes > 59) return "Invalid minute";

    // Handle special cases
    if (hours === 0 && minutes === 0) return "12:00 AM";
    if (hours === 12 && minutes === 0) return "12:00 PM";

    // Convert to 12-hour format
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;

    // Format minutes with leading zero if needed
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes.toString();

    return `${displayHours}:${formattedMinutes} ${period}`;
  }

  // Convert 12-hour format to 24-hour format
  function convert12to24(timeStr, isAm) {
    // Handle partial inputs gracefully
    if (!timeStr || timeStr === ":") return "";

    // Normalize input: remove spaces, handle different separators
    timeStr = timeStr.replace(/\s/g, "").replace(/\./g, ":");

    // If no colon is present, assume it's just hours and add :00
    if (!timeStr.includes(":")) {
      const hours = parseInt(timeStr, 10);

      if (hours >= 1 && hours <= 12) {
        let militaryHours = hours;

        // Handle 12 AM and 12 PM special cases
        if (isAm) {
          militaryHours = hours === 12 ? 0 : hours;
        } else {
          militaryHours = hours === 12 ? 12 : hours + 12;
        }

        return `${militaryHours < 10 ? "0" : ""}${militaryHours}:00`;
      }

      return "Invalid hour";
    }

    // Split into hours and minutes
    const parts = timeStr.split(":");
    if (parts.length !== 2) return "Invalid format";

    let hours = parseInt(parts[0], 10);
    let minutes = parseInt(parts[1], 10);

    // If minutes are NaN or empty, default to 00
    if (isNaN(minutes) || parts[1] === "") {
      minutes = 0;
    }

    // Validate hours and minutes
    if (isNaN(hours) || hours < 1 || hours > 12) return "Invalid hour";
    if (minutes < 0 || minutes > 59) return "Invalid minute";

    // Convert to 24-hour format
    let militaryHours = hours;

    if (isAm) {
      // AM: 12 AM becomes 0, others stay the same
      militaryHours = hours === 12 ? 0 : hours;
    } else {
      // PM: 12 PM stays 12, others add 12
      militaryHours = hours === 12 ? 12 : hours + 12;
    }

    // Format with leading zeros
    const formattedHours =
      militaryHours < 10 ? `0${militaryHours}` : militaryHours.toString();
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes.toString();

    return `${formattedHours}:${formattedMinutes}`;
  }

  // Check if input is valid while user is still typing
  function isValidPartialInput(input, is24to12) {
    if (!input) return true;

    // Remove any spaces
    input = input.replace(/\s/g, "");

    // If no colon, check if it's a valid number
    if (!input.includes(":")) {
      const num = parseInt(input, 10);

      if (is24to12) {
        // For 24-hour input
        return !isNaN(num) && num >= 0 && num <= 24;
      } else {
        // For 12-hour input, allow 1-12
        return !isNaN(num) && num >= 1 && num <= 12;
      }
    }

    // If colon is present, check both parts
    const parts = input.split(":");
    if (parts.length > 2) return false;

    const hours = parseInt(parts[0], 10);
    const minutes = parts[1] ? parseInt(parts[1], 10) : 0;

    if (isNaN(hours)) return false;

    if (is24to12) {
      // For 24-hour input
      if (hours < 0 || hours > 24) return false;
    } else {
      // For 12-hour input
      if (hours < 1 || hours > 12) return false;
    }

    // Check minutes if they exist
    if (parts[1] && (isNaN(minutes) || minutes < 0 || minutes > 59)) {
      return false;
    }

    return true;
  }

  // Initialize the app
  init();
});
