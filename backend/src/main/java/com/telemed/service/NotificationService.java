package com.telemed.service;

import com.telemed.entity.Notification;
import com.telemed.entity.User;
import com.telemed.exception.ApiException;
import com.telemed.repository.NotificationRepository;
import com.telemed.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Notification> getNotificationsForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public long getUnreadCount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
        return notificationRepository.findByUserIdAndIsReadFalse(user.getId()).size();
    }

    @Transactional
    public Notification markAsRead(Long notificationId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ApiException("Notification not found", HttpStatus.NOT_FOUND));
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new ApiException("Access denied", HttpStatus.FORBIDDEN);
        }
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    // Helper method used by other services to create notifications
    @Transactional
    public void createNotification(Long userId, String title, String message) {
        User user = userRepository.findById(userId)
                .orElse(null);
        if (user == null) return;

        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }
}
