package com.docservice.careerhub.service;

import com.docservice.careerhub.config.AppProperties;
import com.docservice.careerhub.exception.ApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.net.URI;

@Service
public class S3StorageService implements StorageService {

    private static final Logger logger = LoggerFactory.getLogger(S3StorageService.class);

    @Autowired
    private AppProperties appProperties;

    private volatile S3Client s3;

    private S3Client s3() {
        if (s3 == null) {
            synchronized (this) {
                if (s3 == null) {
                    s3 = S3Client.builder()
                            .endpointOverride(URI.create(appProperties.getS3Endpoint()))
                            .region(Region.of(appProperties.getS3Region()))
                            .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(
                                    appProperties.getS3AccessKey(), appProperties.getS3SecretKey())))
                            .serviceConfiguration(S3Configuration.builder()
                                    .pathStyleAccessEnabled(true)
                                    .chunkedEncodingEnabled(false)
                                    .build())
                            .build();
                }
            }
        }
        return s3;
    }

    @Override
    public String upload(byte[] content, String objectPath, String contentType) {
        try {
            s3().putObject(PutObjectRequest.builder()
                            .bucket(appProperties.getS3Bucket())
                            .key(objectPath)
                            .contentType(contentType)
                            .build(),
                    RequestBody.fromBytes(content));
        } catch (Exception exception) {
            logger.error("S3 upload failed for {}: {}", objectPath, exception.getMessage(), exception);
            throw ApiException.badData("Failed to upload file to storage: " + exception.getMessage());
        }
        return publicUrl(objectPath);
    }

    @Override
    public byte[] download(String objectPath) {
        try {
            return s3().getObjectAsBytes(GetObjectRequest.builder()
                    .bucket(appProperties.getS3Bucket())
                    .key(objectPath)
                    .build()).asByteArray();
        } catch (NoSuchKeyException notFound) {
            return null;
        } catch (Exception exception) {
            logger.warn("S3 download failed for {}: {}", objectPath, exception.getMessage());
            return null;
        }
    }

    @Override
    public void delete(String objectPath) {
        try {
            s3().deleteObject(DeleteObjectRequest.builder()
                    .bucket(appProperties.getS3Bucket())
                    .key(objectPath)
                    .build());
        } catch (Exception exception) {
            logger.warn("S3 delete failed for {}: {}", objectPath, exception.getMessage());
        }
    }

    @Override
    public String publicUrl(String objectPath) {
        String endpoint = appProperties.getS3Endpoint();
        String base = endpoint == null ? "" : endpoint.replaceAll("/storage/v1/s3/?$", "/storage/v1");
        return base + "/object/public/" + appProperties.getS3Bucket() + "/" + objectPath;
    }
}
