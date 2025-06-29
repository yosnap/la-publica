import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "quill-mention/dist/quill.mention.css";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { Smile, AtSign } from "lucide-react";
import { fetchAllUsers } from "@/api/users";

// Toolbar options for formatting
const TOOLBAR_OPTIONS = [
  [{ 'header': [1, 2, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  ['blockquote', 'code-block'],
  ['link'],
  ['clean']
];

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder, className }) => {
  // State to show/hide formatting toolbar
  const [showToolbar, setShowToolbar] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [mentionReady, setMentionReady] = useState(false);

  useEffect(() => {
    // Dynamically import quill-mention only on client
    import("quill-mention").then(() => setMentionReady(true));
    // Fetch users for mentions
    fetchAllUsers().then(res => {
      if (res.success && Array.isArray(res.data)) {
        setUsers(res.data);
      }
    });
  }, []);

  // Mention module config
  const mentionModule = {
    mention: {
      allowedChars: /^[A-Za-z0-9_áéíóúÁÉÍÓÚñÑüÜ ]*$/, // Allow names and usernames
      mentionDenotationChars: ["@"],
      source: function (searchTerm: string, renderList: any) {
        if (!searchTerm) {
          renderList(users.map(u => ({
            id: u._id,
            value: u.firstName + " " + u.lastName,
            username: u.username
          })), searchTerm);
        } else {
          const matches = users.filter(u =>
            (u.firstName + " " + u.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.username.toLowerCase().includes(searchTerm.toLowerCase())
          ).map(u => ({
            id: u._id,
            value: u.firstName + " " + u.lastName,
            username: u.username
          }));
          renderList(matches, searchTerm);
        }
      },
      renderItem: function(item: any) {
        return `<div><strong>@${item.username}</strong> <span style='color: #888'>${item.value}</span></div>`;
      }
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-2">
        <Button
          type="button"
          variant={showToolbar ? "default" : "outline"}
          size="icon"
          onClick={() => setShowToolbar(v => !v)}
          title={showToolbar ? "Ocultar formato" : "Mostrar formato"}
        >
          <span className="font-bold text-base">Aa</span>
        </Button>
        <div className="flex gap-2">
          {/* Mention button is now enabled visually */}
          <Button type="button" variant="ghost" size="icon" disabled title="Mencionar usuario">
            <AtSign className="h-5 w-5" />
          </Button>
          <Button type="button" variant="ghost" size="icon" disabled title="Agregar emoji">
            <Smile className="h-5 w-5" />
          </Button>
        </div>
      </div>
      {/* Render ReactQuill always, mention only works when ready */}
      <ReactQuill
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={{
          toolbar: showToolbar ? TOOLBAR_OPTIONS : false,
          ...(mentionReady && users.length > 0 ? mentionModule : {})
        }}
        className="bg-white rounded-lg border border-gray-200 min-h-[100px]"
        theme="snow"
      />
    </div>
  );
}; 