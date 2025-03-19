import React from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

const Filter = ({ selectedTag, setSelectedTag, tags }) => {
    return (
        <FormControl
            fullWidth
            variant="outlined"
            sx={{ marginBottom: 2 }}
        >
            <InputLabel shrink>태그 필터</InputLabel>
            <Select
                value={selectedTag}
                onChange={(event) => setSelectedTag(event.target.value)}
            >
                {tags.map((tag) => (
                    <MenuItem key={tag} value={tag}>{tag}</MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default Filter;
