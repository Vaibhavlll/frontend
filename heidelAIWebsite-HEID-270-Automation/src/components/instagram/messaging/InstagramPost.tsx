import Image from "next/image";

interface InstagramPostProps {
  profileImage?: string;
  mediaUrl: string;
  timestamp: string;
}

export default function InstagramPost({
  profileImage = "/icons/ig_no_pfp.jpg",
  mediaUrl,
  timestamp,
}: InstagramPostProps) {
  return (
    <div className="max-w-md mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center p-3">
        <Image
          src={profileImage}
          alt={"Profile"}
          width={40}
          height={40}
          className="rounded-full object-cover"
        />
        <div className="ml-3">
          <p className="font-semibold text-sm">Instagram User</p>
        </div>
      </div>

      {/* Image */}
      <div className="relative w-[300px] h-[350px] bg-gray-100">
        <Image
          src={`https://egenie-whatsapp.koyeb.app/api/instagram/proxy/instagram-media?url=${encodeURIComponent(mediaUrl)}`}
          alt="Instagram media"
          fill
          className="object-cover"
        />
      </div>

      {/* Caption */}
      <div className="px-4 py-3">
        <p className="text-sm">
          <span className="font-semibold mr-2">Instagram User</span>
          Shared a post.
        </p>
        <p className="text-xs text-gray-500 mt-2 uppercase tracking-wide">
          {timestamp}
        </p>
      </div>
    </div>
  );
}
