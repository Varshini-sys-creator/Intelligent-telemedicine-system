package com.telemed.controller;

import com.telemed.entity.Notification;
import com.telemed.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    // GET /api/notifications
    @GetMapping
    public ResponseEntity<List<Notification>> getMyNotifications(Authentication auth) {
        return ResponseEntity.ok(notificationService.getNotificationsForUser(auth.getName()));
    }

    // GET /api/notifications/unread-count
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication auth) {
        long count = notificationService.getUnreadCount(auth.getName());
        return ResponseEntity.ok(Map.of("count", count));
    }

    // PUT /api/notifications/{id}/read
    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(notificationService.markAsRead(id, auth.getName()));
    }
}
