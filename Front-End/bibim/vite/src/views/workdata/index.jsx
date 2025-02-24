// material-ui
import { Typography, Box, ToggleButton, ToggleButtonGroup, Button } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

// project imports
import MainCard from "ui-component/cards/MainCard";

// React Router 추가
import { useNavigate } from "react-router-dom";

// components
import { useState } from "react";
import FileTable from "./components/FileTable";
import FileCardView from "./components/FileCardView";
import SearchBar from "./components/SearchBar";
import Filter from "./components/Filter";
import TableChartIcon from "@mui/icons-material/TableChart";
import ViewModuleIcon from "@mui/icons-material/ViewModule";

// 프로필 이미지 임시 데이터
import CatImg from "assets/images/cat_profile.jpg";

// 샘플 파일 데이터
const filesData = [
    { id: 1, title: "프로젝트 계획서", name: "프로젝트 계획서.pdf", tag: "문서", date: "2025-02-19", uploader: "임성준", avatar: CatImg },
    { id: 2, title: "2025년 디자인 시안", name: "디자인 시안.png", tag: "디자인", date: "2025-02-18", uploader: "김철수", avatar: "/avatars/user2.png" },
    { id: 3, title: "기술 정리입니다", name: "기술 문서.docx", tag: "문서", date: "2025-02-17", uploader: "박지수", avatar: "/avatars/user3.png" },
    { id: 4, title: "여러분들이 봐야할 자료", name: "완전잼따.txt", tag: "문서", date: "2025-02-17", uploader: "협업 전문가", avatar: "/avatars/user3.png" },
    { id: 5, title: "노미카이 때의 사진", name: "회식 250220.jpg", tag: "사진", date: "2025-02-20", uploader: "설진환", avatar: CatImg },
    { id: 6, title: "DB ERD에 대한 설명 파일", name: "ERD 설명.md", tag: "문서", date: "2025-02-17", uploader: "성경진", avatar: "/avatars/user5.png" },
    { id: 7, title: "Github push 방법에 대한 분석", name: "Github 안날려먹기.ppt", tag: "문서", date: "2025-01-08", uploader: "박경남", avatar: "/avatars/user6.png" },
    { id: 8, title: "bibim Figma작업 사진", name: "250215 Figma.jpg", tag: "사진", date: "2025-02-15", uploader: "김세빈", avatar: "/avatars/user7.png" },
    { id: 9, title: "250220 전체공정도", name: "bibim 공정도 정리.xlsx", tag: "문서", date: "2025-02-28", uploader: "박상준", avatar: CatImg },
    { id: 10, title: "겁나긴제목테스트테스트겁나긴제목테스트테스트겁나긴제목테스트테스트", name: "트롤링 방법 정리트롤링트롤링트롤링트롤링.xlsx", tag: "문서", date: "2025-03-01", uploader: "트롤러", avatar: CatImg },
];

// ==============================|| 자료실 ||============================== //

export default function WorkDataPage() {
    const navigate = useNavigate(); // ✅ useNavigate 훅 사용
    const [files, setFiles] = useState(filesData);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTag, setSelectedTag] = useState("전체");
    const [viewMode, setViewMode] = useState("table"); // "table" or "card"

    // 🔍 파일 검색 및 필터링
    const filteredFiles = files.filter(
        (file) =>
            file.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            (selectedTag === "전체" || file.tag === selectedTag)
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

            {/* 📌 테이블 뷰 vs 카드 뷰 전환 */}
            {viewMode === "table" ? (
                <FileTable files={filteredFiles} setFiles={setFiles} />
            ) : (
                <FileCardView files={filteredFiles} setFiles={setFiles} />
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
