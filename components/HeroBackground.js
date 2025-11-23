export default function HeroBackground({ poster, src = '/backgrounds/bkg1.mp4', className = '' }) {
  // Brown gradient fallback while video is loading or if poster is not provided
  const fallbackStyle = {
    background: 'linear-gradient(180deg, #5b3a29 0%, #7a4b2b 50%, #2f1b12 100%)',
    backgroundColor: '#5b3a29',
  };

  return (
    <div className={`absolute inset-0 z-0 ${className}`} style={fallbackStyle}>
      <video
        className="w-full h-full object-cover"
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
      />

      {/* No overlay by default so the video (or the gradient fallback) shows clearly */}
    </div>
  )
}
