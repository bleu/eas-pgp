export const formatKey = (key: string): string => {
  // Replace underscores with spaces and split camelCase words with a space
  const result = key
    .replace(/([A-Z])/g, " $1") // Insert space before each uppercase letter
    .replace(/_/g, " ") // Replace underscores with spaces
    .trim(); // Remove leading and trailing spaces

  // Capitalize the first letter of each word
  return result
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};
