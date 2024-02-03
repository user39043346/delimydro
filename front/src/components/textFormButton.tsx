export default function TextFormButton({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="text-green-500 bg-gray-200 px-1 rounded-lg">
      {text}
    </button>
  );
}
