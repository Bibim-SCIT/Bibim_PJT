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
import { getWorkdataList, getWorkdataDetail, searchWorkdata } from '../../api/workdata'; // ✅ 전체 조회 API import

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

    console.log("현재 JWT 토큰:", localStorage.getItem("token")); // ✅ auth.js에서 저장한 토큰 키 사용

    // ✅ 정렬 함수 (프론트에서 정렬)
    const [sortField, setSortField] = useState("regDate");
    const [sortOrder, setSortOrder] = useState("desc");

    // ✅ 전체 조회 API 호출
    // ✅ 처음 API 요청할 때만 실행 (정렬할 때는 새로 요청하지 않음)
    // useEffect(() => {
    //     const fetchWorkdata = async () => {
    //         try {
    //             setLoading(true);
    //             const wsId = activeWorkspace.wsId;
    //             console.log("📌 현재 등록할 워크스페이스 번호:", wsId);
    //             console.log("📌 현재 등록할 워크스페이스 이름 등 정보:", activeWorkspace);
    //             // 전체 목록 조회
    //             const listData = await getWorkdataList(wsId, "regDate", "desc");
    //             console.log("📌 불러온 자료 목록:", listData);

    //             if (Array.isArray(listData)) {
    //                 // 각 항목마다 상세 조회 API 호출 (content 포함)
    //                 const detailedData = await Promise.all(
    //                     listData.map(async (item) => {
    //                         try {
    //                             const detail = await getWorkdataDetail(wsId, item.dataNumber);
    //                             console.log("📌 불러온 자료 상세:", detail);
    //                             return {
    //                                 ...item, content: detail.content, fileNames2: detail.fileNames, fileUrls: detail.fileUrls
    //                             };
    //                         } catch (error) {
    //                             console.error("상세 조회 실패:", item.dataNumber, error);
    //                             return { ...item, content: "" }; // 실패 시 빈 문자열
    //                         }
    //                     })
    //                 );

    //                 const formattedData = detailedData.map((item) => ({
    //                     id: item.dataNumber,
    //                     title: item.title,
    //                     files: item.fileNames2 || ["파일 없음"],
    //                     tags: item.tags || [],
    //                     date: item.regDate.split("T")[0],
    //                     uploader: item.nickname,
    //                     writer: item.writer,
    //                     avatar: item.profileImage || "/avatars/default.png",
    //                     wsId: activeWorkspace.wsId,
    //                     content: item.content,
    //                     fileUrls: item.fileUrls
    //                 }));
    //                 setFiles(formattedData);
    //             } else {
    //                 console.error("❌ API에서 받은 데이터가 배열이 아님:", listData);
    //                 setFiles([]);
    //             }
    //         } catch (error) {
    //             console.error("❌ 자료 목록 조회 실패:", error);
    //             setFiles([]);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchWorkdata();
    // }, [activeWorkspace]);

    // API 호출 함수: 검색어 여부에 따라 전체 목록 또는 검색 결과를 받아오고, 각 항목에 대해 상세 조회 호출
    const fetchData = async () => {
        try {
            setLoading(true);
            const wsId = activeWorkspace.wsId;
            let listData;
            if (searchQuery.trim() === "") {
                // 검색어가 없으면 전체 자료 조회
                listData = await getWorkdataList(wsId, sortField, sortOrder);
                console.log("검색어 X", listData);
            } else {
                // 검색어가 있으면 검색 API 호출
                let temp;
                temp = await searchWorkdata(wsId, searchQuery, sortField, sortOrder);
                listData = temp.data;
                console.log("검색어 O", listData);
            }

            if (Array.isArray(listData)) {
                // 각 항목에 대해 상세 조회 API 호출
                const detailedData = await Promise.all(
                    listData.map(async (item) => {
                        try {
                            const detail = await getWorkdataDetail(wsId, item.dataNumber);
                            return {
                                ...item,
                                content: detail.content,
                                fileNames2: detail.fileNames,
                                fileUrls: detail.fileUrls
                            };
                        } catch (error) {
                            console.error("상세 조회 실패:", item.dataNumber, error);
                            return { ...item, content: "" };
                        }
                    })
                );

                // 화면 구성을 위한 데이터 포맷팅
                const formattedData = detailedData.map((item) => ({
                    id: item.dataNumber,
                    title: item.title,
                    files: item.fileNames2 || ["파일 없음"],
                    date: item.regDate.split("T")[0],
                    uploader: item.nickname,
                    writer: item.writer,
                    avatar: item.profileImage || "/avatars/default.png",
                    wsId: wsId,
                    content: item.content,
                    fileUrls: item.fileUrls,
                    tags: item.tags || []
                }));
                setFiles(formattedData);
            } else {
                console.error("API로부터 받은 데이터가 배열이 아님:", listData);
                // console.log("검색확인", listData.data);
                setFiles([]);
            }
        } catch (error) {
            console.error("자료 조회 실패:", error);
            setFiles([]);
        } finally {
            setLoading(false);
        }
    };

    // 검색어, 정렬, 워크스페이스 변경 시 debounce 적용
    useEffect(() => {
        const debounceTimeout = setTimeout(() => {
            fetchData();
        }, 300); // 300ms 지연
        return () => clearTimeout(debounceTimeout);
    }, [activeWorkspace, searchQuery, sortField, sortOrder]);


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
    // const filteredFiles = files.filter(
    //     (file) =>
    //         (file.files || []).some(f => f.toLowerCase().includes(searchQuery.toLowerCase())) &&
    //         (selectedTag === "전체" || file.tags?.includes(selectedTag))
    // );

    // 태그 필터링: API 검색 결과에는 태그 필터링이 적용되어 있지 않다면 클라이언트에서 추가 필터링
    const filteredFiles = files.filter(file =>
        selectedTag === "전체" || (file.tags && file.tags.includes(selectedTag))
    );

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
