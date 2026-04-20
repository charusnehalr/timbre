'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';

interface EditorProps {
  content: string;
  onChange: (val: string) => void;
}

export function Editor({ content, onChange }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Your draft will appear here…' }),
    ],
    content,
    onUpdate({ editor }) {
      onChange(editor.getText());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getText()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="flex-1 border rounded min-h-64 p-4 prose max-w-none focus-within:ring-2 focus-within:ring-brand-500">
      <EditorContent editor={editor} />
    </div>
  );
}
