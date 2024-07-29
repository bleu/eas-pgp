export const formatTime = (timestamp: number, timeType: string) => {
  if (timestamp === 0 && timeType === "revocationTime") {
    return "No Previous revocation";
  }
  if (timestamp === 0 && timeType === "expirationTime") {
    return "No Expiration";
  }
  const date = new Date(timestamp * 1000); // Convert from seconds to milliseconds
  return date.toLocaleString(); // Format the date as a human-readable string
};
