"use client";
import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, Typography, IconButton, Button, useTheme 
} from '@mui/material';
import { 
  Close as CloseIcon, Edit as EditIcon 
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import RichTextEditor from './RichTextEditor';
import ImageLightbox from '../common/ImageLightbox';

function getMsgDate(msg) {
  if (!msg) return null;
  const val = msg.createdAt || msg.created_at || msg.timestamp || msg.date;
  if (val) {
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d;
  }
  if (typeof msg.id === 'number' && msg.id > 1600000000000) {
    const d = new Date(msg.id);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

function formatCommentTime(msg) {
  if (!msg) return 'Today, 03:23 PM';
  const isEdited = msg.isEdited;
  const editStr = isEdited ? ' edited' : '';
  const date = getMsgDate(msg);

  if (!date) {
    const fallbackTime = msg.time || '03:23 PM';
    return `Today, ${fallbackTime}${editStr}`;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffTime = today.getTime() - targetDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  let dayLabel = '';
  if (diffDays <= 0) {
    dayLabel = 'Today';
  } else if (diffDays === 1) {
    dayLabel = 'Yesterday';
  } else if (diffDays > 1 && diffDays <= 7) {
    dayLabel = `${diffDays} days ago`;
  } else {
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    dayLabel = `${day} ${month} ${year}`;
  }

  return `${dayLabel}, ${timeStr}${editStr}`;
}

export default function ChatBox({ activeTaskId, comments = [], setComments = () => {} }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const chatEndRef = useRef(null);

  const currentUsername = typeof window !== 'undefined' ? (localStorage.getItem('username') || '') : '';
  const currentUserId = typeof window !== 'undefined' ? (localStorage.getItem('user_id') || '') : '';

  // Local state mapped to parent comments state
  const messages = comments;
  const setMessages = setComments;

  const [inputText, setInputText] = useState('');
  const [lightboxImage, setLightboxImage] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Edit message states
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const getCommentAuthor = (msg) => {
    const author = msg.create_user || msg.created_by || msg.sender;
    if (!author || author === 'You') {
      return currentUsername || 'Dhinesh Paramasivam';
    }
    return author;
  };

  const isMyMessage = (msg) => {
    if (!msg) return false;
    const author = msg.create_user || msg.created_by || (msg.sender !== 'You' ? msg.sender : null);
    
    // Strict comparison by username
    if (author && currentUsername) {
      return author.toLowerCase().trim() === currentUsername.toLowerCase().trim();
    }

    // Comparison by user_id
    if (msg.senderId && currentUserId) {
      return msg.senderId === currentUserId;
    }

    // Fallback for legacy local messages
    if ((msg.sender === 'You' || msg.isMe) && !author) {
      return true;
    }

    return false;
  };

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
      if (!activeTaskId) return;
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || '/api';
        const res = await fetch(`${apiBase}/tasks/${activeTaskId}`);
        if (res.ok) {
          const task = await res.json();
          if (task.comments && Array.isArray(task.comments)) {
            setMessages(task.comments);
          }
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

    const authorName = currentUsername || 'Dhinesh Paramasivam';

    const newMsg = {
      id: Date.now(),
      sender: authorName,
      create_user: authorName,
      created_by: authorName,
      senderId: currentUserId || '',
      text: inputText,
      createdAt: now.toISOString(),
      created_at: now.toISOString(),
      time: timeString,
      isMe: true,
      isEdited: false
    };

    const updatedMessages = [...messages, newMsg];
    
    setMessages(updatedMessages);
    setInputText('');
    setIsExpanded(false);

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

  const handleUpdateMessage = async (msgId) => {
    const targetMsg = messages.find(m => m.id === msgId);
    if (!targetMsg || !isMyMessage(targetMsg)) {
      toast.error('You can only edit your own comments!');
      setEditingMessageId(null);
      setEditingText('');
      return;
    }

    const plainText = editingText.replace(/<[^>]*>/g, '').trim();
    const hasImage = editingText.includes('<img');

    if (!plainText && !hasImage) {
      toast.error('Message content cannot be empty');
      return;
    }

    const updatedMessages = messages.map((m) => {
      if (m.id === msgId) {
        return {
          ...m,
          text: editingText,
          isEdited: true,
          editedAt: new Date().toISOString()
        };
      }
      return m;
    });

    setMessages(updatedMessages);
    setEditingMessageId(null);
    setEditingText('');

    if (activeTaskId) {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || '/api';
        await fetch(`${apiBase}/tasks/${activeTaskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ comments: updatedMessages })
        });
        toast.success('Comment updated!');
      } catch (err) {
        console.error('Error updating comment:', err);
        toast.error('Failed to update comment');
      }
    } else {
      toast.success('Comment updated!');
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
              justifyContent: isMyMessage(msg) ? 'flex-end' : 'flex-start'
            }}
          >
            {/* Column wrapper with max 90% width and fit-content sizing based on text length */}
            <Box sx={{ 
              maxWidth: '90%', 
              width: 'fit-content', 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: isMyMessage(msg) ? 'flex-end' : 'flex-start'
            }}>
              {/* Message Bubble */}
              <Box sx={{
                width: 'fit-content',
                maxWidth: '100%',
                p: '5px 10px',
                pr: isMyMessage(msg) ? '32px' : '10px',
                borderRadius: '10px',
                bgcolor: isDark
                  ? (isMyMessage(msg) ? '#005c4b' : '#202c33')
                  : (isMyMessage(msg) ? '#d9fdd3' : '#ffffff'),
                color: isDark ? '#e9edef' : '#111b21',
                boxShadow: isDark ? '0 2px 6px rgba(0,0,0,0.35)' : '0 2px 6px rgba(0,0,0,0.06)',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                position: 'relative'
              }}>
                {/* Edit Icon (Shown strictly ONLY for author's messages) */}
                {isMyMessage(msg) && editingMessageId !== msg.id && (
                  <IconButton
                    size="small"
                    onClick={() => {
                      setEditingMessageId(msg.id);
                      setEditingText(msg.text);
                    }}
                    sx={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                      opacity: 0.6,
                      color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                      '&:hover': {
                        opacity: 1,
                        bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'
                      },
                      transition: 'opacity 0.15s, background-color 0.15s'
                    }}
                  >
                    <EditIcon sx={{ fontSize: '0.9rem' }} />
                  </IconButton>
                )}

                {/* Editing Mode vs Normal Display */}
                {editingMessageId === msg.id ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 0.5 }}>
                    <RichTextEditor
                      value={editingText}
                      onChange={setEditingText}
                      minHeight="70px"
                      maxHeight="150px"
                    />
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 0.5 }}>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => handleUpdateMessage(msg.id)}
                      >
                        Save
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          setEditingMessageId(null);
                          setEditingText('');
                        }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  msg.text && (
                    <Box 
                      className="chat-message-content"
                      onClick={handleMessageClick}
                      dangerouslySetInnerHTML={{ __html: msg.text }}
                      sx={{ 
                        fontSize: '0.86rem', 
                        wordBreak: 'break-word', 
                        lineHeight: 1.55,
                        '& strong': { fontWeight: 700 },
                        '& em': { fontStyle: 'italic' },
                        '& u': { textDecoration: 'underline' }
                      }}
                    />
                  )
                )}
              </Box>

              {/* Bottom-Right Info Line outside div: white font in dark mode, dark font in light mode */}
              <Box sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                mt: 0.5,
                pr: 0.5
              }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontSize: '0.72rem',
                    fontStyle: 'italic',
                    fontWeight: 500,
                    color: isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.85)',
                    textShadow: isDark ? '0 1px 2px rgba(0,0,0,0.6)' : 'none'
                  }}
                >
                  {getCommentAuthor(msg)}, {formatCommentTime(msg)}
                </Typography>
              </Box>
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

      <ImageLightbox src={lightboxImage} onClose={() => setLightboxImage(null)} />
    </Box>
  );
}
