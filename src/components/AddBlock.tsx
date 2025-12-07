interface AddBlockProps {
  onAddBlock: (type: 'heading' | 'text' | 'weekly', content?: string) => void;
}

export function AddBlock({ onAddBlock }: AddBlockProps) {

  const blockTypes = [
    { type: 'weekly' as const, label: 'Add Weekly Task', icon: '📅' },
  ];

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <div className="grid grid-cols-1 gap-2">
        {blockTypes.map(({ type, label, icon }) => (
          <button
            key={type}
            onClick={() => {
              onAddBlock(type, type === 'weekly' ? 'New Task' : '');
            }}
            className="p-3 border border-primary w-full rounded-lg hover:bg-secondary transition-colors text-center"
          >
            {icon}
            <div className="text-primary">{label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}