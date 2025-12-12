import { WeeklyBlock } from "@/types";
import { WeeklyTable } from "./WeeklyTable";

interface BlockRendererProps {
    block: WeeklyBlock;
    onUpdate: (blockId: string, updates: Partial<WeeklyBlock>) => void;
    onDelete: (blockId: string) => void;
}

export function BlockRenderer({ block, onUpdate, onDelete }: BlockRendererProps) {
    const handleUpdate = (updates: Partial<WeeklyBlock>) => {
        onUpdate(block.id, updates);
    };

    const handleDelete = () => {
        onDelete(block.id);
    };

    const components = {
        weekly: WeeklyTable,
        // Add todo component if it exists, or remove if not needed
        // todo: TodoBlock,
    } as const;

    // Use type guard to ensure the block type is valid
    const isValidBlockType = (type: string): type is keyof typeof components => {
        return type in components;
    };

    // If block type is not valid, return null or a fallback component
    if (!isValidBlockType('block')) {
        console.warn(`Unknown block type: block`);
        return null;
    }

    const Component = components['weekly'];

    return (
        <Component
            block={block}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
        />
    );
}