'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Upload, X } from 'lucide-react';
import { updatePlayer } from '@/lib/actions/playerActions';
import { toast } from 'sonner';
import { Player } from '@/lib/types';
import Image from 'next/image';

const playerSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .trim(),
  photoURL: z.string().optional(),
});

type PlayerFormData = z.infer<typeof playerSchema>;

interface EditPlayerModalProps {
  open: boolean;
  onClose: () => void;
  player: Player;
}

export function EditPlayerModal({ open, onClose, player }: EditPlayerModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>(player.photoURL || '');
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PlayerFormData>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      name: player.name,
      photoURL: player.photoURL || '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: player.name,
        photoURL: player.photoURL || '',
      });
      setPhotoPreview(player.photoURL || '');
      setPhotoFile(null);
    }
  }, [open, player, reset]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      setPhotoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        setValue('photoURL', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview('');
    setValue('photoURL', '');
  };

  const onSubmit = async (data: PlayerFormData) => {
    setSubmitting(true);

    try {
      const result = await updatePlayer(player.id, {
        name: data.name,
        photoURL: data.photoURL || null,
      });

      if (result.success) {
        toast.success('Player updated! ✅', {
          description: `${data.name}'s profile has been updated`,
        });
        onClose();
      } else {
        toast.error('Failed to update player', {
          description: 'Please try again',
        });
      }
    } catch (error) {
      console.error('Error updating player:', error);
      toast.error('An error occurred', {
        description: 'Please check your connection and try again',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      reset();
      setPhotoPreview(player.photoURL || '');
      setPhotoFile(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-[#111827] border-white/10 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            Edit Player
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Update player information and photo
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-4">
          {/* Photo Upload */}
          <div>
            <Label className="text-white mb-2 block text-sm font-medium">
              Player Photo
            </Label>
            
            {photoPreview ? (
              <div className="relative w-32 h-32 mx-auto">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-emerald-500/30 shadow-lg">
                  <Image
                    src={photoPreview}
                    alt="Player photo"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute -top-2 -right-2 p-1.5 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-emerald-500/50 hover:bg-white/5 transition-all">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Upload className="w-8 h-8 text-slate-400" />
                  <p className="text-sm text-slate-400">Click to upload photo</p>
                  <p className="text-xs text-slate-500">PNG, JPG up to 5MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  disabled={submitting}
                />
              </label>
            )}
          </div>

          {/* Player Name */}
          <div>
            <Label htmlFor="name" className="text-white mb-2 block text-sm font-medium">
              Player Name
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Enter player name"
              className="bg-white/5 border-white/10 text-white h-12 focus:border-emerald-500/50"
              disabled={submitting}
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1.5">{errors.name.message}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
              className="flex-1 border-white/10 hover:bg-white/10 text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
