export default function LoadingSpinner({ size = 'md' }) {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizes[size]} border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin`} />
    </div>
  );
}
