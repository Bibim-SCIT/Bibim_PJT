import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    TextField,
    Button,
    Avatar,
    Chip,
    Stack,
    Grid,
    Paper,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Alert
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import MainCard from 'ui-component/cards/MainCard';

// 프로필 이미지 임시 데이터
import CatImg from 'assets/images/cat_profile.jpg';

// 파일 아이콘
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import TableChartIcon from '@mui/icons-material/TableChart';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

export default function WdUpdatePage() {
    const navigate = useNavigate();

    const currentUser = { id: 'user123', name: '임성준', avatar: CatImg };

    // 파일 아이콘 매핑
    const fileTypeIcons = {
        pdf: <PictureAsPdfIcon color="error" />,
        jpg: <ImageIcon color="info" />,
        jpeg: <ImageIcon color="info" />,
        png: <ImageIcon color="info" />,
        docx: <DescriptionIcon color="primary" />,
        doc: <DescriptionIcon color="primary" />,
        xlsx: <TableChartIcon color="success" />,
        pptx: <SlideshowIcon color="warning" />,
        ppt: <SlideshowIcon color="warning" />,
        default: <InsertDriveFileIcon />,
    };

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [tagError, setTagError] = useState('');
    const [fileList, setFileList] = useState([]);

    const fileInputRef = useRef(null);

    // 컴포넌트가 마운트되면 더미 데이터로 초기 상태를 설정합니다.
    useEffect(() => {
        const dummyData = {
            title: '더미 자료 제목',
            content: '이것은 더미 데이터로 불러온 자료 내용입니다.',
            tags: ['더미태그1', '더미태그2'],
            fileList: [
                { name: 'example.pdf' },
                { name: 'image.png' }
            ]
        };

        setTitle(dummyData.title);
        setContent(dummyData.content);
        setTags(dummyData.tags);
        setFileList(dummyData.fileList);
    }, []);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);

        if (fileList.length + files.length > 10) {
            alert('파일은 최대 10개까지 업로드 가능합니다.');
            return;
        }

        const existingFileNames = fileList.map((file) => file.name);
        const duplicateFiles = files.filter((file) => existingFileNames.includes(file.name));

        if (duplicateFiles.length > 0) {
            alert(`"${duplicateFiles[0].name}" 파일은 이미 추가되어 있습니다.`);
            return;
        }

        setFileList((prev) => [...prev, ...files]);
    };

    const handleRemoveFile = (index) => {
        setFileList((prev) => prev.filter((_, idx) => idx !== index));
    };

    const handleTagInput = (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            const newTag = tagInput.replace('#', '').trim();

            if (tags.length >= 3) {
                setTagError('태그는 최대 3개까지 작성 가능합니다.');
                return;
            }

            if (tags.includes(newTag)) {
                setTagError('해당 태그는 이미 있습니다.');
                setTagInput('');
                return;
            }

            if (newTag) {
                setTags((prev) => [...prev, newTag]);
                setTagInput('');
                setTagError('');
            }
        }
    };

    const handleTagDelete = (tagToDelete) => {
        setTags((prev) => prev.filter((tag) => tag !== tagToDelete));
        setTagError('');
    };

    const handleUpdate = () => {
        alert(`수정 제목: ${title}, 설명: ${content}, 태그: ${tags.join(', ')}, 파일 수: ${fileList.length}`);
        navigate('/workdata');
    };

    return (
        <MainCard title="자료실 글 수정">
            <Grid container spacing={2} alignItems="center" mb={3}>
                <Grid item xs={2}>
                    <Typography variant="subtitle1">제목</Typography>
                </Grid>
                <Grid item xs={10}>
                    <TextField
                        fullWidth
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="자료의 제목을 입력하세요."
                    />
                </Grid>

                <Grid item xs={2}>
                    <Typography variant="subtitle1">작성자</Typography>
                </Grid>
                <Grid item xs={10}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar src={currentUser.avatar} sx={{ mr: 1 }} />
                        <Typography>{currentUser.name} ({currentUser.id})</Typography>
                    </Box>
                </Grid>

                <Grid item xs={2}>
                    <Typography variant="subtitle1">파일 첨부</Typography>
                </Grid>
                <Grid item xs={10}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Paper variant="outlined" sx={{ flexGrow: 1, p: 1, minHeight: '100px' }}>
                            <List>
                                {fileList.map((file, idx) => {
                                    const fileExtension = file.name.split('.').pop().toLowerCase();
                                    const icon = fileTypeIcons[fileExtension] || fileTypeIcons.default;
                                    return (
                                        <ListItem key={idx} secondaryAction={
                                            <IconButton edge="end" onClick={() => handleRemoveFile(idx)}>
                                                <CloseIcon />
                                            </IconButton>
                                        }>
                                            <ListItemIcon>{icon}</ListItemIcon>
                                            <ListItemText primary={file.name} />
                                        </ListItem>
                                    );
                                })}
                            </List>
                        </Paper>
                        <Button
                            variant="outlined"
                            startIcon={<CloudUploadIcon />}
                            onClick={() => fileInputRef.current.click()}
                            sx={{ ml: 2 }}
                            disabled={fileList.length >= 10}
                        >
                            업로드
                        </Button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            multiple
                            onChange={handleFileChange}
                        />
                    </Box>
                    <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="textSecondary">
                            파일은 최대 10개까지 업로드 가능합니다.
                        </Typography>
                    </Box>
                </Grid>

                <Grid item xs={2}>
                    <Typography variant="subtitle1">자료 설명</Typography>
                </Grid>
                <Grid item xs={10}>
                    <TextField
                        fullWidth
                        multiline
                        rows={5}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="자료에 대한 부연 설명을 입력하세요."
                    />
                </Grid>

                <Grid item xs={2}>
                    <Typography variant="subtitle1">태그</Typography>
                </Grid>
                <Grid item xs={10}>
                    <TextField
                        fullWidth
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagInput}
                        placeholder="#태그명 입력 후 엔터 또는 띄어쓰기"
                    />
                    {tagError && <Alert severity="warning" sx={{ mt: 1 }}>{tagError}</Alert>}
                    <Box sx={{ mt: 1 }}>
                        {tags.map((tag, idx) => (
                            <Chip key={idx} label={tag} onDelete={() => handleTagDelete(tag)} sx={{ m: 0.5 }} />
                        ))}
                    </Box>
                </Grid>
            </Grid>

            <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button variant="contained" color="primary" onClick={handleUpdate}>
                    수정 완료
                </Button>
                <Button variant="outlined" onClick={() => navigate('/workdata')}>
                    취소
                </Button>
            </Stack>
        </MainCard>
    );
}
