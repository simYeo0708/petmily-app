#!/usr/bin/env python3
"""
Xcode 프로젝트에 KakaoMapView 관련 파일들을 자동으로 추가하는 스크립트
"""
import os
import re
import uuid
import sys

def generate_uuid():
    """Xcode 프로젝트용 UUID 생성"""
    return ''.join([format(int(x, 16), '08X') for x in uuid.uuid4().hex[:8]])

def add_files_to_xcode_project():
    project_path = os.path.join(os.path.dirname(__file__), '..', 'ios', 'Petmily.xcodeproj', 'project.pbxproj')
    
    if not os.path.exists(project_path):
        print(f"❌ 프로젝트 파일을 찾을 수 없습니다: {project_path}")
        return False
    
    # 파일 정보
    files_to_add = [
        {
            'name': 'KakaoMapView.swift',
            'path': 'Petmily/KakaoMapView.swift',
            'type': 'sourcecode.swift'
        },
        {
            'name': 'KakaoMapViewManager.swift',
            'path': 'Petmily/KakaoMapViewManager.swift',
            'type': 'sourcecode.swift'
        },
        {
            'name': 'KakaoMapViewManager.m',
            'path': 'Petmily/KakaoMapViewManager.m',
            'type': 'sourcecode.c.objc'
        }
    ]
    
    # 파일 읽기
    with open(project_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 이미 추가되어 있는지 확인
    for file_info in files_to_add:
        if file_info['name'] in content:
            print(f"⚠️  {file_info['name']}은 이미 프로젝트에 추가되어 있습니다.")
            continue
    
    # UUID 생성
    uuids = {}
    for file_info in files_to_add:
        uuids[file_info['name']] = {
            'fileRef': generate_uuid(),
            'buildFile': generate_uuid()
        }
    
    # 1. PBXFileReference 섹션에 파일 참조 추가
    file_ref_section = '/* Begin PBXFileReference section */'
    file_ref_end = '/* End PBXFileReference section */'
    
    file_refs = []
    for file_info in files_to_add:
        file_refs.append(
            f'\t\t{uuids[file_info["name"]]["fileRef"]} /* {file_info["name"]} */ = '
            f'{{isa = PBXFileReference; lastKnownFileType = {file_info["type"]}; '
            f'name = "{file_info["name"]}"; path = "{file_info["path"]}"; sourceTree = "<group>"; }};'
        )
    
    # AppDelegate.swift 다음에 추가
    appdelegate_pattern = r'(F11748412D0307B40044C1D9 /\* AppDelegate\.swift \*/ = \{isa = PBXFileReference[^;]+;\})'
    replacement = r'\1\n' + '\n'.join(file_refs)
    content = re.sub(appdelegate_pattern, replacement, content)
    
    # 2. PBXBuildFile 섹션에 빌드 파일 추가
    build_file_section = '/* Begin PBXBuildFile section */'
    build_file_end = '/* End PBXBuildFile section */'
    
    build_files = []
    for file_info in files_to_add:
        build_files.append(
            f'\t\t{uuids[file_info["name"]]["buildFile"]} /* {file_info["name"]} in Sources */ = '
            f'{{isa = PBXBuildFile; fileRef = {uuids[file_info["name"]]["fileRef"]} /* {file_info["name"]} */; }};'
        )
    
    # AppDelegate.swift 빌드 파일 다음에 추가
    appdelegate_build_pattern = r'(F11748422D0307B40044C1D9 /\* AppDelegate\.swift in Sources \*/ = \{isa = PBXBuildFile[^;]+;\})'
    replacement = r'\1\n' + '\n'.join(build_files)
    content = re.sub(appdelegate_build_pattern, replacement, content)
    
    # 3. PBXGroup 섹션의 Petmily 그룹에 파일 참조 추가
    petmily_group_pattern = r'(13B07FAE1A68108700A75B9A /\* Petmily \*/ = \{[^}]+children = \(\s+)(F11748412D0307B40044C1D9 /\* AppDelegate\.swift \*/)'
    
    file_refs_in_group = []
    for file_info in files_to_add:
        file_refs_in_group.append(f'\t\t\t\t{uuids[file_info["name"]]["fileRef"]} /* {file_info["name"]} */,')
    
    replacement = r'\1\2,\n' + '\n'.join(file_refs_in_group)
    content = re.sub(petmily_group_pattern, replacement, content)
    
    # 4. PBXSourcesBuildPhase 섹션에 빌드 파일 추가
    sources_pattern = r'(13B07F871A680F5B00A75B9A /\* Sources \*/ = \{[^}]+files = \(\s+)(F11748422D0307B40044C1D9 /\* AppDelegate\.swift in Sources \*/,)'
    
    build_files_in_sources = []
    for file_info in files_to_add:
        build_files_in_sources.append(f'\t\t\t\t{uuids[file_info["name"]]["buildFile"]} /* {file_info["name"]} in Sources */,')
    
    replacement = r'\1\2\n' + '\n'.join(build_files_in_sources)
    content = re.sub(sources_pattern, replacement, content)
    
    # 파일 쓰기
    with open(project_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ KakaoMapView 관련 파일들이 Xcode 프로젝트에 추가되었습니다!")
    print("   - KakaoMapView.swift")
    print("   - KakaoMapViewManager.swift")
    print("   - KakaoMapViewManager.m")
    print("\n이제 빌드를 시도해보세요: npx expo run:ios")
    
    return True

if __name__ == '__main__':
    try:
        add_files_to_xcode_project()
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)




