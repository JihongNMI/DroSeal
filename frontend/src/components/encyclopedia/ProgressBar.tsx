interface ProgressBarProps {
  owned: number
  total: number
  label?: string       // 레이블 (기본값: '수집 진행률')
  showPercent?: boolean // 퍼센트 텍스트 표시 여부
  size?: 'sm' | 'md'   // 바 높이 (sm: h-2.5, md: h-3)
}

export default function ProgressBar({
  owned,
  total,
  label = '수집 진행률',
  showPercent = true,
  size = 'md',
}: ProgressBarProps) {
  const percent = total > 0 ? Math.round((owned / total) * 100) : 0
  const width = total > 0 ? (owned / total) * 100 : 0
  const barHeight = size === 'sm' ? 'h-2.5' : 'h-3'
  const trackColor = size === 'sm' ? 'bg-gray-200' : 'bg-gray-300'

  return (
    <div>
      <div className="flex justify-between items-center font-semibold text-gray-700 dark:text-gray-300 mb-1.5 text-sm transition-colors">
        <span>{label}</span>
        <span>
          {owned} / {total}
          {showPercent && total > 0 && (
            <span className="ml-1 text-blue-600 dark:text-blue-400">({percent}%)</span>
          )}
        </span>
      </div>
      <div className={`w-full ${trackColor} dark:bg-[#0d0b2b] rounded-full ${barHeight} transition-colors`}>
        <div
          className={`bg-blue-500 dark:bg-blue-600 ${barHeight} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}
