import Foundation
import KakaoMapsSDK
import UIKit

/// Helper responsible for managing route overlays on KakaoMap.
final class KakaoMapTracker {
  private var mapView: KakaoMap?
  private let routeLayerID = "PetmilyRouteLayer"
  private var registeredStyleIDs: Set<String> = []

  func attach(mapView: KakaoMap?) {
    if !Thread.isMainThread {
      NSLog("KakaoMapTracker.attach called off-main. Dispatching to main.")
      // mapView를 로컬 변수로 캡처하여 안전하게 전달
      let capturedMapView = mapView
      DispatchQueue.main.async { [weak self] in
        guard let self = self else {
          NSLog("KakaoMapTracker.attach: self is nil, skipping")
          return
        }
        self.attach(mapView: capturedMapView)
      }
      return
    }
    
    // 메인 스레드에서 실행되는 부분
    NSLog("KakaoMapTracker.attach onMain=\(Thread.isMainThread)")
    NSLog("KakaoMapTracker.attach: mapView parameter isNil=\(mapView == nil)")
    
    // 기존 mapView를 먼저 nil로 설정하여 메모리 해제
    if self.mapView != nil {
      NSLog("KakaoMapTracker.attach: clearing existing mapView")
      self.mapView = nil
    }
    
    // mapView를 안전하게 저장
    // 할당 전에 로그를 출력하여 크래시 지점 확인
    NSLog("KakaoMapTracker.attach: about to assign mapView")
    self.mapView = mapView
    NSLog("KakaoMapTracker.attach: mapView assigned successfully (isNil: \(self.mapView == nil))")
  }
  
  func detach() {
    if !Thread.isMainThread {
      NSLog("KakaoMapTracker.detach called off-main. Dispatching to main.")
      DispatchQueue.main.async { [weak self] in self?.detach() }
      return
    }
    NSLog("KakaoMapTracker.detach onMain=\(Thread.isMainThread) mapViewIsNil=\(mapView == nil)")
    NSLog("KakaoMapTracker.detach")
    mapView = nil
    registeredStyleIDs.removeAll()
  }

  func updateRoute(
    routeID: String,
    coordinates: [MapPoint],
    color: UIColor,
    strokeColor: UIColor,
    lineWidth: CGFloat
  ) {
    if !Thread.isMainThread {
      NSLog("KakaoMapTracker.updateRoute called off-main. Dispatching to main. routeID=\(routeID)")
      DispatchQueue.main.async { [weak self] in
        self?.updateRoute(routeID: routeID, coordinates: coordinates, color: color, strokeColor: strokeColor, lineWidth: lineWidth)
      }
      return
    }
    NSLog("KakaoMapTracker.updateRoute onMain=\(Thread.isMainThread) mapViewNil=\(mapView == nil) routeID=\(routeID) coords=\(coordinates.count) lineWidth=\(lineWidth) color=\(color) stroke=\(strokeColor)")
    guard let mapView = mapView else {
      NSLog("KakaoMapTracker.updateRoute skipped – mapView is nil (weak ref lost)")
      return
    }
    let manager = mapView.getRouteManager()
    NSLog("RouteManager acquired")

    if coordinates.count < 2 {
      NSLog("updateRoute insufficient points (<2). routeID=\(routeID)")
    }
    guard coordinates.count >= 2 else {
      clearRoute(routeID: routeID)
      return
    }

    // ❶ 레이어가 방금 생성된 경우, 이번 호출에서는 그냥 생성만 하고 return
    guard let layer = ensureRouteLayer(manager: manager) else {
      NSLog("KakaoMapTracker.updateRoute – RouteLayer just created, skipping this tick to avoid early access")
      return
    }

    let styleID = "\(routeID)_style"
    ensureStyleSet(
      styleID: styleID,
      color: color,
      strokeColor: strokeColor,
      lineWidth: lineWidth,
      manager: manager
    )

    let segment = RouteSegment(points: coordinates, styleIndex: 0)
    NSLog("updateRoute prepared segment count=\(coordinates.count) styleID=\(styleID)")

    if let route = layer.getRoute(routeID: routeID) {
      NSLog("updateRoute updating existing route id=\(routeID)")
      route.changeStyleAndData(styleID: styleID, segments: [segment])
      route.zOrder = 0
      route.show()
    } else {
      let option = RouteOptions(routeID: routeID, styleID: styleID, zOrder: 0)
      option.segments = [segment]
      let newRoute = layer.addRoute(option: option, callback: nil)
      NSLog("updateRoute adding new route id=\(routeID) optionStyleID=\(styleID) newRouteIsNil=\(newRoute == nil)")
      newRoute?.show()
    }
  }

  private func ensureRouteLayer(manager: RouteManager) -> RouteLayer? {
    NSLog("ensureRouteLayer begin")
    if let existing = manager.getRouteLayer(layerID: routeLayerID) {
      NSLog("ensureRouteLayer reuse existing layer id=\(routeLayerID)")
      return existing
    }

    NSLog("KakaoMapTracker.ensureRouteLayer – creating new RouteLayer")
    let newLayer = manager.addRouteLayer(layerID: routeLayerID, zOrder: 1000)
    NSLog("ensureRouteLayer created new layer id=\(routeLayerID) newLayerIsNil=\(newLayer == nil)")
    return newLayer
  }

  private func ensureStyleSet(
    styleID: String,
    color: UIColor,
    strokeColor: UIColor,
    lineWidth: CGFloat,
    manager: RouteManager
  ) {
    NSLog("ensureStyleSet styleID=\(styleID) registered=\(registeredStyleIDs.contains(styleID)) lineWidth=\(lineWidth)")
    if registeredStyleIDs.contains(styleID) { return }

    let styleSet = RouteStyleSet(styleID: styleID)
    let strokeWidth = max(lineWidth * 0.35, 1.0)
    let perLevelStyle = PerLevelRouteStyle(
      width: UInt(max(lineWidth, 1)),
      color: color,
      strokeWidth: UInt(max(strokeWidth, 1)),
      strokeColor: strokeColor,
      level: 0,
      patternIndex: -1
    )

    let routeStyle = RouteStyle(styles: [perLevelStyle])
    styleSet.addStyle(routeStyle)
    manager.addRouteStyleSet(styleSet)
    registeredStyleIDs.insert(styleID)
    NSLog("ensureStyleSet added styleID=\(styleID)")
  }

  private func clearRoute(routeID: String) {
    NSLog("clearRoute routeID=\(routeID) mapViewNil=\(mapView == nil)")
    guard let mapView = mapView else {
      return
    }
    let manager = mapView.getRouteManager()
    guard let layer = manager.getRouteLayer(layerID: routeLayerID) else {
      return
    }
    NSLog("clearRoute layer acquired id=\(routeLayerID)")
    if let route = layer.getRoute(routeID: routeID) {
      NSLog("clearRoute removing existing route id=\(routeID)")
      route.hide()
      layer.removeRoute(routeID: routeID)
    }
  }
}

extension UIColor {
  convenience init(argb: UInt32) {
    let a = CGFloat((argb >> 24) & 0xff) / 255.0
    let r = CGFloat((argb >> 16) & 0xff) / 255.0
    let g = CGFloat((argb >> 8) & 0xff) / 255.0
    let b = CGFloat(argb & 0xff) / 255.0
    self.init(red: r, green: g, blue: b, alpha: a)
  }
}
