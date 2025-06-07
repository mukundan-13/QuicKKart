package com.ecommerce_backend.ecommerce.controller;
import com.ecommerce_backend.ecommerce.dto.ReviewRequest;
import com.ecommerce_backend.ecommerce.dto.ReviewResponse;
import com.ecommerce_backend.ecommerce.service.ReviewService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping 
    @PreAuthorize("hasAuthority('USER')") 
    public ResponseEntity<ReviewResponse> submitReview(@Valid @RequestBody ReviewRequest request) {
        try {
            return new ResponseEntity<>(reviewService.submitReview(request), HttpStatus.CREATED);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build(); 
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(null); 
        }
    }

    @PutMapping("/{reviewId}") 
    @PreAuthorize("hasAuthority('USER')") 
    public ResponseEntity<ReviewResponse> updateReview(@PathVariable Long reviewId, @Valid @RequestBody ReviewRequest request) {
        try {
            return ResponseEntity.ok(reviewService.updateReview(reviewId, request));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build(); 
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); 
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null); 
        }
    }

    @GetMapping("/product/{productId}") 
    @PreAuthorize("permitAll()") 
    public ResponseEntity<List<ReviewResponse>> getReviewsForProduct(@PathVariable Long productId) {
        try {
            return ResponseEntity.ok(reviewService.getReviewsForProduct(productId));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build(); 
        }
    }

    @GetMapping("/my-reviews") 
    @PreAuthorize("hasAuthority('USER')")
    public ResponseEntity<List<ReviewResponse>> getMyReviews() {
        return ResponseEntity.ok(reviewService.getMyReviews());
    }

    @DeleteMapping("/{reviewId}") 
    @PreAuthorize("hasAuthority('USER') or hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteReview(@PathVariable Long reviewId) {
        try {
            reviewService.deleteReview(reviewId);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build(); 
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); 
        }
    }

    @GetMapping 
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<ReviewResponse>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }
}