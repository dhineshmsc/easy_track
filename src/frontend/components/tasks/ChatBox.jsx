"use client";
import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, Typography, IconButton, Button, useTheme 
} from '@mui/material';
import { 
  Close as CloseIcon 
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import RichTextEditor from './RichTextEditor';

export default function ChatBox({ activeTaskId, comments = [], setComments = () => {} }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const chatEndRef = useRef(null);

  // Local state mapped to parent comments state
  const messages = comments;
  const setMessages = setComments;

  const [inputText, setInputText] = useState('');
  const [lightboxImage, setLightboxImage] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch comments when activeTaskId changes
  useEffect(() => {
    const fetchComments = async () => {
      if (!activeTaskId) {
        setMessages([]);
        return;
      }
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || '/api';
        const res = await fetch(`${apiBase}/tasks/${activeTaskId}`);
        if (res.ok) {
          const task = await res.json();
          setMessages(task.comments || []);
        }
      } catch (err) {
        console.error('Error fetching comments:', err);
      }
    };
    fetchComments();
  }, [activeTaskId]);

  const handleSend = async () => {
    const plainText = inputText.replace(/<[^>]*>/g, '').trim();
    const hasImage = inputText.includes('<img');
    
    if (!plainText && !hasImage) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg = {
      id: Date.now(),
      sender: 'You',
      text: inputText,
      time: timeString,
      isMe: true
    };

    const updatedMessages = [...messages, newMsg];
    
    // Optimistically update local view
    setMessages(updatedMessages);
    setInputText('');
    setIsExpanded(false);

    // Save task comments update in database
    if (activeTaskId) {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || '/api';
        await fetch(`${apiBase}/tasks/${activeTaskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ comments: updatedMessages })
        });
        toast.success('Comment added!');
      } catch (err) {
        console.error('Error saving comment:', err);
        toast.error('Failed to save comment to database');
      }
    } else {
      toast.success('Comment added!');
    }
  };

  const handleMessageClick = (e) => {
    if (e.target && e.target.tagName === 'IMG') {
      const src = e.target.getAttribute('src');
      if (src) {
        setLightboxImage(src);
      }
    }
  };

  const isSendDisabled = !inputText.replace(/<[^>]*>/g, '').trim() && !inputText.includes('<img');

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '420px',
      border: '1px solid',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
      borderRadius: '12px',
      bgcolor: isDark ? '#0c0c0e' : '#f5f5f7',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <style>{`
        .chat-message-content p {
          margin: 4px 0;
        }
        .chat-message-content img {
          width: 50px;
          height: 50px;
          object-fit: cover;
          border-radius: 4px;
          margin: 6px 4px 2px 0;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: inline-block;
          vertical-align: middle;
          transition: opacity 0.15s;
        }
        .chat-message-content img:hover {
          opacity: 0.8;
        }
      `}</style>

      {/* Message Area */}
      <Box sx={{
        flexGrow: 1,
        p: 2,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        '&::-webkit-scrollbar': { width: '6px' },
        '&::-webkit-scrollbar-thumb': { 
          bgcolor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)', 
          borderRadius: '3px' 
        }
      }}>
        {messages.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%', 
            opacity: 0.5,
            textAlign: 'center',
            p: 3
          }}>
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
              No activity logs yet. Type a message below to start!
            </Typography>
          </Box>
        ) : (
          messages.map((msg) => (
          <Box
            key={msg.id}
            sx={{
              display: 'flex',
              width: '100%',
              justifyContent: msg.isMe ? 'flex-end' : 'flex-start'
            }}
          >
            {/* Each bubble occupies exactly 90% width */}
            <Box sx={{
              width: '90%',
              p: 1.5,
              borderRadius: '8px',
              bgcolor: isDark
                ? (msg.isMe ? '#005c4b' : '#202c33')
                : (msg.isMe ? '#d9fdd3' : '#ffffff'),
              color: isDark ? '#e9edef' : '#111b21',
              boxShadow: isDark ? '0 1px 2px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.08)',
              border: '1px solid',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
              position: 'relative'
            }}>
              {/* Sender Name and Date/Time Details inline */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, borderBottom: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', pb: 0.5 }}>
                <Typography variant="caption" sx={{ 
                  color: msg.isMe ? '#10b981' : (msg.senderColor || '#38bdf8'), 
                  fontWeight: 700 
                }}>
                  {msg.isMe ? 'You' : msg.sender}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                  . {msg.time}
                </Typography>
              </Box>

              {/* Message HTML Body (Embedded img tags show as 50px*50px thumbnails) */}
              {msg.text && (
                <Box 
                  className="chat-message-content"
                  onClick={handleMessageClick}
                  dangerouslySetInnerHTML={{ __html: msg.text }}
                  sx={{ 
                    fontSize: '0.85rem', 
                    wordBreak: 'break-word', 
                    lineHeight: 1.5,
                    '& strong': { fontWeight: 700 },
                    '& em': { fontStyle: 'italic' },
                    '& u': { textDecoration: 'underline' }
                  }}
                />
              )}
            </Box>
          </Box>
        )))}
        <div ref={chatEndRef} />
      </Box>

      {/* Message Compose and Send area */}
      <Box sx={{
        p: 1.5,
        bgcolor: isDark ? '#1c1c1e' : 'background.paper',
        borderTop: '1px solid',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'
      }}>
        {!isExpanded ? (
          <Box 
            onClick={() => setIsExpanded(true)}
            sx={{
              p: '10px 16px',
              bgcolor: isDark ? '#202c33' : '#ffffff',
              border: '1px solid',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)',
              borderRadius: '8px',
              cursor: 'pointer',
              color: 'text.secondary',
              fontSize: '0.85rem',
              '&:hover': {
                borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'
              },
              transition: 'border-color 0.15s'
            }}
          >
            Add a comment...
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%' }}>
            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
              <RichTextEditor
                value={inputText}
                onChange={setInputText}
                placeholder="Type a message..."
                minHeight="60px"
                maxHeight="120px"
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-start' }}>
              <Button
                type="button"
                size="small"
                variant="contained"
                color="primary"
                onClick={handleSend}
                disabled={isSendDisabled}
              >
                Send
              </Button>
              <Button
                type="button"
                size="small"
                variant="outlined"
                onClick={() => {
                  setInputText('');
                  setIsExpanded(false);
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        )}
      </Box>

      {/* Premium Lightbox Modal for Full-Size Image Preview */}
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
            onClick={(e) => e.stopPropagation()}
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
    </Box>
  );
}
