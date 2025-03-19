import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Button, Avatar, Chip, Box, Dialog,
    DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemIcon, ListItemText, Popover, Divider
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { deleteWorkdata } from "../../../api/workdata";
import LoadingScreen from './LoadingScreen';
import { useContext } from 'react';
import { ConfigContext } from '../../../contexts/ConfigContext';
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import DownloadIcon from "@mui/icons-material/Download";

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

const tagColors = ["#FFD700", "#FF6F61", "#6B8E23", "#20B2AA", "#6495ED"];

const FileTable = ({ files, setFiles, sortField, sortOrder, onSort, loading }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [openDownloadDialog, setOpenDownloadDialog] = useState(false); // 다운로드 선택 모달 state
    const [openDownloadDialog2, setOpenDownloadDialog2] = useState(false); // 테이블뷰의 기능 컬럼 다운로드 모달
    const [downloadFile, setDownloadFile] = useState(null); // 테이블뷰에서 다운로드할 파일 정보
    const { user } = useContext(ConfigContext); // ✅ Context에서 로그인 유저 정보 가져오기
    const navigate = useNavigate();

    // 미리보기 관련 상태
    const [previewAnchorEl, setPreviewAnchorEl] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const closeTimeoutRef = useRef(null);
    const [anchorPosition, setAnchorPosition] = useState(null);
    const [isHoveringPopover, setIsHoveringPopover] = useState(false);

    console.log("📌 FileTable에서 받은 files 데이터:", files); // ✅ 전달된 데이터 확인
    console.log("현재 유저정보", user)

    const currentUser = user.email;

    // 로딩 상태일 때 커스텀 로딩 컴포넌트 렌더링
    if (loading) return <LoadingScreen />;

    // ✅ 데이터가 없을 때만 "파일이 없습니다" 표시
    if (!files || files.length === 0) {
        return <Typography variant="h3" sx={{ p: 2, textAlign: "center" }}>📂 등록된 파일이 없습니다.</Typography>;
    }

    // 파일명 줄이기 함수
    const truncateFileName = (fileName, maxLength) => {
        const parts = fileName.split(".");
        if (parts.length < 2) return fileName; // 확장자가 없는 경우 그대로 반환

        const ext = parts.pop(); // 확장자 분리
        const nameWithoutExt = parts.join("."); // 나머지 부분

        if (nameWithoutExt.length > maxLength) {
            return nameWithoutExt.substring(0, maxLength) + "..." + ext;
        }

        return fileName; // 최대 길이 이하라면 그대로 반환
    };

    // 파일 삭제 기능 (일반 상태)
    const handleDelete = async (wsId, fileId) => {
        const confirmDelete = window.confirm(`해당 파일을(를) 정말 삭제하시겠습니까?`);
        if (!confirmDelete) return;

        try {
            // ✅ 서버에서 삭제 요청
            await deleteWorkdata(wsId, fileId);

            // ✅ 삭제 성공하면 프론트엔드 상태에서도 제거
            setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));

            if (selectedFile && selectedFile.id === fileId) {
                setSelectedFile(null);
                setOpenModal(false);
            }

            alert("파일이 성공적으로 삭제되었습니다.");
        } catch (error) {
            console.error("❌ 파일 삭제 실패:", error);
            alert("파일 삭제에 실패했습니다. 다시 시도해주세요.");
        }
    };

    // 파일 삭제 기능 (모달 상태)
    const modalhandleDelete = async (file) => {
        const confirmDelete = window.confirm(`"${file.name}"을(를) 정말 삭제하시겠습니까?`);
        if (!confirmDelete) return;

        try {
            await deleteWorkdata(file.wsId, file.id);

            setFiles((prevFiles) => prevFiles.filter((f) => f.id !== file.id));
            setOpenModal(false);
            setSelectedFile(null);

            alert("파일이 성공적으로 삭제되었습니다.");
        } catch (error) {
            console.error("❌ 파일 삭제 실패:", error);
            alert("파일 삭제에 실패했습니다. 다시 시도해주세요.");
        }
    };


    // 파일 상세 정보 모달 열기
    const handleOpenModal = (file) => {
        setSelectedFile(file);
        setOpenModal(true);
    };

    // 모달 닫기
    const handleCloseModal = () => {
        setOpenModal(false);
    };

    // 컬럼 클릭시 정렬 변경
    const handleSort = (field) => {
        setSortField(field);
        setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
    };

    // 파일 다운로드 위한 함수 설정
    // const handleDownload = (url, fileName) => {
    //     const link = document.createElement("a");
    //     link.href = url;
    //     link.setAttribute("download", fileName);
    //     document.body.appendChild(link);
    //     link.click();
    //     document.body.removeChild(link);
    // };

    // const handleDownload = async (url, fileName) => {
    //     try {
    //         const response = await fetch(url, { mode: 'cors' }); // CORS 허용 필요
    //         if (!response.ok) throw new Error("파일 다운로드 실패");

    //         const blob = await response.blob();
    //         const blobUrl = window.URL.createObjectURL(blob);

    //         const link = document.createElement("a");
    //         link.href = blobUrl;
    //         link.download = fileName; // 다운로드할 파일명
    //         document.body.appendChild(link);
    //         link.click();

    //         document.body.removeChild(link);
    //         window.URL.revokeObjectURL(blobUrl); // 메모리 해제
    //     } catch (error) {
    //         console.error("다운로드 실패:", error);
    //         alert("파일 다운로드에 실패했습니다.");
    //     }
    // };



    // TableCell 영역에서 엔터하면 Popover를 열고, 리브하면 일정 시간 후 닫기
    const handleCellMouseEnter = (event, fileName, fileUrls) => {
        // 기존 닫기 타이머가 있으면 취소
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
        const ext = fileName.split(".").pop().toLowerCase();
        if (["png", "jpg", "jpeg", "pdf", "gif"].includes(ext)) {
            if (fileUrls && fileUrls[0]) {
                setPreviewUrl(fileUrls[0]);
                setPreviewAnchorEl(event.currentTarget);
                // 예: 마우스 위치에서 오른쪽으로 10px, 위로 10px 오프셋 적용
                setAnchorPosition({ left: event.clientX + 10, top: event.clientY - 10 });
            }
        }
    };

    const handleCellMouseLeave = () => {
        // isHoveringPopover가 true이면 타이머를 설정하지 않음
        if (!isHoveringPopover) {
            // 500ms 후에 Popover 닫기
            closeTimeoutRef.current = setTimeout(() => {
                setPreviewAnchorEl(null);
                setPreviewUrl(null);
            }, 200);
        }
    };

    // Popover 영역에서 마우스가 들어오면 닫기 타이머 취소하고 호버 상태 설정
    const handlePopoverMouseEnter = () => {
        setIsHoveringPopover(true);
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
    };

    // Popover 영역에서 마우스가 나가면 호버 상태 해제하고 타이머 설정
    const handlePopoverMouseLeave = () => {
        setIsHoveringPopover(false);
        closeTimeoutRef.current = setTimeout(() => {
            setPreviewAnchorEl(null);
            setPreviewUrl(null);
        }, 200);
    };




    const previewOpen = Boolean(previewAnchorEl);



    console.log("📌 선택된 파일 정보:", selectedFile);

    return (
        <>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: "#DBE2EF" }}>
                            <TableCell
                                onClick={() => onSort("title")}
                                sx={{
                                    cursor: "pointer",
                                    fontWeight: "bold !important",
                                    borderBottom: "2px solid #B0BEC5",
                                    transition: "background-color 0.3s ease",
                                    "&:hover": {
                                        backgroundColor: "#AFCDE7",
                                    }
                                }}
                            >
                                제목 {sortField === "title" && (sortOrder === "asc" ? "⬆️" : "⬇️")}
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontWeight: "bold !important",
                                    borderBottom: "2px solid #B0BEC5",
                                    transition: "background-color 0.3s ease",
                                    "&:hover": {
                                        backgroundColor: "#AFCDE7",
                                        cursor: "pointer"
                                    }
                                }}>파일명</TableCell>
                            <TableCell
                                sx={{
                                    fontWeight: "bold !important",
                                    borderBottom: "2px solid #B0BEC5",
                                    transition: "background-color 0.3s ease",
                                    "&:hover": {
                                        backgroundColor: "#AFCDE7",
                                        cursor: "pointer"
                                    }
                                }}>태그</TableCell>
                            <TableCell
                                onClick={() => onSort("regDate")}
                                sx={{
                                    cursor: "pointer",
                                    fontWeight: "bold !important",
                                    borderBottom: "2px solid #B0BEC5",
                                    transition: "background-color 0.3s ease",
                                    "&:hover": {
                                        backgroundColor: "#AFCDE7",
                                    }
                                }}
                            >
                                업로드 날짜 {sortField === "regDate" && (sortOrder === "asc" ? "⬆️" : "⬇️")}
                            </TableCell>
                            <TableCell
                                onClick={() => onSort("writer")}
                                sx={{
                                    cursor: "pointer",
                                    fontWeight: "bold !important",
                                    borderBottom: "2px solid #B0BEC5",
                                    transition: "background-color 0.3s ease",
                                    "&:hover": {
                                        backgroundColor: "#AFCDE7",
                                    }
                                }}
                            >
                                업로더 {sortField === "writer" && (sortOrder === "asc" ? "⬆️" : "⬇️")}
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontWeight: "bold !important",
                                    borderBottom: "2px solid #B0BEC5",
                                    transition: "background-color 0.3s ease",
                                    "&:hover": {
                                        backgroundColor: "#AFCDE7",
                                        cursor: "pointer"
                                    }
                                }}
                            >기능</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {files.map((file) => (
                            <TableRow
                                key={file.id}
                                hover
                            >
                                {/* 제목 */}
                                <TableCell
                                    sx={{
                                        cursor: "pointer",
                                        maxWidth: 200,  // 🔹 최대 너비 설정
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis"
                                    }}
                                    onClick={() => handleOpenModal(file)}
                                >
                                    {file.title}
                                </TableCell>

                                {/* 파일명 */}
                                <TableCell
                                    sx={{
                                        cursor: "pointer",
                                        maxWidth: 250,  // 🔹 최대 너비 설정
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        borderRadius: 1,  // 🔹 모서리 둥글게
                                        padding: "4px 8px", // 🔹 패딩 추가
                                        // border: "1px solid #E0E0E0", // 🔹 테두리 추가
                                    }}
                                    onMouseEnter={(e) => handleCellMouseEnter(e, file.files[0], file.fileUrls)}
                                    onMouseLeave={handleCellMouseLeave}
                                    onClick={() => handleOpenModal(file)}
                                >
                                    <Box
                                        sx={{
                                            width: "100%",
                                            height: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                            // 내부 요소들은 이벤트를 캡처하지 않도록 설정
                                            // pointerEvents: "none",
                                        }}>
                                        <img
                                            src={fileTypeIcons[file.files[0].split(".").pop().toLowerCase()] || fileTypeIcons.default}
                                            alt={file.files[0]}
                                            style={{ width: 20, height: 20 }}
                                        />
                                        {/* <Typography>{file.name}</Typography> */}
                                        <Typography
                                            sx={{
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                maxWidth: 200,  // 🔹 최대 너비 설정
                                                // pointerEvents: "auto", // 텍스트 영역은 클릭 이벤트를 받도록 함
                                            }}
                                        >
                                            {/* {truncateFileName(file.name, 12)} 🔥 파일명 줄이기 함수 적용 */}
                                            {file.files.length > 1 ? `${truncateFileName(file.files[0], 10)} 외 ${file.files.length - 1}개` : truncateFileName(file.files[0], 15)}
                                        </Typography>
                                    </Box>
                                </TableCell>

                                {/* 태그 */}
                                <TableCell sx={{ cursor: "pointer" }} onClick={() => handleOpenModal(file)}>
                                    {file.tags.slice(0, 3).map((tag, idx) => (
                                        <Chip
                                            key={idx}
                                            label={tag}
                                            sx={{
                                                m: 0.5,
                                                // backgroundColor: tagColors[idx % tagColors.length], // 순차적으로 색상 적용
                                                backgroundColor: '#DBE2EF',
                                                color: "black",
                                                borderRadius: "12px",
                                                transition: "transform 0.2s ease-in-out",
                                                "&:hover": {
                                                    transform: "scale(1.1)",
                                                    boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
                                                }
                                            }}
                                        />
                                    ))}
                                </TableCell>



                                {/* 업로드 날짜 */}
                                <TableCell
                                    sx={{
                                        cursor: "pointer",
                                    }}
                                    onClick={() => handleOpenModal(file)}
                                >
                                    {file.date}
                                </TableCell>

                                {/* 업로더 */}
                                <TableCell
                                    sx={{
                                        cursor: "pointer",
                                    }}
                                    onClick={() => handleOpenModal(file)}
                                >
                                    {/* 👤 업로더 정렬 (Avatar + 이름 수평 정렬) */}
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Avatar src={file.avatar} sx={{ width: 32, height: 32 }} />
                                        <Typography variant="body2">{file.uploader}</Typography>
                                    </Box>
                                </TableCell>

                                {/* 기능 */}
                                <TableCell>
                                    {/* 테이블뷰의 다운로드 버튼: 해당 파일 정보를 downloadFile 상태에 저장 */}
                                    <Button
                                        variant="contained"
                                        size="small"
                                        color="info"
                                        sx={{ marginRight: 1, backgroundColor: '#3F72AF' }}
                                        onClick={() => { setDownloadFile(file); setOpenDownloadDialog2(true); }}
                                    >
                                        다운로드
                                    </Button>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        color="error"
                                        onClick={() => handleDelete(file.wsId, file.id)}
                                        disabled={file.writer !== currentUser} // 현재 유저와 업로더가 다르면 비활성화
                                    >
                                        삭제
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer >

            {/* 파일 미리보기 Popover */}
            <Popover
                open={Boolean(previewAnchorEl)}
                anchorEl={previewAnchorEl}
                anchorReference="anchorPosition"
                anchorPosition={anchorPosition}
                onClose={() => {
                    if (!isHoveringPopover) {
                        setPreviewAnchorEl(null);
                        setPreviewUrl(null);
                    }
                }}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                }}
                PaperProps={{
                    onMouseEnter: handlePopoverMouseEnter,
                    onMouseLeave: handlePopoverMouseLeave,
                    sx: { pointerEvents: 'auto' }
                }}
                sx={{ pointerEvents: 'none' }}
            >
                <Box sx={{ p: 1, maxWidth: 300, maxHeight: 300 }}>
                    {previewUrl && (() => {
                        const ext = previewUrl.split('.').pop().toLowerCase();
                        if (["png", "jpg", "jpeg", "gif"].includes(ext)) {
                            return <img src={previewUrl} alt="미리보기" style={{ width: "100%", height: "auto" }} />;
                        } else if (ext === "pdf") {
                            return (
                                <object data={previewUrl} type="application/pdf" width="100%" height="300">
                                    PDF 미리보기를 지원하지 않습니다.
                                </object>
                            );
                        }
                        return null;
                    })()}
                </Box>
            </Popover>



            {/* 파일 정보 모달 */}
            <Dialog
                open={openModal}
                onClose={handleCloseModal}
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
                        onClick={handleCloseModal}
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
                    {selectedFile && (
                        <Box>
                            {/* 파일 아이콘 또는 이미지 미리보기 */}
                            <Box sx={{ textAlign: "center", marginBottom: 4 }}>
                                {(() => {
                                    const firstFileExt = selectedFile.files[0].split(".").pop().toLowerCase();
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
                                                src={selectedFile.fileUrls[0]}
                                                alt="파일 미리보기"
                                                style={{ width: "100%", maxWidth: "300px", height: "auto", borderRadius: "4px" }}
                                            />
                                        </Box>
                                    ) : (
                                        <img
                                            src={fileTypeIcons[firstFileExt] || fileTypeIcons["default"]}
                                            alt={selectedFile.files[0]}
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
                                <Typography variant="body1">{selectedFile.title}</Typography>

                                <Typography variant="body1" sx={{ fontWeight: 600, color: '#555' }}>파일명</Typography>
                                <List dense sx={{ 
                                    width: '100%', 
                                    padding: 0,
                                    margin: 0
                                }}>
                                    {selectedFile.files.map((fileName, idx) => (
                                        <ListItem
                                            key={idx} button
                                            sx={{
                                                cursor: "pointer",
                                                borderRadius: 1,
                                                '&:hover': {
                                                    backgroundColor: '#f5f5f5'
                                                },
                                                padding: '4px 8px',
                                                margin: '2px 0'
                                            }}
                                            onClick={() => handleOpenModal(selectedFile)}>
                                            <ListItemIcon sx={{ minWidth: 36 }}>
                                                <img
                                                    src={fileTypeIcons[fileName.split(".").pop().toLowerCase()] || fileTypeIcons.default}
                                                    alt={fileName}
                                                    style={{ width: 24, height: 24 }}
                                                />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary={fileName} 
                                                primaryTypographyProps={{ 
                                                    variant: 'body2',
                                                    sx: { 
                                                        overflow: 'hidden', 
                                                        textOverflow: 'ellipsis', 
                                                        whiteSpace: 'nowrap'
                                                    } 
                                                }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>

                                <Typography variant="body1" sx={{ fontWeight: 600, color: '#555', alignSelf: "start" }}>업로더</Typography>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Avatar src={selectedFile.avatar} sx={{ width: 28, height: 28 }} />
                                    <Typography variant="body1">{selectedFile.uploader}</Typography>
                                </Box>

                                <Typography variant="body1" sx={{ fontWeight: 600, color: '#555' }}>업로드 날짜</Typography>
                                <Typography variant="body1">{selectedFile.date}</Typography>

                                <Typography variant="body1" sx={{ fontWeight: 600, color: '#555', alignSelf: "start" }}>내용</Typography>
                                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{selectedFile.content}</Typography>

                                <Typography variant="body1" sx={{ fontWeight: 600, color: '#555', alignSelf: "start" }}>태그</Typography>
                                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", alignItems: "flex-start" }}>
                                    {selectedFile.tags && selectedFile.tags.map((tag, idx) => (
                                        <Chip
                                            key={idx}
                                            label={tag}
                                            color="default"
                                            size="small"
                                            sx={{ m: 0.3, backgroundColor: '#DBE2EF' }}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        </Box>
                    )}
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
                        onClick={() => modalhandleDelete(selectedFile)}
                        disabled={selectedFile && selectedFile.writer !== currentUser}
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
                        onClick={() => {
                            navigate(`/workdata/update/${selectedFile.wsId}/${selectedFile.id}`);
                            handleCloseModal();
                        }}
                        disabled={selectedFile && selectedFile.writer !== currentUser}
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
                        onClick={() => setOpenDownloadDialog(true)}
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

            {/* 다운로드 선택 모달 (옵션 2) */}
            <Dialog Dialog
                open={openDownloadDialog}
                onClose={() => setOpenDownloadDialog(false)}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>다운로드할 파일 선택</DialogTitle>
                <DialogContent>
                    <List>
                        {selectedFile && selectedFile.files.map((fileName, idx) => (
                            <ListItem key={idx} button
                                sx={{
                                    cursor: "pointer"
                                }}
                                onClick={() => {
                                    if (selectedFile.fileUrls && selectedFile.fileUrls[idx]) {
                                        window.open(selectedFile.fileUrls[idx], '_blank');
                                        // handleDownload(selectedFile.fileUrls[idx], fileName);
                                    } else {
                                        alert("다운로드 URL이 없습니다.");
                                    }
                                }}>
                                <ListItemIcon>
                                    <img
                                        src={fileTypeIcons[fileName.split(".").pop().toLowerCase()] || fileTypeIcons.default}
                                        alt={fileName}
                                        style={{ width: 25 }}
                                    />
                                </ListItemIcon>
                                <ListItemText primary={fileName} />
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDownloadDialog(false)} color="primary">
                        닫기
                    </Button>
                </DialogActions>
            </Dialog >

            {/* 테이블뷰 다운로드 버튼용 다운로드 선택 모달 */}
            <Dialog
                open={openDownloadDialog2}
                onClose={() => { setOpenDownloadDialog2(false); setDownloadFile(null); }}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>다운로드할 파일 선택</DialogTitle>
                <DialogContent>
                    <List>
                        {downloadFile && downloadFile.files.map((fileName, idx) => (
                            <ListItem key={idx} button
                                sx={{ cursor: "pointer" }}
                                onClick={() => {
                                    if (downloadFile.fileUrls && downloadFile.fileUrls[idx]) {
                                        window.open(downloadFile.fileUrls[idx], '_blank');
                                        // handleDownload(downloadFile.fileUrls[idx], fileName);
                                    } else {
                                        alert("다운로드 URL이 없습니다.");
                                    }
                                }}>
                                <ListItemIcon>
                                    <img
                                        src={fileTypeIcons[fileName.split(".").pop().toLowerCase()] || fileTypeIcons.default}
                                        alt={fileName}
                                        style={{ width: 25 }}
                                    />
                                </ListItemIcon>
                                <ListItemText primary={fileName} />
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setOpenDownloadDialog2(false); setDownloadFile(null); }} color="primary">
                        닫기
                    </Button>
                </DialogActions>
            </Dialog>

        </>
    );
};

export default FileTable;
