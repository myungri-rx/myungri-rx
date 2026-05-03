interface SlotFullModalProps {
  open: boolean;
  slotCount: number;
  slotMax: number;
  onOpenHistory: () => void;
  onClose: () => void;
}

export function SlotFullModal({ open, slotCount, slotMax, onOpenHistory, onClose }: SlotFullModalProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div className="glass-card-elevated max-w-sm w-full p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="text-3xl mb-2">📦</div>
        <h3 className="font-display text-xl font-bold text-gradient-gold">저장 슬롯이 가득 찼어요</h3>
        <p className="mt-2 text-sm text-text-secondary">
          저장 가능한 분석은 최대 <span className="text-text-primary font-medium">{slotMax}건</span>입니다.
          <br />
          현재 <span className="text-text-primary font-medium">{slotCount}건</span> 저장 중이에요.
          <br />
          기존 기록을 삭제한 뒤 다시 결제해주세요.
        </p>
        <div className="mt-5 space-y-2">
          <button
            onClick={onOpenHistory}
            className="w-full rounded-xl bg-primary text-white px-4 py-3 text-sm font-semibold hover:brightness-110"
          >
            내 분석 기록 열기
          </button>
          <button
            onClick={onClose}
            className="w-full text-xs text-text-secondary hover:text-text-primary py-2"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
