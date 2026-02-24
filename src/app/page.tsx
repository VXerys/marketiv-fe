export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center space-y-4">
      <h1 className="text-heading-1 text-primary">Marketiv</h1>
      <p className="text-body-base text-text-muted">
        Welcome to Marketiv. This is the initial setup.
      </p>
      <div className="flex gap-4 mt-8">
        <div className="p-4 bg-white rounded shadow-sm border border-gray-100">
          <h2 className="text-heading-2 text-secondary mb-2">UMKM</h2>
          <p className="text-caption text-text-muted">For Business Owners</p>
        </div>
        <div className="p-4 bg-white rounded shadow-sm border border-gray-100">
          <h2 className="text-heading-2 text-primary mb-2">Creator</h2>
          <p className="text-caption text-text-muted">For Content Creators</p>
        </div>
      </div>
    </div>
  );
}
