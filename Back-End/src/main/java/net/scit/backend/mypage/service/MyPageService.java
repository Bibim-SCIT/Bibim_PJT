package net.scit.backend.mypage.service;

import net.scit.backend.common.ResultDTO;
import net.scit.backend.mypage.dto.MyScheduleDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface MyPageService {
    ResultDTO<List<MyScheduleDTO>> getSchedule();
}
