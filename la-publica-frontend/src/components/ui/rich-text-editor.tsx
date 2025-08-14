import { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from "react";
import { useEditor, EditorContent, ReactRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Mention from '@tiptap/extension-mention';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { Bold, Italic, List, AtSign, Smile } from "lucide-react";
import { fetchAllUsers } from "@/api/users";
import { MentionList } from "./mention-list";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  key?: string;
}

export interface RichTextEditorRef {
  clear: () => void;
  reset: () => void;
}

interface User {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

const emojis = ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦵', '🦿', '🦶', '👣', '👂', '🦻', '👃', '🫀', '🫁', '🧠', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋', '🩸', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘'];

export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(({ value, onChange, placeholder, className }, ref) => {
  const [users, setUsers] = useState<User[]>([]);

   // Load users once when component mounts
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchAllUsers();
         // La API devuelve { success: true, data: Array }
        const usersList = data.data || data.users || (Array.isArray(data) ? data : []);
        setUsers(usersList);
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };
    loadUsers();
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || 'Escribe aquí...',
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'mention text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:underline',
        },
        renderText({ node }) {
          return `@${node.attrs.label ?? node.attrs.id}`;
        },
        renderHTML({ node }) {
          return [
            'span',
            {
              class: 'mention text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:underline',
              'data-type': 'mention',
              'data-id': node.attrs.id,
              'data-label': node.attrs.label,
            },
            `@${node.attrs.label ?? node.attrs.id}`,
          ];
        },
        deleteTriggerWithBackspace: true,
        suggestion: {
          char: '@',
          allowSpaces: false,
          items: ({ query }) => {
            if (!query) return users.slice(0, 8);
            
            const lowercaseQuery = query.toLowerCase();
            return users.filter(user => 
              user.username?.toLowerCase().includes(lowercaseQuery) ||
              user.email?.toLowerCase().includes(lowercaseQuery) ||
              `${user.firstName} ${user.lastName}`.toLowerCase().includes(lowercaseQuery)
            ).slice(0, 8);
          },

          render: () => {
            let component: any;
            let popup: any;

            return {
              onStart: props => {
                if (!props.clientRect) {
                  return;
                }

                component = new ReactRenderer(MentionList, {
                  props,
                  editor: props.editor,
                });

                // Detectar si estamos dentro de un Dialog
                const isInDialog = document.querySelector('[role="dialog"]') !== null;
                
                popup = tippy('body', {
                  getReferenceClientRect: props.clientRect,
                  appendTo: () => {
                    // Si estamos en un dialog, appendear al dialog en lugar del body
                    if (isInDialog) {
                      const dialog = document.querySelector('[role="dialog"]');
                      return dialog || document.body;
                    }
                    return document.body;
                  },
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: 'manual',
                  placement: 'bottom-start',
                  theme: 'light',
                  arrow: false,
                  animation: false,
                  duration: 0,
                  zIndex: isInDialog ? 9999 : 1000, // z-index más bajo dentro del dialog
                  hideOnClick: false,
                  allowHTML: true,
                  maxWidth: 'none',
                  popperOptions: {
                    strategy: 'absolute', // Usar absolute en lugar de fixed dentro del dialog
                    modifiers: [
                      {
                        name: 'preventOverflow',
                        options: {
                          boundary: isInDialog ? 'clippingParents' : 'viewport',
                          padding: 8,
                        },
                      },
                      {
                        name: 'flip',
                        options: {
                          fallbackPlacements: ['top-start', 'bottom-end', 'top-end'],
                        },
                      },
                    ],
                  },
                });
              },

              onUpdate(props) {
                component.updateProps(props);

                if (!props.clientRect) {
                  return;
                }

                popup[0].setProps({
                  getReferenceClientRect: props.clientRect,
                });
              },

              onKeyDown(props) {
                if (props.event.key === 'Escape') {
                  popup[0].hide();
                  return true;
                }

                return component.ref?.onKeyDown(props);
              },

              onExit() {
                if (popup[0] && !popup[0].state.isDestroyed) {
                  popup[0].destroy();
                }
                component.destroy();
              },
            };
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
        class: 'focus:outline-none min-h-[100px] p-4 prose prose-sm max-w-none text-gray-900 dark:text-gray-100 [&_.ProseMirror-placeholder]:text-gray-400 [&_.ProseMirror-placeholder]:dark:text-gray-500 [&_p]:m-0 [&_p]:mb-4 [&_p:last-child]:mb-0',
      },
    },
  }, [users]);

  // Actualizar el contenido del editor cuando cambie el value prop
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  // Exponer funciones del editor al componente padre
  useImperativeHandle(ref, () => ({
    clear: () => {
      if (editor) {
        editor.commands.clearContent();
        onChange('');
      }
    },
    reset: () => {
      if (editor) {
        editor.commands.clearContent();
        editor.commands.focus();
        onChange('');
      }
    }
  }), [editor, onChange]);

  const insertEmoji = useCallback((emoji: string) => {
    if (editor) {
      editor.chain().focus().insertContent(emoji).run();
    }
  }, [editor]);

  if (!editor) {
    return <div className="p-4 text-gray-500">Cargando editor...</div>;
  }

  return (
    <div className={cn("w-full border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800", className)}>
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700">
        <Button
          type="button"
          variant={editor.isActive('bold') ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Negrita"
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('italic') ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Cursiva"
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('bulletList') ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Lista"
          className="h-8 w-8 p-0"
        >
          <List className="h-4 w-4" />
        </Button>
        
        <div className="ml-auto flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().insertContent('@').run()}
            title="Mencionar usuario"
            className="h-8 w-8 p-0"
          >
            <AtSign className="h-4 w-4" />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                title="Emojis"
                className="h-8 w-8 p-0"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-2" align="end">
              <div className="grid grid-cols-8 gap-1 max-h-60 overflow-y-auto">
                {emojis.map((emoji, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => insertEmoji(emoji)}
                    className="p-1 text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="min-h-[100px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
});

RichTextEditor.displayName = 'RichTextEditor';