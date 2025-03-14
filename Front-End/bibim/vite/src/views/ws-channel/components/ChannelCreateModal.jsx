import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from "@mui/material";
import { createChannel } from "../../../api/channel";
import { useSelector } from 'react-redux';

function ChannelCreateModal({ open, onClose, workspaceId, onChannelCreated }) {
    const activeWorkspace = useSelector((state) => state.workspace.activeWorkspace); // ✅ Redux에서 현재 워크스페이스
    console.log("몇번", activeWorkspace)
    const WSID = activeWorkspace.wsId;

    const [channelName, setChannelName] = useState("");


    const handleCreate = async () => {
        if (!channelName.trim()) return;
        try {
            console.log("생성할 웤스번호", WSID);
            const newChannel = await createChannel(WSID, channelName);

            if (!newChannel || !newChannel.channelId) {
                throw new Error("채널 생성 실패: 유효한 채널 ID가 없습니다.");
            }

            console.log("새로운 채널 생성 완료:", newChannel);

            onChannelCreated(newChannel.channelId, newChannel.channelName);

            // ✅ 모달 닫기 전에 상태 초기화
            setChannelName("");
            onClose();
        } catch (error) {
            console.error("채널 생성 오류:", error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>새 채널 생성</DialogTitle>
            <DialogContent sx={{ padding: "20px" }}>
                <TextField
                    fullWidth
                    label="채널 이름"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    sx={{ marginBottom: "16px" }}
                />
            </DialogContent>
            <DialogActions sx={{ padding: "16px" }}>
                <Button onClick={onClose} variant="outlined">취소</Button>
                <Button onClick={handleCreate} color="primary" variant="contained">생성</Button>
            </DialogActions>
        </Dialog>
    );
}

export default ChannelCreateModal;
