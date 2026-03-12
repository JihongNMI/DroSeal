import './CursorTestBoard.css'

const cursorList = [
  { id: 'default',     name: '일반 선택',           desc: '표준 마우스 커서',                        cursorClass: 'cursor-default',     icon: '🖱️' },
  { id: 'pointer',     name: '링크 선택',            desc: '클릭 할 수 있음을 나타냅니다.',             cursorClass: 'cursor-pointer',     icon: '👆' },
  { id: 'text',        name: '텍스트 선택',          desc: '텍스트를 선택할 수 있음을 나타냅니다.',      cursorClass: 'cursor-text',        icon: 'T'  },
  { id: 'move',        name: '이동',                 desc: '이동할 수 있음을 표시',                    cursorClass: 'cursor-move',        icon: '✥'  },
  { id: 'crosshair',   name: '영역 선택',            desc: '정밀한 선택이 가능',                       cursorClass: 'cursor-crosshair',   icon: '⌖'  },
  { id: 'help',        name: '도움말 선택',          desc: '도움말 정보가 있음을 나타냅니다.',           cursorClass: 'cursor-help',        icon: '❓'  },
  { id: 'progress',    name: '백그라운드에서 작업 중', desc: '처리 중이지만 조작 할 수 있음을 나타냅니다.', cursorClass: 'cursor-progress',   icon: '↻'  },
  { id: 'wait',        name: '대기 상태',            desc: '처리 대기로 조작 할 수 없음을 나타냅니다.',  cursorClass: 'cursor-wait',        icon: '⏳'  },
  { id: 'not-allowed', name: '이용 불가',            desc: '조작할 수 없음을 나타냅니다.',              cursorClass: 'cursor-not-allowed', icon: '🚫'  },
]

const CursorTestBoard = () => {
  return (
    <div className="p-6 bg-slate-900 dark:bg-[#13112c] rounded-xl text-slate-300 border border-transparent dark:border-purple-900/30 transition-colors">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-white mb-1 transition-colors">마우스 커서 테스트</h2>
        <p className="text-slate-400 dark:text-gray-400 text-xs transition-colors">마우스를 각 카드 위에 올려 커서 모양이 어떻게 변하는지 확인해 보세요.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {cursorList.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-xl bg-slate-800 dark:bg-[#1a1740] border border-slate-700/50 dark:border-purple-900/40
                        transition-all duration-300 hover:bg-slate-700 dark:hover:bg-blue-900/20 hover:border-blue-500/30 dark:hover:border-blue-500/50
                        shadow-sm hover:shadow-md
                        ${item.cursorClass}`}
          >
            <div className="text-blue-400 dark:text-blue-300 text-2xl mb-3 font-black transition-colors">
              {item.icon}
            </div>
            <h3 className="text-white dark:text-gray-100 font-bold text-sm mb-1 transition-colors">{item.name}</h3>
            <p className="text-slate-400 dark:text-gray-400 text-xs leading-relaxed break-keep transition-colors">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CursorTestBoard
