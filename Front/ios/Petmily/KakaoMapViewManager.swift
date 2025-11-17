import Foundation
import React // RCTBridge, RCTUIManager, RCTViewManager

@objc(KakaoMapViewManager)
class KakaoMapViewManager: RCTViewManager {

  override static func requiresMainQueueSetup() -> Bool { 
    return true 
  }

  // KakaoMapView를 생성해 RN에 제공
  override func view() -> UIView! {
    return KakaoMapView()
  }
  
  /// JS에서 보내는 명령: addMarker
  /// - Parameters:
  ///   - node: ReactTag (UIView의 태그)
  ///   - latitude/longitude: 좌표
  ///   - title: 마커 제목
  @objc
  func addMarker(_ node: NSNumber,
                 latitude: NSNumber,
                 longitude: NSNumber,
                 title: NSString) {
    DispatchQueue.main.async { [weak self] in
      guard
        let self = self,
        let uiManager = self.bridge?.uiManager,
        let component = uiManager.view(forReactTag: node) as? KakaoMapView
      else {
        return
      }

      component.addMarker(latitude, longitude: longitude, title: title)
    }
  }
  
  @objc
  func updateRoute(_ node: NSNumber,
                   routeID: NSString,
                   coordinates: NSArray,
                   colorHex: NSNumber,
                   strokeColorHex: NSNumber,
                   lineWidth: NSNumber) {
    DispatchQueue.main.async { [weak self] in
      guard
        let self = self,
        let uiManager = self.bridge?.uiManager,
        let component = uiManager.view(forReactTag: node) as? KakaoMapView
      else {
        return
      }
      
      component.updateRoute(routeID, coordinates: coordinates, colorHex: colorHex, strokeColorHex: strokeColorHex, lineWidth: lineWidth)
    }
  }
  
  @objc
  func clearRoute(_ node: NSNumber,
                  routeID: NSString) {
    DispatchQueue.main.async { [weak self] in
      guard
        let self = self,
        let uiManager = self.bridge?.uiManager,
        let component = uiManager.view(forReactTag: node) as? KakaoMapView
      else {
        return
      }
      
      component.clearRoute(routeID)
    }
  }
  
  @objc
  func startCameraTracking(_ node: NSNumber) {
    DispatchQueue.main.async { [weak self] in
      guard
        let self = self,
        let uiManager = self.bridge?.uiManager,
        let component = uiManager.view(forReactTag: node) as? KakaoMapView
      else {
        return
      }
      
      component.startCameraTracking()
    }
  }
  
  @objc
  func stopCameraTracking(_ node: NSNumber) {
    DispatchQueue.main.async { [weak self] in
      guard
        let self = self,
        let uiManager = self.bridge?.uiManager,
        let component = uiManager.view(forReactTag: node) as? KakaoMapView
      else {
        return
      }
      
      component.stopCameraTracking()
    }
  }
  
  @objc
  func updateTrackingLocation(_ node: NSNumber,
                              latitude: NSNumber,
                              longitude: NSNumber) {
    DispatchQueue.main.async { [weak self] in
      guard
        let self = self,
        let uiManager = self.bridge?.uiManager,
        let component = uiManager.view(forReactTag: node) as? KakaoMapView
      else {
        return
      }
      
      component.updateTrackingLocation(latitude, longitude: longitude)
    }
  }
}
