"use client";
import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Image from '@tiptap/extension-image';

// ── MUI ───────────────────────────────────────────────────────────────────────
import {
  Box, IconButton, Tooltip, Menu, MenuItem, Divider, Typography, useTheme
} from '@mui/material';
import {
  FormatBold, FormatItalic, FormatUnderlined, FormatListBulleted,
  FormatListNumbered, FormatQuote, Code as CodeIcon, Undo, Redo,
  TextFields, FormatColorText
} from '@mui/icons-material';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';

// ── Mock Users for Mentions (Preserved from Lexical version) ─────────────────
export const MOCK_USERS = [
  { id: '1', name: 'Dhinesh', email: 'dhinesh@example.com' },
  { id: '2', name: 'Arun', email: 'arun@example.com' },
  { id: '3', name: 'Priya', email: 'priya@example.com' },
  { id: '4', name: 'Sarah Miller', email: 'sarah@example.com' },
  { id: '5', name: 'Alex Mercer', email: 'alex@example.com' },
  { id: '6', name: 'Jane Doe', email: 'jane@example.com' },
];

// ─────────────────────────────────────────────────────────────────────────────
// TOOLBAR COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function Toolbar({ editor, company, onImageUpload }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [headingAnchor, setHeadingAnchor] = useState(null);
  const [colorAnchor, setColorAnchor] = useState(null);
  const [imageAnchor, setImageAnchor] = useState(null);

  if (!editor) return null;

  const setHeading = (tag) => {
    if (tag === 'paragraph') {
      editor.chain().focus().setParagraph().run();
    } else if (tag === 'h1') {
      editor.chain().focus().toggleHeading({ level: 1 }).run();
    } else if (tag === 'h2') {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
    } else if (tag === 'h3') {
      editor.chain().focus().toggleHeading({ level: 3 }).run();
    } else if (tag === 'h4') {
      editor.chain().focus().toggleHeading({ level: 4 }).run();
    }
    setHeadingAnchor(null);
  };

  const handleInsertImageUrl = () => {
    setImageAnchor(null);
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
      if (onImageUpload) {
        onImageUpload(url);
      }
    }
  };

  const handleUploadImageClick = () => {
    setImageAnchor(null);
    document.getElementById('tiptap-image-upload')?.click();
  };

  const activeBtn = {
    bgcolor: 'rgba(10, 132, 255, 0.2)',
    color: '#0a84ff',
    borderRadius: '6px',
    '&:hover': {
      bgcolor: 'rgba(10, 132, 255, 0.3)',
    }
  };

  const normalBtn = {
    color: isDark ? '#a0a0a5' : '#55555a',
    '&:hover': {
      color: isDark ? '#ffffff' : '#000000',
      bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'
    }
  };

  const colorPalette = [
    { label: 'Red', value: '#ff453a' },
    { label: 'Orange', value: '#ff9f0a' },
    { label: 'Yellow', value: '#ffd60a' },
    { label: 'Green', value: '#30d158' },
    { label: 'Teal', value: '#40c8e0' },
    { label: 'Blue', value: '#0a84ff' },
    { label: 'Indigo', value: '#5e5ce6' },
    { label: 'Purple', value: '#bf5af2' },
    { label: 'Pink', value: '#ff375f' },
    { label: 'White', value: '#ffffff' },
    { label: 'Gray', value: '#8e8e93' },
  ];

  return (
    <Box sx={{
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 0.25,
      px: 1,
      py: 0.75,
      bgcolor: isDark ? '#141418' : '#f5f5f7',
      borderBottom: '1px solid',
      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    }}>
      {/* Hidden file input for image uploads */}
      <input
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        id="tiptap-image-upload"
        onChange={(e) => {
          const files = e.target.files;
          if (files && files.length > 0) {
            Array.from(files).forEach((file) => {
              const formData = new FormData();
              formData.append('file', file);
              formData.append('company', company || 'default');

              fetch('/api/tasks/upload-image', {
                method: 'POST',
                body: formData,
              })
                .then((res) => {
                  if (!res.ok) throw new Error('Upload failed');
                  return res.json();
                })
                .then((data) => {
                  if (data.image_path) {
                    editor.chain().focus().setImage({ src: data.image_path }).run();
                    if (onImageUpload) {
                      onImageUpload(data.image_path);
                    }
                  }
                })
                .catch((err) => {
                  console.error(err);
                  alert(`Failed to upload image ${file.name}.`);
                });
            });
            e.target.value = ''; // Reset file input to allow re-uploading the same file
          }
        }}
      />

      {/* Headings */}
      <Tooltip title="Heading styles">
        <IconButton size="small" onClick={(e) => setHeadingAnchor(e.currentTarget)} sx={normalBtn}>
          <TextFields fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={headingAnchor} open={Boolean(headingAnchor)} onClose={() => setHeadingAnchor(null)}>
        {[['h1', 'Heading 1'], ['h2', 'Heading 2'], ['h3', 'Heading 3'], ['h4', 'Heading 4'], ['paragraph', 'Paragraph']].map(([tag, label]) => {
          const isActive = tag === 'paragraph' ? editor.isActive('paragraph') : editor.isActive('heading', { level: parseInt(tag.substring(1)) });
          return (
            <MenuItem
              key={tag}
              onClick={() => setHeading(tag)}
              sx={{
                fontSize: '0.875rem',
                bgcolor: isActive ? 'rgba(10, 132, 255, 0.15)' : 'transparent',
                color: isActive ? '#0a84ff' : (isDark ? '#f0f0f5' : 'text.primary'),
                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }
              }}
            >
              {label}
            </MenuItem>
          );
        })}
      </Menu>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />

      {/* Bold / Italic / Underline / Code */}
      <Tooltip title="Bold (Ctrl+B)">
        <IconButton
          size="small"
          sx={editor.isActive('bold') ? activeBtn : normalBtn}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <FormatBold fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Italic (Ctrl+I)">
        <IconButton
          size="small"
          sx={editor.isActive('italic') ? activeBtn : normalBtn}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <FormatItalic fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Underline (Ctrl+U)">
        <IconButton
          size="small"
          sx={editor.isActive('underline') ? activeBtn : normalBtn}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <FormatUnderlined fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Inline Code">
        <IconButton
          size="small"
          sx={editor.isActive('code') ? activeBtn : normalBtn}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <CodeIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />

      {/* Color Picker */}
      <Tooltip title="Text Color">
        <IconButton size="small" onClick={(e) => setColorAnchor(e.currentTarget)} sx={normalBtn}>
          <FormatColorText fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={colorAnchor} open={Boolean(colorAnchor)} onClose={() => setColorAnchor(null)}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, p: 1.5, bgcolor: isDark ? '#1c1c1e' : 'background.paper' }}>
          {colorPalette.map((c) => (
            <Tooltip key={c.value} title={c.label}>
              <Box
                onClick={() => {
                  editor.chain().focus().setColor(c.value).run();
                  setColorAnchor(null);
                }}
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: c.value,
                  cursor: 'pointer',
                  border: editor.isActive('textStyle', { color: c.value }) 
                    ? (isDark ? '2px solid #fff' : '2px solid #000') 
                    : (isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.15)'),
                  boxShadow: editor.isActive('textStyle', { color: c.value }) 
                    ? (isDark ? '0 0 4px rgba(255,255,255,0.6)' : '0 0 4px rgba(0,0,0,0.15)') 
                    : 'none',
                  '&:hover': {
                    transform: 'scale(1.15)',
                  },
                  transition: 'transform 0.15s, border 0.15s',
                }}
              />
            </Tooltip>
          ))}
          <Tooltip title="Reset Color">
            <IconButton
              size="small"
              onClick={() => {
                editor.chain().focus().unsetColor().run();
                setColorAnchor(null);
              }}
              sx={{
                width: 24,
                height: 24,
                bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                color: isDark ? '#fff' : 'text.primary',
                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }
              }}
            >
              <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 'bold' }}>✕</Typography>
            </IconButton>
          </Tooltip>
        </Box>
      </Menu>

      {/* Image Insert Button */}
      <Tooltip title="Insert Image">
        <IconButton size="small" onClick={(e) => setImageAnchor(e.currentTarget)} sx={normalBtn}>
          <ImageIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={imageAnchor} open={Boolean(imageAnchor)} onClose={() => setImageAnchor(null)}>
        <MenuItem onClick={handleUploadImageClick} sx={{ fontSize: '0.875rem' }}>
          Upload Local File
        </MenuItem>
        <MenuItem onClick={handleInsertImageUrl} sx={{ fontSize: '0.875rem' }}>
          Insert Image URL
        </MenuItem>
      </Menu>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />

      {/* Lists */}
      <Tooltip title="Bullet List">
        <IconButton
          size="small"
          sx={editor.isActive('bulletList') ? activeBtn : normalBtn}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <FormatListBulleted fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Numbered List">
        <IconButton
          size="small"
          sx={editor.isActive('orderedList') ? activeBtn : normalBtn}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <FormatListNumbered fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Quote */}
      <Tooltip title="Blockquote">
        <IconButton
          size="small"
          sx={editor.isActive('blockquote') ? activeBtn : normalBtn}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <FormatQuote fontSize="small" />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />

      {/* Undo / Redo */}
      <Tooltip title="Undo (Ctrl+Z)">
        <span>
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            sx={normalBtn}
          >
            <Undo fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Redo (Ctrl+Y)">
        <span>
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            sx={normalBtn}
          >
            <Redo fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN RICH TEXT EDITOR COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const RichTextEditor = ({ value, onChange, placeholder = 'Write task description here... Type @ mention someone', company, onImageUpload }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [lightboxImage, setLightboxImage] = useState(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure(),
      Underline.configure(),
      TextStyle.configure(),
      Color.configure(),
      Image.configure(),
      Placeholder.configure({
        placeholder: placeholder,
      }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'tiptap-root-editor',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (onChange) {
        // If editor is empty or only has empty tags, trigger onChange with empty string
        onChange(editor.isEmpty ? '' : html);
      }
    },
  });

  // Sync value from props only if it differs from the editor's content
  useEffect(() => {
    if (!editor) return;
    const currentHTML = editor.getHTML();
    if (value !== currentHTML) {
      editor.commands.setContent(value || '', false);
    }
  }, [value, editor]);

  const handleEditorClick = (e) => {
    if (e.target && e.target.tagName === 'IMG') {
      const src = e.target.getAttribute('src');
      if (src) {
        setLightboxImage(src);
      }
    }
  };

  return (
    <>
      <style>{`
        .tiptap-root-editor {
          min-height: 190px;
          max-height: 290px;
          overflow-y: auto;
          padding: 14px 16px;
          outline: none;
          font-size: 0.95rem;
          line-height: 1.7;
          color: ${isDark ? '#f0f0f5' : '#1d1d1f'};
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif;
          caret-color: ${isDark ? '#0a84ff' : '#0066cc'};
        }
        .tiptap-root-editor p { margin: 1px 0; }
        .tiptap-root-editor h1 { font-size: 1.9rem; font-weight: 800; margin: 12px 0 6px; color: ${isDark ? '#fff' : '#000'}; }
        .tiptap-root-editor h2 { font-size: 1.5rem; font-weight: 700; margin: 10px 0 4px; color: ${isDark ? '#f0f0f5' : '#1d1d1f'}; }
        .tiptap-root-editor h3 { font-size: 1.25rem; font-weight: 600; margin: 8px 0 4px; color: ${isDark ? '#d0d0d8' : '#33333f'}; }
        .tiptap-root-editor h4 { font-size: 1rem;  font-weight: 600; margin: 6px 0 4px; color: ${isDark ? '#b0b0b8' : '#55555f'}; text-transform: uppercase; letter-spacing: 0.06em; }
        .tiptap-root-editor strong { font-weight: 700; }
        .tiptap-root-editor em { font-style: italic; }
        .tiptap-root-editor u { text-decoration: underline; }
        .tiptap-root-editor code {
          font-family: "JetBrains Mono", "Fira Code", Consolas, monospace;
          font-size: 0.85em;
          background: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'};
          border: 1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
          border-radius: 4px;
          padding: 1px 5px;
          color: #ff6b81;
        }
        .tiptap-root-editor img {
          width: 200px;
          height: 200px;
          object-fit: cover;
          border-radius: 8px;
          margin: 12px 10px 12px 0;
          border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'};
          display: inline-block;
          vertical-align: middle;
          cursor: pointer;
          transition: transform 0.2s, border-color 0.2s;
        }
        .tiptap-root-editor img:hover {
          transform: scale(1.03);
          border-color: ${isDark ? '#0a84ff' : '#0066cc'};
        }
        .tiptap-root-editor blockquote {
          border-left: 4px solid ${isDark ? '#0a84ff' : '#0066cc'};
          margin: 10px 0;
          padding: 6px 14px;
          color: #8e8e93;
          font-style: italic;
          background: ${isDark ? 'rgba(10,132,255,0.06)' : 'rgba(0,102,204,0.04)'};
          border-radius: 0 6px 6px 0;
        }
        .tiptap-root-editor ul { padding-left: 24px; margin: 4px 0; list-style-type: disc; }
        .tiptap-root-editor ol { padding-left: 24px; margin: 4px 0; list-style-type: decimal; }
        .tiptap-root-editor li { margin: 2px 0; }
        .tiptap-root-editor pre {
          display: block;
          background: ${isDark ? 'rgba(0,0,0,0.45)' : 'rgba(240,240,245,0.7)'};
          border: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'};
          border-radius: 8px;
          padding: 12px 16px;
          font-family: "JetBrains Mono", "Fira Code", Consolas, monospace;
          font-size: 0.82rem;
          line-height: 1.6;
          overflow-x: auto;
          color: ${isDark ? '#a8ff78' : '#007f30'};
          margin: 8px 0;
        }
        /* Placeholder styling */
        .tiptap-root-editor p.is-editor-empty:first-child::before {
          color: ${isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'};
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
          font-style: italic;
        }
      `}</style>

      <Box sx={{
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.15)',
        borderRadius: '10px',
        bgcolor: isDark ? '#1a1a20' : '#ffffff',
        overflow: 'hidden',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        '&:focus-within': {
          borderColor: isDark ? '#0a84ff' : '#0066cc',
          boxShadow: isDark ? '0 0 0 2px rgba(10,132,255,0.22)' : '0 0 0 2px rgba(0,102,204,0.15)',
        },
      }}>
        {/* Toolbar */}
        <Toolbar editor={editor} company={company} onImageUpload={onImageUpload} />

        {/* Editor Area */}
        <Box sx={{ position: 'relative' }} onClick={handleEditorClick}>
          <EditorContent editor={editor} />
        </Box>
      </Box>

      {/* Premium Lightbox Modal for Full-Size Image */}
      {lightboxImage && (
        <Box
          onClick={() => setLightboxImage(null)}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            bgcolor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out',
            animation: 'fadeIn 0.2s ease-out',
            '@keyframes fadeIn': {
              from: { opacity: 0 },
              to: { opacity: 1 }
            }
          }}
        >
          {/* Close Button */}
          <IconButton
            onClick={() => setLightboxImage(null)}
            sx={{
              position: 'absolute',
              top: 24,
              right: 24,
              color: '#ffffff',
              bgcolor: 'rgba(255,255,255,0.08)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.2)',
                transform: 'rotate(90deg)'
              },
              transition: 'transform 0.2s, background-color 0.2s',
            }}
          >
            <CloseIcon fontSize="medium" />
          </IconButton>

          {/* Full-size Image */}
          <Box
            component="img"
            src={lightboxImage}
            alt="Full size preview"
            onClick={(e) => e.stopPropagation()} // Prevent close on clicking the image itself
            sx={{
              maxHeight: '90vh',
              maxWidth: '90vw',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 24px 64px rgba(0,0,0,0.85)',
              cursor: 'default',
              animation: 'zoomIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
              '@keyframes zoomIn': {
                from: { transform: 'scale(0.92)', opacity: 0 },
                to: { transform: 'scale(1)', opacity: 1 }
              }
            }}
          />
        </Box>
      )}
    </>
  );
};

export default RichTextEditor;
