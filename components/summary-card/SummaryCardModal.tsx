'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
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
import {
  SummaryCardData,
  computeSummaryCardData,
  getSessionMatchComposition,
} from '@/lib/utils/summaryCardUtils';
import { Match, Player } from '@/lib/types';
import { Download, Share2, Image, Loader2, Users, User } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface SummaryCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchesForDate: Match[];
  players: Player[];
  targetDate: Date;
}

type CardFormat = 'square' | 'portrait';
type SummaryMode = 'doubles' | 'singles';

export function SummaryCardModal({
  isOpen,
  onClose,
  matchesForDate,
  players,
  targetDate,
}: SummaryCardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [cardFormat, setCardFormat] = useState<CardFormat>('square');

  // Analyze session composition
  const composition = useMemo(
    () => getSessionMatchComposition(matchesForDate),
    [matchesForDate]
  );

  // Initial summary mode (defaults to doubles if any doubles matches exist)
  const defaultMode: SummaryMode =
    composition.doublesCount > 0 ? 'doubles' : 'singles';
  const [summaryMode, setSummaryMode] = useState<SummaryMode>(defaultMode);

  // Update summary mode whenever matches or modal open changes
  useEffect(() => {
    if (isOpen) {
      setSummaryMode(composition.doublesCount > 0 ? 'doubles' : 'singles');
    }
  }, [isOpen, composition.doublesCount]);

  // Compute summary card data for current active mode
  const currentData: SummaryCardData = useMemo(() => {
    return computeSummaryCardData(matchesForDate, players, targetDate, summaryMode);
  }, [matchesForDate, players, targetDate, summaryMode]);

  const generateImage = useCallback(async () => {
    if (!cardRef.current) return;
    setGenerating(true);

    try {
      // Small delay to ensure DOM layout has fully settled
      await new Promise((resolve) => setTimeout(resolve, 250));

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

  // Re-generate when mode, format, or open status changes
  useEffect(() => {
    if (isOpen) {
      setPreviewUrl(null);
      const timer = setTimeout(() => {
        generateImage();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, summaryMode, cardFormat, generateImage]);

  const handleDownload = async () => {
    if (!previewUrl) return;
    setDownloading(true);

    try {
      const link = document.createElement('a');
      const dateStr = format(targetDate, 'yyyy-MM-dd');
      link.download = `badminton-${summaryMode}-summary-${dateStr}.png`;
      link.href = previewUrl;
      link.click();
      toast.success('Summary image downloaded! 📥');
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
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      const file = new File(
        [blob],
        `badminton-${summaryMode}-summary.png`,
        { type: 'image/png' }
      );

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Badminton ${summaryMode === 'doubles' ? 'Doubles' : 'Singles'} Summary`,
          text: `Badminton session summary for ${currentData.date}`,
          files: [file],
        });
        toast.success('Shared successfully! 🎉');
      } else {
        // Fallback to clipboard
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          toast.success('Image copied to clipboard! 📋', {
            description: 'You can paste it in WhatsApp or messages',
          });
        } catch {
          // Final fallback
          handleDownload();
        }
      }
    } catch (error) {
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
      <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[92dvh] p-4 sm:p-6 overflow-y-auto bg-[#111827] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image className="w-5 h-5 text-emerald-400" />
              <span>Match Summary Card</span>
            </div>
            <span className="text-xs text-slate-400 font-normal">
              {format(targetDate, 'MMMM d, yyyy')}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Controls Toolbar: Mode Switch (if mixed) + Format Switch */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mb-3 bg-white/[0.03] p-2.5 rounded-xl border border-white/10">
          {/* Mode Switch (Visible especially when session has mixed matches) */}
          {composition.isMixed ? (
            <div className="flex items-center justify-between sm:justify-start gap-2">
              <span className="text-xs font-semibold text-slate-400">Mode:</span>
              <div className="flex flex-1 sm:flex-initial rounded-lg overflow-hidden border border-white/10">
                <button
                  type="button"
                  onClick={() => setSummaryMode('doubles')}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    summaryMode === 'doubles'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Doubles ({composition.doublesCount})
                </button>
                <button
                  type="button"
                  onClick={() => setSummaryMode('singles')}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    summaryMode === 'singles'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  Singles ({composition.singlesCount})
                </button>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className="font-semibold text-white">Session Type:</span>
              <span className="capitalize text-emerald-400 font-bold">
                {composition.doublesCount > 0
                  ? `Doubles (${composition.doublesCount} matches)`
                  : `Singles (${composition.singlesCount} matches)`}
              </span>
            </div>
          )}

          {/* Format Toggle */}
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <span className="text-xs font-semibold text-slate-400">Aspect:</span>
            <div className="flex flex-1 sm:flex-initial rounded-lg overflow-hidden border border-white/10">
              <button
                type="button"
                onClick={() => setCardFormat('square')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-semibold text-center transition-all ${
                  cardFormat === 'square'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                Square (1:1)
              </button>
              <button
                type="button"
                onClick={() => setCardFormat('portrait')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-semibold text-center transition-all ${
                  cardFormat === 'portrait'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                Portrait (4:5)
              </button>
            </div>
          </div>
        </div>

        {/* Preview Container */}
        <div className="rounded-xl border border-white/10 overflow-hidden bg-black/60 p-2 flex items-center justify-center min-h-[260px] max-h-[52vh] sm:max-h-[60vh]">
          {generating ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              <span className="ml-3 text-sm text-slate-300 font-medium">
                Generating {summaryMode} summary card...
              </span>
            </div>
          ) : previewUrl ? (
            <img
              src={previewUrl}
              alt={`${summaryMode} Summary Card Preview`}
              className="max-h-[48vh] sm:max-h-[56vh] w-auto max-w-full h-auto object-contain rounded-lg shadow-2xl mx-auto"
            />
          ) : (
            <div className="flex items-center justify-center h-64">
              <span className="text-slate-400 text-sm">Preparing preview...</span>
            </div>
          )}
        </div>

        {/* Hidden Summary Card DOM node for off-screen image rendering */}
        <div
          className="fixed top-0 left-[-9999px] pointer-events-none"
          aria-hidden="true"
        >
          <SummaryCard ref={cardRef} data={currentData} format={cardFormat} />
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end mt-3">
          <Button
            onClick={handleDownload}
            disabled={!previewUrl || downloading}
            className="w-full sm:w-auto h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
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
            className="w-full sm:w-auto h-11 border-white/10 text-white hover:bg-white/10 font-semibold"
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
