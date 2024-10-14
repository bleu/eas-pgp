/**
 * Handles edge cases for zero timestamps, and ensures robust date formatting.
 *
 * @param {number} timestamp - Unix timestamp in seconds.
 * @param {string} timeType - Type of the time being formatted, either "revocationTime" or "expirationTime".
 * @returns {string} - A formatted string representing the time or a special message for edge cases.
 */
export const formatTime = (timestamp: number, timeType: string): string => {
  if (timestamp === 0) {
    switch (timeType) {
      case "revocationTime":
        return "No Previous Revocation";
      case "expirationTime":
        return "No Expiration";
      default:
        return "Unknown Time Type";
    }
  }

  const date = new Date(timestamp * 1000); // Convert the timestamp from seconds to milliseconds

  // Validate the date object
  if (isNaN(date.getTime())) {
    console.warn(`Invalid timestamp provided: ${timestamp}`);
    return "Invalid Date";
  }
  return date.toLocaleString(); // Format the date as a human-readable string
};
