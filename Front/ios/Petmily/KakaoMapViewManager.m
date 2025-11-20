#import <React/RCTViewManager.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTUIManager.h>

// ViewManager 등록
// Swift 클래스는 @objc(KakaoMapViewManager)로 선언되어 있으므로
// Objective-C에서 접근 가능합니다
@interface RCT_EXTERN_MODULE(KakaoMapViewManager, RCTViewManager)

// React Native 속성들
RCT_EXPORT_VIEW_PROPERTY(apiKey, NSString)
RCT_EXPORT_VIEW_PROPERTY(latitude, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(longitude, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(zoomLevel, NSNumber)

// 명령 메서드
RCT_EXTERN_METHOD(addMarker:(nonnull NSNumber *)node
                  latitude:(nonnull NSNumber *)latitude
                  longitude:(nonnull NSNumber *)longitude
                  title:(nonnull NSString *)title)

RCT_EXTERN_METHOD(updateRoute:(nonnull NSNumber *)node
                  routeID:(nonnull NSString *)routeID
                  coordinates:(nonnull NSArray *)coordinates
                  colorHex:(nonnull NSNumber *)colorHex
                  strokeColorHex:(nonnull NSNumber *)strokeColorHex
                  lineWidth:(nonnull NSNumber *)lineWidth)

RCT_EXTERN_METHOD(clearRoute:(nonnull NSNumber *)node
                  routeID:(nonnull NSString *)routeID)

RCT_EXTERN_METHOD(startCameraTracking:(nonnull NSNumber *)node)

RCT_EXTERN_METHOD(stopCameraTracking:(nonnull NSNumber *)node)

RCT_EXTERN_METHOD(updateTrackingLocation:(nonnull NSNumber *)node
                  latitude:(nonnull NSNumber *)latitude
                  longitude:(nonnull NSNumber *)longitude)

@end

