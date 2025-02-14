package net.scit.backend.component;

import com.amazonaws.AmazonServiceException;
import com.amazonaws.SdkClientException;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.DeleteObjectRequest;
import com.amazonaws.services.s3.model.DeleteObjectsRequest;
import com.amazonaws.services.s3.model.DeleteObjectsResult;
import com.amazonaws.services.s3.model.ListObjectsV2Request;
import com.amazonaws.services.s3.model.ListObjectsV2Result;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.amazonaws.services.s3.model.S3ObjectSummary;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
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

//  public void deleteFile(String fileName) {
//    try{
//      amazonS3.deleteObject(new DeleteObjectRequest(bucket, fileName));
//    } catch (AmazonServiceException e) {
//      switch (e.getStatusCode()) {
//        case 403:
//          throw new CustomException(ErrorCode.IMAGE_ACCESS_DENIED);
//        case 404:
//          throw new CustomException(ErrorCode.IMAGE_NOT_FOUND);
//        case 400:
//          throw new CustomException(ErrorCode.IMAGE_NOT_HAVE_PATH);
//        default:
//          throw new CustomException(ErrorCode.IMAGE_INTERNAL_SERVER_ERROR);
//      }
//    } catch (SdkClientException e) {
//      throw new CustomException(ErrorCode.IMAGE_EXCEPTION);
//    } catch (Exception e) {
//      throw new CustomException(ErrorCode.IMAGE_EXCEPTION);
//    }
//  }
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