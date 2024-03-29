import { DefaultBlockProps } from '@/typings/editor.type';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Text } from '@tiptap/extension-text';
import { Heading } from '@tiptap/extension-heading';
import { History } from '@tiptap/extension-history';
import { Bold } from '@tiptap/extension-bold';
import { Italic } from '@tiptap/extension-italic';
import { Strike } from '@tiptap/extension-strike';
import { Code } from '@tiptap/extension-code';
import { updateFocus } from '@/features/editorSlice';
import { css } from '@emotion/react';
import { useEffect } from 'react';
import { shouldShowPlaceholder } from '@/utils/shouldShowPlaceholder';

type HeadingBlockProps = DefaultBlockProps & {
  level?: 1 | 2 | 3;
};

export const HeadingBlock = (props: HeadingBlockProps) => {
  const editorState = useSelector((state: RootState) => state.editor);
  const dispatch = useDispatch();

  const editor = useEditor({
    extensions: [
      Document.extend({
        content: 'heading',
      }),
      Text,
      Heading.configure({
        levels: [1, 2, 3],
      }),
      Bold,
      Italic,
      Strike,
      Code.configure({
        HTMLAttributes: {
          spellcheck: false,
        },
      }),
      History,
    ],
    onFocus: () => dispatch(updateFocus(props.node.uuid)),
    content: props.node.data,
  });

  useEffect(() => {
    editor?.commands.setHeading({ level: props.level ?? 1 });
  }, [editor, props.level]);

  useEffect(() => {
    const isFocused = props.node.uuid === editorState.focusedNode;
    if (isFocused)
      editor?.commands.focus(editorState.cursorIndex);
  }, [editorState, editor]);

  return (
    <div css={css`
      ${headingBlockCss};
      ${shouldShowPlaceholder(true, editor?.isFocused, editor?.getText().length === 0)
              ? placeholderCss(editor?.getAttributes('heading').level ?? 1)
              : undefined};
    `}>
      <EditorContent editor={editor}
                     onKeyDown={(e) => props.onBeforeInput && props.onBeforeInput(e, editor)}
                     onKeyUp={(e) => props.onAfterInput && props.onAfterInput(e, editor)}/>
    </div>
  );
};


const h1Css = css`
  font-size: 2rem;
  font-weight: 800;
`;
const h2Css = css`
  font-size: 1.75rem;
  font-weight: 700;
`;
const h3Css = css`
  font-size: 1.5rem;
  font-weight: 600;
`;

const headingBlockCss = css`;
  position: relative;
  margin: 1rem 0 0.5rem;

  h1 {
    ${h1Css};
  }

  h2 {
    ${h2Css};
  }

  h3 {
    ${h3Css};
  }

  code {
    font-family: Consolas, monospace;
    color: #f30290;

    background: rgba(135, 131, 120, 0.15);
    border-radius: 3px;
    padding: 0.2rem 0.4rem;
  }
`;

const placeholderCss = (level: number) => css`
  [contenteditable]:before {
    content: 'Titre ${level}';
    color: rgba(38, 37, 34, 0.4);

    ${level === 1 ? h1Css : undefined};
    ${level === 2 ? h2Css : undefined};
    ${level === 3 ? h3Css : undefined};

    position: absolute;
    height: 0;
    pointer-events: none;
  }
`;
