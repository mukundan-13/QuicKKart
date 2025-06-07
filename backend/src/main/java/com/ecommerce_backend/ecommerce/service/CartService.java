package com.ecommerce_backend.ecommerce.service;

import com.ecommerce_backend.ecommerce.dto.AddToCartRequest;
import com.ecommerce_backend.ecommerce.dto.CartItemResponse;
import com.ecommerce_backend.ecommerce.dto.CartResponse;
import com.ecommerce_backend.ecommerce.model.Cart;
import com.ecommerce_backend.ecommerce.model.CartItem;
import com.ecommerce_backend.ecommerce.model.Product;
import com.ecommerce_backend.ecommerce.model.User;
import com.ecommerce_backend.ecommerce.repository.CartItemRepository;
import com.ecommerce_backend.ecommerce.repository.CartRepository;
import com.ecommerce_backend.ecommerce.repository.ProductRepository;
import com.ecommerce_backend.ecommerce.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    private User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName(); 
        return userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("Authenticated user not found"));
    }

    private Cart getOrCreateCartForUser(User user) {
        return cartRepository.findByUser(user)
                .orElseGet(() -> cartRepository.save(Cart.builder().user(user).build()));
    }

    private CartItemResponse mapToCartItemResponse(CartItem cartItem) {
        return CartItemResponse.builder()
                .id(cartItem.getId())
                .productId(cartItem.getProduct().getId())
                .productName(cartItem.getProduct().getName())
                .productImageUrl(cartItem.getProduct().getImageUrl())
                .price(cartItem.getPrice())
                .quantity(cartItem.getQuantity())
                .subtotal(cartItem.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())))
                .build();
    }

    public CartResponse getCart() {
        User currentUser = getCurrentAuthenticatedUser();
        Cart cart = getOrCreateCartForUser(currentUser);

        List<CartItemResponse> cartItems = cart.getCartItems().stream()
                .map(this::mapToCartItemResponse)
                .collect(Collectors.toList());

        BigDecimal grandTotal = cartItems.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
                .cartId(cart.getId())
                .cartItems(cartItems)
                .grandTotal(grandTotal)
                .totalItems(cartItems.size())
                .build();
    }

    @Transactional
    public CartResponse addOrUpdateCartItem(AddToCartRequest request) {
        User currentUser = getCurrentAuthenticatedUser();
        Cart cart = getOrCreateCartForUser(currentUser);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new EntityNotFoundException("Product not found with ID: " + request.getProductId()));

        if (product.getStockQuantity() < request.getQuantity()) {
            throw new IllegalArgumentException("Not enough stock for product: " + product.getName() + ". Available: " + product.getStockQuantity());
        }

        Optional<CartItem> existingCartItem = cartItemRepository.findByCartAndProduct(cart, product);

        if (existingCartItem.isPresent()) {
            CartItem cartItem = existingCartItem.get();
            int newQuantity = cartItem.getQuantity() + request.getQuantity();

            if (product.getStockQuantity() < newQuantity) {
                throw new IllegalArgumentException("Cannot add " + request.getQuantity() + " more. Only " + (product.getStockQuantity() - cartItem.getQuantity()) + " available for " + product.getName());
            }
            cartItem.setQuantity(newQuantity);
            cartItemRepository.save(cartItem);
        } else {
            CartItem newCartItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .price(product.getPrice()) 
                    .build();
            cart.addCartItem(newCartItem); 
            cartItemRepository.save(newCartItem);
        }

        return getCart();
    }

    @Transactional
    public CartResponse updateCartItemQuantity(Long productId, Integer quantity) {
        User currentUser = getCurrentAuthenticatedUser();
        Cart cart = getOrCreateCartForUser(currentUser);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with ID: " + productId));

        CartItem cartItem = cartItemRepository.findByCartAndProduct(cart, product)
                .orElseThrow(() -> new EntityNotFoundException("Product not in cart"));

        if (quantity <= 0) {
            return removeCartItem(productId); 
        }

        if (product.getStockQuantity() < quantity) {
            throw new IllegalArgumentException("Not enough stock for product: " + product.getName() + ". Available: " + product.getStockQuantity());
        }

        cartItem.setQuantity(quantity);
        cartItemRepository.save(cartItem);
        return getCart();
    }

    @Transactional
    public CartResponse removeCartItem(Long productId) {
        User currentUser = getCurrentAuthenticatedUser();
        Cart cart = getOrCreateCartForUser(currentUser);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with ID: " + productId));

        CartItem cartItem = cartItemRepository.findByCartAndProduct(cart, product)
                .orElseThrow(() -> new EntityNotFoundException("Product not in cart"));

        cart.removeCartItem(cartItem); 
        cartItemRepository.delete(cartItem); 

        return getCart();
    }

    @Transactional
    public void clearCart() {
        User currentUser = getCurrentAuthenticatedUser();
        Cart cart = getOrCreateCartForUser(currentUser);
        cartItemRepository.deleteAll(cart.getCartItems()); 
        cart.getCartItems().clear(); 
        cartRepository.save(cart); 
    }
}
