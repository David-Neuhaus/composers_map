export default function SubmitButton({
  text,
  className,
  disabled,
}: {
  text: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="submit"
      className={`bg-purple-500 hover:bg-purple-700 font-bold py-2 px-4 rounded mb-4 text-white ${
        disabled && "bg-gray-300 hover:bg-gray-300 cursor-not-allowed"
      } ${className}`}
      disabled={disabled}
    >
      {text}
    </button>
  );
}
