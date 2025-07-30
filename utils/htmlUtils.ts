/**
 * Strips HTML tags from a string and returns clean text
 * @param htmlString - The string containing HTML tags
 * @returns Clean text without HTML tags
 */
export const stripHtmlTags = (htmlString: string): string => {
  if (!htmlString) return '';
  
  // Remove HTML tags using regex
  const cleanText = htmlString.replace(/<[^>]*>/g, '');
  
  // Decode common HTML entities
  const decodedText = cleanText
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  
  return decodedText.trim();
};

/**
 * Truncates text to a specified length and adds ellipsis if needed
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}; 