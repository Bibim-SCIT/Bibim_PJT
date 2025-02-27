import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Card, CardContent, Typography, Grid, Avatar, Chip, Box, IconButton, Menu, MenuItem, Dialog,
    DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemIcon, ListItemText
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MoreVertIcon from "@mui/icons-material/MoreVert";

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
    const navigate = useNavigate();

    // 점 3개 버튼 클릭 (메뉴 열기)
    const handleMenuOpen = (event, file) => {
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
    const handleDelete = () => {
        const confirmDelete1 = window.confirm(`해당 파일을(를) 정말 삭제하시겠습니까?`);
        if (confirmDelete1) {
            setFiles((prevFiles) => prevFiles.filter((file) => file.id !== selectedFile.id));
            handleMenuClose();
        }
    };

    // 파일 삭제 기능 (모달 상태)
    const modalhandleDelete = (file) => {
        const confirmDelete2 = window.confirm(`"${file.files[0]}"을(를) 정말 삭제하시겠습니까?`);
        if (confirmDelete2) {
            setFiles((prevFiles) => prevFiles.filter((f) => f.id !== file.id));
            setAnchorEl(null); // 메뉴 닫기
            setOpenModal(false); // 모달이 열려 있을 경우 닫기
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

    // ✅ 로딩 중일 때 표시
    if (loading) {
        return <Typography variant="h3" sx={{ p: 2, textAlign: "center" }}>⏳ 데이터 로딩 중...</Typography>;
    }

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
                                    justifyContent: "space-between"
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
                                        {file.tags.slice(0, 3).map((tag, idx) => (<Chip key={idx} label={tag} color={tagColors[tag] || "default"} sx={{ m: 0.5 }} />))}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>

            {/* 점 3개 버튼 메뉴 */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={() => alert("다운로드 기능")}>📥 다운로드</MenuItem>
                <MenuItem onClick={handleDelete}>🗑️ 삭제</MenuItem>
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
                            {/* 파일 아이콘 (첫 번째 파일 기준으로 보여줌) */}
                            <Box sx={{ textAlign: "center", marginBottom: 2 }}>
                                <img
                                    src={
                                        fileTypeIcons[selectedFile.files[0].split(".").pop().toLowerCase()] ||
                                        fileTypeIcons["default"]
                                    }
                                    alt={selectedFile.files[0]}
                                    style={{ width: 80, height: 80 }}
                                />
                            </Box>
                            {/* 항목별 2:10 Grid 레이아웃 적용 */}
                            <Box sx={{ display: "grid", gridTemplateColumns: "2fr 10fr", gap: 1, padding: 2, alignItems: "center" }}>
                                <Typography variant="body1" sx={{ fontWeight: "bold" }}>제목:</Typography>
                                <Typography>{selectedFile.title}</Typography>

                                <Typography variant="body1" sx={{ fontWeight: "bold", alignSelf: "start" }}>파일명:</Typography>
                                <List dense>
                                    {selectedFile.files.map((fileName, idx) => (
                                        <ListItem key={idx}>
                                            <ListItemIcon>
                                                <img
                                                    src={
                                                        fileTypeIcons[fileName.split(".").pop().toLowerCase()] ||
                                                        fileTypeIcons.default
                                                    }
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
                    <Button variant="contained" color="primary" onClick={() => alert("다운로드 기능")}>📥 파일 다운로드</Button>
                    <Button
                        variant="contained"
                        color="warning"
                        onClick={() => {
                            // 수정 버튼 클릭 시 workdata/update 페이지로 이동
                            navigate('/workdata/update');
                        }}
                    >
                        ✏️ 수정
                    </Button>
                    <Button variant="contained" color="error" onClick={() => modalhandleDelete(selectedFile)}>🗑️ 파일 삭제</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default FileCardView;
