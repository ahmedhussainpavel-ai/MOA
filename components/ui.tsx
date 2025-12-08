import React, { useRef, useState } from 'react';
import { motion, HTMLMotionProps, AnimatePresence } from 'framer-motion';
import { Upload, X } from 'lucide-react';
import { compressImage } from '../utils';

// Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth, 
  size = 'md',
  className = '', 
  ...props 
}) => {
  const baseStyles = "rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-3 text-sm md:text-base",
    lg: "px-6 py-4 text-base md:text-lg"
  };

  const variants = {
    primary: "bg-moa-gold text-moa-dark hover:bg-moa-goldHover shadow-lg shadow-moa-gold/20",
    secondary: "bg-moa-brown text-moa-cream hover:bg-opacity-90",
    outline: "border-2 border-moa-gold text-moa-gold hover:bg-moa-gold hover:text-moa-dark",
    ghost: "text-moa-cream hover:bg-white/5",
    danger: "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20"
  };

  return (
    <button 
      className={`${baseStyles} ${sizeStyles[size]} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Input
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => (
  <div className="flex flex-col gap-1 w-full">
    {label && <label className="text-sm text-moa-cream/70 ml-1 font-medium">{label}</label>}
    <input 
      className={`bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-moa-cream focus:outline-none focus:border-moa-gold focus:ring-1 focus:ring-moa-gold transition-colors w-full ${className}`}
      {...props}
    />
  </div>
);

// Card
export const Card: React.FC<HTMLMotionProps<"div">> = ({ children, className = '', ...props }) => (
  <motion.div 
    className={`bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl p-4 md:p-5 shadow-xl ${className}`}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    {...props}
  >
    {children}
  </motion.div>
);

// Badge
export const Badge: React.FC<{ children: React.ReactNode; variant?: 'success' | 'warning' | 'info' | 'danger' }> = ({ children, variant = 'info' }) => {
  const colors = {
    success: 'bg-green-500/10 text-green-400 border-green-500/20',
    warning: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    danger: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap ${colors[variant]}`}>
      {children}
    </span>
  );
};

// Modal
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          onClick={onClose}
        />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 pointer-events-none">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 50 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.95, opacity: 0, y: 50 }}
            className="bg-[#1C1C1C] border-t md:border border-white/10 w-full md:max-w-lg h-full md:h-auto md:rounded-2xl shadow-2xl pointer-events-auto flex flex-col md:max-h-[90vh]"
          >
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#1C1C1C] md:rounded-t-2xl">
              <h3 className="font-display font-bold text-xl text-moa-gold">{title}</h3>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-moa-cream/60 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar flex-1 pb-20 md:pb-6">
              {children}
            </div>
          </motion.div>
        </div>
      </>
    )}
  </AnimatePresence>
);

// Image Upload
interface ImageUploadProps {
  image: string;
  onImageChange: (base64: string) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ image, onImageChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = async (file: File) => {
    try {
      const compressed = await compressImage(file);
      onImageChange(compressed);
    } catch (e) {
      console.error("Image upload failed", e);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="w-full">
      <div 
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`relative h-40 md:h-48 rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-2 group
          ${isDragging ? 'border-moa-gold bg-moa-gold/10' : 'border-white/10 bg-white/5 hover:border-moa-gold/50 hover:bg-white/10'}
        `}
      >
        {image ? (
          <>
            <img src={image} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <p className="text-white font-bold text-sm bg-black/50 px-3 py-1 rounded-full">Change Image</p>
            </div>
          </>
        ) : (
          <>
            <Upload className={`w-8 h-8 ${isDragging ? 'text-moa-gold' : 'text-moa-cream/40'}`} />
            <p className="text-xs text-moa-cream/60">Click or Drag Image Here</p>
          </>
        )}
      </div>
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} 
      />
    </div>
  );
};