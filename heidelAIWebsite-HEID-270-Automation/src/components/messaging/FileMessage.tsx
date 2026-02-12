import { FileText, File, FileImage, FileVideo, Music,} from "lucide-react";

export const FileMessage = ({
  fileUrl,
  fileName,
  fileType,
}: {
  fileUrl: string;
  fileName: string;
  fileType?: string;
}) => {
  const getFileIcon = () => {
    if (fileType?.startsWith("image/"))
      return <FileImage className="h-5 w-5 text-blue-500" />;

    if (fileType?.startsWith("video/"))
      return <FileVideo className="h-5 w-5 text-purple-500" />;

    if (fileType?.startsWith("audio/"))
      return <Music className="h-5 w-5 text-green-500" />;

    if (fileType === "application/pdf")
      return <FileText className="h-5 w-5 text-red-500" />;

    return <File className="h-5 w-5 text-gray-500" />;
  };

  const isImage = fileType?.startsWith("image/");
  const isPDF = fileType === "application/pdf";

  if (isImage) {
    return <img src={fileUrl} alt={fileName} className="max-w-sm rounded-lg" />;
  }

  if (isPDF) {
    return (
      <div className="flex flex-col gap-2">
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-3 rounded-lg border hover:bg-gray-50"
        >
          {getFileIcon()}

          <div className="flex flex-col">
            <span className="text-sm text-blue-600">{fileName}</span>

            <span className="text-xs text-gray-500">PDF Document</span>
          </div>
        </a>

        <iframe
          src={`${fileUrl}#view=FitH`}
          className="w-full h-[400px] rounded-lg border"
        />
      </div>
    );
  }

  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 p-3 rounded-lg border hover:bg-gray-50"
    >
      {getFileIcon()}

      <div className="flex flex-col">
        <span className="text-sm text-blue-600">{fileName}</span>

        <span className="text-xs text-gray-500">
          {fileType?.split("/")[1].toUpperCase() || "Document"}
        </span>
      </div>
    </a>
  );
};