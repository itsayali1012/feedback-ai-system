import { query } from '../../lib/db';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, must-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const { limit = 50, offset = 0, rating } = req.query;

      let where = '';
      const params = [];

      if (rating && rating !== 'all') {
        where = 'WHERE rating = $1';
        params.push(parseInt(rating));
      }

      const countResult = await query(
        `SELECT COUNT(*) as total FROM feedback_submissions ${where}`,
        params
      );

      const result = await query(
        `SELECT id, rating, review, ai_summary, recommended_action, user_response, created_at, status
         FROM feedback_submissions
         ${where}
         ORDER BY created_at DESC
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, parseInt(limit), parseInt(offset)]
      );

      const submissions = result.rows.map((row) => ({
        id: row.id,
        rating: row.rating,
        review: row.review,
        aiSummary: row.ai_summary,
        recommendedAction: row.recommended_action,
        userResponse: row.user_response,
        createdAt: row.created_at,
        status: row.status
      }));

      return res.status(200).json({
        success: true,
        data: submissions,
        total: parseInt(countResult.rows[0].total)
      });
    } catch (error) {
      console.error('List error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch submissions',
        details: error.message
      });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
