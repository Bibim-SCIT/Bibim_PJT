package net.scit.backend.workdata.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.workdata.dto.WorkdataDTO;
import net.scit.backend.workdata.service.WorkdataService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RestController
@RequestMapping("/workdata")
@RequiredArgsConstructor
@Slf4j
public class WorkdataController {

    private final WorkdataService workdataService;


    /**
     * 1. 자료글 전체 조회
     */
    @GetMapping("")
    public ResponseEntity<ResultDTO<List<WorkdataDTO>>> workdata() {
        ResultDTO<List<WorkdataDTO>> result = workdataService.workdata();
        return ResponseEntity.ok(result);
    }


    /**
     * 2. 자료글 개별 조회
     */
    @GetMapping("/detail")
    public ResponseEntity<ResultDTO<WorkdataDTO>> workdataDetail(@RequestParam Long wsId,
                                                                 @RequestParam Long dataNumber) {

        // 전체 조회에서 접속 시 상세 정보 반환
        ResultDTO<WorkdataDTO> result = workdataService.workdataDetail(wsId, dataNumber);
        return ResponseEntity.ok(result);
    }


    /**
     * 3. 자료글 등록
     */
    @PostMapping("/create")
    public ResponseEntity<ResultDTO<SuccessDTO>> workdataCreate(@RequestParam Long wsId,
                                                                @RequestBody WorkdataDTO workdataDTO,
                                                                @RequestHeader("userEmail") String userEmail) {

        // writer 값을 자동으로 설정 (현재 로그인한 사용자 정보)
        workdataDTO.setWriter(userEmail);  // 헤더에서 받아온 이메일을 writer로 설정

        // 서비스 호출
        ResultDTO<SuccessDTO> result = workdataService.workdataCreate(wsId, workdataDTO);
        return ResponseEntity.ok(result);
    }


    /**
     * 4. 자료실 삭제
     */
    @DeleteMapping("/delete")
    public ResultDTO<SuccessDTO> deleteWorkdata(@RequestParam Long wsId,
                                                @RequestParam Long dataNumber,
                                                @RequestBody DeleteRequestBody requestBody) {

        // 이메일 값을 RequestBody에서 받아서 서비스 메소드에 전달
        return workdataService.workdataDelete(wsId, dataNumber, requestBody.getUserName());
    }

    // 이메일을 RequestBody로 받을 때 사용하는 DTO 클래스
    public static class DeleteRequestBody {
        private String userName; // 이메일 주소

        public String getUserName() {
            return userName;
        }

        public void setUserName(String userName) {
            this.userName = userName;
        }
    }


    /**
     * 5. 자료글 수정
     */
    @PostMapping("/update")
    public ResponseEntity<ResultDTO<WorkdataDTO>> workdataUpdate(@RequestParam Long wsId,
                                                                 @RequestParam Long dataNumber,
                                                                 @RequestBody WorkdataDTO workdataDTO,
                                                                 @RequestHeader("userName") String userName) {

        // workdataDTO에 작성자(userName) 설정
        workdataDTO.setWriter(userName);

        // 서비스 호출
        ResultDTO<WorkdataDTO> result = workdataService.workdataUpdate(wsId, dataNumber, workdataDTO);
        return ResponseEntity.ok(result);
    }





}
