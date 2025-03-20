import { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, Typography, TextField, Button, Avatar, Chip, Stack, Grid, Paper, IconButton, List, ListItem, ListItemIcon, ListItemText, Alert } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import MainCard from 'ui-component/cards/MainCard';
// 상단 import 부분에 추가
import UploadStatusModal from './components/UploadStatusModal';
// api import
import { createWorkdata, getCurrentUser } from '../../api/workdata';
import { getWorkspaceMemberInfo } from '../../api/auth';
import { ConfigContext } from '../../contexts/ConfigContext';

// 프로필 이미지 임시 데이터
import CatImg from 'assets/images/cat_profile.jpg';

// 파일 아이콘
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import TableChartIcon from '@mui/icons-material/TableChart';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'; // default


export default function WdCreatePage() {
    const navigate = useNavigate();
    const { user } = useContext(ConfigContext); // ✅ Context에서 로그인 유저 정보 가져오기
    const activeWorkspace = useSelector((state) => state.workspace.activeWorkspace); // ✅ Redux에서 현재 워크스페이스
    console.log("지금", activeWorkspace)

    // ✅ currentUser를 API에서 가져오기
    const [currentUser, setCurrentUser] = useState(null);
    const [currentWSUser, setCurrentWSUser] = useState(null);

    // 컴포넌트 내 state 추가
    const [modalOpen, setModalOpen] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('loading'); // 'loading' 또는 'success'
    const [modalMessage, setModalMessage] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await getCurrentUser();
                setCurrentUser(userData);
            } catch (error) {
                console.error("사용자 정보를 불러오는 데 실패했습니다:", error);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        const fetchWSUser = async () => {
            try {
                const userData2 = await getWorkspaceMemberInfo(activeWorkspace.wsId);
                setCurrentWSUser(userData2);
                console.log("사용자 웤스 정보", userData2);
            } catch (error) {
                console.error("사용자 정보를 불러오는 데 실패했습니다:", error);
            }
        };
        fetchWSUser();
    }, []);

    // 파일 아이콘 
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

    const handleUpload = async () => {
        if (!title.trim() || !content.trim()) {
            alert('제목과 설명을 입력해주세요.');
            return;
        }
        if (!user) {
            alert('로그인 후 이용해주세요.');
            return;
        }

        if (!currentUser) {
            alert('사용자 정보를 불러오는 중입니다.');
            return;
        }
        if (!activeWorkspace) {
            alert('워크스페이스를 선택해주세요.');
            return;
        }

        // 나중에 해당 아이디가 워크스페이스 있는지 확인 
        const wsId = activeWorkspace.wsId; // ✅ 이 값이 실제 워크스페이스 ID와 일치하는지 확인 필요

        // 모달을 즉시 열고 로딩 상태로 표시
        setModalMessage('등록중입니다...');
        setUploadStatus('loading');
        setModalOpen(true);

        try {
            // console.log("🟢 업로드 요청 데이터:", { wsId, title, content, tags, fileList });
            // const response = await createWorkdata(wsId, title, content, fileList, tags);
            // alert(response.message);
            // navigate('/workdata'); // 성공 시 목록 페이지로 이동
            console.log("🟢 업로드 요청 데이터:", { wsId, title, content, tags, fileList });
            const response = await createWorkdata(wsId, title, content, fileList, tags);
            setUploadStatus('success');
            setModalMessage(response.message);
        } catch (error) {
            alert(`업로드 실패: ${error}`);
            setModalOpen(false);
        }
    };

    // 모달에서 확인 버튼 클릭 시 동작
    const handleModalConfirm = () => {
        setModalOpen(false);
        navigate('/workdata');
    };



    return (
        <MainCard title="자료실 글 작성">
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                새로운 자료를 자료실에 등록합니다.
            </Typography>

            <Grid container spacing={2} alignItems="center" mb={3}>
                <Grid item xs={2}>
                    <Typography variant="subtitle1">제목</Typography>
                </Grid>
                <Grid item xs={10}>
                    <TextField fullWidth value={title} onChange={(e) => setTitle(e.target.value)} placeholder="자료의 제목을 입력하세요." />
                </Grid>

                <Grid item xs={2}>
                    <Typography variant="subtitle1">작성자</Typography>
                </Grid>
                <Grid item xs={10}>
                    {currentWSUser ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar src={currentWSUser.
                                profileImage
                                || '/default-avatar.png'} sx={{ mr: 1 }} />
                            <Typography>
                                {currentWSUser.nickname}
                                <span style={{ color: "gray", fontSize: "0.9em" }}>
                                    {" "}(현재 로그인: {currentUser.name})
                                </span>
                            </Typography>
                        </Box>
                    ) : (
                        <Typography>로딩 중...</Typography>
                    )}
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
                                            <ListItemIcon>
                                                {icon}
                                            </ListItemIcon>
                                            <ListItemText primary={file.name} />
                                        </ListItem>
                                    );
                                })}
                            </List>

                        </Paper>
                        <Button
                            variant="outlined"
                            color="secondary"
                            startIcon={<CloudUploadIcon />}
                            onClick={() => fileInputRef.current.click()}
                            sx={{ ml: 2 }}
                            disabled={fileList.length >= 10} // 🔥 10개 이상이면 비활성화
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
                    {/* 🔥 추가된 안내문구 */}
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
                <Button variant="contained" color="secondary" onClick={handleUpload}>
                    업로드
                </Button>
                <Button variant="outlined" color="secondary" onClick={() => navigate('/workdata')}>
                    취소
                </Button>
            </Stack>

            {/* 성공 모달 추가 */}
            <UploadStatusModal
                open={modalOpen}
                status={uploadStatus}
                message={modalMessage}
                onConfirm={handleModalConfirm}
            />
        </MainCard>
    );
}
