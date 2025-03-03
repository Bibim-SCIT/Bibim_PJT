import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getWorkdataDetail, getCurrentUser, updateWorkdata } from "../../api/workdata" // ✅ 기존 자료 불러오는 API 호출
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
    const { wsId, dataNumber } = useParams(); // ✅ URL에서 wsId와 dataNumber 가져오기

    // const currentUser = { id: 'user123', name: '임성준', avatar: CatImg };
    // ✅ currentUser를 API에서 가져오기
    const [currentUser, setCurrentUser] = useState(null);

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
    const [uploader, setUploader] = useState("");         // 작성자 이름
    const [uploaderAvatar, setUploaderAvatar] = useState(""); // 작성자 프로필 이미지
    const [uploadDate, setUploadDate] = useState("");     // 작성 날짜
    const [deletedTags, setDeletedTags] = useState([]); // 삭제된 태그 목록


    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getWorkdataDetail(wsId, dataNumber); // 백엔드 API 호출
                console.log("✅ 기존 데이터 불러옴:", data);

                setTitle(data.title);
                setContent(data.content);
                setTags(data.tags || []);
                setFileList(data.fileNames.map(name => ({ name }))); // 파일 리스트 변환

                // ✅ 작성자 정보 추가
                setUploader(data.nickname);          // 작성자 이름
                setUploaderAvatar(data.profileImage);      // 작성자 프로필 이미지
                setUploadDate(data.regDate.split("T")[0]); // 날짜 형식 정리

            } catch (error) {
                console.error("❌ 자료 상세 조회 실패:", error);
                alert("자료를 불러오는 데 실패했습니다.");
                navigate('/workdata'); // 오류 발생 시 목록 페이지로 이동
            }
        };

        fetchData();
    }, [wsId, dataNumber, navigate]);

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

    // const handleTagDelete = (tagToDelete) => {
    //     setTags((prev) => prev.filter((tag) => tag !== tagToDelete));
    //     setTagError('');
    // };

    const handleTagDelete = (tagToDelete) => {
        setTags((prev) => prev.filter((tag) => tag !== tagToDelete));

        // ✅ 기존에 존재하던 태그라면 삭제 목록에 추가
        if (prevTags.includes(tagToDelete)) {
            setDeletedTags((prev) => [...prev, tagToDelete]);
        }

        setTagError('');
    };


    // const handleUpdate = async () => {
    //     if (!title.trim() || !content.trim()) {
    //         alert("제목과 내용을 입력해주세요.");
    //         return;
    //     }

    //     const deleteFiles = []; // 삭제할 파일 목록 (추가 구현 필요)
    //     const tagRequests = tags.map(tag => ({ action: "ADD", tag })); // 태그 수정 형식 맞추기
    //     const newFiles = []; // 새로 추가할 파일 (추가 구현 필요)

    //     const formData = {
    //         wsId,
    //         dataNumber,
    //         title,
    //         content,
    //         deleteFiles,
    //         tagRequests,
    //         newFiles
    //     };

    //     try {
    //         const response = await updateWorkdata(
    //             wsId,
    //             dataNumber,
    //             title,
    //             content,
    //             deleteFiles,
    //             tagRequests,
    //             newFiles
    //         );

    //         console.log("✅ 수정 완료:", response);
    //         alert("자료가 성공적으로 수정되었습니다.");
    //         navigate(`/workdata`); // ✅ 수정 후 목록 페이지로 이동
    //     } catch (error) {
    //         console.error("❌ 자료 수정 실패:", error);
    //         alert("수정에 실패했습니다.");
    //     }
    // };

    const handleUpdate = async () => {
        if (!title.trim() || !content.trim()) {
            alert("제목과 내용을 입력해주세요.");
            return;
        }

        // 🛠️ 삭제된 파일 추적
        const initialFileNames = fileList.map(file => file.name); // 기존 파일 목록
        const deletedFiles = initialFileNames.filter(name => !fileList.some(file => file.name === name));

        // 🛠️ 새로 추가된 파일 추적
        const newFiles = fileList.filter(file => file instanceof File); // 새로 업로드된 파일만 추가


        try {
            // ✅ 기존 태그 목록을 `useState`에서 직접 가져옴 (불필요한 API 호출 제거)
            const prevTags = tags;

            // ✅ 태그 추가 및 삭제 목록 구분
            const newTags = tags.filter(tag => !prevTags.includes(tag));
            // const deletedTags = prevTags.filter(tag => !tags.includes(tag));

            console.log("🔵 기존 태그:", prevTags);
            console.log("🟢 추가된 태그:", newTags);
            console.log("🔴 삭제된 태그:", deletedTags);

            // ✅ API 요청 실행 (백엔드 요구 사항에 맞게 `deleteTags`와 `newTags` 분리)
            const response = await updateWorkdata(
                wsId,
                dataNumber,
                title,
                content,
                deletedFiles,  // 삭제할 파일
                deletedTags,   // 삭제할 태그 목록
                newTags,       // 추가할 태그 목록
                newFiles       // 추가할 파일 
            );

            console.log("✅ 수정 완료:", response);
            alert("자료가 성공적으로 수정되었습니다.");
            navigate(`/workdata`);
        } catch (error) {
            console.error("❌ 자료 수정 실패:", error);
            alert("수정에 실패했습니다.");
        }
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
                {/* <Grid item xs={10}>
                    {currentUser ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar src={currentUser.
                                profileImage || '/default-avatar.png'} sx={{ mr: 1 }} />
                            <Typography>{currentUser.name} ({currentUser.email})</Typography>
                        </Box>
                    ) : (
                        <Typography>로딩 중...</Typography>
                    )}
                </Grid> */}
                <Grid item xs={10}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {/* ✅ 작성자의 프로필 이미지 */}
                        <Avatar src={uploaderAvatar || '/default-avatar.png'} sx={{ mr: 1 }} />
                        <Typography>
                            {uploader}
                            {currentUser && (
                                <span style={{ color: "gray", fontSize: "0.9em" }}>
                                    {" "}(현재 로그인: {currentUser.name})
                                </span>
                            )}
                        </Typography>
                    </Box>
                </Grid>

                <Grid item xs={2}>
                    <Typography variant="subtitle1">작성 날짜</Typography>
                </Grid>
                <Grid item xs={10}>
                    <Typography>{uploadDate}</Typography>
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
