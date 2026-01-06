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
          <div className={styles.statLabel}>Status</div>
          <div
            className={styles.statValue}
            style={{ color: isLoading ? '#ff9800' : '#4caf50' }}
          >
            {isLoading ? 'Loading...' : 'Live'}
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
