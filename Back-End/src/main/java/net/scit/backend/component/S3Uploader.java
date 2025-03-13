package net.scit.backend.component;

import com.amazonaws.AmazonServiceException;
import com.amazonaws.SdkClientException;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.*;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.UUID;
import net.scit.backend.exception.CustomException;
import net.scit.backend.exception.ErrorCode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Component
public class S3Uploader {

    private final AmazonS3 amazonS3;
    private final String bucket;

    public S3Uploader(AmazonS3 amazonS3, @Value("${spring.cloud.s3.bucket}") String bucket) {
        this.amazonS3 = amazonS3;
        this.bucket = bucket;
    }

    /**
     * 파일을 S3에 업로드하고 업로드된 파일의 URL 반환
     * @param file 업로드할 파일
     * @param dirName 업로드할 디렉토리 이름
     * @return 업로드된 파일의 URL
     * @throws IOException 파일 처리 오류 발생 시
     */
    public String upload(MultipartFile file, String dirName) throws IOException {
        String fileName = createFileName(dirName, file);
        ObjectMetadata metadata = createMetadata(file);

        try {
            // S3에 파일 업로드
            amazonS3.putObject(new PutObjectRequest(bucket, fileName, file.getInputStream(), metadata)
                    .withCannedAcl(CannedAccessControlList.PublicRead));
            // 업로드된 파일의 URL 반환
            return amazonS3.getUrl(bucket, fileName).toString();
        } catch (Exception e) {
            // 업로드 중 오류 발생 시 사용자 정의 예외 던짐
            throw new CustomException(ErrorCode.FAILED_IMAGE_SAVE);
        }
    }

    /**
     * 파일 삭제
     * @param fileName 삭제할 파일 이름
     */
    public void deleteFile(String fileName) {
        try {
            amazonS3.deleteObject(new DeleteObjectRequest(bucket, fileName));
        } catch (AmazonServiceException e) {
            handleAmazonServiceException(e); // AWS 서비스 예외 처리
        } catch (SdkClientException e) {
            throw new CustomException(ErrorCode.IMAGE_EXCEPTION); // SDK 예외 처리
        } catch (Exception e) {
            throw new CustomException(ErrorCode.IMAGE_EXCEPTION); // 기타 예외 처리
        }
    }

    /**
     * 파일 다운로드
     * @param fileUrl 다운로드할 파일의 URL
     * @return S3Object
     */
    public S3Object download(String fileUrl) {
        String key = extractS3KeyFromUrl(fileUrl);

        try {
            return amazonS3.getObject(new GetObjectRequest(bucket, key));
        } catch (AmazonServiceException e) {
            throw new CustomException(ErrorCode.IMAGE_NOT_FOUND); // S3 내 파일 없음
        } catch (SdkClientException e) {
            throw new CustomException(ErrorCode.IMAGE_ACCESS_DENIED); // 접근 권한 문제
        }
    }

    // ----------- Helper Methods -----------

    /**
     * S3 키 생성 (디렉토리 이름 + UUID + 확장자)
     * @param dirName 디렉토리 이름
     * @param file 파일 객체
     * @return 생성된 파일 이름
     */
    private String createFileName(String dirName, MultipartFile file) {
        String fileExtension = StringUtils.getFilenameExtension(file.getOriginalFilename());
        return dirName + "/" + UUID.randomUUID() + "." + fileExtension;
    }

    /**
     * ObjectMetadata 생성
     * @param file 파일 객체
     * @return 생성된 ObjectMetadata
     */
    private ObjectMetadata createMetadata(MultipartFile file) {
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(file.getSize());
        metadata.setContentType(file.getContentType());
        return metadata;
    }

    /**
     * fileUrl에서 S3 키 추출
     * @param fileUrl 파일 URL
     * @return S3 키
     */
    private String extractS3KeyFromUrl(String fileUrl) {
        try {
            URL url = new URL(fileUrl);
            return url.getPath().substring(1); // 맨 앞의 '/' 제거
        } catch (MalformedURLException e) {
            throw new CustomException(ErrorCode.IMAGE_EXCEPTION); // URL 형식 오류
        }
    }

    /**
     * AmazonServiceException 처리
     * @param e AmazonServiceException
     */
    private void handleAmazonServiceException(AmazonServiceException e) {
        switch (e.getStatusCode()) {
            case 403:
                throw new CustomException(ErrorCode.IMAGE_ACCESS_DENIED);
            case 404:
                throw new CustomException(ErrorCode.IMAGE_NOT_FOUND);
            case 400:
                throw new CustomException(ErrorCode.IMAGE_NOT_HAVE_PATH);
            default:
                throw new CustomException(ErrorCode.IMAGE_INTERNAL_SERVER_ERROR);
        }
    }
}