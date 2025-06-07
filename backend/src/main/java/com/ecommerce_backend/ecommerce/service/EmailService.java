package com.ecommerce_backend.ecommerce.service;

import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;

import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendSimpleEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("mukundan386@gmail.com"); 
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        try {
            mailSender.send(message);
            System.out.println("Email sent successfully to: " + to);
        } catch (MailException e) {
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
        }
    }

    public void sendLowStockAlert(String productName, Integer currentStock, Integer threshold) {
        String subject = "Low Stock Alert: " + productName;
        String body = String.format(
                "Dear Admin,\n\n" +
                "The product '%s' is running low on stock. Current quantity: %d. Threshold: %d.\n" +
                "Please replenish the stock soon.\n\n" +
                "Sincerely,\nYour E-commerce System",
                productName, currentStock, threshold
        );
        sendSimpleEmail("admin@example.com", subject, body); 
    }

    public void sendNewProductNotification(String productName, String productDescription, BigDecimal price) {
        String subject = "New Product Added: " + productName;
        String body = String.format(
                "Dear Customers,\n\n" +
                "Exciting news! A new product '%s' has been added to our store.\n" +
                "Description: %s\n" +
                "Price: %.2f\n\n" +
                "Check it out now!\n\n" +
                "Sincerely,\nYour E-commerce Team",
                productName, productDescription, price
        );
        sendSimpleEmail("subscriber@example.com", subject, body); 
    }
}