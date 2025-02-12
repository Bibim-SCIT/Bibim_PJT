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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
public class S3Uploader {

  private final AmazonS3 amazonS3;
  private final String bucket;

  public S3Uploader(AmazonS3 amazonS3, @Value("${cloud.aws.s3.bucket}") String bucket) {
    this.amazonS3 = amazonS3;
    this.bucket = bucket;
  }

  public String upload(MultipartFile file, String dirName) throws IOException {
    String fileName = dirName + "/" + UUID.randomUUID();
    ObjectMetadata metadata = new ObjectMetadata();
    metadata.setContentLength(file.getSize());
    metadata.setContentType(file.getContentType());

    amazonS3.putObject(new PutObjectRequest(bucket, fileName, file.getInputStream(), metadata)
        .withCannedAcl(CannedAccessControlList.PublicRead));
    return amazonS3.getUrl(bucket, fileName).toString();
  }

  public String upload(MultipartFile file, String dirName, int i) throws IOException {
    String fileName = dirName + "/" + UUID.randomUUID() + "_" + i + ".jpg";
    ObjectMetadata metadata = new ObjectMetadata();
    metadata.setContentLength(file.getSize());
    metadata.setContentType(file.getContentType());

    amazonS3.putObject(new PutObjectRequest(bucket, fileName, file.getInputStream(), metadata)
        .withCannedAcl(CannedAccessControlList.PublicRead));
    return amazonS3.getUrl(bucket, fileName).toString();
  }

  public void deleteFile(String fileName) {
    try{
      amazonS3.deleteObject(new DeleteObjectRequest(bucket, fileName));
    } catch (AmazonServiceException e) {
      // CustomException 필요
      switch (e.getStatusCode()) {
        case 403:
        case 404:
        case 400:
        default:
      }
    } catch (SdkClientException e) {
    } catch (Exception e) {
    }
  }

  public void deleteFolder(Long auctionId) {
    String prefix = "auction-images/" + auctionId + "/";

    ListObjectsV2Request req = new ListObjectsV2Request().withBucketName(bucket).withPrefix(prefix);
    ListObjectsV2Result result;

    do {
      result = amazonS3.listObjectsV2(req);
      List<DeleteObjectsRequest.KeyVersion> keysToDelete = new ArrayList<>();

      for (S3ObjectSummary objectSummary : result.getObjectSummaries()) {
        keysToDelete.add(new DeleteObjectsRequest.KeyVersion(objectSummary.getKey()));
      }

      if (!keysToDelete.isEmpty()) {
        DeleteObjectsRequest deleteRequest = new DeleteObjectsRequest(bucket).withKeys(keysToDelete);
        DeleteObjectsResult deleteResult = amazonS3.deleteObjects(deleteRequest);
      }

      req.setContinuationToken(result.getNextContinuationToken());
    } while (result.isTruncated());
  }
}
