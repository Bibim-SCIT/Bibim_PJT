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
import { getWorkdataList } from '../../api/workdata'; // ✅ 전체 조회 API import

// ==============================|| 자료실 ||============================== //

export default function WorkDataPage() {
    const navigate = useNavigate(); // ✅ useNavigate 훅 사용
    const activeWorkspace = useSelector((state) => state.workspace.activeWorkspace); // ✅ Redux에서 현재 워크스페이스
    // const [files, setFiles] = useState(filesData);
    const [files, setFiles] = useState([]); // ✅ 초기 데이터를 빈 배열로 설정
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTag, setSelectedTag] = useState("전체");
    const [viewMode, setViewMode] = useState("table"); // "table" or "card"
    const [loading, setLoading] = useState(true);  // ✅ 로딩 상태 추가

    // ✅ 전체 조회 API 호출
    // ✅ 처음 API 요청할 때만 실행 (정렬할 때는 새로 요청하지 않음)
    useEffect(() => {
        const fetchWorkdata = async () => {
            try {
                setLoading(true);  // ✅ API 요청 시작 전에 로딩 상태 true
                const wsId = activeWorkspace.wsId;
                console.log("📌 현재 등록할 워크스페이스 번호:", wsId);
                console.log("📌 현재 등록할 워크스페이스 이름 등 정보:", activeWorkspace);
                const data = await getWorkdataList(wsId, "regDate", "desc"); // ✅ 최초 한 번만 가져오기
                console.log("📌 불러온 자료 목록:", data);

                if (Array.isArray(data)) {
                    const formattedData = data.map((item) => ({
                        id: item.dataNumber,
                        title: item.title,
                        files: item.fileNames || ["파일 없음"],
                        tags: item.tags || [],
                        date: item.regDate.split("T")[0],
                        uploader: item.nickname,
                        avatar: item.profileImage || "/avatars/default.png",
                        wsId: activeWorkspace?.wsId  // ✅ 워크스페이스 ID 추가
                    }));
                    setFiles(formattedData);
                } else {
                    console.error("❌ API에서 받은 데이터가 배열이 아님:", data);
                    setFiles([]);
                }
            } catch (error) {
                console.error("❌ 자료 목록 조회 실패:", error);
                setFiles([]);
            } finally {
                setLoading(false);  // ✅ 데이터 로딩 완료 후 로딩 상태 false
            }
        };

        fetchWorkdata();
    }, []);  // ✅ 최초 한 번만 실행 (정렬할 때는 재요청 안 함)

    // ✅ 정렬 함수 (프론트에서 정렬)
    const [sortField, setSortField] = useState("regDate");
    const [sortOrder, setSortOrder] = useState("desc");

    const handleSort = (field) => {
        setSortField(field);
        setSortOrder(prevOrder => (prevOrder === "asc" ? "desc" : "asc"));
    };

    // ✅ 클라이언트 측에서 정렬 수행
    const sortedFiles = useMemo(() => {
        return [...files].sort((a, b) => {
            if (sortField === "title" || sortField === "uploader") {
                return sortOrder === "asc"
                    ? a[sortField].localeCompare(b[sortField])
                    : b[sortField].localeCompare(a[sortField]);
            }
            if (sortField === "date") {
                // ✅ "YYYY-MM-DD" -> Date 객체 변환하여 비교
                const [yearA, monthA, dayA] = a.date.split("-").map(Number);
                const [yearB, monthB, dayB] = b.date.split("-").map(Number);
                const dateA = new Date(yearA, monthA - 1, dayA);
                const dateB = new Date(yearB, monthB - 1, dayB);

                return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
            }
            return 0;
        });
    }, [files, sortField, sortOrder]);  // ✅ files가 변경될 때만 정렬 실행



    // 🔍 파일 검색 및 필터링
    // const filteredFiles = files.filter(
    //     (file) =>
    //         file.files.some(f => f.toLowerCase().includes(searchQuery.toLowerCase())) &&
    //         (selectedTag === "전체" || file.tags.includes(selectedTag))
    // );
    const filteredFiles = files.filter(
        (file) =>
            (file.files || []).some(f => f.toLowerCase().includes(searchQuery.toLowerCase())) &&
            (selectedTag === "전체" || file.tags?.includes(selectedTag))
    );



    // 📤 파일 업로드 버튼 클릭 시 /workdata/create로 이동
    const handleUpload = () => {
        navigate("/workdata/create"); // ✅ 파일 업로드 페이지로 이동
    };

    return (
        <MainCard title="📂 자료실">
            {/* 🔄 상단: 뷰 전환 토글 & 파일 업로드 버튼 */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                <Typography variant="h6">파일을 검색하고 필터링하여 조회하세요.</Typography>
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
                    <Filter selectedTag={selectedTag} setSelectedTag={setSelectedTag} />
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
