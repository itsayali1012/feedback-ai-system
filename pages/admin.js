import { useState } from 'react';
import useSWR from 'swr';
import styles from '../styles/Admin.module.css';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function AdminDashboard() {
  const [ratingFilter, setRatingFilter] = useState('all');
  const [refreshInterval, setRefreshInterval] = useState(5000);

  const { data, error, isLoading, mutate } = useSWR(
    `/api/submissions-list?rating=${ratingFilter}&limit=100`,
    fetcher,
    {
      refreshInterval: refreshInterval || 0,
      revalidateOnFocus: true,
      revalidateOnReconnect: true
    }
  );

  const submissions = data?.data || [];
  const total = data?.total || 0;

  const ratings = {
    1: submissions.filter((s) => s.rating === 1).length,
    2: submissions.filter((s) => s.rating === 2).length,
    3: submissions.filter((s) => s.rating === 3).length,
    4: submissions.filter((s) => s.rating === 4).length,
    5: submissions.filter((s) => s.rating === 5).length
  };

  const avgRating =
    total > 0
      ? (
          (1 * ratings[1] +
            2 * ratings[2] +
            3 * ratings[3] +
            4 * ratings[4] +
            5 * ratings[5]) /
          total
        ).toFixed(1)
      : 0;

  // Additional analytics
  const avgReviewLength = total > 0
    ? Math.round(submissions.reduce((sum, s) => sum + (s.review?.length || 0), 0) / total)
    : 0;

  const aiResponseRate = total > 0
    ? Math.round((submissions.filter(s => !s.aiSummary?.includes('Unable')).length / total) * 100)
    : 0;

  const recentSubmissions = submissions.filter(s => {
    const submissionDate = new Date(s.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return submissionDate > weekAgo;
  }).length;

  const positiveFeedback = submissions.filter(s => s.rating >= 4).length;
  const neutralFeedback = submissions.filter(s => s.rating === 3).length;
  const negativeFeedback = submissions.filter(s => s.rating <= 2).length;

  const sentimentData = {
    positive: total > 0 ? Math.round((positiveFeedback / total) * 100) : 0,
    neutral: total > 0 ? Math.round((neutralFeedback / total) * 100) : 0,
    negative: total > 0 ? Math.round((negativeFeedback / total) * 100) : 0
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Admin Dashboard</h1>
          <p className={styles.subtitle}>Customer Feedback Overview</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.refreshBtn} onClick={() => mutate()}>
            ↻ Refresh
          </button>
          <select
            value={refreshInterval}
            onChange={(e) =>
              setRefreshInterval(parseInt(e.target.value, 10) || 0)
            }
            className={styles.intervalSelect}
          >
            <option value={3000}>3s refresh</option>
            <option value={5000}>5s refresh</option>
            <option value={10000}>10s refresh</option>
            <option value={0}>Manual</option>
          </select>
        </div>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Submissions</div>
          <div className={styles.statValue}>{total}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Average Rating</div>
          <div className={styles.statValue}>{avgRating} / 5</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>AI Response Rate</div>
          <div className={styles.statValue}>{aiResponseRate}%</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Avg Review Length</div>
          <div className={styles.statValue}>{avgReviewLength} chars</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>This Week</div>
          <div className={styles.statValue}>{recentSubmissions}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Status</div>
          <div
            className={styles.statValue}
            style={{ color: isLoading ? '#ff9800' : '#4caf50' }}
          >
            {isLoading ? 'Loading...' : 'Live'}
          </div>
        </div>
      </div>

      <div className={styles.analyticsGrid}>
        <div className={styles.analyticsCard}>
          <h3>Sentiment Distribution</h3>
          <div className={styles.sentimentBars}>
            <div className={styles.sentimentBar}>
              <span className={styles.sentimentLabel}>Positive (4-5★)</span>
              <div className={styles.bar}>
                <div
                  className={styles.barFill}
                  style={{ width: `${sentimentData.positive}%`, backgroundColor: '#4caf50' }}
                />
              </div>
              <span className={styles.sentimentValue}>{sentimentData.positive}%</span>
            </div>
            <div className={styles.sentimentBar}>
              <span className={styles.sentimentLabel}>Neutral (3★)</span>
              <div className={styles.bar}>
                <div
                  className={styles.barFill}
                  style={{ width: `${sentimentData.neutral}%`, backgroundColor: '#ff9800' }}
                />
              </div>
              <span className={styles.sentimentValue}>{sentimentData.neutral}%</span>
            </div>
            <div className={styles.sentimentBar}>
              <span className={styles.sentimentLabel}>Negative (1-2★)</span>
              <div className={styles.bar}>
                <div
                  className={styles.barFill}
                  style={{ width: `${sentimentData.negative}%`, backgroundColor: '#f44336' }}
                />
              </div>
              <span className={styles.sentimentValue}>{sentimentData.negative}%</span>
            </div>
          </div>
        </div>

        <div className={styles.analyticsCard}>
          <h3>Quick Insights</h3>
          <div className={styles.insights}>
            <div className={styles.insight}>
              <span className={styles.insightLabel}>Most Common Rating:</span>
              <span className={styles.insightValue}>
                {Object.entries(ratings).reduce((a, b) => ratings[a[0]] > ratings[b[0]] ? a : b)[0]}★
              </span>
            </div>
            <div className={styles.insight}>
              <span className={styles.insightLabel}>Response Quality:</span>
              <span className={styles.insightValue}>
                {aiResponseRate >= 80 ? 'Excellent' : aiResponseRate >= 60 ? 'Good' : 'Needs Attention'}
              </span>
            </div>
            <div className={styles.insight}>
              <span className={styles.insightLabel}>Engagement Level:</span>
              <span className={styles.insightValue}>
                {avgReviewLength > 100 ? 'High' : avgReviewLength > 50 ? 'Medium' : 'Low'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.ratingDistribution}>
        <h2>Rating Distribution</h2>
        <div className={styles.bars}>
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className={styles.barRow}>
              <span className={styles.ratingLabel}>{rating}★</span>
              <div className={styles.barContainer}>
                <div
                  className={styles.bar}
                  style={{
                    width:
                      total > 0
                        ? `${(ratings[rating] / total) * 100}%`
                        : '0%',
                    backgroundColor:
                      rating >= 4
                        ? '#4caf50'
                        : rating === 3
                        ? '#ff9800'
                        : '#f44336'
                  }}
                />
              </div>
              <span className={styles.count}>{ratings[rating]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.trendsCard}>
        <h2>Recent Trends</h2>
        <div className={styles.trendsGrid}>
          <div className={styles.trend}>
            <div className={styles.trendIcon}>📈</div>
            <div className={styles.trendContent}>
              <div className={styles.trendValue}>{recentSubmissions}</div>
              <div className={styles.trendLabel}>Submissions this week</div>
            </div>
          </div>
          <div className={styles.trend}>
            <div className={styles.trendIcon}>⭐</div>
            <div className={styles.trendContent}>
              <div className={styles.trendValue}>{avgRating}</div>
              <div className={styles.trendLabel}>Average rating</div>
            </div>
          </div>
          <div className={styles.trend}>
            <div className={styles.trendIcon}>🤖</div>
            <div className={styles.trendContent}>
              <div className={styles.trendValue}>{aiResponseRate}%</div>
              <div className={styles.trendLabel}>AI response rate</div>
            </div>
          </div>
          <div className={styles.trend}>
            <div className={styles.trendIcon}>📝</div>
            <div className={styles.trendContent}>
              <div className={styles.trendValue}>{avgReviewLength}</div>
              <div className={styles.trendLabel}>Avg review length</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.listSection}>
        <div className={styles.filterBar}>
          <h2>All Submissions</h2>
          <div className={styles.filterButtons}>
            {['all', '5', '4', '3', '2', '1'].map((rating) => (
              <button
                key={rating}
                className={`${styles.filterBtn} ${
                  ratingFilter === rating ? styles.filterBtnActive : ''
                }`}
                onClick={() => setRatingFilter(rating)}
              >
                {rating === 'all' ? 'All' : `${rating}★`}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className={styles.error}>
            <p>Failed to load submissions: {error.message}</p>
          </div>
        )}

        {isLoading && submissions.length === 0 && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading submissions...</p>
          </div>
        )}

        {submissions.length === 0 && !isLoading && (
          <div className={styles.empty}>
            <p>No submissions yet. Check back soon!</p>
          </div>
        )}

        <div className={styles.submissionsList}>
          {submissions.map((submission) => (
            <div key={submission.id} className={styles.submissionCard}>
              <div className={styles.cardHeader}>
                <div className={styles.ratingBadge}>
                  {'★'.repeat(submission.rating)}
                </div>
                <time className={styles.timestamp}>
                  {new Date(submission.createdAt).toLocaleString()}
                </time>
              </div>

              <div className={styles.cardContent}>
                <div className={styles.section}>
                  <h3>User Review</h3>
                  <p className={styles.review}>
                    {submission.review || '(Empty review)'}
                  </p>
                </div>

                <div className={styles.section}>
                  <h3>AI Summary</h3>
                  <p className={styles.summary}>{submission.aiSummary}</p>
                </div>

                <div className={styles.section}>
                  <h3>Recommended Action</h3>
                  <p className={styles.action}>
                    {submission.recommendedAction}
                  </p>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <span className={styles.status}>{submission.status}</span>
              </div>
            </div>
          ))}
        </div>

        <p className={styles.pageInfo}>
          Showing {submissions.length} of {total} submissions • Auto-refresh{' '}
          {refreshInterval ? `every ${refreshInterval / 1000}s` : 'manual'}
        </p>
      </div>

      <footer className={styles.footer}>
        <a href="/">← Back to User Dashboard</a>
      </footer>
    </div>
  );
}
