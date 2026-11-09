import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface NewsroomArticle {
  id: string;
  author_id: string;
  author_name: string | null;
  title: string;
  summary: string | null;
  body: string;
  category: string;
  image_url: string | null;
  status: string;
  published_at: string;
}

export function useNewsroomArticles() {
  return useQuery({
    queryKey: ['newsroom-articles'],
    staleTime: 60 * 1000,
    queryFn: async (): Promise<NewsroomArticle[]> => {
      const { data, error } = await supabase
        .from('newsroom_articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      if (error) throw error;
      return data as NewsroomArticle[];
    },
  });
}

export function useIsStaff() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['is-staff', user?.id],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<boolean> => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', user!.id)
        .eq('role', 'staff')
        .maybeSingle();
      if (error) return false;
      return !!data;
    },
  });
}

export function usePublishArticle() {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();
  return useMutation({
    mutationFn: async (article: { title: string; summary: string; body: string; category: string; image_url: string }) => {
      if (!user) throw new Error('Sign in to publish.');
      const { error } = await supabase.from('newsroom_articles').insert({
        author_id: user.id,
        author_name: profile?.display_name || user.email || 'Staff writer',
        title: article.title,
        summary: article.summary || null,
        body: article.body,
        category: article.category,
        image_url: article.image_url || null,
        status: 'published',
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['newsroom-articles'] }),
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('newsroom_articles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['newsroom-articles'] }),
  });
}
