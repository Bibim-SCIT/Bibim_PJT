import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Divider,
  Chip,
  CircularProgress,
  ToggleButton, 
  ToggleButtonGroup,
  Avatar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getMyWorkspaceData, getMyWorkspaces } from '../../../api/mypage';
import TableChartIcon from "@mui/icons-material/TableChart";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import DescriptionIcon from '@mui/icons-material/Description';
import FileDetailModal from './FileDetailModal';

// 파일 아이콘 import
import pdfIcon from "assets/images/icons/pdf.png";
import imageIcon from "assets/images/icons/image.png";
import docIcon from "assets/images/icons/doc.png";
import excelIcon from "assets/images/icons/excel.png";
import pptIcon from "assets/images/icons/ppt.png";
import txtIcon from "assets/images/icons/txt.png";
import fileIcon from "assets/images/icons/file.png";
import defaultWorkspaceIcon from "assets/images/icons/bibimsero.png"; // 기본 워크스페이스 이미지 추가

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

const MyWorkData = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // "table" or "card"
  const [sortField, setSortField] = useState("regDate");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedFile, setSelectedFile] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  // 모든 워크스페이스 데이터 가져오기
  const fetchWorkspaces = async () => {
    try {
      const response = await getMyWorkspaces();
      
      // 이미지 URL이 유효한지 확인하는 헬퍼 함수
      const getValidImageUrl = (imageUrl) => {
        if (!imageUrl || imageUrl === 'null' || imageUrl === 'undefined' || imageUrl === '') {
          return defaultWorkspaceIcon;
        }
        
        // URL이 http:// 또는 https://로 시작하는지 확인
        if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('/')) {
          return defaultWorkspaceIcon;
        }
        
        return imageUrl;
      };

      // ID를 일관되게 처리하는 함수 추가
      const normalizeId = (id) => {
        return typeof id === 'string' ? parseInt(id, 10) : (id || 0);
      };
      
      // response가 바로 배열인 경우
      if (Array.isArray(response)) {
        const workspaceList = response.map(ws => ({
          wsId: normalizeId(ws.wsId),
          wsName: ws.wsName,
          wsImg: getValidImageUrl(ws.wsImg)
        }));
        setWorkspaces(workspaceList);
        return workspaceList;
      } 
      // response.data가 배열인 경우
      else if (response && response.data && Array.isArray(response.data)) {
        const workspaceList = response.data.map(ws => ({
          wsId: normalizeId(ws.wsId),
          wsName: ws.wsName,
          wsImg: getValidImageUrl(ws.wsImg)
        }));
        setWorkspaces(workspaceList);
        return workspaceList;
      } 
      // 데이터 형식이 예상과 다른 경우
      else {
        console.warn('워크스페이스 데이터 형식이 예상과 다릅니다:', response);
        setWorkspaces([]);
        return [];
      }
    } catch (error) {
      console.error('워크스페이스 목록 조회 실패:', error);
      setWorkspaces([]);
      return [];
    }
  };

  // 컴포넌트 마운트 시 워크스페이스 목록 먼저 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // 1. 워크스페이스 데이터 로드
        const workspaceData = await fetchWorkspaces();
        
        // 워크스페이스 데이터가 있는지 확인
        if (workspaceData && workspaceData.length > 0) {
          // 워크스페이스 상태 설정
          setWorkspaces(workspaceData);
          
          // 2. 자료 데이터 로드 - 워크스페이스 데이터를 직접 전달
          await fetchMyWorkData(workspaceData);
        } else {
          console.warn('워크스페이스 데이터 로드 실패 또는 워크스페이스 없음');
          setLoading(false);
        }
      } catch (error) {
        console.error('데이터 로드 중 오류 발생:', error);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    };
    
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 내가 작성한 자료 데이터 가져오기
  const fetchMyWorkData = async (workspaceList) => {
    try {
      // 직접 전달받은 워크스페이스 목록 사용 (매개변수 또는 상태)
      const currentWorkspaces = workspaceList || workspaces;
      
      // 자료 데이터 가져오기
      const result = await getMyWorkspaceData();
      
      // 이미지 URL이 유효한지 확인하는 헬퍼 함수
      const getValidImageUrl = (imageUrl) => {
        if (!imageUrl || imageUrl === 'null' || imageUrl === 'undefined' || imageUrl === '') {
          return defaultWorkspaceIcon;
        }
        
        // URL이 http:// 또는 https://로 시작하는지 확인
        if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('/')) {
          return defaultWorkspaceIcon;
        }
        
        return imageUrl;
      };

      // ID를 일관되게 처리하는 함수
      const normalizeId = (id) => {
        return typeof id === 'string' ? parseInt(id, 10) : (id || 0);
      };
      
      // API 응답 구조 확인: result.data에 자료 데이터 배열이 있음
      if (result && result.data && Array.isArray(result.data)) {
        const formattedData = result.data.map((item) => {
          // 데이터 유형 확인 및 변환 (문자열 ID를 숫자로 변환)
          const workspaceId = normalizeId(item.workspaceNumber);
          
          // 매칭할 워크스페이스 찾기
          let matchingWorkspace = null;
          
          // 각 워크스페이스 ID 비교
          for (const workspace of currentWorkspaces) {
            const wsId = normalizeId(workspace.wsId);
            
            if (wsId === workspaceId) {
              matchingWorkspace = workspace;
              break;
            }
          }
          
          // 워크스페이스 이미지 URL 처리
          let workspaceImageUrl = defaultWorkspaceIcon;
          
          // 매칭된 워크스페이스에서 이미지를 가져오는 것이 가장 우선
          if (matchingWorkspace && matchingWorkspace.wsImg) {
            workspaceImageUrl = matchingWorkspace.wsImg; // 이미 getValidImageUrl을 통과한 값
          } 
          // 자료 데이터에 워크스페이스 이미지가 있으면 사용
          else if (item.wsImg) {
            workspaceImageUrl = getValidImageUrl(item.wsImg);
          }

          return {
            id: item.dataNumber,
            title: item.title,
            files: item.fileNames || ["파일 없음"],
            date: item.regDate.split("T")[0],
            uploader: item.nickname,
            writer: item.writer,
            wsName: item.workspaceName,
            wsId: workspaceId,
            wsImg: workspaceImageUrl,
            content: item.content,
            fileUrls: item.fileUrls,
            tags: item.tags || []
          };
        });
        
        setFiles(formattedData);
      } else {
        console.error("API로부터 받은 데이터가 올바른 형식이 아님:", result);
        setFiles([]);
      }
    } catch (error) {
      console.error("내 자료 조회 실패:", error);
      setError("내 자료를 불러오는 중 오류가 발생했습니다.");
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  // 파일 삭제 후 처리 함수
  const handleDeleteSuccess = async (deletedFile) => {
    // 파일 목록에서 삭제된 파일 제거
    setFiles((prevFiles) => prevFiles.filter((file) => 
      !(file.id === deletedFile.id && file.wsId === deletedFile.wsId)
    ));
  };

  // 정렬 처리 핸들러
  const handleSort = (field) => {
    setSortField(field);
    setSortOrder(prevOrder => (prevOrder === "asc" ? "desc" : "asc"));
  };

  // 클라이언트 측에서 정렬 수행
  const sortedFiles = useMemo(() => {
    return [...files].sort((a, b) => {
      if (sortField === "title" || sortField === "uploader" || sortField === "wsName") {
        return sortOrder === "asc"
          ? a[sortField].localeCompare(b[sortField])
          : b[sortField].localeCompare(a[sortField]);
      }
      if (sortField === "date") {
        const [yearA, monthA, dayA] = a.date.split("-").map(Number);
        const [yearB, monthB, dayB] = b.date.split("-").map(Number);
        const dateA = new Date(yearA, monthA - 1, dayA);
        const dateB = new Date(yearB, monthB - 1, dayB);

        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }
      return 0;
    });
  }, [files, sortField, sortOrder]);

  // 파일명 줄이기 함수
  const truncateFileName = (fileName, maxLength = 15) => {
    const parts = fileName.split(".");
    if (parts.length < 2) return fileName; // 확장자가 없는 경우 그대로 반환
    
    const extension = parts.pop();
    const baseName = parts.join(".");
    
    if (baseName.length <= maxLength) return fileName;
    
    return `${baseName.substring(0, maxLength)}...${extension}`;
  };

  // 자료 상세보기 모달 열기
  const handleOpenModal = (file) => {
    setSelectedFile(file);
    setOpenModal(true);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedFile(null);
  };

  // 로딩 중 표시
  if (loading) {
    return (
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // 에러 표시
  if (error) {
    return (
      <Box sx={{ width: '100%', p: 3, textAlign: 'center', color: 'error.main' }}>
        <Typography variant="h6">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{
        p: 3,
        position: 'relative',
        bgcolor: 'background.paper',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 600,
            color: '#333'
          }}>
            내 자료실
          </Typography>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(event, newMode) => {
              if (newMode !== null) setViewMode(newMode);
            }}
            aria-label="view mode toggle"
            sx={{
              '& .MuiToggleButton-root': {
                border: '1px solid rgba(0, 0, 0, 0.12)',
                borderRadius: '8px',
                mx: 0.5,
                py: 0.8,
                px: 2,
                '&.Mui-selected': {
                  backgroundColor: '#1976d2',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#1565c0',
                  }
                }
              }
            }}
          >
            <ToggleButton value="table" aria-label="table view">
              <TableChartIcon sx={{ marginRight: 1 }} /> 테이블 보기
            </ToggleButton>
            <ToggleButton value="card" aria-label="card view">
              <ViewModuleIcon sx={{ marginRight: 1 }} /> 카드 보기
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {files.length === 0 ? (
          <Box 
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 10,
              px: 3,
              bgcolor: '#f9f9f9',
              borderRadius: 2,
              border: '1px dashed #ccc'
            }}
          >
            <DescriptionIcon sx={{ fontSize: 60, color: '#aaa', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" fontWeight={500} gutterBottom>
              등록한 자료가 없습니다
            </Typography>
            <Typography variant="body1" color="text.secondary" align="center">
              워크스페이스에서 자료를 업로드하면 이곳에 표시됩니다.
            </Typography>
          </Box>
        ) : viewMode === "table" ? (
          <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #eee' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell onClick={() => handleSort("title")} sx={{ cursor: "pointer", fontWeight: 'bold' }}>
                    제목 {sortField === "title" && (sortOrder === "asc" ? "⬆️" : "⬇️")}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>파일명</TableCell>
                  <TableCell onClick={() => handleSort("wsName")} sx={{ cursor: "pointer", fontWeight: 'bold' }}>
                    워크스페이스 {sortField === "wsName" && (sortOrder === "asc" ? "⬆️" : "⬇️")}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>태그</TableCell>
                  <TableCell onClick={() => handleSort("date")} sx={{ cursor: "pointer", fontWeight: 'bold' }}>
                    업로드 날짜 {sortField === "date" && (sortOrder === "asc" ? "⬆️" : "⬇️")}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedFiles.map((file) => (
                  <TableRow 
                    key={`${file.wsId}-${file.id}`}
                    hover
                    onClick={() => handleOpenModal(file)}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#f8f9fa' }
                    }}
                  >
                    <TableCell sx={{ fontWeight: 'medium', maxWidth: '200px' }}>
                      <Typography 
                        sx={{ 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap' 
                        }}
                      >
                        {file.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <img
                          src={fileTypeIcons[file.files[0].split(".").pop().toLowerCase()] || fileTypeIcons.default}
                          alt={file.files[0]}
                          style={{ width: 20, height: 20 }}
                        />
                        <Typography
                          sx={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: 150,
                          }}
                        >
                          {truncateFileName(file.files[0])}
                        </Typography>
                        {file.files.length > 1 && (
                          <Chip 
                            label={`+${file.files.length - 1}`} 
                            size="small" 
                            variant="outlined"
                            sx={{ ml: 1, height: '20px' }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Avatar
                          src={file.wsImg}
                          alt={file.wsName}
                          variant="rounded"
                          sx={{ 
                            width: 28, 
                            height: 28, 
                            border: '1px solid #eee' 
                          }}
                          onError={(e) => {
                            console.error('테이블 뷰 이미지 로딩 오류:', file.wsImg);
                            e.target.src = defaultWorkspaceIcon;
                          }}
                        />
                        <Typography>
                          {file.wsName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {file.tags && file.tags.map((tag, idx) => (
                          <Chip
                            key={idx}
                            label={tag}
                            size="small"
                            color={tagColors[tag] || "default"}
                            sx={{ borderRadius: '4px' }}
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>{file.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 3 }}>
            {sortedFiles.map((file) => {
              const fileExtension = file.files[0].split(".").pop().toLowerCase();
              const fileIcon = fileTypeIcons[fileExtension] || fileTypeIcons["default"];
              
              return (
                <Paper
                  key={`${file.wsId}-${file.id}`}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    border: '1px solid #eee',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                    }
                  }}
                  onClick={() => handleOpenModal(file)}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <img src={fileIcon} alt={file.title} style={{ width: 48, height: 48 }} />
                  </Box>
                  
                  <Typography 
                    variant="h6" 
                    align="center" 
                    sx={{ 
                      fontWeight: 'bold',
                      mb: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      height: '48px'
                    }}
                  >
                    {file.title}
                  </Typography>
                  
                  <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                    {file.tags && file.tags.map((tag, idx) => (
                      <Chip
                        key={idx}
                        label={tag}
                        size="small"
                        color={tagColors[tag] || "default"}
                        sx={{ borderRadius: '4px' }}
                      />
                    ))}
                  </Box>
                  
                  <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid #eee' }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 1 }}>
                      <Avatar
                        src={file.wsImg}
                        alt={file.wsName}
                        variant="rounded"
                        sx={{ 
                          width: 24, 
                          height: 24, 
                          border: '1px solid #eee' 
                        }}
                        onError={(e) => {
                          console.error('카드 뷰 이미지 로딩 오류:', file.wsImg);
                          e.target.src = defaultWorkspaceIcon;
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {file.wsName}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" align="center" display="block">
                      {file.date}
                    </Typography>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        )}
      </Box>

      {/* 자료 상세보기 모달 */}
      <FileDetailModal
        open={openModal}
        onClose={handleCloseModal}
        file={selectedFile}
        onDelete={handleDeleteSuccess}
        refreshData={fetchMyWorkData}
      />
    </Box>
  );
};

export default MyWorkData; 