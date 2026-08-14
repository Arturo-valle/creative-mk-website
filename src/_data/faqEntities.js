import faq from './faq.js';

/**
 * The FAQ in schema.org shape. Derived from the same array the accordion
 * renders, and sliced to the same three the homepage actually shows —
 * schema must never declare a question the page does not carry. The full
 * set lives distributed across the service pages, each with its own
 * FAQPage node built from its own visible questions.
 */
export default faq.en.slice(0, 3).map((item) => ({
  '@type': 'Question',
  name: item.q,
  acceptedAnswer: { '@type': 'Answer', text: item.a }
}));
