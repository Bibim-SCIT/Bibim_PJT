import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography, Divider } from "@mui/material";
import { updateChannelName, deleteChannel } from "../../../api/channel";

function ChannelEditModal({ open, onClose, workspaceId, channelId, currentName, onUpdate, onDelete }) {
    const [newName, setNewName] = useState("");
    const [isChanging, setIsChanging] = useState(false); // ✅ 변경 진행 여부 상태 추가
    const [isDeleting, setIsDeleting] = useState(false); // ✅ 삭제 진행 여부 상태 추가
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false); // ✅ 삭제 확인 모달 상태 추가

    const handleSave = async () => {

        setIsChanging(true);
        try {
            await updateChannelName(workspaceId, channelId, newName);
            onUpdate(channelId, newName);

            onClose();
        } catch (error) {
            console.error("채널 수정 오류:", error);
        } finally {
            setIsChanging(false);
        }
    };

    // ✅ 채널 삭제
    // const handleDelete = async () => {
    //     const confirmDelete = window.confirm(`정말로 "${currentName}" 채널을 삭제하시겠습니까?`);
    //     if (!confirmDelete) return;

    //     setIsDeleting(true);
    //     try {
    //         await deleteChannel(workspaceId, channelId);
    //         onDelete(channelId); // ✅ 삭제 후 상태 업데이트
    //         onClose();
    //     } catch (error) {
    //         console.error("채널 삭제 오류:", error);
    //     } finally {
    //         setIsDeleting(false);
    //     }
    // };

    // ✅ 채널 삭제 확인 모달 열기
    const handleDeleteClick = () => {
        setDeleteConfirmOpen(true);
    };

    // ✅ 채널 삭제 처리
    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        setDeleteConfirmOpen(false);
        try {
            await deleteChannel(workspaceId, channelId);
            onDelete(channelId);
            onClose();
        } catch (error) {
            console.error("채널 삭제 오류:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <DialogTitle>채널 관리</DialogTitle>
                <DialogContent sx={{ padding: "20px" }}>
                    {/* ✅ 현재 채널 정보 표시 */}
                    <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold", color: "#1976d2" }}>
                        현재 채널: {currentName}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    {/* ✅ 채널 이름 변경 필드 */}
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        현재 채널 이름 변경
                    </Typography>
                    <TextField
                        fullWidth
                        label="새 채널 이름"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        sx={{ marginBottom: "16px" }}
                    />
                </DialogContent>
                <DialogActions sx={{ padding: "16px" }}>
                    <Button onClick={onClose} variant="outlined">취소</Button>
                    <Button onClick={handleSave} color="primary" variant="contained" disabled={isChanging}>
                        {isChanging ? "저장중..." : "저장"}
                    </Button>
                    <Button onClick={handleDeleteClick} color="error" variant="contained" disabled={isDeleting}>
                        {isDeleting ? "채널 삭제 중..." : "채널 삭제"}
                    </Button>
                </DialogActions>
            </Dialog>


            {/* ✅ 삭제 확인 모달 */}
            <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
                <DialogTitle>채널 삭제 확인</DialogTitle>
                <DialogContent>
                    <Typography>정말로 "{currentName}" 채널을 삭제하시겠습니까?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)} variant="outlined">아니오</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">예</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default ChannelEditModal;
