-- 테스트용 사용자 생성 (username: asdf, 비밀번호: asdf)
-- H2는 ddl-auto=create로 테이블을 새로 만들므로 INSERT 사용
INSERT INTO users (username, email, password, name, role) VALUES 
('asdf', 'asdf@test.com', '$2a$10$JcfBzfaJRJPUexJl7FZv0OBdmvgxMFxXJjDKn8OyONyRdvOl0WfSu', 'asdf', 'USER');

-- 테스트용 반려동물 생성 (프로필 사진 없음으로 초기화)
INSERT INTO pets (user_id, name, species, breed, age, weight, gender, is_neutered, description, photo_uri, has_photo) VALUES 
(1, '멍멍이', 'dog', '골든리트리버', '3살', '25.5', 'male', true, '활발하고 친근한 강아지입니다.', null, false);

-- 테스트용 반려동물 성격 정보 (temperaments_order는 List 순서)
INSERT INTO pet_temperaments (pet_id, temperament, temperaments_order) VALUES (1, '온순함', 0);
INSERT INTO pet_temperaments (pet_id, temperament, temperaments_order) VALUES (1, '활발함', 1);
INSERT INTO pet_temperaments (pet_id, temperament, temperaments_order) VALUES (1, '사교적', 2);

-- 워커 모집 알림 데이터 (created_at, updated_at 필수)
INSERT INTO notifications (title, content, type, status, is_active, priority, created_at, updated_at) VALUES
('워커로 활동 중입니다! 🚶‍♂️', 
 '반려동물 산책 서비스의 워커로 활동해보세요. 유연한 시간에 수익을 창출할 수 있습니다!', 
 'WALKER_RECRUITMENT', 
 'PUBLISHED', 
 true, 
 10,
 CURRENT_TIMESTAMP,
 CURRENT_TIMESTAMP);

-- 서비스 공지사항 (SERVICE_ANNOUNCEMENT 사용)
INSERT INTO notifications (title, content, type, status, is_active, priority, created_at, updated_at) VALUES
('새로운 기능이 추가되었습니다! 🎉', 
 '산책 경로 추적 기능과 실시간 위치 공유 기능이 추가되었습니다.', 
 'SERVICE_ANNOUNCEMENT', 
 'PUBLISHED', 
 true, 
 5,
 CURRENT_TIMESTAMP,
 CURRENT_TIMESTAMP);

-- 시스템 업데이트 알림 (SYSTEM_UPDATE 사용)
INSERT INTO notifications (title, content, type, status, is_active, priority, created_at, updated_at) VALUES
('앱 업데이트 안내 💰', 
 '더 나은 서비스 제공을 위해 앱이 업데이트되었습니다.', 
 'SYSTEM_UPDATE', 
 'PUBLISHED', 
 true, 
 8,
 CURRENT_TIMESTAMP,
 CURRENT_TIMESTAMP);
