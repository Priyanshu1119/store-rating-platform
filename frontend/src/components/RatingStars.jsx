import { useState } from 'react';

// Read-only: <RatingStars value={4.3} />  (supports decimals, shows partial stars)
// Input:     <RatingStars value={rating} onChange={setRating} />
export default function RatingStars({ value = 0, onChange, size = 'md', showValue = false }) {
  const [hover, setHover] = useState(0);

  if (onChange) {
    const shown = hover || value;
    return (
      <div className={`stars stars-${size} stars-input`} role="radiogroup" aria-label="Rating from 1 to 5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} ${star === 1 ? 'star' : 'stars'}`}
            className={star <= shown ? 'star star-on' : 'star'}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
          >
            ★
          </button>
        ))}
      </div>
    );
  }

  const percent = Math.max(0, Math.min(5, Number(value) || 0)) * 20;
  return (
    <span className={`stars stars-${size}`} role="img" aria-label={`${Number(value).toFixed(1)} out of 5 stars`}>
      <span className="stars-track" aria-hidden="true">
        ★★★★★
        <span className="stars-fill" style={{ width: `${percent}%` }}>
          ★★★★★
        </span>
      </span>
      {showValue && <span className="stars-value">{Number(value).toFixed(1)}</span>}
    </span>
  );
}
