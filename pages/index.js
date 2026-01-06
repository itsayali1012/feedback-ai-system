import { useState } from 'react';
import styles from '../styles/Home.module.css';

export default function UserDashboard() {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [userResponse, setUserResponse] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, review })
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to submit feedback');
        setLoading(false);
        return;
      }

      setUserResponse(data.data.userResponse);
      setSubmitted(true);
      setRating(0);
      setReview('');

      setTimeout(() => {
        setSubmitted(false);
        setUserResponse('');
      }, 5000);
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.heading}>Share Your Feedback</h1>
        <p className={styles.subtitle}>Help us improve your experience</p>

        {error && <div className={styles.error}>{error}</div>}

        {submitted ? (
          <div className={styles.successBox}>
            <div className={styles.successIcon}>✓</div>
            <h2>Thank You!</h2>
            <p className={styles.aiResponse}>{userResponse}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Rating</label>
              <div className={styles.ratingStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`${styles.star} ${
                      rating >= star ? styles.starFilled : ''
                    }`}
                    onClick={() => setRating(star)}
                    aria-label={`${star} stars`}
                  >
                    ★
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <span className={styles.ratingLabel}>{rating} out of 5</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="review">Your Review</label>
              <textarea
                id="review"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Tell us what you think... (optional)"
                rows={6}
                maxLength={2000}
                className={styles.textarea}
              />
              <span className={styles.charCount}>{review.length} / 2000</span>
            </div>

            <button
              type="submit"
              disabled={rating === 0 || loading}
              className={styles.submitButton}
            >
              {loading ? 'Processing...' : 'Submit Feedback'}
            </button>
          </form>
        )}

        <div className={styles.footer}>
          <p>Your feedback is valuable and helps us serve you better.</p>
          <a href="/admin">View Admin Dashboard</a>
        </div>
      </div>
    </div>
  );
}
