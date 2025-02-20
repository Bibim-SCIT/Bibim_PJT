import React from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

const Filter = ({ selectedTag, setSelectedTag }) => {
    return (
        <FormControl fullWidth sx={{ marginBottom: 2 }}>
            <InputLabel>태그 필터</InputLabel>
            <Select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)}>
                <MenuItem value="전체">전체</MenuItem>
                <MenuItem value="문서">문서</MenuItem>
                <MenuItem value="디자인">디자인</MenuItem>
            </Select>
        </FormControl>
    );
};

export default Filter;
