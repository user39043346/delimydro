export default function UserImage({ src }: { src: string }) {
  return <img src={src} className="rounded-[100%] max-w-[100%] max-h-[100%] border-[1px] border-black/[0.5]" />;
}
