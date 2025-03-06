import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Button, Avatar, Chip, Box, Dialog,
    DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemIcon, ListItemText
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

const FileTable = ({ files, setFiles, sortField, sortOrder, onSort, loading }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [openDownloadDialog, setOpenDownloadDialog] = useState(false); // 다운로드 선택 모달 state
    const [openDownloadDialog2, setOpenDownloadDialog2] = useState(false); // 테이블뷰의 기능 컬럼 다운로드 모달
    const [downloadFile, setDownloadFile] = useState(null); // 테이블뷰에서 다운로드할 파일 정보
    const { user } = useContext(ConfigContext); // ✅ Context에서 로그인 유저 정보 가져오기
    const navigate = useNavigate();

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
    const handleDownload = (url, fileName) => {
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };



    console.log("📌 선택된 파일 정보:", selectedFile);

    return (
        <>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell onClick={() => onSort("title")} sx={{ cursor: "pointer" }}>
                                제목 {sortField === "title" && (sortOrder === "asc" ? "⬆️" : "⬇️")}
                            </TableCell>
                            <TableCell>파일명</TableCell>
                            <TableCell>태그</TableCell>
                            <TableCell onClick={() => onSort("regDate")} sx={{ cursor: "pointer" }}>
                                업로드 날짜 {sortField === "regDate" && (sortOrder === "asc" ? "⬆️" : "⬇️")}
                            </TableCell>
                            <TableCell onClick={() => onSort("writer")} sx={{ cursor: "pointer" }}>
                                업로더 {sortField === "writer" && (sortOrder === "asc" ? "⬆️" : "⬇️")}
                            </TableCell>
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
                                    {/* 테이블뷰의 다운로드 버튼: 해당 파일 정보를 downloadFile 상태에 저장 */}
                                    <Button
                                        variant="contained"
                                        size="small"
                                        color="info"
                                        sx={{ marginRight: 1 }}
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
                    {/* 파일 다운로드 버튼: 클릭 시 별도의 다운로드 선택 모달을 엽니다 */}
                    <Button variant="contained" color="primary" onClick={() => setOpenDownloadDialog(true)}>📥 파일 다운로드</Button>
                    <Button
                        variant="contained"
                        color="warning"
                        onClick={() => {
                            // 수정 버튼 클릭 시 workdata/update 페이지로 이동
                            navigate(`/workdata/update/${selectedFile.wsId}/${selectedFile.id}`); // ✅ 워크스페이스 ID와 자료 ID 전달
                        }}
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
            </Dialog >

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
