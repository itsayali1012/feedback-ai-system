import { Pool } from 'pg';

// Mock data for development when database is not available
const mockSubmissions = [
  {
    id: 1,
    rating: 5,
    review: "Great service! Very responsive and helpful.",
    ai_summary: "Customer expressed high satisfaction with service responsiveness.",
    recommended_action: "Share positive feedback with team and continue excellent service.",
    user_response: "Thank you for the wonderful feedback! We're glad you're satisfied with our service.",
    created_at: new Date(Date.now() - 86400000), // 1 day ago
    status: 'completed'
  },
  {
    id: 2,
    rating: 3,
    review: "Service was okay but could be improved.",
    ai_summary: "Customer found service adequate but sees room for improvement.",
    recommended_action: "Follow up to understand specific areas for improvement.",
    user_response: "Thank you for your feedback. We appreciate your input and are always looking to improve.",
    created_at: new Date(Date.now() - 43200000), // 12 hours ago
    status: 'pending'
  }
];

let useMockData = false;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  connectionTimeoutMillis: 5000, // 5 second timeout
});

export async function query(text, params = []) {
  // If we're in mock mode, return mock data
  if (useMockData) {
    return mockQuery(text, params);
  }

  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('Database error:', error.message);

    // If this is the first database error, switch to mock mode
    if (!useMockData) {
      console.log('Switching to mock data mode for development...');
      useMockData = true;
      return mockQuery(text, params);
    }

    throw error;
  }
}

// Mock query implementation for development
function mockQuery(text, params = []) {
  console.log('Mock query:', text.substring(0, 100) + '...', params);

  // Normalize the query text to handle whitespace
  const normalizedText = text.replace(/\s+/g, ' ').trim();

  if (normalizedText.includes('SELECT COUNT(*) as total FROM feedback_submissions')) {
    return {
      rows: [{ total: mockSubmissions.length.toString() }]
    };
  }

  if (normalizedText.includes('SELECT id, rating, review, ai_summary, recommended_action, user_response, created_at, status FROM feedback_submissions')) {
    let filteredSubmissions = [...mockSubmissions];

    // Handle WHERE clause for rating filter
    if (normalizedText.includes('WHERE rating = $1')) {
      const ratingFilter = params[0];
      filteredSubmissions = filteredSubmissions.filter(sub => sub.rating === ratingFilter);
    }

    // Sort by created_at DESC
    filteredSubmissions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Handle LIMIT and OFFSET - they are the last two parameters
    const limit = params[params.length - 2] || 50;
    const offset = params[params.length - 1] || 0;
    filteredSubmissions = filteredSubmissions.slice(offset, offset + limit);

    return {
      rows: filteredSubmissions.map(sub => ({
        ...sub,
        created_at: sub.created_at.toISOString()
      }))
    };
  }

  if (text.includes('INSERT INTO feedback_submissions')) {
    const newSubmission = {
      id: mockSubmissions.length + 1,
      rating: params[0],
      review: params[1] || '',
      ai_summary: 'Mock AI summary - please configure OpenAI API key for real summaries',
      recommended_action: 'Mock recommended action - please configure OpenAI API key for real recommendations',
      user_response: 'Mock user response - please configure OpenAI API key for real responses',
      created_at: new Date().toISOString(),
      status: 'completed'
    };
    mockSubmissions.unshift(newSubmission);
    return {
      rows: [{
        id: newSubmission.id,
        rating: newSubmission.rating,
        review: newSubmission.review,
        ai_summary: newSubmission.ai_summary,
        recommended_action: newSubmission.recommended_action,
        user_response: newSubmission.user_response,
        created_at: newSubmission.created_at,
        status: newSubmission.status
      }]
    };
  }

  if (text.includes('CREATE TABLE IF NOT EXISTS')) {
    console.log('Mock: Table creation (no-op)');
    return { rows: [] };
  }

  if (text.includes('CREATE INDEX IF NOT EXISTS')) {
    console.log('Mock: Index creation (no-op)');
    return { rows: [] };
  }

  return { rows: [] };
}

export async function getClient() {
  return pool.connect();
}

export async function initializeTables() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS feedback_submissions (
      id SERIAL PRIMARY KEY,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      review TEXT NOT NULL,
      ai_summary TEXT,
      recommended_action TEXT,
      user_response TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(20) DEFAULT 'pending'
    );

    CREATE INDEX IF NOT EXISTS idx_created_at ON feedback_submissions(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_rating ON feedback_submissions(rating);
  `;

  try {
    await query(createTableSQL);
    console.log('Database tables initialized');
  } catch (error) {
    console.error('Table initialization error:', error);
  }
}
