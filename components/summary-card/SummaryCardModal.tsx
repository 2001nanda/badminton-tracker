'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { toPng } from 'html-to-image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SummaryCard } from './SummaryCard';
import { SummaryCardData } from '@/lib/utils/summaryCardUtils';
import { Download, Share2, Image, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SummaryCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: SummaryCardData;
}

type CardFormat = 'square' | 'portrait';

export function SummaryCardModal({ isOpen, onClose, data }: SummaryCardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [cardFormat, setCardFormat] = useState<CardFormat>('square');

  const generateImage = useCallback(async () => {
    if (!cardRef.current) return;
    setGenerating(true);

    try {
      // Small delay to ensure DOM is rendered
      await new Promise((resolve) => setTimeout(resolve, 200));

      const dataUrl = await toPng(cardRef.current, {
        quality: 1.0,
        pixelRatio: 1,
        cacheBust: true,
      });

      setPreviewUrl(dataUrl);
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Failed to generate image', {
        description: 'Please try again',
      });
    } finally {
      setGenerating(false);
    }
  }, []);

  // Re-generate when format changes or modal opens
  useEffect(() => {
    if (isOpen) {
      // Reset preview and regenerate
      setPreviewUrl(null);
      const timer = setTimeout(() => {
        generateImage();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, cardFormat, generateImage]);

  const handleDownload = async () => {
    if (!previewUrl) return;
    setDownloading(true);

    try {
      const link = document.createElement('a');
      link.download = `badminton-summary-${data.date.replace(/\s/g, '-').toLowerCase()}.png`;
      link.href = previewUrl;
      link.click();
      toast.success('Image downloaded! 📥');
    } catch (error) {
      console.error('Error downloading:', error);
      toast.error('Failed to download image');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!previewUrl) return;
    setSharing(true);

    try {
      // Convert data URL to blob
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      const file = new File([blob], 'badminton-summary.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "Today's Badminton Summary",
          text: `Badminton session summary for ${data.date}`,
          files: [file],
        });
        toast.success('Shared successfully! 🎉');
      } else {
        // Fallback: copy image to clipboard
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          toast.success('Image copied to clipboard! 📋', {
            description: 'You can paste it anywhere',
          });
        } catch {
          // Final fallback: download
          handleDownload();
        }
      }
    } catch (error) {
      // User cancelled share is not an error
      if ((error as Error)?.name !== 'AbortError') {
        console.error('Error sharing:', error);
        toast.error('Failed to share image');
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-[#111827] border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Image className="w-5 h-5 text-emerald-400" />
            Match Summary Card
          </DialogTitle>
        </DialogHeader>

        {/* Format Toggle */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-slate-400">Format:</span>
          <div className="flex rounded-lg overflow-hidden border border-white/10">
            <button
              onClick={() => setCardFormat('square')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                cardFormat === 'square'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              Square (1080×1080)
            </button>
            <button
              onClick={() => setCardFormat('portrait')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                cardFormat === 'portrait'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              Portrait (1080×1350)
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-xl border border-white/10 overflow-hidden bg-black/50 p-2">
          {generating ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              <span className="ml-3 text-slate-400">Generating card...</span>
            </div>
          ) : previewUrl ? (
            <img
              src={previewUrl}
              alt="Summary Card Preview"
              className="w-full h-auto rounded-lg"
            />
          ) : (
            <div className="flex items-center justify-center h-64">
              <span className="text-slate-400">Preparing preview...</span>
            </div>
          )}
        </div>

        {/* Hidden card for rendering */}
        <div
          className="fixed top-0 left-[-9999px] pointer-events-none"
          aria-hidden="true"
        >
          <SummaryCard ref={cardRef} data={data} format={cardFormat} />
        </div>

        <DialogFooter className="flex-row gap-2 sm:justify-end">
          <Button
            onClick={handleDownload}
            disabled={!previewUrl || downloading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {downloading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Download PNG
          </Button>
          <Button
            onClick={handleShare}
            disabled={!previewUrl || sharing}
            variant="outline"
            className="border-white/10 text-white hover:bg-white/10"
          >
            {sharing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Share2 className="w-4 h-4 mr-2" />
            )}
            Share
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
