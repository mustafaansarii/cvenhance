package com.docservice.careerhub.service;

public interface StorageService {

    String upload(byte[] content, String objectPath, String contentType);

    /** Fetches a stored object, or returns null if it does not exist (or cannot be read). */
    byte[] download(String objectPath);
}
