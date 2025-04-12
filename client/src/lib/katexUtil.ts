import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Renders LaTeX-formatted math expressions using KaTeX
 * 
 * @param text Text containing LaTeX math expressions between $ or $$ delimiters
 * @returns HTML string with properly rendered math expressions
 */
export function renderMathInText(text: string): string {
  if (!text) return '';
  
  // Regular expressions for inline and display math
  const inlineMathRegex = /\$([^\$]+)\$/g;
  const displayMathRegex = /\$\$([^\$]+)\$\$/g;
  
  // Process display math ($$...$$) first
  let processedText = text.replace(displayMathRegex, (match, math) => {
    try {
      return katex.renderToString(math, {
        displayMode: true,
        throwOnError: false
      });
    } catch (e) {
      console.error('KaTeX display math rendering error:', e);
      return match; // Return original text on error
    }
  });
  
  // Then process inline math ($...$)
  processedText = processedText.replace(inlineMathRegex, (match, math) => {
    try {
      return katex.renderToString(math, {
        displayMode: false,
        throwOnError: false
      });
    } catch (e) {
      console.error('KaTeX inline math rendering error:', e);
      return match; // Return original text on error
    }
  });
  
  return processedText;
}