import { ShieldOff } from 'lucide-react';

export default function AccessDenied() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-6">
          <ShieldOff className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-text mb-2">Access Denied</h1>
        <p className="text-text-muted text-sm">
          You do not have permission to view this application.
        </p>
      </div>
    </div>
  );
}
