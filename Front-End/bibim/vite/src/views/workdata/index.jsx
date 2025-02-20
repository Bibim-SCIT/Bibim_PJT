// material-ui
import { Typography, Button, Box, ToggleButton, ToggleButtonGroup } from "@mui/material";

// project imports
import MainCard from 'ui-component/cards/MainCard';

// components
import { useState } from "react";
import FileTable from "./components/FileTable";
import FileCardView from "./components/FileCardView";
import SearchBar from "./components/SearchBar";
import Filter from "./components/Filter";
import TableChartIcon from "@mui/icons-material/TableChart";
import ViewModuleIcon from "@mui/icons-material/ViewModule";

// 샘플 파일 데이터
const filesData = [
    { id: 1, name: "프로젝트 계획서.pdf", tag: "문서", date: "2025-02-19", uploader: "임성준", avatar: "/avatars/user1.png" },
    { id: 2, name: "디자인 시안.png", tag: "디자인", date: "2025-02-18", uploader: "김철수", avatar: "/avatars/user2.png" },
    { id: 3, name: "기술 문서.docx", tag: "문서", date: "2025-02-17", uploader: "박지수", avatar: "/avatars/user3.png" },
];

// ==============================|| 자료실 ||============================== //

export default function WorkDataPage() {
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

    return (
        <MainCard title="📂 자료실">
            {/* 🔄 상단: 토글 버튼 (우측) */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                <Typography variant="h6">파일을 검색하고 필터링하여 조회하세요.</Typography>
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
            </Box>

            {/* 🔍 검색 & 필터 */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                <Filter selectedTag={selectedTag} setSelectedTag={setSelectedTag} />
                <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            </Box>

            {/* 📌 테이블 뷰 vs 카드 뷰 전환 */}
            {viewMode === "table" ? (
                <FileTable files={filteredFiles} setFiles={setFiles} />
            ) : (
                <FileCardView files={filteredFiles} setFiles={setFiles} />
            )}
        </MainCard>
    );
}
