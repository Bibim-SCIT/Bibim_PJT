import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Card, CardContent, Typography, Grid, Avatar, Chip, Box, IconButton, Menu, MenuItem, Dialog,
    DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemIcon, ListItemText
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { deleteWorkdata } from "../../../api/workdata";
import LoadingScreen from './LoadingScreen';
import { useContext } from 'react';
import { ConfigContext } from '../../../contexts/ConfigContext';

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

const FileCardView = ({ files, setFiles, loading }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [openDownloadDialog, setOpenDownloadDialog] = useState(false); // 다운로드 목록 모달 state
    const [openDownloadDialog2, setOpenDownloadDialog2] = useState(false); // 다운로드 선택 버튼시 모달 
    const navigate = useNavigate();

    const { user } = useContext(ConfigContext); // ✅ Context에서 로그인 유저 정보 가져오기
    const currentUser = user.email;

    // 점 3개 버튼 클릭 (메뉴 열기)
    const handleMenuOpen = (event, file) => {
        event.stopPropagation(); // 카드 클릭 이벤트 방지
        setAnchorEl(event.currentTarget);
        setSelectedFile(file);
    };

    // 메뉴 닫기
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

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
    // const handleDelete = () => {
    //     const confirmDelete1 = window.confirm(`해당 파일을(를) 정말 삭제하시겠습니까?`);
    //     if (confirmDelete1) {
    //         setFiles((prevFiles) => prevFiles.filter((file) => file.id !== selectedFile.id));
    //         handleMenuClose();
    //     }
    // };
    const handleDelete = async () => {
        if (!selectedFile) return;

        const confirmDelete = window.confirm(`"${selectedFile.title}"을(를) 정말 삭제하시겠습니까?`);
        if (!confirmDelete) return;

        try {
            // ✅ 백엔드 API 호출
            await deleteWorkdata(selectedFile.wsId, selectedFile.id);

            // ✅ 삭제 성공 시, 상태 업데이트
            setFiles((prevFiles) => prevFiles.filter((file) => file.id !== selectedFile.id));

            alert("파일이 성공적으로 삭제되었습니다.");
            handleMenuClose();
        } catch (error) {
            console.error("❌ 파일 삭제 실패:", error);
            alert("파일 삭제에 실패했습니다. 다시 시도해주세요.");
        }
    };


    // 파일 삭제 기능 (모달 상태)
    const modalhandleDelete = async (file) => {
        if (!file) return;

        const confirmDelete = window.confirm(`"${file.title}"을(를) 정말 삭제하시겠습니까?`);
        if (!confirmDelete) return;

        try {
            // ✅ 백엔드 API 호출
            await deleteWorkdata(file.wsId, file.id);

            // ✅ 삭제 성공 시, 상태 업데이트
            setFiles((prevFiles) => prevFiles.filter((f) => f.id !== file.id));

            alert("파일이 성공적으로 삭제되었습니다.");
            setOpenModal(false);
            setSelectedFile(null);
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

    // 로딩 상태일 때 커스텀 로딩 컴포넌트 렌더링
    if (loading) return <LoadingScreen />;

    // ✅ 데이터가 없을 때만 "파일이 없습니다" 표시
    if (!files || files.length === 0) {
        return <Typography variant="h3" sx={{ p: 2, textAlign: "center" }}>📂 등록된 파일이 없습니다.</Typography>;
    }

    return (
        <>
            <Grid container spacing={2}>
                {files.map((file) => {
                    const fileExtension = file.files[0].split(".").pop().toLowerCase();
                    const fileIcon = fileTypeIcons[fileExtension] || fileTypeIcons["default"];

                    return (
                        <Grid item xs={12} sm={6} md={3} key={file.id}>
                            <Card
                                sx={{
                                    minWidth: 275,
                                    maxHeight: 280, // 카드 높이 제한
                                    padding: 2,
                                    bgcolor: "#F4F5F7",
                                    position: "relative",
                                    cursor: "pointer",
                                    boxShadow: 2,
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    transition: "transform 0.3s ease", // 애니메이션 속성 추가
                                    "&:hover": {
                                        transform: "translateY(-5px) scale(1.02)", // 마우스 오버 시 위로 5px 이동, 1.02배 확대
                                    },
                                    backgroundColor: "#F9F7F7"
                                }}
                                onClick={() => handleOpenModal(file)}
                            >
                                {/* 점 3개 버튼 (메뉴) */}
                                <IconButton
                                    sx={{ position: "absolute", top: 8, right: 8 }}
                                    onClick={(event) => {
                                        event.stopPropagation(); // 부모 클릭 이벤트 방지
                                        handleMenuOpen(event, file);
                                    }}
                                >
                                    <MoreVertIcon />
                                </IconButton>

                                {/* 파일 확장자 이미지 */}
                                <Box sx={{ display: "flex", justifyContent: "center", marginBottom: 2 }}>
                                    <img src={fileIcon} alt={file.name} style={{ width: 60, height: 60 }} />
                                </Box>

                                <CardContent>
                                    {/* 📋 제목 */}
                                    <Typography
                                        variant="h3"
                                        sx={{
                                            fontWeight: "bold",
                                            overflow: "hidden",
                                            whiteSpace: "nowrap",
                                            textAlign: "center",
                                            textOverflow: "ellipsis",
                                            maxWidth: "100%"
                                        }}
                                    >
                                        {file.title}
                                    </Typography>

                                    {/* 📋 파일명 */}
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            color: "gray",
                                            overflow: "hidden",
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis",
                                            textAlign: "center",
                                            maxWidth: "100%",
                                            marginTop: 1
                                        }}
                                    >
                                        {/* {file.name} */}
                                        {file.files.length > 1 ? `${truncateFileName(file.files[0], 10)} 외 ${file.files.length - 1}개` : truncateFileName(file.files[0], 15)}
                                    </Typography>

                                    {/* 업로더 + 업로드 날짜 박스 */}
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
                                        {/* 업로더 */}
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Avatar src={file.avatar} sx={{ width: 28, height: 28 }} />
                                            <Typography variant="body2">{file.uploader}</Typography>
                                        </Box>

                                        {/* 업로드 날짜 */}
                                        <Typography variant="body2" sx={{ color: "gray" }}>
                                            {file.date}
                                        </Typography>
                                    </Box>

                                    {/* 🏷️ 태그 */}
                                    <Box sx={{ display: "flex", justifyContent: "center", marginTop: 1 }}>
                                        {/* <Chip label={file.tag} color={tagColors[file.tag] || "default"} /> */}
                                        {file.tags.slice(0, 3).map((tag, idx) => (
                                            <Chip
                                                key={idx}
                                                label={tag}
                                                color={tagColors[tag] || "default"}
                                                sx={{
                                                    m: 0.5,
                                                    backgroundColor: '#DBE2EF',
                                                    color: "black",
                                                    borderRadius: "12px",
                                                    transition: "transform 0.2s ease-in-out",
                                                    "&:hover": {
                                                        transform: "scale(1.1)",
                                                        boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
                                                    }
                                                }}
                                            />))}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>

            {/* 점 3개 버튼 메뉴 */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={() => { handleMenuClose(); setOpenDownloadDialog(true); }}>
                    📥 다운로드
                </MenuItem>
                <MenuItem
                    onClick={() => handleDelete()}
                    disabled={!selectedFile || selectedFile.writer !== currentUser}
                >🗑️ 삭제</MenuItem>
            </Menu>

            {/* 파일 정보 모달 */}
            <Dialog
                open={openModal}
                onClose={handleCloseModal}
                fullWidth
                maxWidth="sm" // 고정된 모달 크기 설정 (small 크기)
            >
                <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    📁 파일 정보
                    <IconButton onClick={handleCloseModal}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {selectedFile && (
                        <Box>
                            {/* 파일 아이콘 또는 이미지 미리보기 */}
                            <Box sx={{ textAlign: "center", marginBottom: 2 }}>
                                {(() => {
                                    const firstFileExt = selectedFile.files[0].split(".").pop().toLowerCase();
                                    const isImageFile = ["png", "jpg", "jpeg", "gif"].includes(firstFileExt);
                                    return isImageFile ? (
                                        <img
                                            src={selectedFile.fileUrls[0]} // 파일의 URL로 이미지 미리보기
                                            alt="파일 미리보기"
                                            style={{ width: "100%", maxWidth: "200px", height: "auto", borderRadius: "8px" }}
                                        />
                                    ) : (
                                        <img
                                            src={fileTypeIcons[firstFileExt] || fileTypeIcons["default"]}
                                            alt={selectedFile.files[0]}
                                            style={{ width: 80, height: 80 }}
                                        />
                                    );
                                })()}
                            </Box>

                            {/* 항목별 2:10 Grid 레이아웃 적용 */}
                            <Box sx={{ display: "grid", gridTemplateColumns: "2fr 10fr", gap: 1, padding: 2, alignItems: "center" }}>
                                <Typography variant="body1" sx={{ fontWeight: "bold" }}>제목:</Typography>
                                <Typography>{selectedFile.title}</Typography>

                                <Typography variant="body1" sx={{ fontWeight: "bold", alignSelf: "start" }}>파일명:</Typography>
                                <List dense>
                                    {selectedFile.files.map((fileName, idx) => (
                                        // 각 파일명을 클릭하면 바로 다운로드 (새 탭)
                                        <ListItem
                                            key={idx} button
                                            sx={{
                                                cursor: "pointer"
                                            }}
                                            onClick={() => {
                                                // fileUrls 배열이 있을 경우 해당 파일 URL로 이동
                                                if (selectedFile.fileUrls && selectedFile.fileUrls[idx]) {
                                                    window.open(selectedFile.fileUrls[idx], '_blank');
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

                                <Typography variant="body1" sx={{ fontWeight: "bold" }}>업로더:</Typography>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Avatar src={selectedFile.avatar} sx={{ width: 28, height: 28 }} />
                                    <Typography>{selectedFile.uploader}</Typography>
                                </Box>

                                <Typography variant="body1" sx={{ fontWeight: "bold" }}>업로드 날짜:</Typography>
                                <Typography>{selectedFile.date}</Typography>

                                {/* 새로운 content 항목 추가 */}
                                <Typography variant="body1" sx={{ fontWeight: "bold", alignSelf: "start" }}>내용:</Typography>
                                <Typography>{selectedFile.content}</Typography>

                                <Typography variant="body1" sx={{ fontWeight: "bold", alignSelf: "start" }}>태그:</Typography>
                                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                    {selectedFile.tags.slice(0, 3).map((tag, idx) => (
                                        <Chip
                                            key={idx}
                                            label={tag}
                                            color={tagColors[tag] || "default"}
                                            sx={{ m: 0.5, width: 80, justifyContent: "center" }} // 칩 크기 고정
                                        />
                                    ))}
                                </Box>
                            </Box>

                        </Box>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button variant="contained" color="primary" onClick={() => setOpenDownloadDialog2(true)}>📥 파일 다운로드</Button>
                    <Button
                        variant="contained"
                        color="warning"
                        onClick={() => {
                            // 수정 버튼 클릭 시 workdata/update 페이지로 이동
                            navigate(`/workdata/update/${selectedFile.wsId}/${selectedFile.id}`); // ✅ 워크스페이스 ID와 자료 ID 전달
                        }}
                        disabled={selectedFile && selectedFile.writer !== currentUser} // 모달에서도 동일한 조건 적용
                    >
                        ✏️ 수정
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => modalhandleDelete(selectedFile)}
                        disabled={selectedFile && selectedFile.writer !== currentUser} // 모달에서도 동일한 조건 적용
                    >🗑️ 파일 삭제</Button>
                </DialogActions>
            </Dialog>

            {/* 다운로드 선택 모달 (점 3개 메뉴에서 호출) */}
            <Dialog
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
                                sx={{ cursor: "pointer" }}
                                onClick={() => {
                                    if (selectedFile.fileUrls && selectedFile.fileUrls[idx]) {
                                        window.open(selectedFile.fileUrls[idx], '_blank');
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
            </Dialog>

            {/* 다운로드 선택 모달 (옵션 2) */}
            <Dialog Dialog
                open={openDownloadDialog2}
                onClose={() => setOpenDownloadDialog2(false)}
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
        </>
    );
};

export default FileCardView;
