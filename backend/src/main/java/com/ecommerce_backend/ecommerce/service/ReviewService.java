package com.ecommerce_backend.ecommerce.service;

import com.ecommerce_backend.ecommerce.dto.ReviewRequest;
import com.ecommerce_backend.ecommerce.dto.ReviewResponse;
import com.ecommerce_backend.ecommerce.model.Product;
import com.ecommerce_backend.ecommerce.model.Review;
import com.ecommerce_backend.ecommerce.model.User;
import com.ecommerce_backend.ecommerce.repository.ProductRepository;
import com.ecommerce_backend.ecommerce.repository.ReviewRepository;
import com.ecommerce_backend.ecommerce.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    private User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName(); 
        return userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("Authenticated user not found"));
    }

    private ReviewResponse mapToReviewResponse(Review review) {
        String userName = review.getUser().getFirstName();
        if (review.getUser().getLastName() != null && !review.getUser().getLastName().isEmpty()) {
            userName += " " + review.getUser().getLastName().charAt(0) + "."; 
        } else {
            userName = review.getUser().getFirstName(); 
        }

        return ReviewResponse.builder()
                .id(review.getId())
                .productId(review.getProduct().getId())
                .productName(review.getProduct().getName())
                .userId(review.getUser().getId())
                .userName(userName)
                .rating(review.getRating())
                .comment(review.getComment())
                .reviewDate(review.getReviewDate())
                .build();
    }

    @Transactional
    public void updateProductRating(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with ID: " + productId));

        Double averageRating = reviewRepository.findAverageRatingByProductId(productId);
        Long reviewCount = reviewRepository.countByProductId(productId);

        product.setAverageRating(averageRating != null ? BigDecimal.valueOf(averageRating).setScale(1, RoundingMode.HALF_UP).doubleValue() : null);
        product.setReviewCount(reviewCount != null ? reviewCount.intValue() : 0);
        productRepository.save(product);
    }

    @Transactional
    public ReviewResponse submitReview(ReviewRequest request) {
        User currentUser = getCurrentAuthenticatedUser();
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new EntityNotFoundException("Product not found with ID: " + request.getProductId()));

        Optional<Review> existingReview = reviewRepository.findByUserIdAndProductId(currentUser.getId(), product.getId());
        if (existingReview.isPresent()) {
            throw new IllegalArgumentException("You have already reviewed this product. You can update your existing review.");
        }

        Review review = Review.builder()
                .product(product)
                .user(currentUser)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        Review savedReview = reviewRepository.save(review);
        updateProductRating(product.getId()); 

        return mapToReviewResponse(savedReview);
    }

    @Transactional
    public ReviewResponse updateReview(Long reviewId, ReviewRequest request) {
        User currentUser = getCurrentAuthenticatedUser();
        Review existingReview = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new EntityNotFoundException("Review not found with ID: " + reviewId));

        if (!existingReview.getUser().getId().equals(currentUser.getId())) {
            throw new SecurityException("You are not authorized to update this review.");
        }

        if (!existingReview.getProduct().getId().equals(request.getProductId())) {
            throw new IllegalArgumentException("Cannot change product ID for an existing review.");
        }

        existingReview.setRating(request.getRating());
        existingReview.setComment(request.getComment());

        Review updatedReview = reviewRepository.save(existingReview);
        updateProductRating(updatedReview.getProduct().getId());

        return mapToReviewResponse(updatedReview);
    }

    public List<ReviewResponse> getReviewsForProduct(Long productId) {

        if (!productRepository.existsById(productId)) {
            throw new EntityNotFoundException("Product not found with ID: " + productId);
        }
        return reviewRepository.findByProductId(productId).stream()
                .map(this::mapToReviewResponse)
                .collect(Collectors.toList());
    }

    public List<ReviewResponse> getMyReviews() {
        User currentUser = getCurrentAuthenticatedUser();
        return reviewRepository.findByUserIdOrderByReviewDateDesc(currentUser.getId()).stream()
                .map(this::mapToReviewResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteReview(Long reviewId) {
        User currentUser = getCurrentAuthenticatedUser();
        Review reviewToDelete = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new EntityNotFoundException("Review not found with ID: " + reviewId));

        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ADMIN"));

        if (!isAdmin && !reviewToDelete.getUser().getId().equals(currentUser.getId())) {
            throw new SecurityException("You are not authorized to delete this review.");
        }

        reviewRepository.delete(reviewToDelete);
        updateProductRating(reviewToDelete.getProduct().getId()); 
    }

    public List<ReviewResponse> getAllReviews() {
        return reviewRepository.findAll().stream()
                .map(this::mapToReviewResponse)
                .collect(Collectors.toList());
    }
}