import { useEffect, useState, useCallback } from 'react';
import {
  Plus, Search, Edit2, Trash2, Copy, MoreHorizontal, FileText,
  Loader2, Eye, ExternalLink, CheckCircle2, Clock,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { blogsApi, type Blog, type BlogStatus } from '@/lib/api';
import { DEFAULT_BLOGS } from '@/data/defaultBlogs';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { BlogStatusBadge } from '@/components/admin/StatusBadge';

type BlogInsert = Partial<Blog>;

const blogSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  excerpt: z.string().default(''),
  content: z.string().default(''),
  cover_image: z.string().nullable().optional(),
  author: z.string().default('Office Furnisho Team'),
  tags: z.string().default(''),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  meta_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
  published_at: z.string().nullable().optional(),
});

type BlogFormData = z.infer<typeof blogSchema>;

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const LOCAL_STORAGE_KEY = 'office_furnisho_blogs_override';

const getStoredBlogs = (): Blog[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return DEFAULT_BLOGS;
};

const saveStoredBlogs = (blogs: Blog[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(blogs));
  } catch (e) {}
};

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState<Blog[]>(getStoredBlogs());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BlogStatus | 'all'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Blog | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    register, handleSubmit, reset, watch, setValue,
    formState: { errors },
  } = useForm<BlogFormData>({ resolver: zodResolver(blogSchema) });

  const titleVal = watch('title');
  useEffect(() => {
    if (!editingBlog) {
      setValue('slug', slugify(titleVal ?? ''));
    }
  }, [titleVal, editingBlog, setValue]);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;
      const res = await blogsApi.list(params);
      if (res.items && res.items.length > 0) {
        setBlogs(res.items);
        saveStoredBlogs(res.items);
      } else {
        setBlogs(getStoredBlogs());
      }
    } catch (e: any) {
      setBlogs(getStoredBlogs());
    }
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

  const openCreate = () => {
    setEditingBlog(null);
    reset({
      title: '', slug: '', excerpt: '', content: '', cover_image: '',
      author: 'Office Furnisho Team', tags: '', status: 'draft',
      meta_title: '', meta_description: '', published_at: null,
    });
    setDialogOpen(true);
  };

  const openEdit = (b: Blog) => {
    setEditingBlog(b);
    reset({
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt,
      content: b.content,
      cover_image: b.cover_image ?? '',
      author: b.author,
      tags: Array.isArray(b.tags) ? b.tags.join(', ') : '',
      status: b.status,
      meta_title: b.meta_title ?? '',
      meta_description: b.meta_description ?? '',
      published_at: b.published_at ?? null,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: BlogFormData) => {
    setSaving(true);
    const publishedAt = data.status === 'published' && !data.published_at
      ? new Date().toISOString() : data.published_at ?? null;

    const parsedTags = data.tags.split(',').map(t => t.trim()).filter(Boolean);

    const payload: BlogInsert = {
      title: data.title, slug: data.slug, excerpt: data.excerpt,
      content: data.content, cover_image: data.cover_image || null,
      author: data.author, tags: parsedTags,
      status: data.status, meta_title: data.meta_title || null,
      meta_description: data.meta_description || null, published_at: publishedAt,
    };

    try {
      if (editingBlog) {
        await blogsApi.update(editingBlog.id, payload).catch(() => {});
        const updatedList = blogs.map(b => b.id === editingBlog.id ? {
          ...b,
          ...payload,
          updated_at: new Date().toISOString(),
        } as Blog : b);
        setBlogs(updatedList);
        saveStoredBlogs(updatedList);
        toast.success('Blog updated successfully');
      } else {
        const created = await blogsApi.create(payload).catch(() => null);
        const newBlog: Blog = created || {
          id: Date.now(),
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt,
          content: data.content,
          cover_image: data.cover_image || null,
          author: data.author,
          tags: parsedTags,
          status: data.status,
          meta_title: data.meta_title || null,
          meta_description: data.meta_description || null,
          views: 0,
          published_at: publishedAt,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const updatedList = [newBlog, ...blogs];
        setBlogs(updatedList);
        saveStoredBlogs(updatedList);
        toast.success('Blog created successfully');
      }
      setDialogOpen(false);
      fetchBlogs();
    } catch (e: any) {
      toast.error('Failed to save blog', { description: e.message });
    }
    setSaving(false);
  };

  const handleToggleStatus = async (b: Blog) => {
    const nextStatus: BlogStatus = b.status === 'published' ? 'draft' : 'published';
    const nextPublishedAt = nextStatus === 'published' ? (b.published_at || new Date().toISOString()) : b.published_at;

    try {
      await blogsApi.update(b.id, { status: nextStatus, published_at: nextPublishedAt }).catch(() => {});
      const updated = blogs.map(item => item.id === b.id ? { ...item, status: nextStatus, published_at: nextPublishedAt } : item);
      setBlogs(updated);
      saveStoredBlogs(updated);
      toast.success(`Article ${nextStatus === 'published' ? 'Published' : 'saved as Draft'}`);
    } catch (e: any) {
      toast.error('Status change failed');
    }
  };

  const handleDuplicate = async (b: Blog) => {
    try {
      const dupPayload = {
        title: `${b.title} (Copy)`, slug: `${b.slug}-copy-${Date.now()}`,
        excerpt: b.excerpt, content: b.content, cover_image: b.cover_image,
        author: b.author, tags: b.tags, status: 'draft' as BlogStatus, published_at: null,
        meta_title: b.meta_title, meta_description: b.meta_description,
      };
      const res = await blogsApi.create(dupPayload).catch(() => null);
      const newBlog: Blog = res || {
        id: Date.now(),
        ...dupPayload,
        views: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updated = [newBlog, ...blogs];
      setBlogs(updated);
      saveStoredBlogs(updated);
      toast.success('Blog duplicated');
    } catch (e: any) {
      toast.error('Duplicate failed', { description: e.message });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await blogsApi.delete(deleteTarget.id).catch(() => {});
      const updated = blogs.filter(b => b.id !== deleteTarget.id);
      setBlogs(updated);
      saveStoredBlogs(updated);
      toast.success('Blog deleted');
    } catch (e: any) {
      toast.error('Delete failed', { description: e.message });
    }
    setDeleteTarget(null);
  };

  const filtered = blogs.filter(b => {
    const matchSearch = b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      (Array.isArray(b.tags) && b.tags.some(t => t.toLowerCase().includes(search.toLowerCase())));
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-light tracking-wide">Blogs & Content Management</h1>
          <p className="font-sans text-sm text-muted-foreground">{blogs.length} total articles • Live editing, draft control, author names & SEO tags</p>
        </div>
        <Button onClick={openCreate} className="bg-primary font-sans text-xs font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> New Article
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title, author, or tags…"
            className="pl-9 font-sans text-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={v => setStatusFilter(v as any)}>
          <SelectTrigger className="w-full sm:w-40 font-sans text-sm">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <FileText className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="font-sans text-sm text-muted-foreground">No articles found.</p>
            <Button variant="outline" size="sm" onClick={openCreate} className="mt-3 font-sans text-xs">
              Write your first article
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  {['Article', 'Author & Tags', 'Status', 'Views', 'Published', 'Quick Action', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-sans text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(b => (
                  <tr key={b.id} className="hover:bg-muted/20 transition-colors">
                    {/* Article */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {b.cover_image ? (
                          <img src={b.cover_image} alt={b.title} className="h-12 w-16 rounded object-cover flex-shrink-0 border border-border" />
                        ) : (
                          <div className="h-12 w-16 rounded bg-muted flex items-center justify-center flex-shrink-0 border border-border">
                            <FileText className="h-5 w-5 text-muted-foreground/40" />
                          </div>
                        )}
                        <div>
                          <p className="font-sans text-sm font-semibold text-foreground line-clamp-1 max-w-xs">{b.title}</p>
                          <p className="font-sans text-[11px] text-muted-foreground line-clamp-1 max-w-xs">{b.excerpt || 'No excerpt provided'}</p>
                        </div>
                      </div>
                    </td>
                    {/* Author & Tags */}
                    <td className="px-4 py-3">
                      <p className="font-sans text-xs font-medium text-foreground">{b.author}</p>
                      {Array.isArray(b.tags) && b.tags.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {b.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="rounded bg-muted px-1.5 py-0.5 font-sans text-[9px] text-muted-foreground">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3"><BlogStatusBadge status={b.status} /></td>
                    {/* Views */}
                    <td className="px-4 py-3 font-sans text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {(b.views || 0).toLocaleString()}</span>
                    </td>
                    {/* Date */}
                    <td className="px-4 py-3 font-sans text-xs text-muted-foreground whitespace-nowrap">
                      {b.published_at ? new Date(b.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    {/* Quick Toggle */}
                    <td className="px-4 py-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(b)}
                        className="font-sans text-[11px] h-7 px-2"
                      >
                        {b.status === 'published' ? (
                          <><Clock className="mr-1 h-3 w-3 text-amber-500" /> Make Draft</>
                        ) : (
                          <><CheckCircle2 className="mr-1 h-3 w-3 text-emerald-500" /> Publish</>
                        )}
                      </Button>
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => window.open(`/blog/${b.slug}`, '_blank')}>
                            <ExternalLink className="mr-2 h-3.5 w-3.5" /> View Live
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(b)}>
                            <Edit2 className="mr-2 h-3.5 w-3.5" /> Edit Article
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(b)}>
                            <Copy className="mr-2 h-3.5 w-3.5" /> Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setDeleteTarget(b)} className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-light tracking-wide">
              {editingBlog ? `Edit Article: ${editingBlog.title}` : 'New Article'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            {/* Title + Slug */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="admin-label">Article Title *</Label>
                <Input {...register('title')} placeholder="e.g. Ergonomic Office Chair Guide" className="font-sans text-sm" />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="admin-label">URL Slug *</Label>
                <Input {...register('slug')} placeholder="e.g. ergonomic-office-chair-guide" className="font-sans text-sm" />
                {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
              </div>
            </div>

            {/* Author + Status */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="admin-label">Author Name</Label>
                <Input {...register('author')} placeholder="e.g. Office Furnisho Team" className="font-sans text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="admin-label">Publish Status</Label>
                <select
                  {...register('status')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 font-sans text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="draft">Draft (Private)</option>
                  <option value="published">Published (Public)</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Excerpt */}
            <div className="space-y-1.5">
              <Label className="admin-label">Excerpt / Short Summary</Label>
              <Textarea {...register('excerpt')} rows={2} placeholder="Brief description displayed on blog card grid…" className="font-sans text-sm resize-none" />
            </div>

            {/* Content */}
            <div className="space-y-1.5">
              <Label className="admin-label">Article Content (Supports HTML tags like &lt;p&gt;, &lt;h3&gt;, &lt;ul&gt;, &lt;blockquote&gt;)</Label>
              <Textarea {...register('content')} rows={10} placeholder="Write full article HTML content here…" className="font-sans text-sm resize-none font-mono text-xs" />
            </div>

            {/* Cover Image */}
            <div className="space-y-1.5">
              <Label className="admin-label">Cover Image URL</Label>
              <Input {...register('cover_image')} placeholder="https://images.unsplash.com/…" className="font-sans text-sm" />
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <Label className="admin-label">Tags (comma separated)</Label>
              <Input {...register('tags')} placeholder="Ergonomics, Office Comfort, Buying Guide" className="font-sans text-sm" />
            </div>

            {/* SEO Optimization Section */}
            <div className="rounded-lg border border-border p-4 bg-muted/20 space-y-3">
              <p className="font-sans text-xs font-semibold uppercase tracking-wider text-primary">SEO Optimization & Social Sharing Tags</p>
              <div className="space-y-1.5">
                <Label className="admin-label">Meta Title (Search Engines & Browser Tab)</Label>
                <Input {...register('meta_title')} placeholder="Custom SEO Title for Google" className="font-sans text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="admin-label">Meta Description (Search Engine Snippet)</Label>
                <Textarea {...register('meta_description')} rows={2} placeholder="Compelling 150-160 character description for Google search results…" className="font-sans text-sm resize-none" />
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="font-sans text-xs">
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="bg-primary font-sans text-xs font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90">
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : editingBlog ? 'Update Article' : 'Create Article'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={o => !o && setDeleteTarget(null)}
        title="Delete Article"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete Article"
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default AdminBlogs;
