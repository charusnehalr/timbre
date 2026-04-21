'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';

interface EditorProps {
  content: string;
  onChange: (val: string) => void;
  streaming?: boolean;
}

export function StreamingCaret() {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 2, height: '1.1em',
        background: 'var(--accent)',
        marginLeft: 2,
        verticalAlign: 'text-bottom',
        boxShadow: '0 0 8px var(--accent-glow)',
        animation: 'caret-blink 1s steps(1) infinite',
      }}
    />
  );
}

export function Editor({ content, onChange, streaming = false }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Your draft will appear here…' }),
    ],
    content,
    onUpdate({ editor }) {
      onChange(editor.getText());
    },
    editorProps: {
      attributes: {
        style: [
          'outline: none',
          'font-size: 17px',
          'line-height: 1.65',
          'letter-spacing: -0.005em',
          'color: var(--text)',
          'white-space: pre-wrap',
          'word-break: break-word',
          'min-height: 100px',
        ].join('; '),
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getText()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  if (!content && !streaming) {
    return (
      <div
        style={{
          height: '100%', display: 'grid', placeItems: 'center',
          color: 'var(--text-dim)', textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 420 }}>
          <div className="t-label" style={{ marginBottom: 14 }}>canvas</div>
          <h2
            style={{
              fontSize: 32, fontWeight: 500, letterSpacing: '-0.02em',
              lineHeight: 1.2, color: 'var(--text)', marginBottom: 14,
            }}
          >
            Write in your own voice.
          </h2>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-mute)' }}>
            Describe what you need on the left. timbre will draft it the way you'd actually say it — not the way an AI defaults to.
          </p>
        </div>
      </div>
    );
  }

  if (streaming) {
    return (
      <div style={{ maxWidth: 680, whiteSpace: 'pre-wrap' }}>
        {content}
        <StreamingCaret />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680 }}>
      <EditorContent editor={editor} />
    </div>
  );
}
