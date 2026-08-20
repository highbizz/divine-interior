import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, Copy, MoreHorizontal, ImageOff, Loader2, Package } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { productsApi, type Product } from '@/lib/api';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';

const CATEGORIES = ['Table','Adjustable Desk','Chairs','Sofas & Couches','Coffee Tables','Dining Chairs','Dining Tables','Lighting','Rugs','Wardrobes','Beds','Side Tables','Accessories','Kitchens','Outdoor'];

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const productSchema = z.object({
  title: z.string().min(1,'Title is required'),
  slug: z.string().min(1,'Slug is required'),
  description: z.string().default(''),
  price: z.coerce.number().min(0),
  compare_at_price: z.coerce.number().nullable().optional(),
  category: z.string().min(1,'Category is required'),
  sku: z.string().optional(),
  stock: z.coerce.number().min(0).default(0),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  tags: z.string().default(''),
  images: z.string().default(''),
});
type FormData = z.infer<typeof productSchema>;

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing]   = useState<Product | null>(null);
  const [delTarget, setDelTarget] = useState<Product | null>(null);
  const [saving, setSaving]     = useState(false);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } =
    useForm<FormData>({ resolver: zodResolver(productSchema) });

  const titleVal = watch('title');
  useEffect(() => { if (!editing) setValue('slug', slugify(titleVal ?? '')); }, [titleVal, editing, setValue]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string,string> = {};
      if (search) params.search = search;
      if (catFilter !== 'all') params.category = catFilter;
      const res = await productsApi.list(params);
      setProducts(res.items);
      setTotal(res.total);
    } catch (e: any) { toast.error(e.message); }
    setLoading(false);
  }, [search, catFilter]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    reset({ title:'', slug:'', description:'', price:0, compare_at_price:undefined, category:'', sku:'', stock:0, is_active:true, is_featured:false, tags:'', images:'' });
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    reset({
      title: p.title, slug: p.slug, description: p.description,
      price: p.price, compare_at_price: p.compare_at_price ?? undefined,
      category: p.category, sku: p.sku ?? '', stock: p.stock,
      is_active: Boolean(p.is_active), is_featured: Boolean(p.is_featured),
      tags: p.tags.join(', '), images: p.images.join('\n'),
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    const payload = {
      ...data,
      compare_at_price: data.compare_at_price || null,
      tags:   data.tags.split(',').map(t => t.trim()).filter(Boolean),
      images: data.images.split('\n').map(u => u.trim()).filter(Boolean),
    };
    try {
      if (editing) { await productsApi.update(editing.id, payload as any); toast.success('Product updated'); }
      else         { await productsApi.create(payload as any); toast.success('Product created'); }
      setDialogOpen(false); load();
    } catch (e: any) { toast.error(e.message); }
    setSaving(false);
  };

  const handleDuplicate = async (p: Product) => {
    try {
      await productsApi.create({ ...p, id: undefined as any, title: `${p.title} (Copy)`, slug: `${p.slug}-copy-${Date.now()}` });
      toast.success('Duplicated'); load();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDelete = async () => {
    if (!delTarget) return;
    try { await productsApi.delete(delTarget.id); toast.success('Deleted'); load(); }
    catch (e: any) { toast.error(e.message); }
    setDelTarget(null);
  };

  const toggleActive = async (p: Product) => {
    try { await productsApi.update(p.id, { is_active: !p.is_active } as any); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-black">Products</h1>
          <p className="font-sans text-sm text-gray-400">{total} total products</p>
        </div>
        <Button onClick={openCreate} className="bg-black text-white hover:bg-gray-900 font-sans text-xs font-bold uppercase tracking-widest rounded-lg">
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Search by name or SKU…" className="pl-9 font-sans text-sm bg-white border-gray-200 focus:border-black focus:ring-black/10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-full sm:w-48 font-sans text-sm bg-white border-gray-200"><SelectValue placeholder="All categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        {loading ? (
          <div className="flex h-48 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-black" /></div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package className="mb-3 h-10 w-10 text-gray-200" />
            <p className="font-sans text-sm text-gray-400">No products found.</p>
            <Button variant="outline" size="sm" onClick={openCreate} className="mt-3 font-sans text-xs border-gray-200 hover:border-black hover:bg-black hover:text-white transition-all">Add your first product</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>{['Product','Category','Price','Stock','Active','Featured','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-sans text-[10px] font-semibold uppercase tracking-wider text-gray-400">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                          {p.images[0] ? <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center"><ImageOff className="h-4 w-4 text-gray-300" /></div>}
                        </div>
                        <div>
                          <p className="font-sans text-sm font-semibold text-black line-clamp-1">{p.title}</p>
                          <p className="font-sans text-xs text-gray-400">SKU: {p.sku ?? '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-sans text-xs text-gray-500">{p.category}</td>
                    <td className="px-4 py-3">
                      <p className="font-sans text-sm font-bold text-black">₹{Number(p.price).toLocaleString('en-IN')}</p>
                      {p.compare_at_price && <p className="font-sans text-xs text-gray-400 line-through">₹{Number(p.compare_at_price).toLocaleString('en-IN')}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 font-sans text-[11px] font-semibold ${Number(p.stock) > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                        {Number(p.stock) > 0 ? `${p.stock} in stock` : 'Out of stock'}
                      </span>
                    </td>
                    <td className="px-4 py-3"><Switch checked={Boolean(p.is_active)} onCheckedChange={() => toggleActive(p)} /></td>
                    <td className="px-4 py-3">
                      {p.is_featured ? <span className="inline-flex items-center rounded-full bg-black px-2.5 py-1 font-sans text-[11px] font-semibold text-white">Featured</span> : <span className="font-sans text-xs text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(p)}><Edit2 className="mr-2 h-3.5 w-3.5" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(p)}><Copy className="mr-2 h-3.5 w-3.5" /> Duplicate</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setDelTarget(p)} className="text-red-600 focus:text-red-600"><Trash2 className="mr-2 h-3.5 w-3.5" /> Delete</DropdownMenuItem>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display text-lg font-semibold text-black">{editing ? 'Edit Product' : 'Add New Product'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Title *</Label>
                <Input {...register('title')} className="font-sans text-sm" />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Slug *</Label>
                <Input {...register('slug')} className="font-sans text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Description</Label>
              <Textarea {...register('description')} rows={3} className="font-sans text-sm resize-none" />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Price (₹) *</Label>
                <Input {...register('price')} type="number" min="0" step="0.01" className="font-sans text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Compare At (₹)</Label>
                <Input {...register('compare_at_price')} type="number" min="0" step="0.01" className="font-sans text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Stock</Label>
                <Input {...register('stock')} type="number" min="0" className="font-sans text-sm" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Category *</Label>
                <select {...register('category')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Select…</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">SKU</Label>
                <Input {...register('sku')} className="font-sans text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tags (comma separated)</Label>
              <Input {...register('tags')} placeholder="featured, sale" className="font-sans text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Image URLs (one per line)</Label>
              <Textarea {...register('images')} rows={3} className="font-sans text-sm resize-none" />
            </div>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Switch id="is_active" checked={watch('is_active')} onCheckedChange={v => setValue('is_active', v)} />
                <Label htmlFor="is_active" className="font-sans text-sm cursor-pointer">Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="is_featured" checked={watch('is_featured')} onCheckedChange={v => setValue('is_featured', v)} />
                <Label htmlFor="is_featured" className="font-sans text-sm cursor-pointer">Featured</Label>
              </div>
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="font-sans text-xs border-gray-200">Cancel</Button>
              <Button type="submit" disabled={saving} className="bg-black text-white hover:bg-gray-900 font-sans text-xs font-bold uppercase tracking-widest rounded-lg">
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : editing ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!delTarget} onOpenChange={o => !o && setDelTarget(null)}
        title="Delete Product" description={`Delete "${delTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete" onConfirm={handleDelete} />
    </div>
  );
};
export default AdminProducts;
