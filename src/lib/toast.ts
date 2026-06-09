/**
 * Premium custom toast notification helper for NongkiYuk.
 * Automatically handles DOM creation, injection, auto-dismiss, and animations.
 */
export function showToast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
  if (typeof window === 'undefined') return;

  let container = document.getElementById('nongkiyuk-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'nongkiyuk-toast-container';
    container.className = 'fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  
  let icon = 'ℹ️';
  let typeLabel = 'INFO';
  let typeColor = 'text-blue-400';
  let borderColor = 'border-slate-800';

  if (type === 'success') {
    icon = '✨';
    typeLabel = 'SUCCESS';
    typeColor = 'text-emerald-400';
  } else if (type === 'error') {
    icon = '⚠️';
    typeLabel = 'ERROR';
    typeColor = 'text-red-400';
  } else if (type === 'warning') {
    icon = '🚨';
    typeLabel = 'WARNING';
    typeColor = 'text-amber-400';
  }

  toast.className = `min-w-[300px] max-w-sm bg-slate-900/95 text-white p-4 rounded-2xl border ${borderColor} backdrop-blur-md shadow-2xl flex items-start gap-3.5 pointer-events-auto transform translate-x-12 opacity-0 transition-all duration-300 ease-out font-sans`;
  toast.style.boxShadow = '0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.5)';
  
  toast.innerHTML = `
    <div class="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800/80 shrink-0 text-sm">
      ${icon}
    </div>
    <div class="flex-1 space-y-0.5 pr-2">
      <p class="text-[9px] font-black uppercase tracking-widest ${typeColor}">${typeLabel}</p>
      <p class="text-xs font-bold leading-relaxed text-slate-200">${message}</p>
    </div>
    <button class="text-slate-500 hover:text-white transition-colors text-base font-black leading-none select-none cursor-pointer">×</button>
  `;

  container.appendChild(toast);

  // Trigger intro animation
  setTimeout(() => {
    toast.className = toast.className.replace('translate-x-12 opacity-0', 'translate-x-0 opacity-100');
  }, 10);

  const closeToast = () => {
    toast.className = toast.className.replace('translate-x-0 opacity-100', 'translate-x-12 opacity-0');
    setTimeout(() => {
      toast.remove();
      if (container && container.childElementCount === 0) {
        container.remove();
      }
    }, 300);
  };

  // Close button trigger
  toast.querySelector('button')?.addEventListener('click', closeToast);

  // Auto remove after 4.5 seconds
  setTimeout(closeToast, 4500);
}
