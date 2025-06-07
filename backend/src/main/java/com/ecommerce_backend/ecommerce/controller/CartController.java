package com.ecommerce_backend.ecommerce.controller;
import com.ecommerce_backend.ecommerce.dto.AddToCartRequest;
import com.ecommerce_backend.ecommerce.dto.CartResponse;
import com.ecommerce_backend.ecommerce.service.CartService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('USER') or hasAuthority('ADMIN')") 
public class CartController {

    private final CartService cartService;

    @GetMapping 
    public ResponseEntity<CartResponse> getCart() {
        return ResponseEntity.ok(cartService.getCart());
    }

    @PostMapping("/add") 
    public ResponseEntity<CartResponse> addOrUpdateCartItem(@Valid @RequestBody AddToCartRequest request) {
        try {
            return new ResponseEntity<>(cartService.addOrUpdateCartItem(request), HttpStatus.OK);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build(); 
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null); 
        }
    }

    @PutMapping("/update/{productId}") 
    public ResponseEntity<CartResponse> updateCartItemQuantity(@PathVariable Long productId, @RequestParam Integer quantity) {
        try {
            return ResponseEntity.ok(cartService.updateCartItemQuantity(productId, quantity));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build(); 
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null); 
        }
    }

    @DeleteMapping("/remove/{productId}") 
    public ResponseEntity<CartResponse> removeCartItem(@PathVariable Long productId) {
        try {
            return ResponseEntity.ok(cartService.removeCartItem(productId));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build(); 
        }
    }

    @DeleteMapping("/clear") 
    public ResponseEntity<Void> clearCart() {
        cartService.clearCart();
        return ResponseEntity.noContent().build();
    }
}

