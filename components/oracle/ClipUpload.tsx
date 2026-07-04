type ClipUploadProps = {
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
};

export default function ClipUpload({
  selectedFile,
  onFileSelect,
}: ClipUploadProps) {
  return (
    <div className="mx-auto mt-6 max-w-3xl rounded-3xl border border-dashed border-cyan-400/30 bg-cyan-400/10 p-6">
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-950 p-8 text-center hover:border-cyan-400">
        <span className="text-4xl">🎥</span>

        <p className="mt-4 text-xl font-bold text-cyan-300">
          Upload a gameplay clip
        </p>

        <p className="mt-2 text-sm text-slate-400">
          MP4, MOV or WebM. Start with short 10–30 second gunfights.
        </p>

        <input
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onFileSelect(file);
          }}
        />
      </label>

      {selectedFile && (
        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-sm text-slate-400">Selected clip</p>
          <p className="mt-1 font-bold text-white">{selectedFile.name}</p>
        </div>
      )}
    </div>
  );
}