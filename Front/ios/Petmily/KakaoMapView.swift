import Foundation
import UIKit
import KakaoMapsSDK

@objc protocol KMControllerStateReporting: AnyObject {
  @objc(getStateDescMessage) optional func getStateDescMessage() -> String
}

class KakaoMapView: KMViewContainer, MapControllerDelegate {
  private var mapController: KMController?
  private var mapView: KakaoMap?
  private var trackingManager: TrackingManager?
  private let routeTracker = KakaoMapTracker()
  private var pendingRoutes: [PendingRoute] = []
  private var isCameraTrackingEnabled = false
  private var userTrackingPoi: Poi?
  private let trackingLayerId = "PetmilyTrackingLayer"
  private var isTrackingPoiStyleRegistered = false
  
  private func ptr(_ obj: AnyObject?) -> String {
    guard let obj = obj else { return "nil" }
    return String(describing: Unmanaged.passUnretained(obj).toOpaque())
  }
  
  @objc var apiKey: NSString = ""{
    didSet {
      NSLog("KakaoMapView: apiKey didSet (length: \(apiKey.length))")
      if apiKey.length > 0 && oldValue != apiKey {
        initializeIfNeeded()
      }
    }
  }
  
  @objc var latitude: NSNumber = 37.5665 {
    didSet { updateMapPosition() }
  }
  
  @objc var longitude: NSNumber = 126.9780 {
    didSet { updateMapPosition() }
  }
  
  @objc var zoomLevel: NSNumber = 15 {
    didSet { updateMapPosition() }
  }
  
  private var isEnginePrepared = false
  private static var isSDKInitialized = false
  
  override init(frame: CGRect) {
    super.init(frame: frame)
    backgroundColor = .white
  }
  
  required init?(coder: NSCoder) {
    super.init(coder: coder)
    backgroundColor = .white
  }
  
  private func initializeIfNeeded() {
    guard apiKey.length > 0 else {
      NSLog("KakaoMapView: API Key가 설정되지 않았습니다")
      return
    }
    
    if mapController == nil {
      prepareController()
    } else if let controller = mapController, controller.isEngineActive == false {
      controller.activateEngine()
    }
  }
  
  private func prepareController() {
    guard mapController == nil else { return }
    
    if !KakaoMapView.isSDKInitialized {
      SDKInitializer.InitSDK(appKey: apiKey as String)
      KakaoMapView.isSDKInitialized = true
      NSLog("KakaoMapView: SDK 초기화 완료")
    }
    
    mapController = KMController(viewContainer: self)
    mapController?.delegate = self
    mapController?.prepareEngine()
    NSLog("KakaoMapView: prepareEngine 호출")
    
    mapController?.activateEngine()
    NSLog("KakaoMapView: activateEngine 호출")
  }
  
  @objc func authenticationFailed(_ errorCode: Int, desc: String) {
    NSLog("KakaoMapView: 인증 실패 - code: \(errorCode), desc: \(desc)")
  }
  
  @objc func addViews() {
    guard let controller = mapController else { return }
    
    let defaultPosition = MapPoint(longitude: longitude.doubleValue, latitude: latitude.doubleValue)
    NSLog("KakaoMapView: addViews - defaultPosition lat=\(latitude.doubleValue), lon=\(longitude.doubleValue), level=\(zoomLevel.intValue)")
    let mapviewInfo = MapviewInfo(
      viewName: "mapview",
      viewInfoName: "map",
      defaultPosition: defaultPosition,
      defaultLevel: max(zoomLevel.intValue, 6),
      enabled: true
    )
    
    controller.addView(mapviewInfo)
    NSLog("KakaoMapView: addView 호출")
  }
  
  @objc func addViewSucceeded(_ viewName: String, viewInfoName: String) {
    NSLog("addViewSucceeded called \(Unmanaged.passUnretained(self).toOpaque())")
    guard let controller = mapController else { return }

    // KakaoMap 객체만 얻어두고,
    guard let kmView = controller.getView(viewName) as? KakaoMap else {
      NSLog("KakaoMapView: addViewSucceeded - getView 실패")
      return
    }

    // 나머지 작업은 메인 스레드에서, 한 프레임 늦게 처리
    // kmView를 명시적으로 캡처하여 안전하게 전달
    let capturedMapView = kmView
    DispatchQueue.main.async { [weak self] in
      guard let self = self else { return }

      self.mapView = capturedMapView
      NSLog("KakaoMapView.addViewSucceeded onMain=\(Thread.isMainThread) mapViewPtr=\(self.ptr(self.mapView)) trackingManagerPtr=\(self.ptr(self.trackingManager))")
      
      // routeTracker.attach를 안전하게 호출
      self.routeTracker.attach(mapView: capturedMapView)
      
      self.trackingManager = capturedMapView.getTrackingManager()
      NSLog("KakaoMapView: addViewSucceeded - 지도 뷰 획득 성공")

      if let reporter = self.mapController as? KMControllerStateReporting,
         let obj = reporter as? NSObjectProtocol,
         obj.responds(to: #selector(KMControllerStateReporting.getStateDescMessage)) {
        let stateMessage = reporter.getStateDescMessage?() ?? ""
        NSLog("KakaoMapView: engine state -> %@", stateMessage)
      }

      capturedMapView.viewRect = self.bounds
      self.updateMapPosition()
      self.flushPendingRoutes()
    }
  }

  
  @objc func addViewFailed(_ viewName: String, viewInfoName: String) {
    NSLog("❌ KakaoMapView: addViewFailed - viewName: \(viewName), viewInfoName: \(viewInfoName)")
  }
  
  @objc func containerDidResized(_ size: CGSize) {
    if let mapView = mapView {
      mapView.viewRect = CGRect(origin: .zero, size: size)
      NSLog("KakaoMapView: containerDidResized - %.2fx%.2f", size.width, size.height)
    }
  }
  
  @objc func viewWillDestroyed(_ view: ViewBase) {
    NSLog("KakaoMapView: viewWillDestroyed - \(view.viewName)")
  }
  
  // MARK: - Layout / Lifecycle
  override func layoutSubviews() {
    super.layoutSubviews()
    
    if bounds.width > 0 && bounds.height > 0 {
      initializeIfNeeded()
      mapView?.viewRect = bounds
    }
  }
  
  deinit {
    NSLog("KakaoMapView deinit \(Unmanaged.passUnretained(self).toOpaque())")
    
    mapController?.delegate = nil
    mapController?.pauseEngine()
    mapController?.resetEngine()
    mapController = nil
    mapView = nil
    routeTracker.detach()
  }
  
  // MARK: - Helpers
  private func updateMapPosition() {
    guard let mapView = mapView else { return }
    
    let position = MapPoint(longitude: longitude.doubleValue, latitude: latitude.doubleValue)
    let level = max(zoomLevel.intValue, 6)
    NSLog("KakaoMapView: updateMapPosition -> lat=\(latitude.doubleValue), lon=\(longitude.doubleValue), level=\(level)")
    let cameraUpdate = CameraUpdate.make(target: position, zoomLevel: level, mapView: mapView)
    mapView.moveCamera(cameraUpdate)
  }
  
  @objc public func updateRoute(
    _ routeID: NSString,
    coordinates: NSArray,
    colorHex: NSNumber,
    strokeColorHex: NSNumber,
    lineWidth: NSNumber
  ) {
    let coordinateArray = extractCoordinateTuples(from: coordinates)
    let widthValue = lineWidth.doubleValue == 0 ? 12.0 : lineWidth.doubleValue
    let width = CGFloat(widthValue)
    let colorValue: UInt32 = colorHex.uint32Value != 0 ? colorHex.uint32Value : 0xFF4A90E2
    let strokeValue: UInt32 = strokeColorHex.uint32Value != 0 ? strokeColorHex.uint32Value : 0xFFFFFFFF
    
    guard self.mapView != nil else {
      storePendingRoute(
        PendingRoute(
          routeID: routeID as String,
          coordinates: coordinateArray,
          color: colorValue,
          strokeColor: strokeValue,
          lineWidth: width
        )
      )
      return
    }
    
    let mapPoints = coordinateArray.map { MapPoint(longitude: $0.longitude, latitude: $0.latitude) }
    routeTracker.updateRoute(
      routeID: routeID as String,
      coordinates: mapPoints,
      color: UIColor(argb: colorValue),
      strokeColor: UIColor(argb: strokeValue),
      lineWidth: width
    )
  }
  
  @objc public func clearRoute(_ routeID: NSString) {
    // 메인 스레드에서만 실행되도록 보장
    if !Thread.isMainThread {
      DispatchQueue.main.async { [weak self] in
        self?.clearRoute(routeID)
      }
      return
    }
    
    // Remove any pending route with the same ID if mapView isn't ready yet
    if mapView == nil {
      pendingRoutes.removeAll { $0.routeID == (routeID as String) }
      return
    }

    // KakaoMapTracker.clearRoute(routeID:) is not accessible (private).
    // Fallback: rebuild without the specified route by removing it from pending and re-flushing.
    pendingRoutes.removeAll { $0.routeID == (routeID as String) }
    flushPendingRoutes()
  }
  
  private func extractCoordinateTuples(from array: NSArray) -> [RouteCoordinate] {
    var result: [RouteCoordinate] = []
    for element in array {
      if let dict = element as? [String: Any] {
        let lat = (dict["latitude"] as? NSNumber)?.doubleValue ?? (dict["lat"] as? NSNumber)?.doubleValue
        let lon = (dict["longitude"] as? NSNumber)?.doubleValue ?? (dict["lng"] as? NSNumber)?.doubleValue
        if let latitude = lat, let longitude = lon {
          result.append(RouteCoordinate(latitude: latitude, longitude: longitude))
        }
      }
    }
    return result
  }
  
  private func storePendingRoute(_ route: PendingRoute) {
    // 메인 스레드에서만 실행되도록 보장
    if !Thread.isMainThread {
      DispatchQueue.main.async { [weak self] in
        self?.storePendingRoute(route)
      }
      return
    }
    pendingRoutes.removeAll { $0.routeID == route.routeID }
    pendingRoutes.append(route)
  }
  
  private func flushPendingRoutes() {
      // 메인 스레드에서만 실행되도록 보장
      if !Thread.isMainThread {
          NSLog("KakaoMapView.flushPendingRoutes called off-main. Dispatching to main.")
          DispatchQueue.main.async { [weak self] in
              self?.flushPendingRoutes()
          }
          return
      }
      
      NSLog("flushPendingRoutes begin onMain=\(Thread.isMainThread)")
      guard let mapView = self.mapView else {
          NSLog("[WARN] flushPendingRoutes skipped: mapView is nil")
          return
      }
      
      // pendingRoutes를 복사하여 안전하게 접근
      let routesToFlush = pendingRoutes
      guard !routesToFlush.isEmpty else {
          NSLog("flushPendingRoutes: no pending routes")
          return
      }

      for pending in routesToFlush {
          // Validate coordinates and convert safely
          let coords = pending.coordinates
          if coords.isEmpty {
              NSLog("[WARN] flushPendingRoutes: routeID=\(pending.routeID) has no coordinates, skipping")
              continue
          }

          // MapPoint init safety: if the SDK expects different initializer, adjust here
          let mapPoints: [MapPoint] = coords.compactMap { coord in
              // Validate longitude/latitude range if needed
              let lon = coord.longitude
              let lat = coord.latitude
              // Basic sanity check
              if !lon.isFinite || !lat.isFinite {
                  NSLog("[WARN] flushPendingRoutes: invalid coord (lon=\(lon), lat=\(lat)) for routeID=\(pending.routeID), skipping this point")
                  return nil
              }
              return MapPoint(longitude: lon, latitude: lat)
          }

          if mapPoints.isEmpty {
              NSLog("[WARN] flushPendingRoutes: all coordinates invalid for routeID=\(pending.routeID), skipping route")
              continue
          }

          NSLog("flushPendingRoutes: updating route routeID=\(pending.routeID) points=\(mapPoints.count)")
          routeTracker.updateRoute(
              routeID: pending.routeID,
              coordinates: mapPoints,
              color: UIColor(argb: pending.color),
              strokeColor: UIColor(argb: pending.strokeColor),
              lineWidth: pending.lineWidth
          )
      }

      // 처리한 라우트만 제거
      pendingRoutes.removeAll()
      NSLog("flushPendingRoutes end")
  }

  
  private struct RouteCoordinate {
    let latitude: Double
    let longitude: Double
  }
  
  private struct PendingRoute {
    let routeID: String
    let coordinates: [RouteCoordinate]
    let color: UInt32
    let strokeColor: UInt32
    let lineWidth: CGFloat
  }
  
  @objc func addMarker(_ latitude: NSNumber, longitude: NSNumber, title: NSString) {
    if !Thread.isMainThread {
      NSLog("KakaoMapView.addMarker called off-main. Dispatching to main. title=\(title)")
      DispatchQueue.main.async { [weak self] in self?.addMarker(latitude, longitude: longitude, title: title) }
      return
    }
    guard let mapView = mapView else { return }
    NSLog("KakaoMapView.addMarker onMain=\(Thread.isMainThread) mapViewPtr=\(ptr(mapView)) lat=\(latitude) lon=\(longitude) title=\(title)")
    
    let manager = mapView.getLabelManager()
    NSLog("KakaoMapView.addMarker LabelManager ptr=\(ptr(manager))")
    let layer = manager.getLabelLayer(layerID: "markerLayer") ?? manager.addLabelLayer(option: LabelLayerOptions(
      layerID: "markerLayer",
      competitionType: .none,
      competitionUnit: .symbolFirst,
      orderType: .rank,
      zOrder: 10001
    ))
    NSLog("KakaoMapView.addMarker LabelLayer id=markerLayer ptr=\(ptr(layer))")
    
    let position = MapPoint(longitude: longitude.doubleValue, latitude: latitude.doubleValue)
    let poiOptions = PoiOptions(styleID: "")
    poiOptions.clickable = true
    
    let poi = layer?.addPoi(option: poiOptions, at: position)
    NSLog("KakaoMapView.addMarker POI created ptr=\(poi.map { ptr($0) } ?? "nil") at lat=\(latitude.doubleValue) lon=\(longitude.doubleValue)")
    poi?.show()
    NSLog("KakaoMapView.addMarker POI show called")
  }
  
  // MARK: - Camera Tracking
  @objc func startCameraTracking() {
    if !Thread.isMainThread {
      NSLog("KakaoMapView.startCameraTracking called off-main. Dispatching to main.")
      DispatchQueue.main.async { [weak self] in self?.startCameraTracking() }
      return
    }
    guard let mapView = mapView else {
      NSLog("KakaoMapView: 카메라 추적을 시작할 수 없습니다 (mapView nil)")
      return
    }
    NSLog("KakaoMapView.startCameraTracking onMain=\(Thread.isMainThread) mapViewPtr=\(ptr(mapView)) trackingManagerPtr=\(ptr(trackingManager))")
    
    let position = MapPoint(longitude: longitude.doubleValue, latitude: latitude.doubleValue)
    guard let poi = ensureTrackingPoi(on: mapView, at: position) else {
      NSLog("KakaoMapView: 추적용 POI 생성 실패")
      return
    }
    
    trackingManager?.stopTracking()
    trackingManager?.isTrackingRoll = false
    trackingManager?.startTrackingPoi(poi)
    
    isCameraTrackingEnabled = true
    NSLog("KakaoMapView: 카메라 추적 시작 (TrackingManager 사용)")
  }
  
  @objc func stopCameraTracking() {
    if !Thread.isMainThread {
      NSLog("KakaoMapView.stopCameraTracking called off-main. Dispatching to main.")
      DispatchQueue.main.async { [weak self] in self?.stopCameraTracking() }
      return
    }
    NSLog("KakaoMapView.stopCameraTracking onMain=\(Thread.isMainThread) trackingManagerPtr=\(ptr(trackingManager))")
    trackingManager?.stopTracking()
    isCameraTrackingEnabled = false
    NSLog("KakaoMapView: 카메라 추적 중지")
  }
  
  @objc func updateTrackingLocation(_ latitude: NSNumber, longitude: NSNumber) {
    if !Thread.isMainThread {
      NSLog("KakaoMapView.updateTrackingLocation called off-main. Dispatching to main. lat=\(latitude) lon=\(longitude)")
      DispatchQueue.main.async { [weak self] in self?.updateTrackingLocation(latitude, longitude: longitude) }
      return
    }
    guard let mapView = mapView else { return }
    NSLog("KakaoMapView.updateTrackingLocation onMain=\(Thread.isMainThread) mapViewPtr=\(ptr(mapView)) poiPtr=\(ptr(userTrackingPoi)) lat=\(latitude) lon=\(longitude)")
    
    let position = MapPoint(longitude: longitude.doubleValue, latitude: latitude.doubleValue)
    _ = ensureTrackingPoi(on: mapView, at: position)
    userTrackingPoi?.moveAt(position, duration: 0)
    NSLog("KakaoMapView.updateTrackingLocation moved POI")
    
    if isCameraTrackingEnabled {
      let level = max(zoomLevel.intValue, 6)
      let cameraUpdate = CameraUpdate.make(target: position, zoomLevel: level, mapView: mapView)
      NSLog("KakaoMapView.updateTrackingLocation moving camera level=\(level)")
      mapView.moveCamera(cameraUpdate)
    }
  }

  private func ensureTrackingPoiStyle(on manager: LabelManager) {
      NSLog("KakaoMapView.ensureTrackingPoiStyle begin registered=\(isTrackingPoiStyleRegistered)")
      guard !isTrackingPoiStyleRegistered else { return }

      let symbol = makeTrackingSymbol()
      NSLog("KakaoMapView.ensureTrackingPoiStyle symbol size=\(symbol.size)")
      // size 0인 이미지 방지
      if symbol.size.width <= 0 || symbol.size.height <= 0 {
          NSLog("KakaoMapView: makeTrackingSymbol이 유효한 이미지를 만들지 못했습니다.")
          return
      }

      let iconStyle = PoiIconStyle(symbol: symbol, anchorPoint: CGPoint(x: 0.5, y: 0.5))
      let perLevelStyle = PerLevelPoiStyle(iconStyle: iconStyle, level: 0)
      let poiStyle = PoiStyle(styleID: "trackingPoiStyle", styles: [perLevelStyle])
      manager.addPoiStyle(poiStyle)
      isTrackingPoiStyleRegistered = true
      NSLog("KakaoMapView.ensureTrackingPoiStyle style added styleID=trackingPoiStyle")
  }


  private func makeTrackingSymbol() -> UIImage {
      let size = CGSize(width: 18, height: 18)
      UIGraphicsBeginImageContextWithOptions(size, false, 0)
      defer { UIGraphicsEndImageContext() }
      
      let circleRect = CGRect(origin: .zero, size: size)
      let path = UIBezierPath(ovalIn: circleRect)
      
      // 배경 원
      UIColor(red: 0.925, green: 0.447, blue: 0.271, alpha: 1).setFill()
      path.fill()
      
      // 테두리
      UIColor.white.setStroke()
      path.lineWidth = 2
      path.stroke()
      
      guard let image = UIGraphicsGetImageFromCurrentImageContext() else {
          assertionFailure("makeTrackingSymbol: 이미지 생성 실패")
          // 최소한 "빈" 이미지라도 돌려줘서 Kakao SDK에 nil 안 넘어가게
          return UIImage()
      }
      
      return image
  }

  // Ensures the tracking label layer exists and returns it
  private func ensureTrackingLayer(on manager: LabelManager) -> LabelLayer? {
    NSLog("KakaoMapView.ensureTrackingLayer begin layerID=\(trackingLayerId)")
    if let existing = manager.getLabelLayer(layerID: trackingLayerId) {
      NSLog("KakaoMapView.ensureTrackingLayer reuse existing ptr=\(ptr(existing))")
      return existing
    }
    let options = LabelLayerOptions(
      layerID: trackingLayerId,
      competitionType: .none,
      competitionUnit: .symbolFirst,
      orderType: .rank,
      zOrder: 10002
    )
    let newLayer = manager.addLabelLayer(option: options)
    NSLog("KakaoMapView.ensureTrackingLayer created new ptr=\(ptr(newLayer))")
    return newLayer
  }

  // Ensures a tracking POI exists at the given position and returns it
  private func ensureTrackingPoi(on mapView: KakaoMap, at position: MapPoint) -> Poi? {
    let labelManager = mapView.getLabelManager()
    NSLog("KakaoMapView.ensureTrackingPoi LabelManager ptr=\(ptr(labelManager))")

    // Ensure style is registered once
    ensureTrackingPoiStyle(on: labelManager)
    NSLog("KakaoMapView.ensureTrackingPoi style ensured")

    // Ensure layer exists
    guard let layer = ensureTrackingLayer(on: labelManager) else { return nil }
    NSLog("KakaoMapView.ensureTrackingPoi layer ensured ptr=\(ptr(layer))")

    // Reuse existing POI if we have one
    if let poi = userTrackingPoi {
      NSLog("KakaoMapView.ensureTrackingPoi reuse existing poiPtr=\(ptr(poi)) -> show()")
      // Ensure the POI is visible; calling show() is idempotent in KakaoMapsSDK
      poi.show()
      return poi
    }

    // Create a new tracking POI
    NSLog("KakaoMapView.ensureTrackingPoi creating new POI with options styleID=trackingPoiStyle")
    let options = PoiOptions(styleID: "trackingPoiStyle")
    options.clickable = false
    guard let poi = layer.addPoi(option: options, at: position) else { return nil }
    NSLog("KakaoMapView.ensureTrackingPoi new poi created poiPtr=\(ptr(poi)) -> show()")
    poi.show()

    // Keep a reference for subsequent updates
    userTrackingPoi = poi
    NSLog("KakaoMapView.ensureTrackingPoi set userTrackingPoi poiPtr=\(ptr(userTrackingPoi))")
    return poi
  }
}

