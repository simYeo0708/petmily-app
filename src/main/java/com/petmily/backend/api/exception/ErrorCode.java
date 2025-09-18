package com.petmily.backend.api.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

import static org.springframework.http.HttpStatus.*;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // auth
    ILLEGAL_REGISTRATION_ID(NOT_ACCEPTABLE, "illegal registration id"),
    TOKEN_EXPIRED(UNAUTHORIZED, "토큰이 만료되었습니다."),
    INVALID_TOKEN(UNAUTHORIZED, "올바르지 않은 토큰입니다."),
    INVALID_JWT_SIGNATURE(UNAUTHORIZED, "잘못된 JWT 시그니처입니다."),
    INVALID_PASSWORD(UNAUTHORIZED, "비밀번호가 일치하지 않습니다."),

    // member
    USER_NOT_FOUND(NOT_FOUND, "회원을 찾을 수 없습니다."),

    // payment history
    INVALID_PAYMENT(BAD_REQUEST, "결제 정보가 일치하지 않습니다."),

    // notification
    NOTIFICATION_NOT_FOUND(NOT_FOUND, "알림을 찾을 수 없습니다."),

    // location
    LOCATION_REQUIRED(BAD_REQUEST, "위치 정보가 필요합니다."),
    INVALID_COORDINATES(BAD_REQUEST, "올바르지 않은 좌표입니다."),
    LOCATION_PERMISSION_REQUIRED(BAD_REQUEST, "위치 권한이 필요합니다."),
    UNREALISTIC_LOCATION_CHANGE(BAD_REQUEST, "비현실적인 위치 변화입니다."),
    LOCATION_SERVICE_UNAVAILABLE(SERVICE_UNAVAILABLE, "위치 서비스를 사용할 수 없습니다."),

    // product
    PRODUCT_NOT_FOUND(NOT_FOUND, "상품을 찾을 수 없습니다."),
    PRODUCT_INACTIVE(BAD_REQUEST, "비활성화된 상품입니다."),
    INSUFFICIENT_STOCK(BAD_REQUEST, "재고가 부족합니다."),
    PRODUCT_ALREADY_EXISTS(CONFLICT, "이미 존재하는 상품입니다."),
    INVALID_PRODUCT_DATA(BAD_REQUEST, "올바르지 않은 상품 정보입니다."),

    // category
    CATEGORY_NOT_FOUND(NOT_FOUND, "카테고리를 찾을 수 없습니다."),
    CATEGORY_INACTIVE(BAD_REQUEST, "비활성화된 카테고리입니다."),
    CATEGORY_ALREADY_EXISTS(CONFLICT, "이미 존재하는 카테고리입니다."),
    CATEGORY_HAS_PRODUCTS(BAD_REQUEST, "상품이 있는 카테고리는 삭제할 수 없습니다."),
    INVALID_CATEGORY_HIERARCHY(BAD_REQUEST, "올바르지 않은 카테고리 계층 구조입니다."),

    // cart
    CART_ITEM_NOT_FOUND(NOT_FOUND, "장바구니 아이템을 찾을 수 없습니다."),
    CART_ITEM_ALREADY_EXISTS(CONFLICT, "이미 장바구니에 있는 상품입니다."),
    INVALID_CART_QUANTITY(BAD_REQUEST, "올바르지 않은 수량입니다."),
    CART_IS_EMPTY(BAD_REQUEST, "장바구니가 비어있습니다."),

    // order
    ORDER_NOT_FOUND(NOT_FOUND, "주문을 찾을 수 없습니다."),
    ORDER_CANNOT_CANCEL(BAD_REQUEST, "취소할 수 없는 주문입니다."),
    ORDER_ALREADY_CANCELLED(BAD_REQUEST, "이미 취소된 주문입니다."),
    INVALID_ORDER_STATUS(BAD_REQUEST, "올바르지 않은 주문 상태입니다."),
    ORDER_ITEMS_REQUIRED(BAD_REQUEST, "주문할 상품을 선택해주세요."),
    PAYMENT_FAILED(BAD_REQUEST, "결제에 실패했습니다."),

    // subscription
    SUBSCRIPTION_NOT_FOUND(NOT_FOUND, "정기배송을 찾을 수 없습니다."),
    SUBSCRIPTION_ALREADY_PAUSED(BAD_REQUEST, "이미 일시정지된 정기배송입니다."),
    SUBSCRIPTION_ALREADY_CANCELLED(BAD_REQUEST, "이미 해지된 정기배송입니다."),
    INVALID_SUBSCRIPTION_TYPE(BAD_REQUEST, "올바르지 않은 정기배송 유형입니다."),
    SUBSCRIPTION_MODIFICATION_NOT_ALLOWED(BAD_REQUEST, "정기배송 변경이 불가능합니다."),

    // global
    RESOURCE_LOCKED(LOCKED, "자원이 잠겨있어 접근할 수 없습니다."),
    NO_ACCESS(FORBIDDEN, "접근 권한이 없습니다."),
    RESOURCE_NOT_FOUND(NOT_FOUND, "요청한 자원을 찾을 수 없습니다."),
    INVALID_REQUEST(BAD_REQUEST, "올바르지 않은 요청입니다."),
    INTERNAL_ERROR(INTERNAL_SERVER_ERROR, "예상치못한 에러가 발생했습니다.");

    private final HttpStatus httpStatus;
    private final String message;

}
