package com.biometric.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class DateUtils {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public static String formatDate(LocalDateTime dateTime) {
        return dateTime.format(DATE_FORMATTER);
    }

    public static String formatTime(LocalDateTime dateTime) {
        return dateTime.format(TIME_FORMATTER);
    }

    public static String formatDateTime(LocalDateTime dateTime) {
        return dateTime.format(DATETIME_FORMATTER);
    }

    public static String getCurrentDate() {
        return formatDate(LocalDateTime.now());
    }

    public static String getCurrentTime() {
        return formatTime(LocalDateTime.now());
    }
}
