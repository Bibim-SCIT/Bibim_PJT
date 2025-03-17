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

    private final AmazonS3 amazonS3; // AWS S3 클라이언트 객체
    private final String bucket; // 업로드 대상 S3 버킷 이름

    public S3Uploader(AmazonS3 amazonS3, @Value("${spring.cloud.s3.bucket}") String bucket) {
        this.amazonS3 = amazonS3;
        this.bucket = bucket;
    }

    /**
     * 파일을 S3에 업로드하고 업로드된 파일의 URL을 반환
     *
     * @param file 업로드할 파일 객체
     * @param dirName S3에 저장될 디렉토리 이름
     * @return 업로드된 파일의 URL
     * @throws IOException 파일 처리 중 오류 발생 시 예외 발생
     */
    public String upload(MultipartFile file, String dirName) throws IOException {
        String fileName = createFileName(dirName, file);
        ObjectMetadata metadata = createMetadata(file);

        try {
            amazonS3.putObject(new PutObjectRequest(bucket, fileName, file.getInputStream(), metadata)
                    .withCannedAcl(CannedAccessControlList.PublicRead));
            return amazonS3.getUrl(bucket, fileName).toString();
        } catch (Exception e) {
            throw new CustomException(ErrorCode.FAILED_IMAGE_SAVE);
        }
    }

    /**
     * S3에서 파일 삭제
     *
     * @param fileName 삭제할 파일 이름 (S3 키)
     */
    public void deleteFile(String fileName) {
        try {
            amazonS3.deleteObject(new DeleteObjectRequest(bucket, fileName));
        } catch (AmazonServiceException e) {
            handleAmazonServiceException(e);
        } catch (Exception e) {
            throw new CustomException(ErrorCode.IMAGE_EXCEPTION);
        }
    }

    /**
     * S3에서 파일 다운로드
     *
     * @param fileUrl 다운로드할 파일 URL
     * @return 다운로드된 S3Object
     */
    public S3Object download(String fileUrl) {
        String key = extractS3KeyFromUrl(fileUrl);

        try {
            return amazonS3.getObject(new GetObjectRequest(bucket, key));
        } catch (AmazonServiceException e) {
            throw new CustomException(ErrorCode.IMAGE_NOT_FOUND);
        } catch (SdkClientException e) {
            throw new CustomException(ErrorCode.IMAGE_ACCESS_DENIED);
        }
    }

    /**
     * 파일 이름 생성: 디렉토리 이름 + UUID + 확장자
     *
     * @param dirName S3 디렉토리 이름
     * @param file 업로드할 파일 객체
     * @return 생성된 파일 이름
     */
    private String createFileName(String dirName, MultipartFile file) {
        String fileExtension = StringUtils.getFilenameExtension(file.getOriginalFilename());
        return dirName + "/" + UUID.randomUUID() + "." + fileExtension;
    }

    /**
     * 파일의 메타데이터 생성
     *
     * @param file 파일 객체
     * @return 생성된 ObjectMetadata 객체
     */
    private ObjectMetadata createMetadata(MultipartFile file) {
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(file.getSize());
        metadata.setContentType(file.getContentType());
        return metadata;
    }

    /**
     * 파일 URL에서 S3 키를 추출
     *
     * @param fileUrl S3 파일 URL
     * @return S3 키
     */
    private String extractS3KeyFromUrl(String fileUrl) {
        try {
            URL url = new URL(fileUrl);
            return url.getPath().substring(1);
        } catch (MalformedURLException e) {
            throw new CustomException(ErrorCode.IMAGE_EXCEPTION);
        }
    }

    /**
     * AmazonServiceException 처리 메서드
     *
     * @param e AmazonServiceException 예외 객체
     */
    private void handleAmazonServiceException(AmazonServiceException e) {
        switch (e.getStatusCode()) {
            case 403 -> throw new CustomException(ErrorCode.IMAGE_ACCESS_DENIED);
            case 404 -> throw new CustomException(ErrorCode.IMAGE_NOT_FOUND);
            case 400 -> throw new CustomException(ErrorCode.IMAGE_NOT_HAVE_PATH);
            default -> throw new CustomException(ErrorCode.IMAGE_INTERNAL_SERVER_ERROR);
        }
    }
}
