export const FloatingWhatsApp = () => {
  const whatsappUrl = `https://wa.me/919902841970?text=${encodeURIComponent(
    "Hello! I am interested in your products at Divine Interior."
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Order via WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-300 hover:scale-110 hover:bg-[#20bd5a] focus:outline-none focus:ring-4 focus:ring-[#25D366]/40"
    >
      <svg className="h-7 w-7 fill-current" viewBox="0 0 24 24">
        <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.763.459 3.484 1.332 5.002L2 22l5.127-1.341c1.464.798 3.116 1.218 4.881 1.219h.004c5.506 0 9.99-4.478 9.99-9.985 0-2.668-1.039-5.176-2.926-7.062A9.927 9.927 0 0 0 12.012 2zm.004 1.661c4.586 0 8.318 3.731 8.319 8.322 0 2.224-.866 4.314-2.438 5.885a8.274 8.274 0 0 1-5.881 2.435h-.003c-1.474 0-2.915-.395-4.172-1.141l-.299-.178-3.097.81.826-3.018-.195-.311A8.257 8.257 0 0 1 3.682 11.99c0-4.59 3.732-8.322 8.334-8.329z" />
      </svg>
    </a>
  );
};
