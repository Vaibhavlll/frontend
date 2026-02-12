interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input = ({ label, ...props }: InputProps) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input 
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
      {...props}
    />
  </div>
);