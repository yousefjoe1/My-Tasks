import { Block } from "@/types";
import { WeeklyTable } from "./WeeklyTable";

interface BlockRendererProps {
    block: Block;
    onUpdate: (blockId: string, updates: Partial<Block>) => void;
    onDelete: (blockId: string) => void;
}

export function BlockRenderer({ block, onUpdate, onDelete }: BlockRendererProps) {
    const handleUpdate = (updates: Partial<Block>) => {
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
    if (!isValidBlockType(block.type)) {
        console.warn(`Unknown block type: ${block.type}`);
        return null;
    }

    const Component = components[block.type];

    return (
        <Component
            block={block}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
        />
    );
}