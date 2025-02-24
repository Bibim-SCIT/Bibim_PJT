import React, { useState } from "react";
import {
    Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Button, Avatar, Chip, Box, Dialog,
    DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemIcon, ListItemText
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

const tagColors = {
    "문서": "primary",
    "디자인": "secondary"
};

const FileTable = ({ files, setFiles }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [openModal, setOpenModal] = useState(false);

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
    const handleDelete = (id) => {
        const confirmDelete1 = window.confirm(`해당 파일을(를) 정말 삭제하시겠습니까?`);
        if (confirmDelete1) {
            setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));

            // 🛠️ 현재 삭제한 파일이 selectedFile이면 초기화하고 모달 닫기
            if (selectedFile && selectedFile.id === id) {
                setSelectedFile(null);
                setOpenModal(false);
            }
        }
    };

    // 파일 삭제 기능 (모달 상태)
    const modalhandleDelete = (file) => {
        const confirmDelete2 = window.confirm(`"${file.name}"을(를) 정말 삭제하시겠습니까?`);
        if (confirmDelete2) {
            setFiles((prevFiles) => prevFiles.filter((f) => f.id !== file.id));
            setOpenModal(false); // 모달이 열려 있을 경우 닫기
            setSelectedFile(null); // 🛠️ 삭제 후 selectedFile 초기화
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
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>제목</TableCell>
                            <TableCell>파일명</TableCell>
                            <TableCell>태그</TableCell>
                            <TableCell>업로드 날짜</TableCell>
                            <TableCell>업로더</TableCell>
                            <TableCell>기능</TableCell>
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
                                    onClick={() => handleOpenModal(file)}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                                                maxWidth: 200  // 🔹 최대 너비 설정
                                            }}
                                        >
                                            {/* {truncateFileName(file.name, 12)} 🔥 파일명 줄이기 함수 적용 */}
                                            {file.files.length > 1 ? `${truncateFileName(file.files[0], 10)} 외 ${file.files.length - 1}개` : truncateFileName(file.files[0], 15)}
                                        </Typography>
                                    </Box>
                                </TableCell>

                                {/* 태그 */}
                                <TableCell>
                                    {file.tags.slice(0, 3).map((tag, idx) => (
                                        <Chip key={idx} label={tag} color={tagColors[tag] || "default"} sx={{ m: 0.5 }} />
                                    ))}
                                </TableCell>


                                {/* 업로드 날짜 */}
                                <TableCell>{file.date}</TableCell>

                                {/* 업로더 */}
                                <TableCell>
                                    {/* 👤 업로더 정렬 (Avatar + 이름 수평 정렬) */}
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Avatar src={file.avatar} sx={{ width: 32, height: 32 }} />
                                        <Typography variant="body2">{file.uploader}</Typography>
                                    </Box>
                                </TableCell>

                                {/* 기능 */}
                                <TableCell>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        color="info"
                                        sx={{ marginRight: 1 }}
                                        onClick={() => alert("다운로드 기능")}
                                    >
                                        다운로드
                                    </Button>
                                    <Button variant="contained" size="small" color="error" onClick={() => handleDelete(file.id)}>
                                        삭제
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer >

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
                    <Button variant="contained" color="warning">✏️ 수정</Button>
                    <Button variant="contained" color="error" onClick={() => modalhandleDelete(selectedFile)}>🗑️ 파일 삭제</Button>
                </DialogActions>
            </Dialog >

        </>
    );
};

export default FileTable;
