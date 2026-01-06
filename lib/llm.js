import OpenAI from 'openai';

let openai = null;

// Initialize OpenAI only if API key is available
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-placeholder-key-for-testing') {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

export async function generateSummary(review) {
  if (!review || review.trim().length === 0) {
    return 'No review provided';
  }

  // If OpenAI is not configured, return mock response
  if (!openai) {
    console.log('OpenAI not configured, using mock summary');
    return `Mock summary: "${review.substring(0, 50)}${review.length > 50 ? '...' : ''}"`;
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that summarizes customer feedback. Provide a concise 1-2 sentence summary.'
        },
        {
          role: 'user',
          content: `Summarize this feedback: "${review.substring(0, 500)}"`
        }
      ],
      max_tokens: 100,
      temperature: 0.7
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('LLM summary error:', error);
    return 'Unable to generate summary at this time';
  }
}

export async function generateRecommendedAction(rating, review, summary) {
  if (!review || review.trim().length === 0) {
    return 'Acknowledge submission and follow up with user';
  }

  // If OpenAI is not configured, return mock response
  if (!openai) {
    console.log('OpenAI not configured, using mock recommended action');
    return `Mock recommended action for ${rating}/5 rating: Follow up with customer to understand their experience better.`;
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are a customer service expert. Suggest a specific, actionable next step based on the feedback.'
        },
        {
          role: 'user',
          content: `Rating: ${rating}/5\nSummary: ${summary}\nOriginal feedback: "${review.substring(
            0,
            300
          )}"\n\nWhat is the recommended next action?`
        }
      ],
      max_tokens: 150,
      temperature: 0.7
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('LLM action error:', error);
    return 'Review and respond to customer';
  }
}

export async function generateUserResponse(rating, review) {
  if (!review || review.trim().length === 0) {
    return 'Thank you for your submission. We appreciate your feedback!';
  }

  // If OpenAI is not configured, return mock response
  if (!openai) {
    console.log('OpenAI not configured, using mock user response');
    const tone = rating >= 4 ? 'positive' : 'constructive';
    return `Mock ${tone} response: Thank you for your ${rating}/5 star feedback! We appreciate you taking the time to share your thoughts with us.`;
  }

  try {
    const tone =
      rating >= 4 ? 'grateful and enthusiastic' : 'empathetic and constructive';

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a customer service representative. Respond to customer feedback in a ${tone} manner. Keep response to 2-3 sentences.`
        },
        {
          role: 'user',
          content: `Customer gave ${rating}/5 stars. Their feedback: "${review.substring(
            0,
            300
          )}"`
        }
      ],
      max_tokens: 150,
      temperature: 0.8
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('LLM response error:', error);
    return 'Thank you for your feedback. We will review your submission and get back to you shortly.';
  }
}
