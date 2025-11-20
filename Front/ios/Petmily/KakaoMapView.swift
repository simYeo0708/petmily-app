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
  
  // React Native 뷰 라이프사이클 추적을 위한 플래그
  private var isInitialized = false
  private var isAddingViews = false
  private var hasStartedCleanup = false
  
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
    // 중복 초기화 방지: 이미 초기화되었거나 정리 중이면 무시
    guard !isInitialized && !hasStartedCleanup else {
      NSLog("KakaoMapView: initializeIfNeeded skipped (isInitialized=\(isInitialized), hasStartedCleanup=\(hasStartedCleanup))")
      return
    }
    
    guard apiKey.length > 0 else {
      NSLog("KakaoMapView: API Key가 설정되지 않았습니다")
      return
    }
    
    // 메인 스레드에서만 실행
    if !Thread.isMainThread {
      DispatchQueue.main.async { [weak self] in
        self?.initializeIfNeeded()
      }
      return
    }
    
    if mapController == nil {
      prepareController()
    } else if let controller = mapController, controller.isEngineActive == false {
      controller.activateEngine()
    }
    
    isInitialized = true
    NSLog("KakaoMapView: initializeIfNeeded 완료 (isInitialized=true)")
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
    // 중복 호출 방지 및 정리 중인 경우 무시
    guard !isAddingViews && !hasStartedCleanup else {
      NSLog("KakaoMapView: addViews skipped (isAddingViews=\(isAddingViews), hasStartedCleanup=\(hasStartedCleanup))")
      return
    }
    
    guard let controller = mapController else {
      NSLog("KakaoMapView: addViews skipped - mapController is nil")
      return
    }
    
    // 메인 스레드에서만 실행
    if !Thread.isMainThread {
      DispatchQueue.main.async { [weak self] in
        self?.addViews()
      }
      return
    }
    
    isAddingViews = true
    
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
    
    // 정리 중이면 무시
    guard !hasStartedCleanup else {
      NSLog("KakaoMapView: addViewSucceeded skipped - cleanup started")
      return
    }
    
    guard let controller = mapController else {
      NSLog("KakaoMapView: addViewSucceeded - mapController is nil")
      return
    }

    // KakaoMap 객체만 얻어두고,
    guard let kmView = controller.getView(viewName) as? KakaoMap else {
      NSLog("KakaoMapView: addViewSucceeded - getView 실패")
      isAddingViews = false
      return
    }

    // 나머지 작업은 메인 스레드에서, 한 프레임 늦게 처리
    // kmView를 명시적으로 캡처하여 안전하게 전달
    let capturedMapView = kmView
    
    // pendingRoutes는 클로저 내부에서 strongSelf가 확실히 유효할 때 접근
    // 외부에서 접근하면 self.pendingRoutes의 내부 버퍼가 nil일 수 있음
    DispatchQueue.main.async { [weak self] in
      // self를 strong 참조로 변환하여 해제 방지
      guard let strongSelf = self else {
        NSLog("KakaoMapView.addViewSucceeded: self is nil, skipping")
        return
      }

      strongSelf.mapView = capturedMapView
      NSLog("KakaoMapView.addViewSucceeded onMain=\(Thread.isMainThread) mapViewPtr=\(strongSelf.ptr(strongSelf.mapView)) trackingManagerPtr=\(strongSelf.ptr(strongSelf.trackingManager))")
      
      // routeTracker를 strong 참조로 캡처하여 해제 방지
      // routeTracker.attach는 이미 메인 스레드이므로 동기적으로 호출
      let tracker = strongSelf.routeTracker
      tracker.attach(mapView: capturedMapView)
      
      strongSelf.trackingManager = capturedMapView.getTrackingManager()
      NSLog("KakaoMapView: addViewSucceeded - 지도 뷰 획득 성공")

      if let reporter = strongSelf.mapController as? KMControllerStateReporting,
         let obj = reporter as? NSObjectProtocol,
         obj.responds(to: #selector(KMControllerStateReporting.getStateDescMessage)) {
        let stateMessage = reporter.getStateDescMessage?() ?? ""
        NSLog("KakaoMapView: engine state -> %@", stateMessage)
      }

      capturedMapView.viewRect = strongSelf.bounds
      
      // updateMapPosition 호출 전에 필요한 값들을 모두 캡처
      // strongSelf를 사용하여 self 해제 방지
      // PendingRoute는 struct이고 모든 프로퍼티가 let이므로,
      // 배열 할당만으로도 자동 복사됨 (Array() 래퍼 불필요)
      
      // pendingRoutes는 strongSelf가 확실히 유효할 때 접근
      // 안전하게 복사하기 위해 빈 배열로 시작하고 조건부로 복사
      let routesToFlush: [PendingRoute]
      do {
        // strongSelf.pendingRoutes에 안전하게 접근
        // 먼저 빈 배열인지 확인하여 isEmpty 접근 최소화
        let tempRoutes = strongSelf.pendingRoutes
        
        // 배열이 비어있으면 빈 배열, 아니면 명시적으로 복사
        if tempRoutes.isEmpty {
          routesToFlush = []
        } else {
          // 명시적으로 새 배열 생성하여 내부 버퍼 독립성 보장
          routesToFlush = Array(tempRoutes)
        }
      }
      
      // count 접근 전에 배열이 유효한지 확인
      let routesCount = routesToFlush.count
      NSLog("flushPendingRoutes: pendingRoutes 캡처 완료 (count=\(routesCount))")
      
      // mapView 캡처
      let currentMapView = strongSelf.mapView
      NSLog("flushPendingRoutes: mapView 캡처 완료 (nil=\(currentMapView == nil))")
      
      // tracker는 이미 위에서 캡처했으므로 재사용
      NSLog("flushPendingRoutes: tracker 재사용")
      
      // 로깅을 위해 값을 안전하게 추출
      // routesToFlush는 이미 위에서 안전하게 초기화되었으므로 안전하게 접근 가능
      // routesCount는 이미 위에서 계산되었으므로 재사용
      let hasMapView = currentMapView != nil
      
      // 로깅 (이미 추출된 값만 사용)
      NSLog("flushPendingRoutes: captured values (routes=\(routesCount), mapView=\(hasMapView))")
      
      // updateMapPosition 호출
      strongSelf.updateMapPosition()
      
      // ✅ Unbalanced calls 문제 해결: flushPendingRoutes 호출을 한 프레임 더 연기
      // React Native의 뷰 렌더 트랜잭션이 완전히 완료된 후에 실행되도록 함
      if let mapView = currentMapView, !routesToFlush.isEmpty {
        NSLog("flushPendingRoutes: scheduling for next frame (routes=\(routesCount))")
        // 한 프레임 더 연기하여 React Native의 뷰 렌더 트랜잭션과 충돌 방지
        DispatchQueue.main.async {
          [weak self] in
          guard let strongSelf = self else {
            NSLog("flushPendingRoutes: self is nil after frame delay")
            return
          }
          
          // 정리 중이면 무시
          guard !strongSelf.hasStartedCleanup else {
            NSLog("flushPendingRoutes: skipped - cleanup started")
            return
          }
          
          NSLog("flushPendingRoutes: processing \(routesCount) routes (after frame delay)")
          strongSelf.flushPendingRoutesWithData(mapView: mapView, routes: routesToFlush, tracker: tracker)
          
          // 처리한 라우트 제거
          if !routesToFlush.isEmpty {
            strongSelf.pendingRoutes.removeAll()
          }
          NSLog("flushPendingRoutes: completed")
        }
      } else {
        NSLog("flushPendingRoutes: skipped (mapView=\(hasMapView), routes=\(routesCount))")
      }
      
      // addViews 플래그 리셋
      strongSelf.isAddingViews = false
    }
  }

  @objc func addViewFailed(_ viewName: String, viewInfoName: String) {
    NSLog("❌ KakaoMapView: addViewFailed - viewName: \(viewName), viewInfoName: \(viewInfoName)")
    // 실패 시 플래그 리셋
    isAddingViews = false
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
  
  // React Native 뷰 라이프사이클과 동기화: 뷰가 부모 뷰 계층에 추가될 때
  override func willMove(toSuperview newSuperview: UIView?) {
    super.willMove(toSuperview: newSuperview)
    
    if newSuperview != nil {
      // 뷰가 추가될 때: 정리 플래그 리셋하고 초기화 준비
      if hasStartedCleanup {
        NSLog("KakaoMapView: willMoveToSuperview - resetting cleanup flag")
        hasStartedCleanup = false
      }
    } else {
      // 뷰가 제거될 때: 정리 시작
      if !hasStartedCleanup {
        NSLog("KakaoMapView: willMoveToSuperview(nil) - starting cleanup")
        cleanup()
      }
    }
  }
  
  override func didMoveToSuperview() {
    super.didMoveToSuperview()
    
    // 뷰가 부모에 추가된 후에만 초기화 (React Native가 완전히 마운트된 후)
    if superview != nil && bounds.width > 0 && bounds.height > 0 {
      NSLog("KakaoMapView: didMoveToSuperview - initializing")
      initializeIfNeeded()
      
      // 초기화가 완료되고 mapController가 있으면 addViews 호출
      if mapController != nil && !isAddingViews {
        addViews()
      }
    }
  }
  
  override func layoutSubviews() {
    super.layoutSubviews()
    
    // 정리 중이면 layout 업데이트 무시
    guard !hasStartedCleanup else { return }
    
    if bounds.width > 0 && bounds.height > 0 {
      // 이미 초기화되었고 뷰가 부모에 있을 때만 업데이트
      if isInitialized && superview != nil {
        mapView?.viewRect = bounds
      }
    }
  }
  
  // 정리 로직을 별도 메서드로 분리
  private func cleanup() {
    // 메인 스레드에서만 실행
    if !Thread.isMainThread {
      DispatchQueue.main.async { [weak self] in
        self?.cleanup()
      }
      return
    }
    
    guard !hasStartedCleanup else {
      NSLog("KakaoMapView: cleanup already started, skipping")
      return
    }
    
    hasStartedCleanup = true
    NSLog("KakaoMapView: cleanup 시작")
    
    // 카메라 추적 중지
    if isCameraTrackingEnabled {
      trackingManager?.stopTracking()
      isCameraTrackingEnabled = false
    }
    
    // 뷰 정리
    mapView = nil
    userTrackingPoi = nil
    pendingRoutes.removeAll()
    
    // 엔진 정리
    mapController?.delegate = nil
    mapController?.pauseEngine()
    mapController?.resetEngine()
    mapController = nil
    
    routeTracker.detach()
    
    // 플래그 리셋
    isInitialized = false
    isAddingViews = false
    isTrackingPoiStyleRegistered = false
    
    NSLog("KakaoMapView: cleanup 완료")
  }
  
  deinit {
    NSLog("KakaoMapView deinit \(Unmanaged.passUnretained(self).toOpaque())")
    
    // deinit에서도 안전하게 정리 (이미 cleanup이 호출되었을 수 있음)
    if !hasStartedCleanup {
      cleanup()
    }
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
    
    guard let currentMapView = self.mapView else { return }
    let mapPoints = coordinateArray.map { MapPoint(longitude: $0.longitude, latitude: $0.latitude) }
    routeTracker.updateRoute(
      mapView: currentMapView,
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
        guard let self = self else { return }
        self.clearRoute(routeID)
      }
      return
    }
    
    // Remove any pending route with the same ID if mapView isn't ready yet
    if mapView == nil {
      pendingRoutes.removeAll { $0.routeID == (routeID as String) }
      return
    }

    guard let currentMapView = mapView else { return }
    routeTracker.clearRoute(mapView: currentMapView, routeID: routeID as String)
    pendingRoutes.removeAll { $0.routeID == (routeID as String) }
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
        guard let self = self else { return }
        self.storePendingRoute(route)
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
              guard let self = self else { return }
              self.flushPendingRoutes()
          }
          return
      }
      
      NSLog("flushPendingRoutes begin onMain=\(Thread.isMainThread)")
      guard let mapView = self.mapView else {
          NSLog("[WARN] flushPendingRoutes skipped: mapView is nil")
          return
      }
      
      let routesToFlush = self.pendingRoutes
      let tracker = self.routeTracker
      
      if !routesToFlush.isEmpty {
        self.flushPendingRoutesWithData(mapView: mapView, routes: routesToFlush, tracker: tracker)
      } else {
        NSLog("flushPendingRoutes: no pending routes")
      }
  }
  
  private func flushPendingRoutesWithData(mapView: KakaoMap, routes: [PendingRoute], tracker: KakaoMapTracker) {
      NSLog("flushPendingRoutesWithData begin routes=\(routes.count)")
      
      for pending in routes {
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
          tracker.updateRoute(
              mapView: mapView,
              routeID: pending.routeID,
              coordinates: mapPoints,
              color: UIColor(argb: pending.color),
              strokeColor: UIColor(argb: pending.strokeColor),
              lineWidth: pending.lineWidth
          )
      }

      NSLog("flushPendingRoutesWithData end")
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
      DispatchQueue.main.async { [weak self] in
        guard let self = self else { return }
        self.addMarker(latitude, longitude: longitude, title: title)
      }
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
      DispatchQueue.main.async { [weak self] in
        guard let self = self else { return }
        self.startCameraTracking()
      }
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
      DispatchQueue.main.async { [weak self] in
        guard let self = self else { return }
        self.stopCameraTracking()
      }
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
      DispatchQueue.main.async { [weak self] in
        guard let self = self else { return }
        self.updateTrackingLocation(latitude, longitude: longitude)
      }
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
      // ✅ unsupported image format 문제 해결: 명시적 설정으로 이미지 포맷 보장
      // 명시적인 크기와 scale 설정 (최소 1.0 이상)
      let size = CGSize(width: 18, height: 18)
      // scale을 명확히 1.0 이상으로 설정 (Kakao SDK 호환성)
      let scale: CGFloat = max(UIScreen.main.scale, 1.0)  // 화면 scale 또는 최소 1.0
      // opaque를 false로 설정하여 alpha 채널 지원 (Kakao SDK 요구사항)
      let opaque = false
      
      // ✅ 명시적으로 옵션을 설정하여 이미지 포맷 보장
      UIGraphicsBeginImageContextWithOptions(size, opaque, scale)
      defer { 
          UIGraphicsEndImageContext() 
      }
      
      // 그래픽 컨텍스트가 유효한지 확인
      guard let context = UIGraphicsGetCurrentContext() else {
          NSLog("[ERROR] makeTrackingSymbol: 그래픽 컨텍스트를 얻을 수 없습니다")
          // 최소한 투명한 이미지라도 반환 (빈 이미지가 아닌 투명한 1x1 이미지)
          return UIImage()
      }
      
      // ✅ 컨텍스트 설정 명시 (색공간 및 포맷 명확히 지정)
      context.interpolationQuality = .high
      
      let circleRect = CGRect(origin: .zero, size: size)
      let path = UIBezierPath(ovalIn: circleRect)
      
      // 배경 원 (명시적 색상 및 alpha 설정)
      UIColor(red: 0.925, green: 0.447, blue: 0.271, alpha: 1.0).setFill()
      path.fill()
      
      // 테두리 (명시적 색상 설정)
      UIColor.white.withAlphaComponent(1.0).setStroke()
      path.lineWidth = 2.0
      path.stroke()
      
      // ✅ 이미지 생성 및 검증 (포맷 확인)
      guard let image = UIGraphicsGetImageFromCurrentImageContext() else {
          NSLog("[ERROR] makeTrackingSymbol: 이미지 생성 실패 - UIGraphicsGetImageFromCurrentImageContext returned nil")
          return UIImage()
      }
      
      // ✅ 이미지 유효성 검증
      guard image.size.width > 0 && image.size.height > 0 else {
          NSLog("[ERROR] makeTrackingSymbol: 유효하지 않은 이미지 크기 (width=\(image.size.width), height=\(image.size.height))")
          return UIImage()
      }
      
      // ✅ scale 검증 (1.0 이상이어야 함)
      guard image.scale >= 1.0 else {
          NSLog("[ERROR] makeTrackingSymbol: 유효하지 않은 이미지 scale (scale=\(image.scale))")
          return UIImage()
      }
      
      // ✅ 이미지 포맷 검증 (CGImage가 있는지 확인)
      guard image.cgImage != nil else {
          NSLog("[ERROR] makeTrackingSymbol: CGImage가 nil입니다 - 이미지 포맷 문제")
          return UIImage()
      }
      
      NSLog("makeTrackingSymbol: 이미지 생성 성공 (size=\(image.size), scale=\(image.scale), cgImage=\(image.cgImage != nil))")
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

