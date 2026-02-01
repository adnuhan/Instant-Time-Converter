document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const sourceTimeInput = document.getElementById('sourceTime');
    const targetTimeInput = document.getElementById('targetTime');
    const swapBtn = document.getElementById('swapBtn');
    const mode24to12 = document.getElementById('mode24to12');
    const mode12to24 = document.getElementById('mode12to24');
    const sourceLabel = document.getElementById('sourceLabel');
    const targetLabel = document.getElementById('targetLabel');
    const sourceHint = document.getElementById('sourceHint');
    const targetHint = document.getElementById('targetHint');
    const ampmSection = document.getElementById('ampmSection');
    const amPmToggle = document.getElementById('amPmToggle');
    const toggleText = document.getElementById('toggleText');
    
    // App State
    let is24to12Mode = true;
    let isAM = true;
    
    // Initialize the app
    function init() {
        updateUIForMode();
        setupEventListeners();
        // Set a default example
        sourceTimeInput.value = '14:30';
        convertTime();
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Input event for instant conversion
        sourceTimeInput.addEventListener('input', convertTime);
        
        // Swap button
        swapBtn.addEventListener('click', toggleConversionMode);
        
        // AM/PM toggle button
        amPmToggle.addEventListener('click', toggleAmPm);
    }
    
    // Toggle AM/PM
    function toggleAmPm() {
        isAM = !isAM;
        updateAmPmUI();
        convertTime();
    }
    
    // Update AM/PM UI
    function updateAmPmUI() {
        if (isAM) {
            ampmSection.classList.remove('pm');
            ampmSection.classList.add('am');
            toggleText.textContent = 'AM';
        } else {
            ampmSection.classList.remove('am');
            ampmSection.classList.add('pm');
            toggleText.textContent = 'PM';
        }
    }
    
    // Toggle between 24h-to-12h and 12h-to-24h modes
    function toggleConversionMode() {
        is24to12Mode = !is24to12Mode;
        updateUIForMode();
        
        // Swap the values between source and target
        const temp = sourceTimeInput.value;
        sourceTimeInput.value = targetTimeInput.value;
        targetTimeInput.value = temp;
        
        // Trigger conversion with new source value
        convertTime();
    }
    
    // Update UI based on current mode
    function updateUIForMode() {
        if (is24to12Mode) {
            // 24h to 12h mode
            mode24to12.classList.add('active');
            mode12to24.classList.remove('active');
            sourceLabel.textContent = 'From 24-Hour Time';
            targetLabel.textContent = 'To 12-Hour Time';
            sourceHint.textContent = 'Format: HH:MM or HH (00-23)';
            targetHint.textContent = 'Converted time with AM/PM';
            ampmSection.classList.add('hidden');
            sourceTimeInput.placeholder = 'e.g., 14:30 or 14';
            targetTimeInput.placeholder = 'e.g., 2:30 PM';
        } else {
            // 12h to 24h mode
            mode12to24.classList.add('active');
            mode24to12.classList.remove('active');
            sourceLabel.textContent = 'From 12-Hour Time';
            targetLabel.textContent = 'To 24-Hour Time';
            sourceHint.textContent = 'Format: HH:MM or HH (1-12)';
            targetHint.textContent = 'Converted time (00-23)';
            ampmSection.classList.remove('hidden');
            updateAmPmUI();
            sourceTimeInput.placeholder = 'e.g., 2:30 or 2';
            targetTimeInput.placeholder = 'e.g., 14:30';
        }
    }
    
    // Main conversion function
    function convertTime() {
        const sourceValue = sourceTimeInput.value.trim();
        
        if (!sourceValue) {
            targetTimeInput.value = '';
            return;
        }
        
        try {
            let result;
            
            if (is24to12Mode) {
                result = convert24to12(sourceValue);
            } else {
                result = convert12to24(sourceValue, isAM);
            }
            
            targetTimeInput.value = result;
        } catch (error) {
            // Don't show errors while user is typing
            // Only show error if input is clearly invalid
            if (sourceValue.length > 1 && !isValidPartialInput(sourceValue, is24to12Mode)) {
                targetTimeInput.value = 'Invalid format';
            } else {
                targetTimeInput.value = '';
            }
        }
    }
    
    // Convert 24-hour format to 12-hour format
    function convert24to12(timeStr) {
        // Handle partial inputs gracefully
        if (!timeStr || timeStr === ':') return '';
        
        // Normalize input: remove spaces, handle different separators
        timeStr = timeStr.replace(/\s/g, '').replace(/\./g, ':');
        
        // If no colon is present, assume it's just hours
        if (!timeStr.includes(':')) {
            const hours = parseInt(timeStr, 10);
            
            // Handle special cases
            if (hours === 0) return '12:00 AM';
            if (hours === 12) return '12:00 PM';
            
            if (hours >= 0 && hours <= 23) {
                const period = hours >= 12 ? 'PM' : 'AM';
                const displayHours = hours % 12 || 12;
                return `${displayHours}:00 ${period}`;
            }
            
            return 'Invalid hour';
        }
        
        // Split into hours and minutes
        const parts = timeStr.split(':');
        if (parts.length !== 2) return 'Invalid format';
        
        let hours = parseInt(parts[0], 10);
        let minutes = parseInt(parts[1], 10);
        
        // Validate hours and minutes
        if (isNaN(hours) || hours < 0 || hours > 23) return 'Invalid hour';
        if (isNaN(minutes) || minutes < 0 || minutes > 59) return 'Invalid minute';
        
        // Handle special cases
        if (hours === 0 && minutes === 0) return '12:00 AM';
        if (hours === 12 && minutes === 0) return '12:00 PM';
        
        // Convert to 12-hour format
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        
        // Format minutes with leading zero if needed
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        
        return `${displayHours}:${formattedMinutes} ${period}`;
    }
    
    // Convert 12-hour format to 24-hour format
    function convert12to24(timeStr, isAm) {
        // Handle partial inputs gracefully
        if (!timeStr || timeStr === ':') return '';
        
        // Normalize input: remove spaces, handle different separators
        timeStr = timeStr.replace(/\s/g, '').replace(/\./g, ':');
        
        // If no colon is present, assume it's just hours
        if (!timeStr.includes(':')) {
            const hours = parseInt(timeStr, 10);
            
            if (hours >= 1 && hours <= 12) {
                let militaryHours = hours;
                
                // Handle 12 AM and 12 PM special cases
                if (isAm) {
                    militaryHours = hours === 12 ? 0 : hours;
                } else {
                    militaryHours = hours === 12 ? 12 : hours + 12;
                }
                
                return `${militaryHours < 10 ? '0' : ''}${militaryHours}:00`;
            }
            
            return 'Invalid hour';
        }
        
        // Split into hours and minutes
        const parts = timeStr.split(':');
        if (parts.length !== 2) return 'Invalid format';
        
        let hours = parseInt(parts[0], 10);
        let minutes = parseInt(parts[1], 10);
        
        // Validate hours and minutes
        if (isNaN(hours) || hours < 1 || hours > 12) return 'Invalid hour';
        if (isNaN(minutes) || minutes < 0 || minutes > 59) return 'Invalid minute';
        
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
        const formattedHours = militaryHours < 10 ? `0${militaryHours}` : militaryHours;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        
        return `${formattedHours}:${formattedMinutes}`;
    }
    
    // Check if input is valid while user is still typing
    function isValidPartialInput(input, is24to12) {
        if (!input) return true;
        
        // Remove any spaces
        input = input.replace(/\s/g, '');
        
        // If no colon, check if it's a valid number
        if (!input.includes(':')) {
            const num = parseInt(input, 10);
            
            if (is24to12) {
                // For 24-hour input, allow 0-23
                return !isNaN(num) && num >= 0 && num <= 23;
            } else {
                // For 12-hour input, allow 1-12
                return !isNaN(num) && num >= 1 && num <= 12;
            }
        }
        
        // If colon is present, check both parts
        const parts = input.split(':');
        if (parts.length > 2) return false;
        
        const hours = parseInt(parts[0], 10);
        const minutes = parts[1] ? parseInt(parts[1], 10) : 0;
        
        if (isNaN(hours)) return false;
        
        if (is24to12) {
            // For 24-hour input
            if (hours < 0 || hours > 23) return false;
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