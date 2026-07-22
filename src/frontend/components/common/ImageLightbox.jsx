import React, { useState, useEffect } from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

const ImageLightbox = ({ src, onClose }) => {
  const [zoomScale, setZoomScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setZoomScale(1);
    setPosition({ x: 0, y: 0 });
  }, [src]);

  if (!src) return null;

  const handleWheel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Scroll UP (deltaY < 0) -> Zoom IN | Scroll DOWN (deltaY > 0) -> Zoom OUT
    const delta = e.deltaY < 0 ? 0.2 : -0.2;
    setZoomScale((prev) => {
      const nextScale = Math.min(Math.max(0.5, prev + delta), 5);
      if (nextScale === 1) setPosition({ x: 0, y: 0 });
      return nextScale;
    });
  };

  const handleZoomIn = (e) => {
    e.stopPropagation();
    setZoomScale((prev) => Math.min(prev + 0.25, 5));
  };

  const handleZoomOut = (e) => {
    e.stopPropagation();
    setZoomScale((prev) => {
      const nextScale = Math.max(prev - 0.25, 0.5);
      if (nextScale === 1) setPosition({ x: 0, y: 0 });
      return nextScale;
    });
  };

  const handleResetZoom = (e) => {
    e.stopPropagation();
    setZoomScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      if (src.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = src;
        link.download = `downloaded_image_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const response = await fetch(src);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        const filename = src.split('/').pop() || `downloaded_image_${Date.now()}.png`;
        link.download = filename.includes('.') ? filename : `${filename}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }
    } catch (err) {
      console.error('Error downloading image:', err);
      const link = document.createElement('a');
      link.href = src;
      link.download = `downloaded_image_${Date.now()}.png`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleMouseDown = (e) => {
    if (zoomScale > 1) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoomScale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <Box
      onClick={onClose}
      onWheel={handleWheel}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        bgcolor: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(10px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        animation: 'fadeIn 0.2s ease-out',
        '@keyframes fadeIn': {
          from: { opacity: 0 },
          to: { opacity: 1 }
        }
      }}
    >
      {/* Top Action Control Bar */}
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          position: 'absolute',
          top: 20,
          right: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: 'rgba(255, 255, 255, 0.14)',
          backdropFilter: 'blur(14px)',
          borderRadius: '24px',
          px: 1.5,
          py: 0.5,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.2)',
          zIndex: 1000000
        }}
      >
        {/* Zoom Out */}
        <Tooltip title="Zoom Out (Scroll Down)">
          <IconButton size="small" onClick={handleZoomOut} sx={{ color: '#ffffff', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
            <ZoomOutIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* Zoom Level Indicator */}
        <Typography variant="caption" sx={{ color: '#ffffff', fontWeight: 700, minWidth: 42, textAlign: 'center', fontSize: '0.78rem' }}>
          {Math.round(zoomScale * 100)}%
        </Typography>

        {/* Zoom In */}
        <Tooltip title="Zoom In (Scroll Up)">
          <IconButton size="small" onClick={handleZoomIn} sx={{ color: '#ffffff', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
            <ZoomInIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* Reset Zoom */}
        <Tooltip title="Reset Zoom (100%)">
          <IconButton size="small" onClick={handleResetZoom} sx={{ color: '#ffffff', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
            <RestartAltIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Box sx={{ width: '1px', height: '18px', bgcolor: 'rgba(255,255,255,0.3)', mx: 0.5 }} />

        {/* Download Button */}
        <Tooltip title="Download Image">
          <IconButton size="small" onClick={handleDownload} sx={{ color: '#60a5fa', '&:hover': { bgcolor: 'rgba(96,165,250,0.2)' } }}>
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* Close Button */}
        <Tooltip title="Close">
          <IconButton size="small" onClick={onClose} sx={{ color: '#ef4444', '&:hover': { bgcolor: 'rgba(239,68,68,0.2)' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Image Container with Scale and Drag */}
      <Box
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleMouseDown}
        sx={{
          maxWidth: '90vw',
          maxHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          cursor: zoomScale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
        }}
      >
        <Box
          component="img"
          src={src}
          alt="Full size preview"
          draggable={false}
          sx={{
            maxHeight: '85vh',
            maxWidth: '85vw',
            objectFit: 'contain',
            borderRadius: '8px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.85)',
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoomScale})`,
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            transformOrigin: 'center center'
          }}
        />
      </Box>
    </Box>
  );
};

export default ImageLightbox;
