# 원본(소스) 보관함

앱 화면(맨 위 index.html)은 이 폴더의 파일로 **자동으로 만들어집니다**. 고칠 때는 여기를 고치고 다시 빌드합니다.

| 위치 | 내용 |
|---|---|
| `template.html` | 앱의 모든 화면·기능 코드 (데이터 자리는 `__LAW__` 같은 표시로 비워 둠) |
| `data/` | 앱에 들어가는 내용: 장특법(law, docs, cmpmap, quiz_law), 교육과정(curr2), 기출문제(past, pastq, hl, qimgs, qtext), 점자·수어 등(fs, num, en) |
| `law_src/` | 장특법·시행령·시행규칙 원문 텍스트 |
| `tools/` | 원본 파일(HWP, PDF)에서 데이터를 뽑을 때 쓴 스크립트 (참고용) |
| `icons_src/` | 앱 아이콘 디자인 원본 |
| `build.py` | 위 파일들을 합쳐 index.html·sw.js·manifest를 만드는 스크립트 |

다시 만들기: 저장소 폴더에서 `python3 _source/build.py`

여기에 넣지 않은 것: 기출문제 PDF 원본, 교육과정 HWP 원본 (저작권 때문에 공개 저장소에 올리지 않음. 승찬 선생님이 따로 보관).
