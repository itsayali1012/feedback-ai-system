import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;
let model = null;

// Initialize Gemini only if API key is available
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your-gemini-api-key') {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: 'gemini-pro' });
}

export async function generateSummary(review) {
  if (!review || review.trim().length === 0) {
    return 'No review provided';
  }

  // If Gemini is not configured, return realistic mock summary
  if (!model) {
    console.log('Gemini not configured, using realistic mock summary');

    const summaries = [
      `Customer provided feedback focusing on their experience with our service, highlighting ${review.length > 100 ? 'several key points' : 'specific aspects'} of their interaction.`,
      `The feedback centers on the customer's experience, with particular attention to ${review.includes('time') ? 'timing and responsiveness' : review.includes('quality') ? 'service quality' : 'overall satisfaction'}.`,
      `Customer shared their thoughts about their recent experience, emphasizing ${review.length > 50 ? 'multiple aspects' : 'key elements'} of our service delivery.`,
      `The review highlights the customer's perspective on their interaction, focusing on ${review.includes('good') || review.includes('great') ? 'positive aspects' : 'areas for improvement'}.`
    ];

    return summaries[Math.floor(Math.random() * summaries.length)];
  }

  try {
    const prompt = `You are a helpful assistant that summarizes customer feedback. Provide a concise 1-2 sentence summary of the following feedback: "${review.substring(0, 500)}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Gemini summary error:', error);
    return 'Unable to generate summary at this time';
  }
}

export async function generateRecommendedAction(rating, review, summary) {
  if (!review || review.trim().length === 0) {
    return 'Acknowledge submission and follow up with user';
  }

  // If Gemini is not configured, return realistic mock action
  if (!model) {
    console.log('Gemini not configured, using realistic mock recommended action');

    const actions = {
      5: [
        "Share this positive feedback with the team and consider featuring it in internal communications to celebrate excellent service.",
        "Thank the customer personally and ask if they'd be willing to provide a testimonial or case study.",
        "Review what specifically contributed to this excellent experience and ensure these practices are documented and shared."
      ],
      4: [
        "Send a personalized thank you note acknowledging their positive experience and invite them to share any suggestions for improvement.",
        "Follow up within 24 hours to see if there's anything specific that could have made their experience perfect.",
        "Analyze the feedback to identify what went well and ensure these successful elements are consistently applied."
      ],
      3: [
        "Contact the customer within 24 hours to discuss their feedback in detail and understand specific areas for improvement.",
        "Schedule a follow-up call to address their concerns and demonstrate our commitment to better service.",
        "Review the customer's experience with relevant team members to identify actionable improvements."
      ],
      2: [
        "Reach out immediately to apologize and offer to personally resolve any outstanding issues.",
        "Escalate this feedback to management for immediate review and corrective action planning.",
        "Offer the customer a complimentary service or discount as a gesture of goodwill while addressing their concerns."
      ],
      1: [
        "Contact the customer immediately to apologize and offer immediate resolution to their concerns.",
        "Escalate to senior management for urgent review and assign a dedicated team member to resolve the issue.",
        "Conduct an immediate internal review to prevent similar experiences and provide the customer with a detailed action plan."
      ]
    };

    const ratingActions = actions[rating] || actions[3];
    return ratingActions[Math.floor(Math.random() * ratingActions.length)];
  }

  try {
    const prompt = `You are a customer service expert. Suggest a specific, actionable next step based on this feedback:

Rating: ${rating}/5
Summary: ${summary}
Original feedback: "${review.substring(0, 300)}"

What is the recommended next action? Provide a concise response.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Gemini action error:', error);
    return 'Review and respond to customer';
  }
}

export async function generateUserResponse(rating, review) {
  if (!review || review.trim().length === 0) {
    return 'Thank you for your submission. We appreciate your feedback!';
  }

  // If Gemini is not configured, return realistic mock action
  if (!model) {
    console.log('Gemini not configured, using realistic mock user response');

    const responses = {
      5: [
        "Thank you so much for the amazing feedback! We're thrilled to hear that you're completely satisfied with our service. Your kind words motivate us to keep delivering excellence.",
        "We're absolutely delighted with your 5-star rating! Thank you for taking the time to share your positive experience. We truly appreciate your support and look forward to serving you again.",
        "Wow, thank you for the fantastic review! We're overjoyed that you had such a great experience. Your feedback means the world to us and helps us continue improving our service."
      ],
      4: [
        "Thank you for the great feedback and the 4-star rating! We're glad you had a positive experience overall. We appreciate you taking the time to share your thoughts with us.",
        "We really appreciate your 4-star rating and kind words! Thank you for your feedback. We're always looking for ways to improve and make your experience even better.",
        "Thank you for the positive review! We're pleased that you had a good experience with us. Your feedback helps us understand what we're doing right and where we can improve."
      ],
      3: [
        "Thank you for your honest feedback and the 3-star rating. We appreciate you taking the time to share your thoughts. We'll use this information to improve our service for you and others.",
        "We appreciate your feedback and the opportunity to learn from your experience. Thank you for the 3-star rating. We'll work on addressing the areas you've mentioned to better serve you.",
        "Thank you for sharing your experience with us. We value your honest assessment and will use your feedback to make improvements. Please don't hesitate to reach out if there's anything specific we can help with."
      ],
      2: [
        "Thank you for your feedback, though we're disappointed with the 2-star rating. We sincerely apologize for not meeting your expectations. We'd love the opportunity to make this right for you.",
        "We appreciate you taking the time to share your experience, even though it wasn't what we hoped for. We're sorry we didn't meet your expectations and would like to understand how we can improve.",
        "Thank you for your honest feedback. We're truly sorry that your experience didn't meet your expectations. We'd welcome the chance to discuss this further and work towards a solution."
      ],
      1: [
        "We're truly sorry to hear about your experience and appreciate you bringing this to our attention. Your feedback is important to us, and we want to make this right. Please contact us directly so we can address your concerns.",
        "Thank you for your feedback, though we're very disappointed with the 1-star rating. We apologize for the poor experience and would like to discuss how we can resolve this for you.",
        "We sincerely apologize for the unsatisfactory experience. Your feedback helps us identify areas that need immediate attention. Please reach out to us so we can address your concerns and work towards a solution."
      ]
    };

    const ratingResponses = responses[rating] || responses[3];
    return ratingResponses[Math.floor(Math.random() * ratingResponses.length)];
  }

  try {
    const tone = rating >= 4 ? 'grateful and enthusiastic' : 'empathetic and constructive';
    const prompt = `You are a customer service representative. Respond to customer feedback in a ${tone} manner. Keep response to 2-3 sentences.

Customer gave ${rating}/5 stars. Their feedback: "${review.substring(0, 300)}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Gemini response error:', error);
    return 'Thank you for your feedback. We will review your submission and get back to you shortly.';
  }
}