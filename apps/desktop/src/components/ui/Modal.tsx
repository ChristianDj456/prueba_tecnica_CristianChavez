import { useEffect } from 'react'
import { XIcon } from 'lucide-react'

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer
}: ModalProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
        
        <div className="relative z-[101] w-full max-w-2xl rounded-2xl bg-white shadow-xl">
          
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-500 focus:outline-none">
              <XIcon size={20} />
            </button>
          </div>
          
          <div className="px-6 py-4">{children}</div>

          {footer && <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              {footer}
            </div>}
        </div>
      </div>
    </div>;
};