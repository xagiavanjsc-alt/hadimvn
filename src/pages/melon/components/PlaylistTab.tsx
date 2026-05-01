import { MelonSong } from "@/mocks/melonSongs";

interface PlaylistTabProps {
  songs: MelonSong[];
  onOpenAnalysis: (song: MelonSong) => void;
  onRemove: (rank: number) => void;
}

export default function PlaylistTab({ songs, onOpenAnalysis, onRemove }: PlaylistTabProps) {
  if (songs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-6">
        <div className="w-16 h-16 flex items-center justify-center bg-white/5 rounded-2xl mb-4">
          <i className="ri-heart-3-line text-white/20 text-2xl" />
        </div>
        <p className="text-white/50 text-sm font-medium mb-1">Playlist trống</p>
        <p className="text-white/25 text-xs leading-relaxed">
          Nhấn biểu tượng tim ở Chart để<br />lưu bài hát vào playlist của bạn
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-4">
      <div className="flex items-center justify-between px-1">
        <p className="text-white/40 text-xs">{songs.length} bài hát đã lưu</p>
        <p className="text-white/20 text-xs">Nhấn để học tiếng Hàn</p>
      </div>

      {songs.map((song, idx) => {
        const hasCachedAnalysis = !!localStorage.getItem(`melon_analysis_${song.rank}`);
        return (
          <div
            key={song.rank}
            className="flex items-center bg-white/3 rounded-2xl p-3 border border-white/5 gap-3"
          >
            <span className="text-xs text-white/25 w-5 text-center flex-shrink-0">{idx + 1}</span>
            <img
              src={song.albumArt}
              alt={song.title}
              className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-white/85 text-sm font-semibold truncate">{song.title}</p>
              <p className="text-white/35 text-xs truncate">{song.artist}</p>
              {hasCachedAnalysis && (
                <span className="inline-flex items-center gap-1 text-[10px] text-[#e8c84a]/70 mt-0.5">
                  <i className="ri-sparkling-2-line" />
                  Đã có bài học
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => onOpenAnalysis(song)}
                className="flex items-center gap-1 bg-[#e8c84a]/10 hover:bg-[#e8c84a]/20 text-[#e8c84a] text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-sparkling-2-line text-xs" />
                Học
              </button>
              <button
                onClick={() => onRemove(song.rank)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-colors cursor-pointer"
                title="Xóa khỏi playlist"
              >
                <i className="ri-delete-bin-line text-xs" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
