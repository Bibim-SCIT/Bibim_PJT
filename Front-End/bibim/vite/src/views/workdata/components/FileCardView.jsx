import React, { useState } from "react";
import {
    Card, CardContent, Typography, Grid, Avatar, Chip, Box, IconButton, Menu, MenuItem, Dialog,
    DialogTitle, DialogContent, DialogActions, Button
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

const FileCardView = ({ files, setFiles }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [openModal, setOpenModal] = useState(false);

    // 점 3개 버튼 클릭 (메뉴 열기)
    const handleMenuOpen = (event, file) => {
        setAnchorEl(event.currentTarget);
        setSelectedFile(file);
    };

    // 메뉴 닫기
    const handleMenuClose = () => {
        setAnchorEl(null);
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
        const confirmDelete2 = window.confirm(`"${file.name}"을(를) 정말 삭제하시겠습니까?`);
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

    return (
        <>
            <Grid container spacing={2}>
                {files.map((file) => {
                    const fileExtension = file.name.split(".").pop().toLowerCase();
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
                                        {file.name}
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
                                        <Chip label={file.tag} color={tagColors[file.tag] || "default"} />
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
            <Dialog open={openModal} onClose={handleCloseModal}>
                <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    📁 파일 정보
                    <IconButton onClick={handleCloseModal}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {selectedFile && (
                        <Box>
                            {/* 파일 아이콘 */}
                            <Box sx={{ textAlign: "center", marginBottom: 2 }}>
                                <img
                                    src={fileTypeIcons[selectedFile.name.split(".").pop().toLowerCase()] || fileTypeIcons["default"]}
                                    alt={selectedFile.name}
                                    style={{ width: 80, height: 80 }}
                                />
                            </Box>
                            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 1, padding: 2 }}>
                                <Typography variant="body1" sx={{ fontWeight: "bold" }}>제목:</Typography>
                                <Typography>{selectedFile.title}</Typography>

                                <Typography variant="body1" sx={{ fontWeight: "bold" }}>파일명:</Typography>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <img
                                        src={fileTypeIcons[selectedFile.name.split(".").pop().toLowerCase()] || fileTypeIcons["default"]}
                                        alt={selectedFile.name}
                                        style={{ width: 25, height: 25 }}
                                    />
                                    <Typography>{selectedFile.name}</Typography>
                                </Box>
                                {/* <Typography>{selectedFile.name}</Typography> */}

                                <Typography variant="body1" sx={{ fontWeight: "bold" }}>업로더:</Typography>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Avatar src={selectedFile.avatar} sx={{ width: 28, height: 28 }} />
                                    <Typography>{selectedFile.uploader}</Typography>
                                </Box>

                                <Typography variant="body1" sx={{ fontWeight: "bold" }}>업로드 날짜:</Typography>
                                <Typography>{selectedFile.date}</Typography>

                                <Typography variant="body1" sx={{ fontWeight: "bold" }}>태그:</Typography>
                                <Chip label={selectedFile.tag} color={tagColors[selectedFile.tag] || "default"} />
                            </Box>

                        </Box>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button variant="contained" color="primary" onClick={() => alert("다운로드 기능")}>📥 파일 다운로드</Button>
                    <Button variant="contained" color="warning">✏️ 파일 수정</Button>
                    <Button variant="contained" color="error" onClick={() => modalhandleDelete(selectedFile)}>🗑️ 파일 삭제</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default FileCardView;
