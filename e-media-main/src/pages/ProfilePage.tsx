import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Camera, User, ArrowLeft, Save } from 'lucide-react';
import logoImg from '@/assets/e-media-logo.png';

const ProfilePage = ({ onBack }: { onBack: () => void }) => {
  const { user, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', user.id)
        .single();
      if (data) {
        setDisplayName(data.display_name || '');
        setAvatarUrl(data.avatar_url);
      }
    };
    fetchProfile();
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path);

      const url = `${publicUrl}?t=${Date.now()}`;
      setAvatarUrl(url);

      await supabase
        .from('profiles')
        .update({ avatar_url: url })
        .eq('user_id', user.id);

      await refreshProfile();
      toast.success('Avatar updated!');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('user_id', user.id);
      if (error) throw error;
      await refreshProfile();
      toast.success('Profile updated!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 pt-4 pb-24">
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">Back</span>
      </button>

      <div className="flex flex-col items-center mb-8">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-muted border-2 border-primary/30">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User size={40} className="text-muted-foreground" />
              </div>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Camera size={14} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </div>
        {uploading && <p className="text-xs text-muted-foreground mt-2">Uploading...</p>}
        <p className="text-xs text-muted-foreground mt-2">{user?.email}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="Your display name"
            className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Save size={16} />
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      <div className="mt-8 text-center">
        <img src={logoImg} alt="ES-PRESS" className="w-10 h-10 rounded-lg mx-auto mb-2 opacity-50" />
        <p className="text-[10px] text-muted-foreground">© {new Date().getFullYear()} Ncamiso Xaba. All rights reserved.</p>
      </div>
    </div>
  );
};

export default ProfilePage;
