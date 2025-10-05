
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}
export const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500';
  const variants = {
    primary: 'bg-red-600 text-white hover:bg-red-700 border border-transparent',
    secondary: 'bg-gray-800 text-white hover:bg-gray-900 border border-transparent',
    danger: 'bg-red-600 text-white hover:bg-red-700 border border-transparent',
    outline: 'bg-transparent text-red-600 hover:bg-red-50 border border-red-600'
  };
  const sizes = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  const variantStyle = variants[variant];
  const sizeStyle = sizes[size];
  return <button className={`${baseStyles} ${variantStyle} ${sizeStyle} ${className}`} {...props}>
      {children}
    </button>
};