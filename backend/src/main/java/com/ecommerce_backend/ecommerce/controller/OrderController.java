package com.ecommerce_backend.ecommerce.controller;

import com.ecommerce_backend.ecommerce.dto.CheckoutRequest;
import com.ecommerce_backend.ecommerce.dto.OrderResponse;
import com.ecommerce_backend.ecommerce.model.OrderStatus;
import com.ecommerce_backend.ecommerce.model.PaymentStatus;
import com.ecommerce_backend.ecommerce.service.OrderService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/place") 
    @PreAuthorize("hasAuthority('USER')")
    public ResponseEntity<OrderResponse> placeOrder(@Valid @RequestBody CheckoutRequest request) {
        try {
            return new ResponseEntity<>(orderService.placeOrder(request), HttpStatus.CREATED);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null); 
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null); 
        }
    }

    @GetMapping("/my-orders") 
    @PreAuthorize("hasAuthority('USER') or hasAuthority('ADMIN')")
    public ResponseEntity<List<OrderResponse>> getUserOrders() {
        return ResponseEntity.ok(orderService.getUserOrders());
    }

    @GetMapping("/{orderId}") 
    @PreAuthorize("hasAuthority('USER') or hasAuthority('ADMIN')")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long orderId) {
        try {
            return ResponseEntity.ok(orderService.getOrderById(orderId));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); 
        }
    }

    @GetMapping 
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }
    @PutMapping("/{orderId}/status") 
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<OrderResponse> updateOrderStatus(@PathVariable Long orderId, @RequestParam OrderStatus status) {
        try {
            return ResponseEntity.ok(orderService.updateOrderStatus(orderId, status));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build(); 
        }
    }
    @PutMapping("/{orderId}/payment-status") 
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<OrderResponse> updatePaymentStatus(@PathVariable Long orderId, @RequestParam PaymentStatus status) {
        try {
            return ResponseEntity.ok(orderService.updatePaymentStatus(orderId, status));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build(); 
        }
    }
}
