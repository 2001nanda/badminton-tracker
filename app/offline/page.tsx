import { Card } from '@/components/ui/card';
import { WifiOff } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm max-w-md w-full">
        <div className="p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-orange-500/20 flex items-center justify-center">
            <WifiOff className="w-10 h-10 text-orange-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-3">
            You're Offline
          </h2>
          <p className="text-gray-400 mb-6">
            No internet connection detected. Some features may be limited until you're back online.
          </p>
          
          <div className="text-sm text-gray-500">
            <p>You can still browse:</p>
            <ul className="mt-2 space-y-1">
              <li>• Cached matches</li>
              <li>• Player profiles</li>
              <li>• Rankings</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
