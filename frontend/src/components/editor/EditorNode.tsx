import { KeyboardEvent, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { css } from '@emotion/react';
import { addBottomNode, deleteNode, onArrow, updateData } from '@/features/editorSlice';
import { Node } from '@/typings/editor.type';
import { Editor } from '@tiptap/react';
import { DragHandle } from '@components/editor/DragHandle';
import { CommandManager } from '@components/editor/commands/CommandManager';
import { getEditorNodeFromType } from '@/utils/getEditorNodeFromType';
import { useCommandManager } from '@hooks/useCommandManager';

type EditorNodeProps = {
  node: Node;
  isLastNode?: boolean;
  onChange?: () => void;
};

export const EditorNode = (props: EditorNodeProps) => {
  const commandManager = useCommandManager();
  const dispatch = useDispatch();
  const [focused, setFocused] = useState(false);

  const beforeInput = useCallback((e: KeyboardEvent<HTMLDivElement>, editor: Editor | null) => {
    if (e.shiftKey) return;
    if (null === editor) return;
    const selection = window.getSelection();

    if (e.key === 'Enter' && !commandManager.show) {
      e.preventDefault();
      dispatch(addBottomNode(props.node.uuid));
    } else if (['Backspace', 'Delete'].includes(e.key) && editor.isEmpty) {
      e.preventDefault();
      dispatch(deleteNode(props.node.uuid));
    } else if (e.key === 'ArrowUp' && selection?.isCollapsed && !commandManager.show) {
      e.preventDefault();
      dispatch(onArrow({ nodeId: props.node.uuid, orientation: 'up', cursorIndex: selection.anchorOffset }));
    } else if (e.key === 'ArrowDown' && selection?.isCollapsed && !commandManager.show) {
      e.preventDefault();
      dispatch(onArrow({ nodeId: props.node.uuid, orientation: 'down', cursorIndex: selection.anchorOffset }));
    } else if (e.key === 'ArrowLeft' && selection?.isCollapsed && selection?.anchorOffset === 0) {
      dispatch(onArrow({ nodeId: props.node.uuid, orientation: 'up', cursorIndex: 'end' }));
    } else if (e.key === 'ArrowRight' && selection?.isCollapsed && selection?.anchorOffset === editor.getText().length) {
      dispatch(onArrow({ nodeId: props.node.uuid, orientation: 'down', cursorIndex: 'start' }));
    }
  }, [commandManager]);

  const afterInput = useCallback((e: KeyboardEvent<HTMLDivElement>, editor: Editor | null) => {
    if (e.key === '/') commandManager.toggleCommands();

    const textContent = (e.target as HTMLDivElement).textContent;
    if (textContent) commandManager.filterCommands(textContent);

    if (commandManager.commands.length > 0) {
      if (e.key === 'ArrowUp') commandManager.goUpOneCommand();
      if (e.key === 'ArrowDown') commandManager.goDownOneCommand();
      if (e.key === 'Enter') commandManager.chooseCommand(props.node.uuid);
    }

    const htmlData = editor?.getHTML();
    if (htmlData) dispatch(updateData({ nodeId: props.node.uuid, newData: htmlData }));
    if (props.onChange) props.onChange();
  }, [commandManager]);

  return (
    <div data-node-id={props.node.uuid}
         css={nodeContainerCss}
         onFocus={() => setFocused(true)}
         onBlur={() => setFocused(false)}
         onMouseEnter={() => setFocused(true)}
         onMouseLeave={() => setFocused(false)}>
      {/* Node */}
      {getEditorNodeFromType(props.node, props.isLastNode, beforeInput, afterInput)}
      {/* ---- */}
      <DragHandle nodeId={props.node.uuid} show={focused}/>
      {commandManager.show
        ? <CommandManager nodeId={props.node.uuid}
                          commands={commandManager.commands}
                          selected={commandManager.selectedIndex}
                          onCommandClick={(newType) => commandManager.chooseCommand(props.node.uuid, newType)}/>
        : null}
    </div>
  );
};

const nodeContainerCss = css`
  position: relative;
  //background-color: rgba(0 0 0 / 2%);
  //border-bottom: 1px solid #505050;
  //border-radius: .5rem;
  margin: 3px 7px;

  .ProseMirror:focus {
    outline: none;
  }
`;
