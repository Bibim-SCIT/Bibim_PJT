/* eslint-disable prettier/prettier */
import { useState, useEffect, useContext } from "react";
import { Grid, List, ListItem, ListItemText, Card, CardContent, Typography, Box, Divider } from "@mui/material";
import MainCard from "ui-component/cards/MainCard";
import ChatComponent from "./ChatComponent"; // ✅ 1:1 채팅창 컴포넌트
import { ConfigContext } from "contexts/ConfigContext"; // ✅ 유저 정보 가져오기
import { getWorkspaceMembers } from "../../api/workspaceApi"; // ✅ API 호출
import axios from "axios";

export default function DmPage() {
    const { user } = useContext(ConfigContext);
    const [dmList, setDmList] = useState([]); // ✅ 기존 DM 목록
    const [users, setUsers] = useState([]); // ✅ 워크스페이스 사용자 목록
    const [selectedUser, setSelectedUser] = useState(null); // ✅ 선택된 상대방
    const [wsId, setWsId] = useState(9); // ✅ 기본 워크스페이스 ID (테스트용)

    // ✅ 기존 DM 목록 가져오기
    useEffect(() => {
        axios
            .get(`/api/chat/recent?wsId=${wsId}&user=${user.email}`)
            .then((res) => setDmList(res.data || [])) // ✅ 응답이 null일 경우 빈 배열 설정
            .catch(console.error);
    }, [wsId]);

    // ✅ 워크스페이스 내 사용자 목록 가져오기
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const members = await getWorkspaceMembers(wsId);
                console.log("✅ 워크스페이스 사용자 목록:", members);
                setUsers(members || []);
            } catch (error) {
                console.error("🚨 워크스페이스 사용자 목록 불러오기 실패:", error);
            }
        };
        fetchUsers();
    }, [wsId]);

    // ✅ 사용자 목록과 DM 목록을 통합하여 하나의 리스트 생성
    const mergedList = users
        .filter((u) => u.email !== user.email) // ✅ 본인 제외
        .map((userItem) => {
            // ✅ 해당 유저가 기존 DM이 있는지 확인
            const existingDm = dmList.find((dm) => dm.receiver === userItem.email);
            return {
                ...userItem,
                unreadCount: existingDm ? existingDm.unreadCount : 0, // ✅ 기존 DM이 있으면 unreadCount 유지
            };
        });

    return (
        <MainCard title="디엠 페이지">
            <Grid container spacing={2}>
                {/* ✅ 왼쪽: DM + 워크스페이스 유저 목록 통합 */}
                <Grid item xs={4}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="h6">대화 목록</Typography>
                            <Divider />
                            <List>
                                {mergedList.length === 0 ? (
                                    <Typography variant="body2">대화할 수 있는 사람이 없습니다.</Typography>
                                ) : (
                                    mergedList.map((u, i) => (
                                        <ListItem
                                            key={i}
                                            button
                                            onClick={() => setSelectedUser(u.email)}
                                            sx={{ backgroundColor: selectedUser === u.email ? "#f0f0f0" : "inherit" }}
                                        >
                                            <ListItemText primary={u.nickname} secondary={u.email} />
                                            {u.unreadCount > 0 && (
                                                <Typography variant="caption" color="error">
                                                    🔴 {u.unreadCount}
                                                </Typography>
                                            )}
                                        </ListItem>
                                    ))
                                )}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* ✅ 오른쪽: 선택된 사용자와의 DM 창 */}
                <Grid item xs={8}>
                    {selectedUser ? (
                        <ChatComponent wsId={wsId} receiverId={selectedUser} />
                    ) : (
                        <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                            <Typography variant="body1">대화할 상대를 선택하세요.</Typography>
                        </Box>
                    )}
                </Grid>
            </Grid>
        </MainCard>
    );
}
