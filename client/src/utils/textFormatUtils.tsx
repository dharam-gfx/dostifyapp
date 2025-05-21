import React, { ReactNode } from 'react';

/**
 * Utility function to convert URLs in text to clickable links
 * @param text The text that might contain URLs
 * @returns An array of React nodes with URLs converted to clickable links
 */
export const renderTextWithLinks = (text: string): ReactNode[] => {
  if (!text) return [];
  
  // Regular expression to match URLs - improved to handle punctuation at end of URLs
  const urlRegex = /(https?:\/\/[^\s]+)(?=\s|$|\.|\,|\)|\]|\}|\;|\:|\?|\!)/g;
  
  // If no URLs are found, return the plain text as is
  if (!text.match(urlRegex)) {
    return [text];
  }
  
  // Match all URLs in the text
  let matches: RegExpExecArray | null;
  let lastIndex = 0;
  const result: ReactNode[] = [];
  const regex = new RegExp(urlRegex);
  
  // Process the text sequentially to avoid duplication
  while ((matches = regex.exec(text)) !== null) {
    // Add text before the URL
    if (matches.index > lastIndex) {
      result.push(text.substring(lastIndex, matches.index));
    }
    
    // Add the URL as a clickable link
    const url = matches[0];
    result.push(
      <a 
        key={matches.index}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:underline break-all"
        onClick={(e) => e.stopPropagation()}
      >
        {url}
      </a>
    );
    
    lastIndex = matches.index + url.length;
  }
  
  // Add any remaining text after the last URL
  if (lastIndex < text.length) {
    result.push(text.substring(lastIndex));
  }
  
  return result;
};
