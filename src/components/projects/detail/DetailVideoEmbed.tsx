import { useState } from 'react';

interface Props {
  videoId: string;
  title: string;
}

/**
 * Lightweight YouTube facade for project detail pages: a poster image with a
 * play button; the real iframe only loads once clicked.
 */
export default function DetailVideoEmbed({ videoId, title }: Props) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        className="pd-video"
        // youtube-nocookie.com is YouTube's privacy-enhanced embed domain: it
        // doesn't set tracking cookies until the viewer interacts with the
        // player. Using www.youtube.com here can trigger a generic "An error
        // occurred. Please try again later." in browsers that block
        // third-party storage for youtube.com (e.g. Edge/Safari tracking
        // prevention), since the player can't initialize its session.
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      className="pd-video pd-video-poster"
      onClick={() => setPlaying(true)}
      aria-label={`Play video: ${title}`}
    >
      <img
        src={`https://i.ytimg.com/vi_webp/${videoId}/sddefault.webp`}
        alt=""
        loading="lazy"
      />
      <span className="pd-video-play" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M7 4.5v13l11-6.5-11-6.5z" fill="#000" />
        </svg>
      </span>
    </button>
  );
}
