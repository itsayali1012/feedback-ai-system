import { query } from '../../lib/db';
import { generateSummary, generateRecommendedAction, generateUserResponse } from '../../lib/llm';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, must-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { rating, review } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          error: 'Rating must be between 1 and 5'
        });
      }

      // Generate AI responses
      const aiSummary = await generateSummary(review);
      const recommendedAction = await generateRecommendedAction(rating, review, aiSummary);
      const userResponse = await generateUserResponse(rating, review);

      // Insert into database
      const result = await query(
        `INSERT INTO feedback_submissions (rating, review, ai_summary, recommended_action, user_response)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, rating, review, ai_summary, recommended_action, user_response, created_at, status`,
        [rating, review || '', aiSummary, recommendedAction, userResponse]
      );

      const submission = {
        id: result.rows[0].id,
        rating: result.rows[0].rating,
        review: result.rows[0].review,
        aiSummary: result.rows[0].ai_summary,
        recommendedAction: result.rows[0].recommended_action,
        userResponse: result.rows[0].user_response,
        createdAt: result.rows[0].created_at,
        status: result.rows[0].status
      };

      return res.status(201).json({
        success: true,
        data: submission
      });
    } catch (error) {
      console.error('Submission error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to submit feedback',
        details: error.message
      });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
