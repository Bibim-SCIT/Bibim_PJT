package net.scit.backend.component;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.amazonaws.AmazonServiceException;
import com.amazonaws.SdkClientException;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.DeleteObjectRequest;
import com.amazonaws.services.s3.model.GetObjectRequest;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.amazonaws.services.s3.model.S3Object;

import net.scit.backend.exception.CustomException;
import net.scit.backend.exception.ErrorCode;

@Component
public class S3Uploader {

    private final AmazonS3 amazonS3;
    private final String bucket;

    public S3Uploader(AmazonS3 amazonS3, @Value("${spring.cloud.s3.bucket}") String bucket) {
        this.amazonS3 = amazonS3;
        this.bucket = bucket;
    }

    public String upload(MultipartFile file, String dirName) throws IOException {
        String fileExtension = StringUtils.getFilenameExtension(file.getOriginalFilename());
        String fileName = dirName + "/" + UUID.randomUUID() + "." + fileExtension;
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(file.getSize());
        metadata.setContentType(file.getContentType());

        amazonS3.putObject(new PutObjectRequest(bucket, fileName, file.getInputStream(), metadata)
                .withCannedAcl(CannedAccessControlList.PublicRead));
        return amazonS3.getUrl(bucket, fileName).toString();
    }
    
  //   public String extractFileNameFromUrl(String fileUrl) {
  //     try {
  //         // URL 객체 생성
  //         URL url = new URL(fileUrl);
  
  //         // 경로 추출 (버킷명 이후의 경로)
  //         String fullPath = url.getPath(); // 예: "/workspace-images/6e62c522-d61f-4d41-96b8-a100646cf0ca.png"
  
  //         // 첫 '/' 제거 (필수)
  //         if (fullPath.startsWith("/")) {
  //             fullPath = fullPath.substring(1);
  //         }
  
  //         return fullPath; // "workspace-images/6e62c522-d61f-4d41-96b8-a100646cf0ca.png"
  //     } catch (MalformedURLException e) {
  //         throw new CustomException(ErrorCode.IMAGE_EXCEPTION);
  //     }
  // }
  

  public void deleteFile(String fileName) {
    try{
      amazonS3.deleteObject(new DeleteObjectRequest(bucket, fileName));
    } catch (AmazonServiceException e) {
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
    } catch (SdkClientException e) {
      throw new CustomException(ErrorCode.IMAGE_EXCEPTION);
    } catch (Exception e) {
      throw new CustomException(ErrorCode.IMAGE_EXCEPTION);
    }
  }

    public S3Object download(String fileUrl) {
        try {
            // fileUrl에서 S3 키 추출
            URL url = new URL(fileUrl);
            String key = url.getPath().substring(1); // 맨 앞의 '/' 제거

            // S3에서 객체 가져오기
            return amazonS3.getObject(new GetObjectRequest(bucket, key));

        } catch (MalformedURLException e) {
            throw new CustomException(ErrorCode.IMAGE_EXCEPTION); // URL 문제
        } catch (AmazonServiceException e) {
            throw new CustomException(ErrorCode.IMAGE_NOT_FOUND); // S3 내 파일 없음
        } catch (SdkClientException e) {
            throw new CustomException(ErrorCode.IMAGE_ACCESS_DENIED); // 접근 권한 문제
        }
    }


//
//  public void deleteFolder(Long auctionId) {
//    String prefix = "auction-images/" + auctionId + "/";
//
//    ListObjectsV2Request req = new ListObjectsV2Request().withBucketName(bucket).withPrefix(prefix);
//    ListObjectsV2Result result;
//
//    do {
//      result = amazonS3.listObjectsV2(req);
//      List<DeleteObjectsRequest.KeyVersion> keysToDelete = new ArrayList<>();
//
//      for (S3ObjectSummary objectSummary : result.getObjectSummaries()) {
//        keysToDelete.add(new DeleteObjectsRequest.KeyVersion(objectSummary.getKey()));
//      }
//
//      if (!keysToDelete.isEmpty()) {
//        DeleteObjectsRequest deleteRequest = new DeleteObjectsRequest(bucket).withKeys(keysToDelete);
//        DeleteObjectsResult deleteResult = amazonS3.deleteObjects(deleteRequest);
//      }
//
//      req.setContinuationToken(result.getNextContinuationToken());
//    } while (result.isTruncated());
//  }
}
