import React, { useContext, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Button,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { ConfigContext } from '../../../contexts/ConfigContext';
import { deleteWorkdata } from '../../../api/workdata';
import DeleteStatusModal from './DeleteStatusModal';

// 파일 아이콘 import
import pdfIcon from "assets/images/icons/pdf.png";
import imageIcon from "assets/images/icons/image.png";
import docIcon from "assets/images/icons/doc.png";
import excelIcon from "assets/images/icons/excel.png";
import pptIcon from "assets/images/icons/ppt.png";
import txtIcon from "assets/images/icons/txt.png";
import fileIcon from "assets/images/icons/file.png";

// 확장자별 이미지 매핑
const fileTypeIcons = {
  "pdf": pdfIcon,
  "png": imageIcon,
  "gif": imageIcon,
  "jpg": imageIcon,
  "docx": docIcon,
  "xlsx": excelIcon,
  "pptx": pptIcon,
  "ppt": pptIcon,
  "txt": txtIcon,
  "default": fileIcon
};

// 태그 색상 매핑 
const tagColors = {
  "문서": "primary",
  "디자인": "secondary"
};

const FileDetailModal = ({ open, onClose, file, onDelete, refreshData }) => {
  if (!file) return null;

  const navigate = useNavigate();
  const { user } = useContext(ConfigContext);
  const currentUser = user?.email;
  
  // 삭제 상태 모달 관리
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    status: 'loading', // 'loading' 또는 'success'
    message: ''
  });

  // 삭제 핸들러
  const handleDelete = async () => {
    const confirmDelete = window.confirm(`"${file.title}"을(를) 정말 삭제하시겠습니까?`);
    if (!confirmDelete) return;
    
    try {
      // 삭제 진행 모달 표시
      setDeleteModal({
        open: true,
        status: 'loading',
        message: '파일을 삭제하고 있습니다...'
      });
      
      await deleteWorkdata(file.wsId, file.id);
      
      if (onDelete) {
        await onDelete(file);
      }
      
      // 삭제 성공 모달로 변경
      setDeleteModal({
        open: true,
        status: 'success',
        message: '파일이 성공적으로 삭제되었습니다.'
      });
      
    } catch (error) {
      console.error("❌ 파일 삭제 실패:", error);
      setDeleteModal({
        open: true,
        status: 'success', // 모달은 성공 애니메이션을 사용하되 메시지만 다르게
        message: '파일 삭제에 실패했습니다. 다시 시도해주세요.'
      });
    }
  };
  
  // 삭제 모달 확인 버튼 핸들러
  const handleDeleteModalConfirm = () => {
    setDeleteModal(prev => ({ ...prev, open: false }));
    // 모달 닫기
    onClose();
    // 데이터 새로고침
    if (refreshData) {
      refreshData();
    }
  };
  
  // 수정 핸들러
  const handleEdit = () => {
    navigate(`/workdata/update/${file.wsId}/${file.id}`);
    onClose(); // 수정 페이지로 이동 후 모달 닫기
  };

  // 작성자만 수정/삭제 가능한지 확인
  const isOwner = file.writer === currentUser;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{ 
          sx: { 
            borderRadius: 1,
            boxShadow: 24,
            overflow: 'hidden'
          } 
        }}
      >
        {/* 모달 헤더 */}
        <Box sx={{ p: 3, pb: 1.5 }}>
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8
            }}
          >
            <CloseIcon />
          </IconButton>

          <Typography
            variant="h3"
            sx={{
              fontWeight: 400,
              mb: 2
            }}
          >
            파일 정보
          </Typography>
        </Box>

        <Divider sx={{ borderColor: '#e0e0e0' }} />

        <DialogContent sx={{ px: 3, py: 3 }}>
          <Box>
            {/* 파일 아이콘 또는 이미지 미리보기 */}
            <Box sx={{ textAlign: "center", marginBottom: 4 }}>
              {(() => {
                const firstFileExt = file.files[0].split(".").pop().toLowerCase();
                const isImageFile = ["png", "jpg", "jpeg", "gif"].includes(firstFileExt);
                return isImageFile ? (
                  <Box sx={{ 
                    p: 1, 
                    border: '1px solid #eee',
                    borderRadius: 1,
                    display: 'inline-block',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}>
                    <img
                      src={file.fileUrls[0]} // 파일의 URL로 이미지 미리보기
                      alt="파일 미리보기"
                      style={{ width: "100%", maxWidth: "300px", height: "auto", borderRadius: "4px" }}
                    />
                  </Box>
                ) : (
                  <img
                    src={fileTypeIcons[firstFileExt] || fileTypeIcons["default"]}
                    alt={file.files[0]}
                    style={{ width: 80, height: 80 }}
                  />
                );
              })()}
            </Box>

            {/* 항목별 Grid 레이아웃 적용 */}
            <Box sx={{ 
              display: "grid", 
              gridTemplateColumns: { xs: "1fr", sm: "130px 1fr" }, 
              gap: 3, 
              rowGap: 2,
              padding: 1, 
              alignItems: "center" 
            }}>
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#555' }}>제목</Typography>
              <Typography variant="body1">{file.title}</Typography>

              <Typography variant="body1" sx={{ fontWeight: 600, color: '#555' }}>파일명</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <img
                  src={fileTypeIcons[file.files[0].split(".").pop().toLowerCase()] || fileTypeIcons.default}
                  alt={file.files[0]}
                  style={{ width: 24, height: 24, marginRight: '8px' }}
                />
                <Typography variant="body1">{file.files[0]}</Typography>
              </Box>

              <Typography variant="body1" sx={{ fontWeight: 600, color: '#555' }}>업로더</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {/* <Avatar sx={{ width: 28, height: 28 }} /> */}
                <Typography variant="body1">{file.uploader}</Typography>
              </Box>

              <Typography variant="body1" sx={{ fontWeight: 600, color: '#555' }}>업로드 날짜</Typography>
              <Typography variant="body1">{file.date}</Typography>

              <Typography variant="body1" sx={{ fontWeight: 600, color: '#555' }}>워크스페이스</Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.wsName}</Typography>

              <Typography variant="body1" sx={{ fontWeight: 600, color: '#555' }}>내용</Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{file.content}</Typography>

              <Typography variant="body1" sx={{ fontWeight: 600, color: '#555' }}>태그</Typography>
              <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                {file.tags && file.tags.map((tag, idx) => (
                  <Chip
                    key={idx}
                    label={tag}
                    color={tagColors[tag] || "default"}
                    size="small"
                    sx={{ m: 0.3 }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </DialogContent>

        {/* 모달 푸터 (버튼 영역) */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1,
          p: 2,
          bgcolor: '#f8f9fa',
          borderTop: '1px solid #e0e0e0'
        }}>
          <Button
            variant="contained"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            sx={{
              bgcolor: '#f44336',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#d32f2f',
                boxShadow: 'none'
              },
              '&.Mui-disabled': {
                bgcolor: '#ffcdd2',
                color: '#ffffff'
              }
            }}
          >
            삭제
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEdit}
            sx={{
              bgcolor: '#ff9800',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#f57c00',
                boxShadow: 'none'
              },
              '&.Mui-disabled': {
                bgcolor: '#ffe0b2',
                color: '#ffffff'
              }
            }}
          >
            수정
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => {
              if (file.fileUrls && file.fileUrls.length > 0) {
                window.open(file.fileUrls[0], '_blank');
              } else {
                alert("다운로드 URL이 없습니다.");
              }
            }}
            sx={{
              bgcolor: '#1976d2',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#1565c0',
                boxShadow: 'none'
              }
            }}
          >
            다운로드
          </Button>
        </Box>
      </Dialog>
      
      {/* 삭제 상태 모달 */}
      <DeleteStatusModal
        open={deleteModal.open}
        status={deleteModal.status}
        message={deleteModal.message}
        onConfirm={handleDeleteModalConfirm}
      />
    </>
  );
};

export default FileDetailModal; 