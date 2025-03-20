// material-ui
import { Typography, Box, ToggleButton, ToggleButtonGroup, Button, Paper, InputBase, Divider, useTheme, useMediaQuery, Chip, Fade, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";

// project imports
import MainCard from "ui-component/cards/MainCard";
import MainCard4 from "ui-component/cards/MainCard4";

// React Router 추가
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';

// components
import { useState, useEffect, useMemo } from "react";
import FileTable from "./components/FileTable";
import FileCardView from "./components/FileCardView";
import SearchBar from "./components/SearchBar";
import Filter from "./components/Filter";
import TableChartIcon from "@mui/icons-material/TableChart";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import { getWorkdataList, getWorkdataDetail, searchWorkdata, getAllTags } from '../../api/workdata'; // ✅ 전체 조회 API import

// ==============================|| 자료실 ||============================== //

export default function WorkDataPage() {
    const navigate = useNavigate(); // ✅ useNavigate 훅 사용
    const activeWorkspace = useSelector((state) => state.workspace.activeWorkspace); // ✅ Redux에서 현재 워크스페이스
    // const [files, setFiles] = useState(filesData);
    const [files, setFiles] = useState([]); // ✅ 초기 데이터를 빈 배열로 설정
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState("table"); // "table" or "card"
    const [loading, setLoading] = useState(true);  // ✅ 로딩 상태 추가
    const [tags, setTags] = useState(["전체"]); // 기본 태그 옵션
    const [selectedTag, setSelectedTag] = useState("전체");
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    console.log("현재 JWT 토큰:", localStorage.getItem("token")); // ✅ auth.js에서 저장한 토큰 키 사용

    // ✅ 정렬 함수 (프론트에서 정렬)
    const [sortField, setSortField] = useState("regDate");
    const [sortOrder, setSortOrder] = useState("desc");

    // API 호출 함수: 검색어 여부에 따라 전체 목록 또는 검색 결과를 받아오고, 각 항목에 대해 상세 조회 호출
    const fetchData = async () => {
        try {
            setLoading(true);
            const wsId = activeWorkspace.wsId;
            let listData;

            if (searchQuery.trim() === "") {
                // ✅ 태그 필터가 '전체'가 아닐 경우 서버에서 태그 필터링 적용
                listData = await getWorkdataList(wsId, sortField, sortOrder, selectedTag !== "전체" ? selectedTag : null);
            } else {
                let temp;
                temp = await searchWorkdata(wsId, searchQuery, sortField, sortOrder, selectedTag !== "전체" ? selectedTag : null);
                listData = temp.data;
                console.log("검색어 및 태그 O", listData);
            }

            if (Array.isArray(listData)) {
                // ✅ 상세 조회 없이 바로 리스트 저장
                const formattedData = listData.map((item) => ({
                    id: item.dataNumber,
                    title: item.title,
                    files: item.fileNames || ["파일 없음"],
                    date: item.regDate.split("T")[0],
                    uploader: item.nickname,
                    writer: item.writer,
                    avatar: item.profileImage || "/avatars/default.png",
                    wsId: wsId,
                    content: item.content,   // 🔥 상세조회 없이 바로 content 사용
                    fileUrls: item.fileUrls,
                    tags: item.tags || []
                }));
                setFiles(formattedData);
            } else {
                console.error("API로부터 받은 데이터가 배열이 아님:", listData);
                setFiles([]);
            }
        } catch (error) {
            console.error("자료 조회 실패:", error);
            setFiles([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchTags = async () => {
            if (!activeWorkspace) return;
            try {
                const wsId = activeWorkspace.wsId;
                const tagList = await getAllTags(wsId);
                setTags(["전체", ...tagList]); // "전체" 옵션 추가
            } catch (error) {
                console.error("태그 불러오기 실패:", error);
            }
        };

        fetchTags();
    }, [activeWorkspace]);

    // 검색어, 정렬, 워크스페이스 변경 시 debounce 적용
    useEffect(() => {
        const debounceTimeout = setTimeout(() => {
            fetchData();
        }, 300); // 300ms 지연
        return () => clearTimeout(debounceTimeout);
    }, [activeWorkspace, searchQuery, sortField, sortOrder, selectedTag]);


    const handleSort = (field) => {
        setSortField(field);
        setSortOrder(prevOrder => (prevOrder === "asc" ? "desc" : "asc"));
    };

    // 태그 필터링: API 검색 결과에는 태그 필터링이 적용되어 있지 않다면 클라이언트에서 추가 필터링
    const filteredFiles = useMemo(() => {
        return files.filter(file =>
            selectedTag === "전체" || (file.tags && file.tags.includes(selectedTag))
        );
    }, [files, selectedTag]); // ✅ selectedTag 변경될 때마다 실행

    // ✅ 클라이언트 측에서 정렬 수행
    const sortedFiles = useMemo(() => {
        return [...filteredFiles].sort((a, b) => { // ✅ filteredFiles 기반으로 정렬
            if (sortField === "title" || sortField === "uploader") {
                return sortOrder === "asc"
                    ? a[sortField].localeCompare(b[sortField])
                    : b[sortField].localeCompare(a[sortField]);
            }
            if (sortField === "date") {
                const [yearA, monthA, dayA] = a.date.split("-").map(Number);
                const [yearB, monthB, dayB] = b.date.split("-").map(Number);
                const dateA = new Date(yearA, monthA - 1, dayA);
                const dateB = new Date(yearB, monthB - 1, dayB);

                return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
            }
            return 0;
        });
    }, [filteredFiles, sortField, sortOrder]); // ✅ filteredFiles가 변경될 때 정렬

    // 정렬은 API에서 처리하거나, 클라이언트 단에서 추가 정렬할 수도 있음.
    // 여기서는 API에서 정렬을 처리한다고 가정

    // 📤 파일 업로드 버튼 클릭 시 /workdata/create로 이동
    const handleUpload = () => {
        navigate("/workdata/create"); // ✅ 파일 업로드 페이지로 이동
    };

    // 검색창 직접 구현
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    return (
        <MainCard4 title="의 자료실" wsname={activeWorkspace?.wsName}>
            {/* 헤더 영역: 설명 텍스트와 간략한 안내 */}
            <Fade in={true} timeout={800}>
                <Box sx={{
                    mb: 4,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: '#F8FAFF',
                    border: '1px solid #E3F2FD'
                }}>
                    <Typography variant="body1" color="text.primary">
                        📂 워크스페이스의 공유 자료를 검색하고 관리하세요. 파일을 업로드하거나 다운로드할 수 있습니다.
                    </Typography>
                </Box>
            </Fade>

            {/* 검색 및 필터링 영역 */}
            <Box
                sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 2,
                    justifyContent: "space-between",
                    mb: 3,
                    alignItems: "center"
                }}
            >
                {/* 왼쪽: 태그 필터와 검색바 (순서 변경) */}
                <Box sx={{
                    display: 'flex',
                    gap: 2,
                    alignItems: 'center',
                    flexBasis: { xs: '100%', md: '50%' },
                    maxWidth: { xs: '100%', md: '50%' }
                }}>
                    {/* 태그 선택기를 먼저 배치 */}
                    <FormControl
                        variant="outlined"
                        size="small"
                        sx={{
                            width: { xs: '40%', sm: '30%' },
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                bgcolor: '#fff'
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                                transition: 'border-color 0.3s'
                            },
                            '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#3F72AF !important',
                                borderWidth: '2px'
                            }
                        }}
                    >
                        <InputLabel>태그</InputLabel>
                        <Select
                            value={selectedTag}
                            onChange={(e) => setSelectedTag(e.target.value)}
                            label="태그"
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        maxHeight: 300,
                                    },
                                },
                            }}
                        >
                            {tags.map((tag) => (
                                <MenuItem key={tag} value={tag}>
                                    {tag === "전체" ? "전체 태그" : tag}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* 검색창을 두 번째로 배치 */}
                    <Paper
                        elevation={0}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: '4px 12px',
                            borderRadius: 2,
                            width: { xs: '60%', sm: '70%' },
                            border: '2px solid rgba(0, 0, 0, 0.23)',
                            bgcolor: '#fff',
                            transition: 'border-color 0.3s',
                            '&:focus-within': {
                                borderColor: '#3F72AF'
                            }
                        }}
                    >
                        <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                        <InputBase
                            placeholder="파일 검색..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            sx={{ ml: 1, flex: 1 }}
                        />
                    </Paper>
                </Box>

                {/* 오른쪽: 뷰 모드 토글과 업로드 버튼 */}
                <Box
                    sx={{
                        display: "flex",
                        gap: 2,
                        alignItems: "center",
                        flexBasis: { xs: '100%', md: 'auto' },
                        justifyContent: { xs: 'space-between', md: 'flex-end' }
                    }}
                >
                    <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        size="small"
                        onChange={(event, newMode) => {
                            if (newMode !== null) setViewMode(newMode);
                        }}
                        aria-label="view mode toggle"
                        sx={{
                            '& .MuiToggleButton-root': {
                                borderColor: '#e0e0e0',
                                color: '#757575',
                                '&.Mui-selected': {
                                    backgroundColor: '#3F72AF',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: '#2E5A88',
                                    }
                                }
                            }
                        }}
                    >
                        <ToggleButton value="table" aria-label="table view">
                            <TableChartIcon sx={{ mr: { xs: 0, sm: 0.5 } }} />
                            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>테이블 보기</Box>
                        </ToggleButton>
                        <ToggleButton value="card" aria-label="card view">
                            <ViewModuleIcon sx={{ mr: { xs: 0, sm: 0.5 } }} />
                            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>카드 보기</Box>
                        </ToggleButton>
                    </ToggleButtonGroup>

                    {/* 📤 파일 업로드 버튼 */}
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<CloudUploadIcon />}
                        onClick={handleUpload}
                        sx={{
                            bgcolor: '#3F72AF',
                            '&:hover': { bgcolor: '#2E5A88' },
                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        파일 업로드
                    </Button>
                </Box>
            </Box>

            {/* 파일 목록 표시 영역 */}
            <Box sx={{ mb: 3, minHeight: 400 }}>
                <Fade in={true} timeout={500}>
                    <Box>
                        {viewMode === "table" ? (
                            <FileTable
                                files={sortedFiles}
                                setFiles={setFiles}
                                sortField={sortField}
                                sortOrder={sortOrder}
                                onSort={handleSort}
                                loading={loading}  // ✅ 로딩 상태 전달
                            />
                        ) : (
                            <FileCardView files={sortedFiles} setFiles={setFiles} loading={loading} />
                        )}
                    </Box>
                </Fade>
            </Box>

            {/* 하단 영역: 추가 정보 또는 업로드 버튼 */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    mt: 2,
                    pt: 3,
                    borderTop: '1px solid #eaeaea'
                }}
            >
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<CloudUploadIcon />}
                    onClick={handleUpload}
                    sx={{
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        bgcolor: '#3F72AF',
                        '&:hover': { bgcolor: '#2E5A88' },
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}
                >
                    새 파일 업로드하기
                </Button>
            </Box>
        </MainCard4>
    );
}
