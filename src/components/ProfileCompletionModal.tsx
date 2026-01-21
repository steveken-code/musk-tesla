import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, User, Mail, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProfileCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentName?: string;
  currentEmail?: string;
  currentAvatarUrl?: string;
  onProfileUpdated: () => void;
}

const ProfileCompletionModal = ({
  isOpen,
  onClose,
  userId,
  currentName = '',
  currentEmail = '',
  currentAvatarUrl = '',
  onProfileUpdated,
}: ProfileCompletionModalProps) => {
  const [fullName, setFullName] = useState(currentName);
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(currentAvatarUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setAvatarFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile) return avatarUrl || null;

    setIsUploading(true);
    try {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;

      // Delete existing avatar if present
      if (avatarUrl) {
        const oldPath = avatarUrl.split('/avatars/')[1];
        if (oldPath) {
          await supabase.storage.from('avatars').remove([oldPath]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast.error('Failed to upload avatar');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    setIsLoading(true);
    try {
      // Upload avatar if selected
      const newAvatarUrl = await uploadAvatar();

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          avatar_url: newAvatarUrl,
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Profile updated successfully!');
      onProfileUpdated();
      onClose();
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const isProfileIncomplete = !currentName?.trim();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={isProfileIncomplete ? undefined : onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="relative p-6 pb-4 border-b border-border bg-gradient-to-r from-tesla-red/10 to-electric-blue/10">
                {!isProfileIncomplete && (
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                )}
                <h2 className="text-2xl font-bold text-foreground">
                  {isProfileIncomplete ? 'Complete Your Profile' : 'Edit Profile'}
                </h2>
                <p className="text-muted-foreground mt-1">
                  {isProfileIncomplete 
                    ? 'Please complete your profile to continue'
                    : 'Update your profile information'
                  }
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Avatar Upload */}
                <div className="flex flex-col items-center gap-4">
                  <motion.div 
                    onClick={() => fileInputRef.current?.click()}
                    className="relative w-28 h-28 rounded-full overflow-hidden cursor-pointer group border-4 border-tesla-red/30 hover:border-tesla-red transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {avatarPreview ? (
                      <motion.img 
                        key={avatarPreview}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        src={avatarPreview} 
                        alt="Avatar preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-tesla-red to-electric-blue flex items-center justify-center">
                        <User className="w-12 h-12 text-white" />
                      </div>
                    )}
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {isUploading ? (
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                      ) : (
                        <Camera className="w-8 h-8 text-white" />
                      )}
                    </div>
                  </motion.div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-electric-blue hover:underline"
                  >
                    {avatarPreview ? 'Change Photo' : 'Add Profile Photo'}
                  </button>
                </div>

                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-foreground font-medium">
                    Full Name <span className="text-tesla-red">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="pl-10 bg-background border-border"
                      required
                    />
                  </div>
                </div>

                {/* Email (Read-only) */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={currentEmail}
                      disabled
                      className="pl-10 bg-muted border-border opacity-70 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed here
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading || isUploading}
                  className="w-full bg-gradient-to-r from-tesla-red to-red-600 hover:from-red-600 hover:to-tesla-red text-white font-semibold py-3"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Save Profile
                    </>
                  )}
                </Button>

                {isProfileIncomplete && (
                  <p className="text-xs text-center text-muted-foreground">
                    You need to complete your profile before using the dashboard
                  </p>
                )}
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProfileCompletionModal;
