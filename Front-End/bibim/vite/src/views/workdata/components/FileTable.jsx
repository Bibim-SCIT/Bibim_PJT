import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Avatar, Chip } from "@mui/material";

const tagColors = {
    "문서": "primary",
    "디자인": "secondary"
};

const FileTable = ({ files, setFiles }) => {
    // 파일 삭제 기능
    const handleDelete = (id) => {
        setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
    };

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>파일명</TableCell>
                        <TableCell>태그</TableCell>
                        <TableCell>업로드 날짜</TableCell>
                        <TableCell>업로더</TableCell>
                        <TableCell>기능</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {files.map((file) => (
                        <TableRow key={file.id}>
                            <TableCell>{file.name}</TableCell>
                            <TableCell>
                                <Chip label={file.tag} color={tagColors[file.tag] || "default"} />
                            </TableCell>
                            <TableCell>{file.date}</TableCell>
                            <TableCell>
                                <Avatar src={file.avatar} sx={{ width: 24, height: 24, marginRight: 1 }} />
                                {file.uploader}
                            </TableCell>
                            <TableCell>
                                <Button variant="contained" size="small" color="success" sx={{ marginRight: 1 }}>
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
        </TableContainer>
    );
};

export default FileTable;
