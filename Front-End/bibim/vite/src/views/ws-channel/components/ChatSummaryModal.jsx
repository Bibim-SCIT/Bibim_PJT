import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    Typography,
    Box,
    Radio,
    FormControlLabel,
    RadioGroup,
    Avatar,
    Snackbar,
    Alert
} from '@mui/material';
import { summarizeChat, summarizeChatUpload } from '../../../api/channel';
import { translateText } from '../../../api/translate';

const ChatSummaryModal = ({ open, onClose, messages, wsId }) => {
    const [selectedStart, setSelectedStart] = useState(null);
    const [selectedEnd, setSelectedEnd] = useState(null);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [translating, setTranslating] = useState(false); // ✅ 번역 상태 추가
    const [translatedSummary, setTranslatedSummary] = useState(null); // ✅ 번역된 요약 저장
    const [selectedSummary, setSelectedSummary] = useState(null); // ✅ 선택된 요약본 저장
    const [snackbarOpen, setSnackbarOpen] = useState(false); // ✅ 스낵바 상태 추가

    // 유튜브 링크 자동 필터링
    const filteredMessages = messages.filter(msg => !msg.content.includes("www.youtube"));

    console.log("요약창 엽니다", messages);

    // ✅ 모달이 열릴 때 상태 초기화
    useEffect(() => {
        if (open) {
            setSelectedStart(null);
            setSelectedEnd(null);
            setSummary(null);
            setTranslatedSummary(null);
            setLoading(false);
            setTranslating(false);
            setSelectedSummary(null);
        }
    }, [open]);

    // 메시지 시작과 끝 범위를 선택하는 함수
    const handleSelectMessage = (index, type) => {
        if (type === 'start') {
            setSelectedStart(index);
            setSelectedEnd(null);
        } else if (type === 'end' && index >= selectedStart) {
            setSelectedEnd(index);
        }
    };

    /**
     * ✅ 요약 요청 함수
     * 선택된 채팅 메시지 범위를 API에 전송하여 요약을 요청
     */
    const handleSummarize = async () => {
        if (selectedStart === null || selectedEnd === null) return;
        setLoading(true);

        const chatHistory = filteredMessages
            .slice(selectedStart, selectedEnd + 1)
            .map(msg => `${msg.nickname} (${msg.sendTime})\n${msg.content}`)
            .join('\n');

        try {
            const response = await summarizeChat({ chatHistory });
            const originalSummary = response.data;
            const translated = await translateText(originalSummary, "ko");

            setSummary(originalSummary);
            setTranslatedSummary(translated);
            setSelectedSummary(originalSummary); // ✅ 기본값 설정
        } catch (error) {
            console.error('채팅 요약 오류:', error);
        } finally {
            setLoading(false);
        }
    };

    // 요약본 업로드 함수 (선택된 요약본 사용)
    const handleUploadSummary = async () => {
        if (!selectedSummary) return;
        try {
            await summarizeChatUpload({ summaryString: selectedSummary, wsId });

            // ✅ 스낵바 표시
            setSnackbarOpen(true);
            onClose(); // ✅ 모달 닫기
        } catch (error) {
            console.error('요약 업로드 오류:', error);
        }
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <DialogTitle>채팅 요약</DialogTitle>
                <DialogContent dividers>
                    {!summary ? (
                        <>
                            <Typography variant="subtitle1" sx={{ marginBottom: 2 }}>
                                요약할 메시지를 선택하세요. (시작 - 끝)
                            </Typography>
                            <List>
                                {filteredMessages.map((msg, index) => (
                                    <ListItem
                                        key={index}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            bgcolor: (index === selectedStart || index === selectedEnd) ? '#e3f2fd' : 'inherit',
                                            '&:hover': { bgcolor: '#bbdefb' },
                                            padding: "10px",
                                            borderRadius: "10px"
                                        }}
                                    >
                                        <Avatar src={msg.profileImage} sx={{ width: 32, height: 32, marginRight: 2 }}>
                                        {(msg.sender ?? "?").charAt(0)}
                                        </Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="body1" fontWeight="bold">
                                                {msg.nickname}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                {msg.content}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', flexShrink: 0 }}>
                                            <Button
                                                size="small"
                                                variant={index === selectedStart ? 'contained' : 'outlined'}
                                                color="primary"
                                                sx={{ marginRight: 1 }}
                                                onClick={() => handleSelectMessage(index, 'start')}
                                            >
                                                시작
                                            </Button>
                                            <Button
                                                size="small"
                                                variant={index === selectedEnd ? 'contained' : 'outlined'}
                                                color="secondary"
                                                disabled={selectedStart === null || index < selectedStart}
                                                onClick={() => handleSelectMessage(index, 'end')}
                                            >
                                                끝
                                            </Button>
                                        </Box>
                                    </ListItem>
                                ))}
                            </List>
                        </>
                    ) : (
                        <>
                            <Typography variant="h4" sx={{ mb: 2 }}>요약 미리보기</Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                * 요약본 저장을 누를 시 자료실에 저장됩니다.
                            </Typography>
                            <RadioGroup value={selectedSummary} onChange={(e) => setSelectedSummary(e.target.value)}>
                                <FormControlLabel
                                    value={summary}
                                    control={<Radio />}
                                    label={
                                        <Box sx={{ padding: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                                            <Typography variant="body1" fontWeight="bold">내 설정 언어로 요약된 채팅</Typography>
                                            <Typography sx={{ mt: 1 }}>{summary}</Typography>
                                        </Box>
                                    }
                                />
                                <FormControlLabel
                                    value={translatedSummary}
                                    control={<Radio />}
                                    label={
                                        <Box sx={{ padding: 2, bgcolor: '#e8f5e9', borderRadius: 2, mt: 3 }}>
                                            <Typography variant="body1" fontWeight="bold">한국어로 요약된 채팅</Typography>
                                            <Typography sx={{ mt: 1 }}>{translatedSummary}</Typography>
                                        </Box>
                                    }
                                />
                            </RadioGroup>
                        </>
                    )}
                </DialogContent>

                <DialogActions>
                    {!summary ? (
                        <Button
                            onClick={handleSummarize}
                            disabled={selectedStart === null || selectedEnd === null || loading}
                            variant="contained"
                            color="primary"
                            sx={{ backgroundColor: "#3F72AF" }}
                        >
                            {loading ? "요약 중..." : "요약 요청"}
                        </Button>
                    ) : (
                        <Button
                            onClick={handleUploadSummary}
                            variant="contained"
                            color="primary"
                            sx={{ backgroundColor: "#3F72AF" }}
                        >
                            요약본 저장
                        </Button>
                    )}
                    <Button onClick={onClose} color="error">
                        취소
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ✅ 스낵바 (Snackbar) 추가 */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity="success">
                    자료실에 요청하신 채팅 요약본이 저장되었습니다.
                </Alert>
            </Snackbar>
        </>
    );
};

export default ChatSummaryModal;
