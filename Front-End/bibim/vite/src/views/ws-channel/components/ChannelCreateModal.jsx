import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from "@mui/material";
import { createChannel } from "../../../api/channel";
import { useSelector } from 'react-redux';

function ChannelCreateModal({ open, onClose, workspaceId, onChannelCreated }) {
    const activeWorkspace = useSelector((state) => state.workspace.activeWorkspace); // ✅ Redux에서 현재 워크스페이스
    console.log("몇번", activeWorkspace)
    const WSID = activeWorkspace.wsId;

    const [channelName, setChannelName] = useState("");
    const [isCreating, setIsCreating] = useState(false); // ✅ 생성 중 상태 추가

    const handleCreate = async () => {
        // if (!channelName.trim()) return;
        if (!channelName.trim() || isCreating) return; // ✅ 이미 생성 중이면 실행 방지

        setIsCreating(true); // ✅ 생성 시작
        try {
            console.log("생성할 웤스번호", WSID);
            const newChannel = await createChannel(WSID, channelName);
            console.log("확인하기", newChannel);

            if (!newChannel) {
                throw new Error("채널 생성 실패: 유효한 채널 ID가 없습니다.");
            }

            console.log("새로운 채널 생성 완료:", newChannel);

            // ✅ 채널 생성 후 부모 컴포넌트에서 상태 업데이트
            onChannelCreated(newChannel.channelId, newChannel.channelName);

            // ✅ 모달 닫기 전에 입력 필드 초기화
            setTimeout(() => {
                setChannelName("");
                onClose();
            }, 200);
        } catch (error) {
            console.error("채널 생성 오류:", error);
        } finally {
            setIsCreating(false); // ✅ 생성 완료 후 버튼 활성화
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
                    disabled={isCreating} // ✅ 입력창 비활성화 (생성 중일 때)
                    sx={{ marginBottom: "16px" }}
                />
            </DialogContent>
            <DialogActions sx={{ padding: "16px" }}>
                <Button onClick={onClose} variant="outlined">취소</Button>
                <Button onClick={handleCreate} color="primary" variant="contained" disabled={isCreating}>
                    {isCreating ? "생성 중..." : "생성"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ChannelCreateModal;
