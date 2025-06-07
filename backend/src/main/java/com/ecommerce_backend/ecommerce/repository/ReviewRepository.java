package com.ecommerce_backend.ecommerce.repository;

import com.ecommerce_backend.ecommerce.model.Product;
import com.ecommerce_backend.ecommerce.model.Review;
import com.ecommerce_backend.ecommerce.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductId(Long productId);
    Optional<Review> findByUserIdAndProductId(Long userId, Long productId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId")
    Double findAverageRatingByProductId(Long productId);

    Long countByProductId(Long productId);

    List<Review> findByUserIdOrderByReviewDateDesc(Long userId);
}