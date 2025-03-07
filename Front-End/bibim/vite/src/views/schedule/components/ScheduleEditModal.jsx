import React, { useState, useEffect } from "react";
import {
  Dialog,
  IconButton,
  Typography,
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/material/styles";
import { updateSchedule } from "../../../api/schedule"; // ✅ 수정 API
import { fetchLargeTags, fetchMediumTags, fetchSmallTags } from "../../../api/tag"; // ✅ 태그 API 호출

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: "12px",
    padding: "24px",
    maxWidth: "500px",
    width: "100%",
  },
}));

const ScheduleEditModal = ({ open, onClose, scheduleData, onUpdate }) => {
  const [formData, setFormData] = useState({
    scheduleTitle: "",
    scheduleContent: "",
    tag1: "",
    tag2: "",
    tag3: "",
    scheduleStatus: "",
    scheduleStartDate: "",
    scheduleFinishDate: "",
  });

  const [largeTags, setLargeTags] = useState([]);
  const [mediumTags, setMediumTags] = useState([]);
  const [smallTags, setSmallTags] = useState([]);

  useEffect(() => {
    if (scheduleData) {
      setFormData({
        scheduleTitle: scheduleData.scheduleTitle || "",
        scheduleContent: scheduleData.scheduleContent || "",
        tag1: scheduleData.tag1 || "",
        tag2: scheduleData.tag2 || "",
        tag3: scheduleData.tag3 || "",
        scheduleStatus: scheduleData.scheduleStatus || "unassigned",
        scheduleStartDate: scheduleData.scheduleStartDate?.split("T")[0] || "",
        scheduleFinishDate: scheduleData.scheduleFinishDate?.split("T")[0] || "",
      });

      const wsId = scheduleData.wsId;
      if (!wsId) return;

      // ✅ 대분류 태그 가져오기
      fetchLargeTags(wsId).then((tags) => {
        setLargeTags(tags);
        if (scheduleData.tag1) {
          const largeTag = tags.find((tag) => tag.tagName === scheduleData.tag1);
          if (largeTag) {
            fetchMediumTags(wsId, largeTag.largeTagNumber).then((medTags) => {
              setMediumTags(medTags);
              if (scheduleData.tag2) {
                const mediumTag = medTags.find((tag) => tag.tagName === scheduleData.tag2);
                if (mediumTag) {
                  fetchSmallTags(wsId, largeTag.largeTagNumber, mediumTag.mediumTagNumber).then(setSmallTags);
                }
              }
            });
          }
        }
      });
    }
  }, [scheduleData]);

  // ✅ 중분류 태그 변경 시 소분류 태그 업데이트
  useEffect(() => {
    if (formData.tag1 && formData.tag2) {
      const largeTag = largeTags.find(tag => tag.tagName === formData.tag1);
      const mediumTag = mediumTags.find(tag => tag.tagName === formData.tag2);

      if (largeTag && mediumTag) {
        fetchSmallTags(scheduleData.wsId, largeTag.largeTagNumber, mediumTag.mediumTagNumber).then(setSmallTags);
      }
    }
  }, [formData.tag1, formData.tag2, largeTags, mediumTags]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("📌 수정 요청 시작:", formData);

      const updatedData = {
        scheduleTitle: formData.scheduleTitle,
        scheduleContent: formData.scheduleContent,
        tag1: formData.tag1,
        tag2: formData.tag2,
        tag3: formData.tag3,
        scheduleStatus: formData.scheduleStatus,
        scheduleStartDate: formData.scheduleStartDate
          ? `${formData.scheduleStartDate}T00:00:00`
          : null,
        scheduleFinishDate: formData.scheduleFinishDate
          ? `${formData.scheduleFinishDate}T23:59:59`
          : null,
      };

      console.log("📌 스케줄 수정 요청 데이터:", updatedData);

      await updateSchedule(scheduleData.scheduleNumber, updatedData);

      console.log("✅ 스케줄 수정 성공");

      if (onUpdate) {
        onUpdate({ ...scheduleData, ...updatedData });
      }

      onClose();
    } catch (error) {
      console.error("❌ 스케줄 수정 실패:", error);
    }
  };

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="600">
          팀스케줄 수정
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <form onSubmit={handleSubmit}>
        {/* ✅ 제목 수정 */}
        <TextField
          fullWidth
          label="스케줄 제목*"
          value={formData.scheduleTitle}
          onChange={(e) => setFormData({ ...formData, scheduleTitle: e.target.value })}
          sx={{ mt: 2 }}
        />

        {/* ✅ 내용 수정 */}
        <TextField
          fullWidth
          label="스케줄 내용"
          multiline
          rows={4}
          value={formData.scheduleContent}
          onChange={(e) => setFormData({ ...formData, scheduleContent: e.target.value })}
          sx={{ mt: 2 }}
        />

        {/* ✅ 날짜 수정 */}
        <Typography sx={{ mt: 2, mb: 1 }}>날짜 설정*</Typography>
        <Box display="flex" gap={2}>
          <TextField
            type="date"
            value={formData.scheduleStartDate}
            onChange={(e) => setFormData({ ...formData, scheduleStartDate: e.target.value })}
            sx={{ flex: 1 }}
          />
          <Typography>~</Typography>
          <TextField
            type="date"
            value={formData.scheduleFinishDate}
            onChange={(e) => setFormData({ ...formData, scheduleFinishDate: e.target.value })}
            sx={{ flex: 1 }}
          />
        </Box>

        {/* ✅ 태그 수정 (대, 중, 소분류) */}
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>대분류*</InputLabel>
          <Select
            value={formData.tag1}
            onChange={(e) => setFormData({ ...formData, tag1: e.target.value })}
          >
            {largeTags.map((tag) => (
              <MenuItem key={tag.tagNumber} value={tag.tagName}>
                {tag.tagName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>중분류*</InputLabel>
          <Select
            value={formData.tag2}
            onChange={(e) => setFormData({ ...formData, tag2: e.target.value })}
            disabled={!formData.tag1}
          >
            {mediumTags.map((tag) => (
              <MenuItem key={tag.tagNumber} value={tag.tagName}>
                {tag.tagName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>소분류*</InputLabel>
          <Select
            value={formData.tag3}
            onChange={(e) => setFormData({ ...formData, tag3: e.target.value })}
            disabled={!formData.tag2}
          >
            {smallTags.map((tag) => (
              <MenuItem key={tag.tagNumber} value={tag.tagName}>
                {tag.tagName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button type="submit" variant="contained" sx={{ mt: 3, bgcolor: "#7C3AED" }}>
          수정하기
        </Button>
      </form>
    </StyledDialog>
  );
};

export default ScheduleEditModal;
