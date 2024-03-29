import { KeyboardEvent } from 'react';
import { Editor } from '@tiptap/react';
import { PageNode } from '@/typings/page.type';

export type Node = PageNode & {
  settingsOpen: boolean;
};

export type NodeType =
  | 'text' // default
  | 'header-1'
  | 'header-2'
  | 'header-3'
  | 'image'
  | 'table' // views -> kanban, to-do
  | 'bulleted-list'
  | 'numbered-list'
  | 'column';

export type DefaultBlockProps = {
  node: Node;
  onBeforeInput?: (event: KeyboardEvent<HTMLDivElement>, editor: Editor | null) => void;
  onAfterInput?: (event: KeyboardEvent<HTMLDivElement>, editor: Editor | null) => void;
  showPlaceholder?: boolean;
};

export type Command = {
  type: 'base' | 'media';
  title: string;
  info: string;
  img?: string;
  blockName: NodeType;
};
