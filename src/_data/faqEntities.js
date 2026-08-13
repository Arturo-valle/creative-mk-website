import faq from './faq.js';

/**
 * The FAQ in schema.org shape. Derived from the same array the accordion
 * renders, so a question can never exist in one and not the other.
 */
export default faq.en.map((item) => ({
  '@type': 'Question',
  name: item.q,
  acceptedAnswer: { '@type': 'Answer', text: item.a }
}));
