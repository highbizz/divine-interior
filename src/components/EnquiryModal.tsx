import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, Phone, User, FileText, ClipboardList } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useCustomerStore } from "@/stores/customerStore";
import { checkoutApi, type Product } from "@/lib/api";

const enquirySchema = z.object({
  customer_name:  z.string().min(2, "Name is required"),
  customer_email: z.string().email("Valid email required"),
  customer_phone: z.string().min(10, "Valid phone required"),
  notes:          z.string().optional(),
  quantity:       z.coerce.number().min(1, "Quantity must be at least 1").default(1),
});

type EnquiryForm = z.infer<typeof enquirySchema>;

interface EnquiryModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EnquiryModal = ({ product, isOpen, onClose }: EnquiryModalProps) => {
  const navigate = useNavigate();
  const { user } = useCustomerStore();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EnquiryForm>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      customer_name:  user?.name  ?? "",
      customer_email: user?.email ?? "",
      customer_phone: user?.phone ?? "",
      quantity:       1,
    },
  });

  // Reset form values if user logs in/out or selected product changes
  useEffect(() => {
    if (isOpen) {
      reset({
        customer_name:  user?.name  ?? "",
        customer_email: user?.email ?? "",
        customer_phone: user?.phone ?? "",
        quantity:       1,
        notes:          "",
      });
    }
  }, [isOpen, user, reset]);

  if (!product) return null;

  const onSubmit = async (data: EnquiryForm) => {
    setSubmitting(true);
    try {
      const payload = {
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone,
        shipping_address: {
          name: data.customer_name,
          line1: "N/A",
          line2: "",
          city: "N/A",
          state: "N/A",
          postal_code: "N/A",
          country: "India",
        },
        items: [{
          product_id: String(product.id),
          product_title: product.title,
          variant_title: "Standard",
          price: Number(product.price),
          quantity: data.quantity,
          image: product.images?.[0] ?? "",
        }],
        notes: data.notes,
        total: Number(product.price) * data.quantity,
      };

      const res = await checkoutApi.place(payload);
      toast.success("Enquiry submitted successfully!");
      onClose();
      navigate(`/order-confirmation?order=${res.order_number}&total=${res.total}`);
    } catch (e: any) {
      toast.error("Failed to submit enquiry", { description: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-background">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-light tracking-wide text-foreground">
            Enquire Now
          </DialogTitle>
          <DialogDescription className="font-sans text-xs text-muted-foreground mt-1">
            Request a customized B2B / retail quote for the selected chair setup.
          </DialogDescription>
        </DialogHeader>

        {/* Selected Product Summary */}
        <div className="flex gap-4 p-4 rounded-lg bg-secondary/30 border border-border/60 mb-4 mt-2">
          <div className="h-16 w-16 bg-muted rounded overflow-hidden flex-shrink-0">
            {product.images?.[0] ? (
              <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gray-200">
                <ClipboardList className="h-6 w-6 text-muted-foreground/30" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-display text-sm tracking-wide truncate">{product.title}</h4>
            <p className="font-sans text-xs text-muted-foreground mt-0.5 line-clamp-1">{product.category}</p>
            <p className="font-sans text-xs font-semibold text-primary mt-1">
              Ref. Price: ₹{Number(product.price).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Instant WhatsApp Order Option */}
        <div className="mb-4">
          <a
            href={`https://wa.me/919902841970?text=${encodeURIComponent(
              `Hello I want to buy:\n\n*${product.title}*\n*Price:* ₹${Number(product.price).toLocaleString("en-IN")}\n*URL:* ${window.location.origin}/product/${product.slug}\n\nThank you!`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-3.5 px-4 font-sans text-xs font-bold uppercase tracking-wider rounded-md transition-all shadow-sm hover:shadow-md"
          >
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.763.459 3.484 1.332 5.002L2 22l5.127-1.341c1.464.798 3.116 1.218 4.881 1.219h.004c5.506 0 9.99-4.478 9.99-9.985 0-2.668-1.039-5.176-2.926-7.062A9.927 9.927 0 0 0 12.012 2zm.004 1.661c4.586 0 8.318 3.731 8.319 8.322 0 2.224-.866 4.314-2.438 5.885a8.274 8.274 0 0 1-5.881 2.435h-.003c-1.474 0-2.915-.395-4.172-1.141l-.299-.178-3.097.81.826-3.018-.195-.311A8.257 8.257 0 0 1 3.682 11.99c0-4.59 3.732-8.322 8.334-8.329z" />
            </svg>
            Order via WhatsApp (+91 99028 41970)
          </a>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          {/* Contact Details */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Full Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input {...register("customer_name")} placeholder="Your full name" className="pl-9 font-sans text-sm" />
              </div>
              {errors.customer_name && <p className="text-xs text-destructive">{errors.customer_name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input {...register("customer_email")} type="email" placeholder="your@email.com" className="pl-9 font-sans text-sm" />
              </div>
              {errors.customer_email && <p className="text-xs text-destructive">{errors.customer_email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Phone *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input {...register("customer_phone")} type="tel" placeholder="+91 98765 43210" className="pl-9 font-sans text-sm" />
              </div>
              {errors.customer_phone && <p className="text-xs text-destructive">{errors.customer_phone.message}</p>}
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-1.5 w-full sm:w-32">
            <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Quantity *</Label>
            <Input {...register("quantity")} type="number" min="1" className="font-sans text-sm" />
            {errors.quantity && <p className="text-xs text-destructive">{errors.quantity.message}</p>}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Enquiry Specifications (optional)</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea {...register("notes")} rows={3} placeholder="Sizing requests, upholstery materials, customization needs..." className="pl-9 font-sans text-sm resize-none" />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting} className="font-sans text-xs uppercase tracking-wider font-semibold">
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="bg-primary font-sans text-xs font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90 px-6">
              {submitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…</>
              ) : (
                "Submit Request"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
