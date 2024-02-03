export default function FormButton({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="disabled:bg-green-200 absolute bottom-2 left-2 py-1 bg-green-300 w-[calc(100%-16px)] rounded-md hover:bg-green-400"
    >
      {text}
    </button>
  );
}
