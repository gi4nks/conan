import { create } from 'zustand';

export type Block = {
  id?: number;
  tempId: string;
  type: string;
  content: string;
  order_index: number;
};

interface EditorState {
  // Page Meta
  id: number | null;
  title: string;
  category: string;
  deadline: string;
  tags: string;
  
  // Blocks
  blocks: Block[];
  isSaving: boolean;
  focusedBlockId: string | null;

  // Actions
  initialize: (page: any, blocks: Block[]) => void;
  setTitle: (title: string) => void;
  setCategory: (category: string) => void;
  setDeadline: (deadline: string) => void;
  setTags: (tags: string) => void;
  setBlocks: (blocks: Block[]) => void;
  updateBlock: (tempId: string, content: string) => void;
  addBlock: (type: string, index: number) => void;
  deleteBlock: (tempId: string) => void;
  setIsSaving: (isSaving: boolean) => void;
  setFocusedBlockId: (id: string | null) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useEditorStore = create<EditorState>((set) => ({
  id: null,
  title: '',
  category: 'inbox',
  deadline: '',
  tags: '',
  blocks: [],
  isSaving: false,
  focusedBlockId: null,

  initialize: (page, blocks) => set({
    id: page.id,
    title: page.title,
    category: page.category || 'inbox',
    deadline: page.deadline || '',
    tags: page.tags || '',
    blocks: blocks.map(b => ({ ...b, tempId: b.tempId || generateId() })),
  }),

  setTitle: (title) => set({ title }),
  setCategory: (category) => set({ category }),
  setDeadline: (deadline) => set({ deadline }),
  setTags: (tags) => set({ tags }),
  setIsSaving: (isSaving) => set({ isSaving }),
  setFocusedBlockId: (focusedBlockId) => set({ focusedBlockId }),

  setBlocks: (blocks) => set({ blocks }),

  updateBlock: (tempId, content) => set((state) => ({
    blocks: state.blocks.map(b => b.tempId === tempId ? { ...b, content } : b)
  })),

  addBlock: (type, index) => set((state) => {
    const newId = generateId();
    let content = '';
    if (type === 'code') content = JSON.stringify({ language: 'javascript', code: '' });
    
    const newBlock = { tempId: newId, type, content, order_index: index + 1 };
    const newBlocks = [...state.blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    
    return {
      blocks: newBlocks,
      focusedBlockId: newId
    };
  }),

  deleteBlock: (tempId) => set((state) => ({
    blocks: state.blocks.filter(b => b.tempId !== tempId)
  })),
}));
