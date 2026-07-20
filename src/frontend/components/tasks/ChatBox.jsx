"use client";
import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, Typography, IconButton, InputBase, Paper, 
  Menu, MenuItem, Tooltip, Badge, Button, Chip
} from '@mui/material';
import {
  EmojiEmotions as EmojiIcon,
  AttachFile as AttachFileIcon,
  Send as SendIcon,
  Mic as MicIcon,
  Description as DocIcon,
  Image as ImageIcon,
  Movie as VideoIcon,
  VolumeUp as AudioIcon,
  Cancel as CancelIcon,
  DoneAll as ReadIcon,
  Person as ContactIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';

export default function ChatBox({ activeTaskId }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'Sarah Miller',
      text: 'Hey team, let\'s make sure we test this component on mobile browsers as well.',
      time: '11:15 AM',
      isMe: false,
      senderColor: '#34d399'
    },
    {
      id: 2,
      sender: 'You',
      text: 'Good point Sarah! I\'ve already added tests for viewport responsiveness.',
      time: '11:18 AM',
      isMe: true
    },
    {
      id: 3,
      sender: 'Dhinesh',
      text: 'Awesome. I will review the PR once the CI pipeline passes.',
      time: '11:20 AM',
      isMe: false,
      senderColor: '#38bdf8'
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const chatEndRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, attachedFiles]);

  const handleAttachClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAttachClose = () => {
    setAnchorEl(null);
  };

  const triggerFileSelect = (acceptType) => {
    handleAttachClose();
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    if (acceptType) {
      input.accept = acceptType;
    }
    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      const newAttached = files.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        type: file.type,
        url: URL.createObjectURL(file)
      }));
      setAttachedFiles(prev => [...prev, ...newAttached]);
      toast.success(`${files.length} file(s) ready to send`);
    };
    input.click();
  };

  const handleRemoveAttached = (id) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSend = () => {
    if (!inputText.trim() && attachedFiles.length === 0) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg = {
      id: Date.now(),
      sender: 'You',
      text: inputText,
      time: timeString,
      isMe: true,
      files: attachedFiles
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setAttachedFiles([]);
    toast.success('Message sent!');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <ImageIcon sx={{ color: '#ec4899' }} />;
    if (type.startsWith('video/')) return <VideoIcon sx={{ color: '#8b5cf6' }} />;
    if (type.startsWith('audio/')) return <AudioIcon sx={{ color: '#f59e0b' }} />;
    return <DocIcon sx={{ color: '#3b82f6' }} />;
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '380px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '12px',
      bgcolor: '#0b141a', // WhatsApp dark bg
      overflow: 'hidden',
      position: 'relative',
      backgroundImage: `radial-gradient(rgba(255,255,255,0.03) 1px, transparent 0)`,
      backgroundSize: '24px 24px'
    }}>


      {/* Message Area */}
      <Box sx={{
        flexGrow: 1,
        p: 2,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        '&::-webkit-scrollbar': { width: '6px' },
        '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255, 255, 255, 0.15)', borderRadius: '3px' }
      }}>
        {messages.map((msg) => (
          <Box
            key={msg.id}
            sx={{
              alignSelf: msg.isMe ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{
              p: 1.2,
              borderRadius: msg.isMe ? '12px 0 12px 12px' : '0 12px 12px 12px',
              bgcolor: msg.isMe ? '#005c4b' : '#202c33', // WhatsApp dark green / grey bubbles
              color: '#e9edef',
              boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
              position: 'relative'
            }}>
              {!msg.isMe && (
                <Typography variant="caption" sx={{ 
                  color: msg.senderColor || '#38bdf8', 
                  fontWeight: 700, 
                  display: 'block', 
                  mb: 0.5 
                }}>
                  {msg.sender}
                </Typography>
              )}

              {/* Render Attached Files inside Chat Bubble */}
              {msg.files && msg.files.map((file) => (
                <Paper
                  key={file.id}
                  elevation={0}
                  sx={{
                    p: 1,
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    bgcolor: 'rgba(0,0,0,0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '6px'
                  }}
                >
                  {getFileIcon(file.type)}
                  <Box sx={{ overflow: 'hidden' }}>
                    <Typography variant="caption" noWrap sx={{ display: 'block', fontWeight: 600, color: '#e9edef', maxWidth: '150px' }}>
                      {file.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#8696a0', fontSize: '0.7rem' }}>
                      {file.size}
                    </Typography>
                  </Box>
                </Paper>
              ))}

              {msg.text && (
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.875rem' }}>
                  {msg.text}
                </Typography>
              )}

              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 0.5,
                mt: 0.5,
                float: 'right'
              }}>
                <Typography variant="caption" sx={{ color: '#8696a0', fontSize: '0.65rem' }}>
                  {msg.time}
                </Typography>
                {msg.isMe && <ReadIcon sx={{ color: '#53bdeb', fontSize: 14 }} />}
              </Box>
            </Box>
          </Box>
        ))}
        <div ref={chatEndRef} />
      </Box>

      {/* Pre-send File Attachment Queue */}
      {attachedFiles.length > 0 && (
        <Box sx={{
          p: 1,
          bgcolor: '#1f2c34',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          gap: 1.5,
          overflowX: 'auto',
          alignItems: 'center',
          '&::-webkit-scrollbar': { height: '4px' }
        }}>
          {attachedFiles.map((file) => (
            <Box 
              key={file.id} 
              sx={{ 
                p: 0.8, 
                bgcolor: '#2a3942', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                minWidth: '160px',
                position: 'relative'
              }}
            >
              {getFileIcon(file.type)}
              <Box sx={{ overflow: 'hidden' }}>
                <Typography variant="caption" noWrap sx={{ display: 'block', color: '#e9edef', width: '100px' }}>
                  {file.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#8696a0', fontSize: '0.7rem' }}>
                  {file.size}
                </Typography>
              </Box>
              <IconButton 
                size="small" 
                onClick={() => handleRemoveAttached(file.id)}
                sx={{ 
                  position: 'absolute', 
                  top: -6, 
                  right: -6, 
                  bgcolor: '#ff4b4b',
                  color: 'white',
                  '&:hover': { bgcolor: '#e03a3a' },
                  width: 16,
                  height: 16,
                  p: 0
                }}
              >
                <CancelIcon sx={{ fontSize: 12 }} />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}

      {/* WhatsApp Input Bar */}
      <Box sx={{
        p: 1,
        bgcolor: '#202c33',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        {/* Emoji Button */}
        <Tooltip title="Emojis">
          <IconButton sx={{ color: '#8696a0' }}>
            <EmojiIcon />
          </IconButton>
        </Tooltip>

        {/* Paperclip Attachment Button */}
        <Tooltip title="Attach">
          <IconButton 
            onClick={handleAttachClick} 
            sx={{ color: '#8696a0', transform: 'rotate(45deg)' }}
          >
            <AttachFileIcon />
          </IconButton>
        </Tooltip>

        {/* Attachment Context Menu (WhatsApp Theme) */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleAttachClose}
          PaperProps={{
            sx: {
              bgcolor: '#233138',
              color: '#e9edef',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.05)',
              mt: -8
            }
          }}
        >
          <MenuItem onClick={() => triggerFileSelect('.pdf,.doc,.docx,.xls,.xlsx')} sx={{ display: 'flex', gap: 1.5, py: 1 }}>
            <DocIcon sx={{ color: '#7f66ff' }} />
            <Typography variant="body2">Document</Typography>
          </MenuItem>
          <MenuItem onClick={() => triggerFileSelect('image/*')} sx={{ display: 'flex', gap: 1.5, py: 1 }}>
            <ImageIcon sx={{ color: '#ec4899' }} />
            <Typography variant="body2">Photos & Videos</Typography>
          </MenuItem>
          <MenuItem onClick={() => triggerFileSelect('audio/*')} sx={{ display: 'flex', gap: 1.5, py: 1 }}>
            <AudioIcon sx={{ color: '#f59e0b' }} />
            <Typography variant="body2">Audio</Typography>
          </MenuItem>
          <MenuItem onClick={handleAttachClose} sx={{ display: 'flex', gap: 1.5, py: 1 }}>
            <LocationIcon sx={{ color: '#10b981' }} />
            <Typography variant="body2">Location</Typography>
          </MenuItem>
          <MenuItem onClick={handleAttachClose} sx={{ display: 'flex', gap: 1.5, py: 1 }}>
            <ContactIcon sx={{ color: '#06b6d4' }} />
            <Typography variant="body2">Contact</Typography>
          </MenuItem>
        </Menu>

        {/* Message Input base */}
        <InputBase
          fullWidth
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message"
          sx={{
            bgcolor: '#2a3942',
            borderRadius: '8px',
            px: 2,
            py: 0.6,
            color: '#e9edef',
            fontSize: '0.9rem',
            flexGrow: 1
          }}
        />

        {/* Send / Microphone Button */}
        {inputText.trim() || attachedFiles.length > 0 ? (
          <IconButton 
            onClick={handleSend}
            sx={{ 
              bgcolor: '#00a884', 
              color: 'white',
              '&:hover': { bgcolor: '#008f72' },
              width: 38,
              height: 38
            }}
          >
            <SendIcon sx={{ fontSize: 18 }} />
          </IconButton>
        ) : (
          <IconButton sx={{ color: '#8696a0' }}>
            <MicIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}
