package com.seplag.artistalbum.shared.service;

import io.minio.*;
import io.minio.http.Method;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.util.concurrent.TimeUnit;

@Service
public class MinioService {

    private final MinioClient minioClient;
    private final MinioClient minioClientPublic;


    @Value("${minio.bucket-name}")
    private String bucketName;

    public MinioService(@Value("${minio.endpoint}") String endpoint,
                        @Value("${minio.public-endpoint}") String publicEndpoint,
                        @Value("${minio.access-key}") String accessKey,
                        @Value("${minio.secret-key}") String secretKey) {
        this.minioClient = MinioClient.builder()
                .endpoint(endpoint)
                .credentials(accessKey, secretKey)
                .region("us-east-1")
                .build();
        this.minioClientPublic = MinioClient.builder()
                .endpoint(publicEndpoint)
                .credentials(accessKey, secretKey)
                .build();
    }

    public void uploadFile(String objectKey, byte[] data, String contentType) throws Exception {
        // Garantir que o bucket existe
        ensureBucketExists();

        minioClient.putObject(
                PutObjectArgs.builder()
                        .bucket(bucketName)
                        .object(objectKey)
                        .stream(new ByteArrayInputStream(data), data.length, -1)
                        .contentType(contentType)
                        .build()
        );
    }

    public void deleteFile(String objectKey) throws Exception {
        minioClient.removeObject(
                RemoveObjectArgs.builder()
                        .bucket(bucketName)
                        .object(objectKey)
                        .build()
        );
    }

    public String generatePresignedUrl(String objectKey, int expirationSeconds) throws Exception {
        return minioClientPublic.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                        .method(Method.GET)
                        .bucket(bucketName)
                        .object(objectKey)
                        .expiry(expirationSeconds, TimeUnit.SECONDS)
                        .build()
        );
    }


    public byte[] downloadFile(String objectKey) throws Exception {
        try (var stream = minioClient.getObject(
                GetObjectArgs.builder()
                        .bucket(bucketName)
                        .object(objectKey)
                        .build())) {
            return stream.readAllBytes();
        }
    }

    public boolean fileExists(String objectKey) throws Exception {
        try {
            minioClient.statObject(
                    StatObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectKey)
                            .build()
            );
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private void ensureBucketExists() throws Exception {
        boolean found = minioClient.bucketExists(
                BucketExistsArgs.builder()
                        .bucket(bucketName)
                        .build()
        );

        if (!found) {
            minioClient.makeBucket(
                    MakeBucketArgs.builder()
                            .bucket(bucketName)
                    .build()
            );
        }
    }

    public String generatePresignedUrl30Min(String objectKey) throws Exception {
        return minioClientPublic.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                        .method(Method.GET)
                        .bucket(bucketName)
                        .object(objectKey)
                        .expiry(30, TimeUnit.SECONDS)
                        .build()
        );
    }

}
