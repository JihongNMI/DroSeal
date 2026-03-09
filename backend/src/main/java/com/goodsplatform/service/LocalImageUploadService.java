package com.goodsplatform.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Slf4j
@Service
public class LocalImageUploadService {

    private final Path fileStorageLocation;

    public LocalImageUploadService() {
        // 루트 디렉토리 산하 uploads 폴더
        this.fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("업로드 폴더를 생성할 수 없습니다.", ex);
        }
    }

    public String storeFile(MultipartFile file) {
        // 원본 파일명에서 확장자 추출
        String originalFileName = file.getOriginalFilename();
        String extension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }

        // 새 고유 파일명 생성 (해시 기반으로 중복 업로드 방지)
        String newFileName;
        try {
            String fileHash = org.springframework.util.DigestUtils.md5DigestAsHex(file.getBytes());
            newFileName = fileHash + extension;
        } catch (IOException e) {
            log.warn("파일 해시 계산 실패, 기본 UUID로 대체합니다.", e);
            newFileName = UUID.randomUUID().toString() + extension;
        }

        try {
            // 파일 복사
            Path targetLocation = this.fileStorageLocation.resolve(newFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // 클라이언트가 이미지에 접근할 수 있는 다운로드/조회 URL 생성
            String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/uploads/")
                    .path(newFileName)
                    .toUriString();

            return fileDownloadUri;

        } catch (IOException ex) {
            throw new RuntimeException("파일을 저장할 수 없습니다. " + newFileName, ex);
        }
    }
}
