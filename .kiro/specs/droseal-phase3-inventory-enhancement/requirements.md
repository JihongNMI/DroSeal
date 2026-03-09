# Requirements Document

## Introduction

DroSeal Phase 3는 인벤토리 페이지의 고급 기능을 추가하는 단계입니다. Phase 1에서 구축된 기본 인프라(네비게이션, localStorage)를 기반으로, 계층적 카테고리 관리, 향상된 아이템 정보 입력, 수량 변동 이력 추적 등의 기능을 제공합니다.

## Glossary

- **Inventory_System**: 사용자의 수집품을 관리하는 시스템
- **Category**: 아이템을 분류하는 계층적 구조의 분류 체계
- **Uncategorized_Category**: 시스템이 제공하는 삭제 불가능한 기본 카테고리 ('미분류')
- **Item**: 사용자가 수집한 개별 수집품
- **History_Record**: 아이템의 수량 변동 및 삭제 이력을 기록하는 데이터
- **Encyclopedia**: 사용자가 등록한 도감 (아이템과 연결 가능)
- **Transaction**: 거래 데이터 (아이템의 가격 정보와 연동)
- **LocalStorage_Service**: 브라우저 localStorage를 통해 데이터를 영구 저장하는 서비스

## Requirements

### Requirement 1: 초기 사용자 설정

**User Story:** 사용자로서, 처음 앱을 사용할 때 내 수집 방식에 맞는 카테고리 구조를 설정하고 싶습니다. 그래야 나에게 맞는 방식으로 수집품을 관리할 수 있습니다.

#### Acceptance Criteria

1. WHEN 사용자가 처음으로 Inventory 페이지에 접근하고 카테고리가 존재하지 않을 때, THE Inventory_System SHALL "미분류" 카테고리를 자동으로 생성한다
2. WHEN "미분류" 카테고리가 생성된 후, THE Inventory_System SHALL "수집품을 어떤 방식으로 관리하고 싶으신가요?" 질문을 표시한다
3. THE Inventory_System SHALL 두 가지 옵션을 제공한다:
   - 옵션 A: "아이템 종류별로 모으기 (예: 씰, 카드, 피규어)"
   - 옵션 B: "작품/컨텐츠별로 모으기 (예: 포켓몬, 블루아카, 산리오)"
4. WHEN 사용자가 옵션을 선택할 때, THE Inventory_System SHALL 카테고리 이름 입력 인터페이스를 표시한다
5. WHEN 사용자가 카테고리 이름을 입력할 때, THE Inventory_System SHALL 입력된 카테고리들을 "미분류"와 동일한 최상위 레벨로 생성한다
6. THE Inventory_System SHALL "미분류" 카테고리를 삭제할 수 없도록 제한한다
7. WHEN 아이템이 카테고리 없이 생성되거나 categoryId가 null일 때, THE Inventory_System SHALL 해당 아이템을 "미분류" 카테고리에 자동으로 할당한다
8. THE Inventory_System SHALL "미분류" 외의 모든 카테고리를 삭제 가능하도록 허용한다

### Requirement 2: 계층적 카테고리 구조

**User Story:** 사용자로서, 카테고리를 계층적으로 구성하고 싶습니다. 그래야 수집품을 더 세밀하게 분류할 수 있습니다.

#### Acceptance Criteria

1. THE Inventory_System SHALL 카테고리를 부모-자식 관계의 계층 구조로 저장한다
2. WHEN 사용자가 카테고리를 클릭할 때, THE Inventory_System SHALL 해당 카테고리의 직계 하위 카테고리만 펼쳐서 표시한다
3. WHEN 사용자가 펼쳐진 카테고리를 다시 클릭할 때, THE Inventory_System SHALL 하위 카테고리를 접는다
4. THE Inventory_System SHALL 서로 다른 부모 카테고리 아래에 동일한 이름의 카테고리 생성을 허용한다
5. THE Inventory_System SHALL 서로 다른 계층 레벨에 동일한 이름의 카테고리 생성을 허용한다
6. THE Inventory_System SHALL 같은 부모 카테고리 아래에 중복된 이름의 카테고리 생성을 방지한다

### Requirement 3: 카테고리 추가 및 수정

**User Story:** 사용자로서, 카테고리를 추가하고 수정하고 싶습니다. 그래야 내 수집품 분류 체계를 커스터마이즈할 수 있습니다.

#### Acceptance Criteria

1. THE Inventory_System SHALL Header 아래 왼쪽에 '카테고리 추가' 버튼을 표시한다
2. WHEN 사용자가 '카테고리 추가' 버튼을 클릭할 때, THE Inventory_System SHALL 카테고리 추가 대화상자를 표시한다
3. WHEN 카테고리 추가 대화상자가 표시될 때, THE Inventory_System SHALL 부모 카테고리 선택 옵션을 제공한다
4. WHEN 사용자가 기존 카테고리를 클릭할 때, THE Inventory_System SHALL '카테고리 수정' 및 '카테고리 삭제' 버튼을 표시한다
5. WHEN 사용자가 '카테고리 수정' 버튼을 클릭할 때, THE Inventory_System SHALL 카테고리 이름 및 부모 카테고리를 수정할 수 있는 대화상자를 표시한다
6. WHEN 사용자가 Uncategorized_Category를 선택할 때, THE Inventory_System SHALL '카테고리 삭제' 버튼을 비활성화한다

### Requirement 4: 카테고리 삭제

**User Story:** 사용자로서, 불필요한 카테고리를 삭제하고 싶습니다. 그래야 깔끔한 분류 체계를 유지할 수 있습니다.

#### Acceptance Criteria

1. WHEN 사용자가 '카테고리 삭제' 버튼을 클릭하고 해당 카테고리에 아이템이 없을 때, THE Inventory_System SHALL 카테고리를 삭제한다
2. WHEN 사용자가 '카테고리 삭제' 버튼을 클릭하고 해당 카테고리에 아이템이 있을 때, THE Inventory_System SHALL 해당 아이템들을 Uncategorized_Category로 이동한다
3. WHEN 사용자가 하위 카테고리가 있는 카테고리를 삭제할 때, THE Inventory_System SHALL 하위 카테고리들을 삭제된 카테고리의 부모 카테고리로 이동한다
4. WHEN 사용자가 최상위 카테고리를 삭제하고 하위 카테고리가 있을 때, THE Inventory_System SHALL 하위 카테고리들을 최상위 레벨로 이동한다

### Requirement 5: 카테고리 검색

**User Story:** 사용자로서, 카테고리를 검색하고 싶습니다. 그래야 많은 카테고리 중에서 원하는 카테고리를 빠르게 찾을 수 있습니다.

#### Acceptance Criteria

1. THE Inventory_System SHALL 카테고리 목록 상단에 검색 입력 필드를 표시한다
2. WHEN 사용자가 검색어를 입력할 때, THE Inventory_System SHALL 검색어를 포함하는 카테고리를 필터링하여 표시한다
3. WHEN 검색 결과에 카테고리가 포함될 때, THE Inventory_System SHALL 해당 카테고리의 모든 상위 카테고리를 함께 표시한다
4. WHEN 검색 결과에 카테고리가 포함될 때, THE Inventory_System SHALL 해당 카테고리의 모든 하위 카테고리를 함께 표시한다
5. WHEN 검색어가 비어있을 때, THE Inventory_System SHALL 모든 카테고리를 기본 상태로 표시한다

### Requirement 6: 향상된 아이템 입력

**User Story:** 사용자로서, 아이템을 등록할 때 더 많은 정보를 입력하고 싶습니다. 그래야 수집품을 더 상세하게 관리할 수 있습니다.

#### Acceptance Criteria

1. WHEN 사용자가 아이템 추가 대화상자를 열 때, THE Inventory_System SHALL 이름, 카테고리, 수량, 구입 가격, 일자, 도감 선택 입력 필드를 표시한다
2. THE Inventory_System SHALL 구입 가격 입력 필드를 선택사항으로 제공한다
3. THE Inventory_System SHALL 일자 입력 필드의 기본값을 현재 timestamp로 설정한다
4. THE Inventory_System SHALL 등록된 Encyclopedia 목록을 선택할 수 있는 드롭다운을 제공한다
5. THE Inventory_System SHALL 카테고리 입력 필드의 기본값을 Uncategorized_Category로 설정한다
6. WHEN 사용자가 아이템을 수정할 때, THE Inventory_System SHALL 모든 입력 필드를 수정 가능하도록 제공한다

### Requirement 7: 수량 변동 이력 추적

**User Story:** 사용자로서, 아이템의 수량 변동 이력을 추적하고 싶습니다. 그래야 언제 어떻게 수집품이 변경되었는지 확인할 수 있습니다.

#### Acceptance Criteria

1. WHEN 사용자가 아이템의 수량을 변경할 때, THE Inventory_System SHALL Inventory 테이블의 수량 값을 업데이트한다
2. WHEN 사용자가 아이템의 수량을 변경할 때, THE Inventory_System SHALL History_Record를 생성하여 변동 내역을 저장한다
3. WHEN 사용자가 아이템을 삭제할 때, THE Inventory_System SHALL Inventory 테이블에서 아이템을 제거한다
4. WHEN 사용자가 아이템을 삭제할 때, THE Inventory_System SHALL History_Record를 생성하여 삭제 내역을 저장한다
5. THE Inventory_System SHALL History_Record에 아이템 ID, 변동 유형, 이전 수량, 새 수량, timestamp를 저장한다

### Requirement 8: 향상된 아이템 표시

**User Story:** 사용자로서, 아이템 목록에서 더 많은 정보를 보고 싶습니다. 그래야 각 아이템의 상세 정보를 한눈에 파악할 수 있습니다.

#### Acceptance Criteria

1. WHEN 아이템이 하위 카테고리에 속할 때, THE Inventory_System SHALL 카테고리를 "상위 카테고리 > 하위 카테고리" 형식으로 표시한다
2. WHEN 아이템에 구입 가격이 있을 때, THE Inventory_System SHALL 가격을 아이템 정보에 표시한다
3. WHEN 아이템이 Encyclopedia에 연결되어 있을 때, THE Inventory_System SHALL 도감 이름을 아이템 정보에 표시한다
4. WHEN 아이템이 Transaction 데이터와 연동되어 있을 때, THE Inventory_System SHALL 가격 옆에 체크 표시를 추가한다
5. THE Inventory_System SHALL 체크 표시에 마우스를 올릴 때 "거래로 인증됨" 툴팁을 표시한다

### Requirement 9: 데이터 영속성

**User Story:** 사용자로서, 입력한 모든 데이터가 저장되기를 원합니다. 그래야 페이지를 새로고침하거나 다시 방문해도 데이터가 유지됩니다.

#### Acceptance Criteria

1. WHEN 사용자가 카테고리를 추가, 수정, 삭제할 때, THE LocalStorage_Service SHALL 변경사항을 localStorage에 저장한다
2. WHEN 사용자가 아이템을 추가, 수정, 삭제할 때, THE LocalStorage_Service SHALL 변경사항을 localStorage에 저장한다
3. WHEN 사용자가 아이템 수량을 변경할 때, THE LocalStorage_Service SHALL History_Record를 localStorage에 저장한다
4. WHEN 사용자가 Inventory 페이지를 로드할 때, THE LocalStorage_Service SHALL localStorage에서 모든 카테고리, 아이템, 이력 데이터를 불러온다
5. THE LocalStorage_Service SHALL 데이터 저장 실패 시 사용자에게 오류 메시지를 표시한다

### Requirement 10: 기존 데이터 마이그레이션

**User Story:** 사용자로서, Phase 1에서 입력한 기존 데이터가 Phase 3에서도 정상적으로 작동하기를 원합니다. 그래야 데이터 손실 없이 새 기능을 사용할 수 있습니다.

#### Acceptance Criteria

1. WHEN Phase 1 형식의 데이터가 localStorage에 존재할 때, THE Inventory_System SHALL 데이터를 Phase 3 형식으로 변환한다
2. WHEN 기존 아이템에 카테고리가 없을 때, THE Inventory_System SHALL 해당 아이템을 Uncategorized_Category에 할당한다
3. WHEN 기존 아이템에 새로운 필드(가격, 일자, 도감)가 없을 때, THE Inventory_System SHALL 해당 필드를 null 또는 기본값으로 설정한다
4. THE Inventory_System SHALL 마이그레이션 완료 후 데이터 버전을 localStorage에 기록한다
5. WHEN 마이그레이션이 실패할 때, THE Inventory_System SHALL 원본 데이터를 백업하고 사용자에게 오류를 알린다
