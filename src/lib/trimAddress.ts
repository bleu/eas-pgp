/**
 * Trims the address to show the first and last few characters.
 * If the total number of characters to show is greater than the address length, it returns the full address.
 *
 * @param address - The address to trim.
 * @param start - Number of characters to show at the start.
 * @param end - Number of characters to show at the end.
 * @returns The trimmed address or the full address if the trimming is not required.
 */
export const trimAddress = (
  address: string,
  start: number,
  end: number
): string => {
  // Validate inputs
  if (typeof address !== "string" || address.length === 0) {
    throw new Error("Invalid address provided.");
  }
  if (
    typeof start !== "number" ||
    typeof end !== "number" ||
    start < 0 ||
    end < 0
  ) {
    throw new Error("Start and end values must be non-negative numbers.");
  }

  // Return full address if trimming is not needed
  if (start + end >= address.length || address.length <= start + end + 3) {
    return address;
  }

  // Trim the address and add ellipsis in the middle
  return `${address.slice(0, start)}...${address.slice(-end)}`;
};
