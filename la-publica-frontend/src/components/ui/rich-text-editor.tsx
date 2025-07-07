import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Mention from '@tiptap/extension-mention';
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { Smile, AtSign, Bold, Italic, List, Link as LinkIcon } from "lucide-react";
import { fetchAllUsers } from "@/api/users";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder, className }) => {
  const [showToolbar, setShowToolbar] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    fetchAllUsers().then(res => {
      if (res.success && Array.isArray(res.data)) {
        setUsers(res.data);
      }
    });
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Escribe aquí...',
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline',
        },
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'mention bg-blue-100 text-blue-600 px-1 rounded',
        },
        suggestion: {
          items: ({ query }: { query: string }) => {
            return users
              .filter(user => 
                user.username.toLowerCase().includes(query.toLowerCase()) ||
                `${user.firstName} ${user.lastName}`.toLowerCase().includes(query.toLowerCase())
              )
              .slice(0, 5)
              .map(user => ({
                id: user._id,
                label: `@${user.username}`,
                username: user.username,
                name: `${user.firstName} ${user.lastName}`
              }));
          },
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[100px] p-4 prose prose-sm max-w-none [&_strong]:font-bold [&_em]:italic [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:ml-4 [&_ol]:ml-4 [&_a]:text-blue-500 [&_a]:underline',
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  const ToolbarButton = ({ onClick, isActive = false, children, title }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <Button
      type="button"
      variant={isActive ? "default" : "ghost"}
      size="sm"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      className="h-8 w-8 p-0"
    >
      {children}
    </Button>
  );

  // Función para insertar emoji
  const insertEmoji = (emoji: string) => {
    if (editor) {
      editor.chain().focus().insertContent(emoji).run();
    }
    setShowEmojiPicker(false);
  };

  return (
    <div className={cn("w-full border border-gray-200 rounded-lg bg-white", className)}>
      <div className="flex items-center justify-between p-2 border-b border-gray-200">
        <Button
          type="button"
          variant={showToolbar ? "default" : "outline"}
          size="sm"
          onClick={() => setShowToolbar(v => !v)}
          title={showToolbar ? "Ocultar formato" : "Mostrar formato"}
        >
          <span className="font-bold text-sm">Aa</span>
        </Button>
        
        {showToolbar && editor && (
          <div className="flex gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              title="Negrita"
            >
              <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              title="Cursiva"
            >
              <Italic className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
              title="Lista"
            >
              <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => {
                const url = window.prompt('URL:');
                if (url) {
                  editor.chain().focus().setLink({ href: url }).run();
                }
              }}
              isActive={editor.isActive('link')}
              title="Enlace"
            >
              <LinkIcon className="h-4 w-4" />
            </ToolbarButton>
          </div>
        )}
        
        <div className="flex gap-1">
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            title="Mencionar usuario (@)" 
            className="h-8 w-8 p-0"
            onMouseDown={(e) => {
              e.preventDefault();
              if (editor) {
                editor.chain().focus().insertContent('@').run();
              }
            }}
          >
            <AtSign className="h-4 w-4" />
          </Button>
          <Button 
            type="button" 
            variant={showEmojiPicker ? "default" : "ghost"} 
            size="sm" 
            title="Agregar emoji" 
            className="h-8 w-8 p-0"
            onMouseDown={(e) => {
              e.preventDefault();
              setShowEmojiPicker(!showEmojiPicker);
            }}
          >
            <Smile className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="min-h-[100px]">
        <EditorContent editor={editor} />
      </div>

      {/* Emoji picker */}
      {showEmojiPicker && (
        <div className="border-t border-gray-200 p-3">
          <div className="grid grid-cols-8 gap-2">
            {['😀', '😊', '😍', '🥰', '😎', '🤔', '👍', '👎', '❤️', '🔥', '💯', '🎉', '😂', '😢', '😮', '😴', '🤝', '👏', '🙌', '💪', '🎯', '🚀', '⭐', '✨'].map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="text-xl hover:bg-gray-100 p-2 rounded transition-colors"
                onClick={() => insertEmoji(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 