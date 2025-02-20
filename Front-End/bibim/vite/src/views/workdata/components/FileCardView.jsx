import React from "react";
import { Card, CardContent, Typography, Button, Grid, Avatar, Chip } from "@mui/material";

const tagColors = {
    "문서": "primary",
    "디자인": "secondary"
};

const FileCardView = ({ files, setFiles }) => {
    // 파일 삭제 기능
    const handleDelete = (id) => {
        setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
    };

    return (
        <Grid container spacing={2}>
            {files.map((file) => (
                <Grid item xs={12} sm={6} md={4} key={file.id}>
                    <Card sx={{ minWidth: 275, padding: 2 }}>
                        <CardContent>
                            <Typography variant="h6">{file.name}</Typography>
                            <Chip label={file.tag} color={tagColors[file.tag] || "default"} sx={{ marginBottom: 1 }} />
                            <Typography variant="body2">업로드 날짜: {file.date}</Typography>
                            <Typography variant="body2">
                                <Avatar src={file.avatar} sx={{ width: 24, height: 24, marginRight: 1 }} />
                                {file.uploader}
                            </Typography>
                            <Button variant="contained" color="success" sx={{ marginTop: 1, marginRight: 1 }}>
                                다운로드
                            </Button>
                            <Button variant="contained" color="error" sx={{ marginTop: 1 }} onClick={() => handleDelete(file.id)}>
                                삭제
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default FileCardView;
