package com.ecommerce_backend.ecommerce.service;

import com.ecommerce_backend.ecommerce.dto.ProductRequest;
import com.ecommerce_backend.ecommerce.dto.ProductResponse;
import com.ecommerce_backend.ecommerce.dto.CategoryResponse;
import com.ecommerce_backend.ecommerce.model.Category;
import com.ecommerce_backend.ecommerce.model.Product;
import com.ecommerce_backend.ecommerce.repository.CategoryRepository;
import com.ecommerce_backend.ecommerce.repository.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final EmailService emailService;

    @Value("${product.low_stock_threshold:10}") 
    private Integer lowStockThreshold;

    private ProductResponse mapToProductResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stockQuantity(product.getStockQuantity())
                .imageUrl(product.getImageUrl())
                .category(CategoryResponse.builder() 
                        .id(product.getCategory().getId())
                        .name(product.getCategory().getName())
                        .description(product.getCategory().getDescription())
                        .build())
                .isActive(product.isActive())
                .build();
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new EntityNotFoundException("Category not found with ID: " + request.getCategoryId()));

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stockQuantity(request.getStockQuantity())
                .imageUrl(request.getImageUrl())
                .category(category)
                .isActive(request.isActive())
                .build();

        Product savedProduct = productRepository.save(product);

        emailService.sendNewProductNotification(savedProduct.getName(), savedProduct.getDescription(), savedProduct.getPrice());

        if (savedProduct.getStockQuantity() <= lowStockThreshold) {
            emailService.sendLowStockAlert(savedProduct.getName(), savedProduct.getStockQuantity(), lowStockThreshold);
        }

        return mapToProductResponse(savedProduct);
    }

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());
    }

    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with ID: " + id));
        return mapToProductResponse(product);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with ID: " + id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new EntityNotFoundException("Category not found with ID: " + request.getCategoryId()));

        boolean lowStockTriggered = false;
        if (request.getStockQuantity() <= lowStockThreshold && existingProduct.getStockQuantity() > lowStockThreshold) {
            lowStockTriggered = true;
        }

        existingProduct.setName(request.getName());
        existingProduct.setDescription(request.getDescription());
        existingProduct.setPrice(request.getPrice());
        existingProduct.setStockQuantity(request.getStockQuantity());
        existingProduct.setImageUrl(request.getImageUrl());
        existingProduct.setCategory(category);
        existingProduct.setActive(request.isActive());

        Product updatedProduct = productRepository.save(existingProduct);

        if (lowStockTriggered) {
            emailService.sendLowStockAlert(updatedProduct.getName(), updatedProduct.getStockQuantity(), lowStockThreshold);
        }

        return mapToProductResponse(updatedProduct);
    }

    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new EntityNotFoundException("Product not found with ID: " + id);
        }
        productRepository.deleteById(id);
    }

    public List<ProductResponse> searchProducts(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllProducts(); 
        }
        return productRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query, query).stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());
    }

    public List<ProductResponse> getProductsByCategory(Long categoryId) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new EntityNotFoundException("Category not found with ID: " + categoryId);
        }
        return productRepository.findByCategoryId(categoryId).stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());
    }

    public void checkAndSendLowStockAlerts() {
        List<Product> lowStockProducts = productRepository.findByStockQuantityLessThan(lowStockThreshold);
        for (Product product : lowStockProducts) {
            emailService.sendLowStockAlert(product.getName(), product.getStockQuantity(), lowStockThreshold);
        }
    }
}
