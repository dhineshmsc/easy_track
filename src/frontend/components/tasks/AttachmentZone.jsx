"use client";
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Card, CardContent, IconButton, Button, Grid, Tooltip } from '@mui/material';
import {
  Image as ImageIcon,
  Description as DocIcon,
  Movie as VideoIcon,
  MusicNote as AudioIcon,
  AttachFile as FileIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import { addAttachment, removeAttachment } from '../../redux/taskSlice';
import { toast } from 'react-hot-toast';

const getFileIcon = (type) => {
  const t = type.toLowerCase();
  if (t.startsWith('image/')) return <ImageIcon sx={{ fontSize: 28, color: '#ff9500' }} />;
  if (t.startsWith('video/')) return <VideoIcon sx={{ fontSize: 28, color: '#ff3b30' }} />;
  if (t.startsWith('audio/')) return <AudioIcon sx={{ fontSize: 28, color: '#34c759' }} />;
  if (
    t.includes('pdf') ||
    t.includes('word') ||
    t.includes('excel') ||
    t.includes('powerpoint') ||
    t.includes('text') ||
    t.includes('office')
  ) {
    return <DocIcon sx={{ fontSize: 28, color: '#0a84ff' }} />;
  }
  return <FileIcon sx={{ fontSize: 28, color: '#8e8e93' }} />;
};

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const AttachmentZone = () => {
  const dispatch = useDispatch();
  const attachments = useSelector((state) => state.tasks.currentAttachments);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleFiles = (files) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const newAttachment = {
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        url: URL.createObjectURL(file) // Mock URL for viewing/download
      };
      dispatch(addAttachment(newAttachment));
    }
    toast.success(`Uploaded ${files.length} file(s)`);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleDelete = (id) => {
    dispatch(removeAttachment(id));
    toast.success("Attachment removed");
  };

  // Helper to trigger input file upload by file type
  const triggerUpload = (acceptType) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    if (acceptType) input.accept = acceptType;
    input.onchange = handleFileInput;
    input.click();
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: '600', mb: 1 }}>
        Attachments
      </Typography>

      {/* DRAG AND DROP ZONE */}
      <Box
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'rgba(255, 255, 255, 0.12)',
          borderRadius: '12px',
          p: 3,
          textAlign: 'center',
          bgcolor: isDragActive ? 'rgba(10, 132, 255, 0.05)' : '#1e1e24',
          transition: 'all 0.2s ease-in-out',
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'rgba(255, 255, 255, 0.01)'
          }
        }}
        onClick={() => triggerUpload()}
      >
        <UploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1, opacity: 0.7 }} />
        <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: '500' }}>
          Drag & drop files here, or <span style={{ color: '#0a84ff', textDecoration: 'underline' }}>browse</span>
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
          Support images, docs, videos, audio up to 50MB
        </Typography>
      </Box>

      {/* QUICK ACTION TOOLBAR */}
      <Box sx={{
        display: 'flex',
        gap: 1.5,
        mt: 1.5,
        mb: 2,
        flexWrap: 'wrap',
        bgcolor: '#141418',
        p: 1,
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <Button
          size="small"
          startIcon={<ImageIcon />}
          onClick={(e) => { e.stopPropagation(); triggerUpload('image/*'); }}
          sx={{ color: '#ff9500', '&:hover': { bgcolor: 'rgba(255,149,0,0.1)' } }}
        >
          Image
        </Button>
        <Button
          size="small"
          startIcon={<DocIcon />}
          onClick={(e) => { e.stopPropagation(); triggerUpload('.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt'); }}
          sx={{ color: '#0a84ff', '&:hover': { bgcolor: 'rgba(10,132,255,0.1)' } }}
        >
          Document
        </Button>
        <Button
          size="small"
          startIcon={<VideoIcon />}
          onClick={(e) => { e.stopPropagation(); triggerUpload('video/*'); }}
          sx={{ color: '#ff3b30', '&:hover': { bgcolor: 'rgba(255,59,48,0.1)' } }}
        >
          Video
        </Button>
        <Button
          size="small"
          startIcon={<AudioIcon />}
          onClick={(e) => { e.stopPropagation(); triggerUpload('audio/*'); }}
          sx={{ color: '#34c759', '&:hover': { bgcolor: 'rgba(52,199,89,0.1)' } }}
        >
          Audio
        </Button>
        <Button
          size="small"
          startIcon={<FileIcon />}
          onClick={(e) => { e.stopPropagation(); triggerUpload(); }}
          sx={{ color: '#8e8e93', '&:hover': { bgcolor: 'rgba(142,142,147,0.1)' } }}
        >
          Any File
        </Button>
      </Box>

      {/* UPLOADED FILES LIST */}
      {attachments.length > 0 && (
        <Grid container spacing={2}>
          {attachments.map((file) => (
            <Grid item xs={12} sm={6} md={4} key={file.id}>
              <Card sx={{
                bgcolor: '#1c1c1e',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                p: 1.5,
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }
              }}>
                <Box sx={{ mr: 1.5, display: 'flex', alignItems: 'center' }}>
                  {getFileIcon(file.type)}
                </Box>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="body2" noWrap sx={{ fontWeight: '500', color: 'text.primary' }}>
                    {file.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {formatBytes(file.size)}
                  </Typography>
                </Box>
                <Tooltip title="Delete">
                  <IconButton size="small" onClick={() => handleDelete(file.id)} sx={{ color: 'error.main' }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default AttachmentZone;
