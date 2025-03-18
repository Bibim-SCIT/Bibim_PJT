// material-ui
import { Typography, Box, ToggleButton, ToggleButtonGroup, Button } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

// project imports
import MainCard from "ui-component/cards/MainCard";

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

    return (
        <MainCard title="📂 자료실">
            {/* 🔄 상단: 뷰 전환 토글 & 파일 업로드 버튼 */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                <Typography variant="h5">파일을 검색하고 필터링하여 조회하세요.</Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                    <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        onChange={(event, newMode) => {
                            if (newMode !== null) setViewMode(newMode);
                        }}
                        aria-label="view mode toggle"
                    >
                        <ToggleButton value="table" aria-label="table view">
                            <TableChartIcon sx={{ marginRight: 1 }} /> 테이블 보기
                        </ToggleButton>
                        <ToggleButton value="card" aria-label="card view">
                            <ViewModuleIcon sx={{ marginRight: 1 }} /> 카드 보기
                        </ToggleButton>
                    </ToggleButtonGroup>

                    {/* 📤 파일 업로드 버튼 */}
                    <Button variant="contained" color="primary" startIcon={<CloudUploadIcon />} onClick={handleUpload}>
                        파일 업로드
                    </Button>
                </Box>
            </Box>

            {/* 🔍 검색 & 필터 (자연스럽게 배치) */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                <Box sx={{ flexGrow: 1, maxWidth: "200px" }}>
                    <Filter selectedTag={selectedTag} setSelectedTag={setSelectedTag} tags={tags} />
                </Box>
                <Box sx={{ flexGrow: 2, maxWidth: "400px", display: "flex", justifyContent: "flex-end" }}>
                    <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                </Box>
            </Box>

            {/* 🔄 테이블 뷰 vs 카드 뷰 전환 */}
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


            {/* 📤 아래 있는 파일 업로드 버튼 */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    margin: 2
                }}
            >
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<CloudUploadIcon />}
                    onClick={handleUpload}
                >
                    파일 업로드
                </Button>
            </Box>
        </MainCard>
    );
}
