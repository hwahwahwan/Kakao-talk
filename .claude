# Code Implementation Rules

## 1. Reuse and Common Modules
- Do not duplicate logic across files or functions.
- If the same or similar logic is needed in multiple places, extract it into a shared/common module.
- Place reusable code in a dedicated common/shared directory and import it where needed.
- Prioritize reuse through shared utilities, helpers, services, constants, and types instead of copy-pasting code.

## 2. Keep Code Concise
- Write code as simply and concisely as possible.
- Avoid unnecessary abstractions, overly verbose patterns, and premature optimization.
- Prefer clear and short implementations when they do not reduce readability or maintainability.
- Follow KISS and YAGNI principles.

## 3. Constants and Variables Management
- Do not hardcode repeated values directly in business logic.
- Extract constants, configuration values, enums, and reusable literals into separate files/modules.
- Import constants from dedicated constant/config files.
- Use meaningful and consistent names for variables, constants, functions, and classes.

## 4. SOLID Principles
Always implement code in compliance with SOLID principles:
- **SRP**: Each function, class, and module must have a single responsibility.
- **OCP**: Code should be open for extension but closed for modification.
- **LSP**: Derived types must be safely substitutable for their base types.
- **ISP**: Do not force consumers to depend on interfaces they do not use.
- **DIP**: Depend on abstractions, not concrete implementations.

## 5. Separation of Concerns
- Separate responsibilities clearly across layers such as:
  - UI / presentation
  - business logic
  - data access
  - external API integration
  - shared utilities
- Do not mix unrelated concerns in the same file or function.

## 6. Test-First Completion Rule
- Every implemented feature must include corresponding tests.
- After implementing a feature, always write and run tests for it.
- Do not claim a feature is complete until its tests are implemented and verified.
- Only report completion after confirming the tests pass.

## 7. Testing Requirements
- Cover both normal cases and edge cases.
- Write unit tests for isolated logic.
- Write integration tests where modules interact with external systems or multiple layers.
- Keep tests readable and maintainable.
- Avoid skipping tests unless there is a clear documented reason.

## 8. Maintainability and Readability
- Prefer small functions with a single clear purpose.
- Avoid deeply nested conditionals when possible.
- Use descriptive naming and consistent structure.
- Refactor when code becomes repetitive, overly long, or hard to understand.
- Write code for future maintainers, not just for immediate execution.

## 9. Folder Structure Guidance
Use a clear project structure such as:
- `common/` or `shared/` for reusable modules
- `constants/` for constants and config values
- `types/` for shared types/interfaces
- `services/` for business logic
- `repositories/` or `data/` for persistence logic
- `tests/` for test code

## 10. Output and Completion Policy
- Before finishing, verify:
  1. the feature is implemented,
  2. duplicated logic is removed or extracted,
  3. constants are separated appropriately,
  4. SOLID principles are respected,
  5. tests are implemented,
  6. tests pass successfully.
- Only then state that the work is complete.

## 11. Prohibited Practices
- Do not duplicate code.
- Do not hardcode magic numbers or repeated strings.
- Do not mix business logic with UI or infrastructure code.
- Do not mark tasks as complete without test verification.
- Do not introduce unnecessary dependencies or abstractions.

## 12. Refactoring Rule
- If existing code violates reuse, readability, or SOLID principles, refactor before extending it.
- Prefer improving structure before adding more complexity on top of poor foundations.

# Development Rules
- 중복 코드 금지. 공통 로직은 반드시 common/shared 모듈로 분리한다.
- 하드코딩 금지. 상수, 설정값, 반복 문자열은 constants/config 파일로 분리한다.
- 코드는 최대한 간결하고 명확하게 작성한다.
- SOLID 원칙을 준수한다.
- 기능 구현 후 반드시 테스트를 작성하고 실행한다.
- 테스트 통과 전에는 완료라고 판단하지 않는다.
- UI, 비즈니스 로직, 데이터 접근, 외부 연동은 분리한다.
- 작은 함수, 명확한 이름, 쉬운 구조를 우선한다.
- 기존 구조가 나쁘면 기능 추가 전에 먼저 리팩토링한다.